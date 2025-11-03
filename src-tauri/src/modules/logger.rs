use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use std::collections::HashMap;
use std::path::{Path, PathBuf};
use anyhow::{Context, Result};
use tracing::{info, error, warn, debug};
use tracing_subscriber::{
    fmt,
    layer::SubscriberExt,
    util::SubscriberInitExt,
    EnvFilter,
};
use std::sync::{Arc, RwLock};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActionLog {
    pub timestamp: DateTime<Utc>,
    pub action_type: String,
    pub action_id: String,
    pub result: ActionResult,
    pub execution_time_ms: u64,
    pub error_message: Option<String>,
    pub context: HashMap<String, serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ActionResult {
    Success,
    Failed,
    Cancelled,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LogStats {
    pub total_files: usize,
    pub total_size_bytes: u64,
    pub oldest_log: Option<DateTime<Utc>>,
    pub newest_log: Option<DateTime<Utc>>,
    pub log_directory: PathBuf,
}

#[derive(Debug, Clone)]
pub struct LogConfig {
    pub max_file_size_mb: u64,
    pub max_total_size_mb: u64,
    pub retention_days: i64,
    pub rotation_enabled: bool,
    pub json_format: bool,
}

impl Default for LogConfig {
    fn default() -> Self {
        Self {
            max_file_size_mb: 10,      // 10MB per file
            max_total_size_mb: 100,    // 100MB total
            retention_days: 30,        // Keep logs for 30 days
            rotation_enabled: true,    // Enable automatic rotation
            json_format: true,         // Use JSON format for structured logging
        }
    }
}

pub struct LoggerService {
    log_file_path: PathBuf,
    config: LogConfig,
    in_memory_logs: Arc<RwLock<Vec<ActionLog>>>,
}

impl LoggerService {
    pub fn new() -> Result<Self> {
        Self::new_with_config(LogConfig::default())
    }

    pub fn new_with_config(config: LogConfig) -> Result<Self> {
        let log_file_path = Self::get_log_file_path()?;
        
        // Initialize tracing subscriber
        Self::init_tracing(&log_file_path, &config)?;
        
        let service = Self { 
            log_file_path,
            config,
            in_memory_logs: Arc::new(RwLock::new(Vec::new())),
        };
        
        // Perform initial cleanup if rotation is enabled
        if service.config.rotation_enabled {
            if let Err(e) = service.rotate_logs() {
                warn!("Failed to perform initial log rotation: {}", e);
            }
            
            if let Err(e) = service.cleanup_logs_by_size(service.config.max_total_size_mb) {
                warn!("Failed to perform initial size-based cleanup: {}", e);
            }
        }
        
        Ok(service)
    }

    pub fn log_action(&self, log_entry: ActionLog) -> Result<()> {
        // Log using tracing for structured logging
        match log_entry.result {
            ActionResult::Success => {
                info!(
                    action_type = %log_entry.action_type,
                    action_id = %log_entry.action_id,
                    execution_time_ms = log_entry.execution_time_ms,
                    context = ?log_entry.context,
                    "Action executed successfully"
                );
            }
            ActionResult::Failed => {
                error!(
                    action_type = %log_entry.action_type,
                    action_id = %log_entry.action_id,
                    execution_time_ms = log_entry.execution_time_ms,
                    error = %log_entry.error_message.as_deref().unwrap_or("Unknown error"),
                    context = ?log_entry.context,
                    "Action execution failed"
                );
            }
            ActionResult::Cancelled => {
                warn!(
                    action_type = %log_entry.action_type,
                    action_id = %log_entry.action_id,
                    execution_time_ms = log_entry.execution_time_ms,
                    context = ?log_entry.context,
                    "Action execution cancelled"
                );
            }
        }

        // Store in memory for quick access (using blocking approach for simplicity)
        if let Ok(mut logs) = self.in_memory_logs.try_write() {
            logs.push(log_entry.clone());
            
            // Keep only the last 1000 logs in memory
            let len = logs.len();
            if len > 1000 {
                logs.drain(0..len - 1000);
            }
        }

        // Also append to JSON log file for structured storage
        self.append_json_log(&log_entry)?;
        
        // Check if we need to rotate logs
        if self.config.rotation_enabled {
            if let Err(e) = self.check_and_rotate_if_needed() {
                warn!("Failed to check log rotation: {}", e);
            }
        }
        
        Ok(())
    }

    pub fn log_system_event(&self, event_type: &str, message: &str, context: Option<HashMap<String, serde_json::Value>>) {
        info!(
            event_type = event_type,
            message = message,
            context = ?context,
            "System event"
        );
    }

    pub fn log_error(&self, error_type: &str, error: &anyhow::Error, context: Option<HashMap<String, serde_json::Value>>) {
        error!(
            error_type = error_type,
            error = %error,
            error_chain = ?error.chain().collect::<Vec<_>>(),
            context = ?context,
            "System error occurred"
        );
    }

    pub fn get_recent_logs(&self, limit: usize) -> Result<Vec<ActionLog>> {
        // First try to get from in-memory cache
        if let Ok(logs) = self.in_memory_logs.try_read() {
            if logs.len() >= limit {
                let start_idx = if logs.len() > limit { logs.len() - limit } else { 0 };
                return Ok(logs[start_idx..].to_vec());
            }
        }
        
        // Fallback to reading from file
        let content = std::fs::read_to_string(&self.log_file_path)
            .context("Failed to read log file")?;
        
        let mut logs = Vec::new();
        for line in content.lines().rev().take(limit) {
            if let Ok(log_entry) = serde_json::from_str::<ActionLog>(line) {
                logs.push(log_entry);
            }
        }
        
        logs.reverse();
        Ok(logs)
    }

    fn get_log_file_path() -> Result<PathBuf> {
        // Use portable mode - logs in same directory as executable
        let exe_path = std::env::current_exe()
            .context("Failed to get executable path")?;
        
        let log_dir = if let Some(exe_dir) = exe_path.parent() {
            exe_dir.join("logs")
        } else {
            // Fallback to current directory
            std::env::current_dir()
                .context("Failed to get current directory")?
                .join("logs")
        };
        
        std::fs::create_dir_all(&log_dir)
            .context("Failed to create log directory")?;
        
        tracing::info!("Using portable log directory: {}", log_dir.display());
        Ok(log_dir.join("q-deck.log"))
    }

    fn init_tracing(log_file_path: &Path, _config: &LogConfig) -> Result<()> {
        // Create log directory if it doesn't exist
        if let Some(parent) = log_file_path.parent() {
            std::fs::create_dir_all(parent)
                .context("Failed to create log directory")?;
        }

        // Set up file appender for logs
        let file_appender = tracing_appender::rolling::daily(
            log_file_path.parent().unwrap(),
            "q-deck"
        );
        
        // Create a subscriber with both console and file output
        // Use a simpler approach to avoid type conflicts
        let subscriber = tracing_subscriber::registry()
            .with(
                fmt::layer()
                    .with_writer(std::io::stdout)
                    .with_ansi(true)
                    .with_target(false)
                    .compact()
            )
            .with(
                fmt::layer()
                    .with_writer(file_appender)
                    .with_ansi(false)
                    .compact()  // Always use compact format for now
            )
            .with(
                EnvFilter::try_from_default_env()
                    .unwrap_or_else(|_| EnvFilter::new("debug"))
            );

        subscriber.init();
        
        info!("Q-Deck logging system initialized");
        
        Ok(())
    }

    fn append_json_log(&self, log_entry: &ActionLog) -> Result<()> {
        let json_line = serde_json::to_string(log_entry)
            .context("Failed to serialize log entry")?;
        
        use std::fs::OpenOptions;
        use std::io::Write;
        
        let mut file = OpenOptions::new()
            .create(true)
            .append(true)
            .open(&self.log_file_path)
            .context("Failed to open log file")?;
        
        writeln!(file, "{}", json_line)
            .context("Failed to write log entry")?;
        
        Ok(())
    }

    pub fn rotate_logs(&self) -> Result<()> {
        let log_dir = self.log_file_path.parent()
            .context("Failed to get log directory")?;
        
        // Keep only the last 30 days of logs
        let cutoff_date = Utc::now() - chrono::Duration::days(30);
        let mut removed_count = 0;
        let mut total_size_removed = 0u64;
        
        if let Ok(entries) = std::fs::read_dir(log_dir) {
            for entry in entries.flatten() {
                let path = entry.path();
                
                // Only process log files (avoid removing other files)
                if let Some(file_name) = path.file_name() {
                    let file_name_str = file_name.to_string_lossy();
                    if !file_name_str.starts_with("q-deck") || !file_name_str.ends_with(".log") {
                        continue;
                    }
                }
                
                if let Ok(metadata) = entry.metadata() {
                    if let Ok(created) = metadata.created() {
                        let created_datetime: DateTime<Utc> = created.into();
                        if created_datetime < cutoff_date {
                            let file_size = metadata.len();
                            if let Err(e) = std::fs::remove_file(&path) {
                                warn!("Failed to remove old log file {:?}: {}", path, e);
                            } else {
                                debug!("Removed old log file: {:?} (size: {} bytes)", path, file_size);
                                removed_count += 1;
                                total_size_removed += file_size;
                            }
                        }
                    }
                }
            }
        }
        
        if removed_count > 0 {
            info!(
                "Log rotation completed: removed {} files, freed {} bytes",
                removed_count,
                total_size_removed
            );
        }
        
        Ok(())
    }

    pub fn get_log_stats(&self) -> Result<LogStats> {
        let log_dir = self.log_file_path.parent()
            .context("Failed to get log directory")?;
        
        let mut total_files = 0;
        let mut total_size = 0u64;
        let mut oldest_log: Option<DateTime<Utc>> = None;
        let mut newest_log: Option<DateTime<Utc>> = None;
        
        if let Ok(entries) = std::fs::read_dir(log_dir) {
            for entry in entries.flatten() {
                let path = entry.path();
                
                // Only count log files
                if let Some(file_name) = path.file_name() {
                    let file_name_str = file_name.to_string_lossy();
                    if !file_name_str.starts_with("q-deck") || !file_name_str.ends_with(".log") {
                        continue;
                    }
                }
                
                if let Ok(metadata) = entry.metadata() {
                    total_files += 1;
                    total_size += metadata.len();
                    
                    if let Ok(created) = metadata.created() {
                        let created_datetime: DateTime<Utc> = created.into();
                        
                        if oldest_log.is_none() || created_datetime < oldest_log.unwrap() {
                            oldest_log = Some(created_datetime);
                        }
                        
                        if newest_log.is_none() || created_datetime > newest_log.unwrap() {
                            newest_log = Some(created_datetime);
                        }
                    }
                }
            }
        }
        
        Ok(LogStats {
            total_files,
            total_size_bytes: total_size,
            oldest_log,
            newest_log,
            log_directory: log_dir.to_path_buf(),
        })
    }

    pub fn cleanup_logs_by_size(&self, max_size_mb: u64) -> Result<()> {
        let max_size_bytes = max_size_mb * 1024 * 1024;
        let stats = self.get_log_stats()?;
        
        if stats.total_size_bytes <= max_size_bytes {
            debug!("Log size ({} bytes) is within limit ({} bytes)", stats.total_size_bytes, max_size_bytes);
            return Ok(());
        }
        
        info!("Log size ({} bytes) exceeds limit ({} bytes), cleaning up oldest files", 
              stats.total_size_bytes, max_size_bytes);
        
        let log_dir = self.log_file_path.parent()
            .context("Failed to get log directory")?;
        
        // Collect all log files with their creation times
        let mut log_files = Vec::new();
        
        if let Ok(entries) = std::fs::read_dir(log_dir) {
            for entry in entries.flatten() {
                let path = entry.path();
                
                if let Some(file_name) = path.file_name() {
                    let file_name_str = file_name.to_string_lossy();
                    if !file_name_str.starts_with("q-deck") || !file_name_str.ends_with(".log") {
                        continue;
                    }
                }
                
                if let Ok(metadata) = entry.metadata() {
                    if let Ok(created) = metadata.created() {
                        log_files.push((path, created, metadata.len()));
                    }
                }
            }
        }
        
        // Sort by creation time (oldest first)
        log_files.sort_by_key(|(_, created, _)| *created);
        
        let mut current_size = stats.total_size_bytes;
        let mut removed_count = 0;
        
        // Remove oldest files until we're under the size limit
        for (path, _, file_size) in log_files {
            if current_size <= max_size_bytes {
                break;
            }
            
            // Don't remove the current log file
            if path == self.log_file_path {
                continue;
            }
            
            if let Err(e) = std::fs::remove_file(&path) {
                warn!("Failed to remove log file {:?}: {}", path, e);
            } else {
                debug!("Removed log file: {:?} (size: {} bytes)", path, file_size);
                current_size -= file_size;
                removed_count += 1;
            }
        }
        
        info!("Size-based cleanup completed: removed {} files, current size: {} bytes", 
              removed_count, current_size);
        
        Ok(())
    }

    fn check_and_rotate_if_needed(&self) -> Result<()> {
        // Check file size
        if let Ok(metadata) = std::fs::metadata(&self.log_file_path) {
            let file_size_mb = metadata.len() / (1024 * 1024);
            
            if file_size_mb >= self.config.max_file_size_mb {
                debug!("Log file size ({} MB) exceeds limit ({} MB), rotating", 
                       file_size_mb, self.config.max_file_size_mb);
                self.rotate_current_log_file()?;
            }
        }
        
        // Check total size
        self.cleanup_logs_by_size(self.config.max_total_size_mb)?;
        
        // Check age-based rotation
        self.rotate_logs()?;
        
        Ok(())
    }

    fn rotate_current_log_file(&self) -> Result<()> {
        let timestamp = Utc::now().format("%Y%m%d_%H%M%S");
        let log_dir = self.log_file_path.parent()
            .context("Failed to get log directory")?;
        
        let rotated_name = format!("q-deck_{}.log", timestamp);
        let rotated_path = log_dir.join(rotated_name);
        
        if self.log_file_path.exists() {
            std::fs::rename(&self.log_file_path, &rotated_path)
                .context("Failed to rotate log file")?;
            
            info!("Rotated log file to: {:?}", rotated_path);
        }
        
        Ok(())
    }

    pub fn get_config(&self) -> &LogConfig {
        &self.config
    }

    pub fn update_config(&mut self, new_config: LogConfig) -> Result<()> {
        let old_json_format = self.config.json_format;
        self.config = new_config;
        
        // Re-initialize tracing with new config if needed
        if old_json_format != self.config.json_format {
            warn!("Log format change requires application restart to take effect");
        }
        
        Ok(())
    }
}

// Helper macros for common logging patterns
#[macro_export]
macro_rules! log_action_start {
    ($action_type:expr, $action_id:expr) => {
        tracing::info!(
            action_type = $action_type,
            action_id = $action_id,
            "Starting action execution"
        );
    };
}

#[macro_export]
macro_rules! log_action_success {
    ($action_type:expr, $action_id:expr, $duration:expr) => {
        tracing::info!(
            action_type = $action_type,
            action_id = $action_id,
            execution_time_ms = $duration,
            "Action completed successfully"
        );
    };
}

#[macro_export]
macro_rules! log_action_error {
    ($action_type:expr, $action_id:expr, $duration:expr, $error:expr) => {
        tracing::error!(
            action_type = $action_type,
            action_id = $action_id,
            execution_time_ms = $duration,
            error = %$error,
            "Action execution failed"
        );
    };
}

// Utility function to create ActionLog entries
impl ActionLog {
    pub fn new(
        action_type: String,
        action_id: String,
        result: ActionResult,
        execution_time_ms: u64,
        error_message: Option<String>,
        context: HashMap<String, serde_json::Value>,
    ) -> Self {
        Self {
            timestamp: Utc::now(),
            action_type,
            action_id,
            result,
            execution_time_ms,
            error_message,
            context,
        }
    }

    pub fn success(action_type: String, action_id: String, execution_time_ms: u64) -> Self {
        Self::new(
            action_type,
            action_id,
            ActionResult::Success,
            execution_time_ms,
            None,
            HashMap::new(),
        )
    }

    pub fn failed(
        action_type: String,
        action_id: String,
        execution_time_ms: u64,
        error_message: String,
    ) -> Self {
        Self::new(
            action_type,
            action_id,
            ActionResult::Failed,
            execution_time_ms,
            Some(error_message),
            HashMap::new(),
        )
    }

    pub fn cancelled(action_type: String, action_id: String, execution_time_ms: u64) -> Self {
        Self::new(
            action_type,
            action_id,
            ActionResult::Cancelled,
            execution_time_ms,
            None,
            HashMap::new(),
        )
    }

    pub fn with_context(mut self, key: String, value: serde_json::Value) -> Self {
        self.context.insert(key, value);
        self
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[test]
    fn test_action_log_creation() {
        let log = ActionLog::success(
            "LaunchApp".to_string(),
            "test-app".to_string(),
            150,
        );
        
        assert_eq!(log.action_type, "LaunchApp");
        assert_eq!(log.action_id, "test-app");
        assert_eq!(log.execution_time_ms, 150);
        assert!(matches!(log.result, ActionResult::Success));
        assert!(log.error_message.is_none());
    }

    #[test]
    fn test_action_log_with_context() {
        let log = ActionLog::success(
            "LaunchApp".to_string(),
            "test-app".to_string(),
            150,
        ).with_context(
            "app_path".to_string(),
            serde_json::Value::String("/path/to/app".to_string())
        );
        
        assert!(log.context.contains_key("app_path"));
    }

    #[test]
    fn test_log_serialization() {
        let log = ActionLog::failed(
            "LaunchApp".to_string(),
            "test-app".to_string(),
            150,
            "File not found".to_string(),
        );
        
        let json = serde_json::to_string(&log).unwrap();
        let deserialized: ActionLog = serde_json::from_str(&json).unwrap();
        
        assert_eq!(log.action_type, deserialized.action_type);
        assert_eq!(log.error_message, deserialized.error_message);
    }

    // Note: These tests are commented out due to tracing initialization conflicts in test environment
    // The logger functionality is tested through integration tests instead
    
    // #[test]
    // fn test_logger_service_creation() {
    //     let logger = LoggerService::new().unwrap();
    //     assert!(logger.log_file_path.exists() || logger.log_file_path.parent().unwrap().exists());
    // }

    // #[test]
    // fn test_log_action() {
    //     let logger = LoggerService::new().unwrap();
    //     let log_entry = ActionLog::success(
    //         "TestAction".to_string(),
    //         "test-id".to_string(),
    //         100,
    //     );
    //     
    //     let result = logger.log_action(log_entry);
    //     assert!(result.is_ok());
    // }

    // #[test]
    // fn test_get_recent_logs() {
    //     let logger = LoggerService::new().unwrap();
    //     
    //     // Add some test logs
    //     for i in 0..5 {
    //         let log_entry = ActionLog::success(
    //             "TestAction".to_string(),
    //             format!("test-id-{}", i),
    //             100 + i as u64,
    //         );
    //         logger.log_action(log_entry).unwrap();
    //     }
    //     
    //     let recent_logs = logger.get_recent_logs(3).unwrap();
    //     assert_eq!(recent_logs.len(), 3);
    // }

    #[test]
    fn test_log_config_default() {
        let config = LogConfig::default();
        assert_eq!(config.max_file_size_mb, 10);
        assert_eq!(config.max_total_size_mb, 100);
        assert_eq!(config.retention_days, 30);
        assert!(config.rotation_enabled);
        assert!(config.json_format);
    }
}