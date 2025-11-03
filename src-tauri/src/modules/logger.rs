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

pub struct LoggerService {
    log_file_path: PathBuf,
}

impl LoggerService {
    pub fn new() -> Result<Self> {
        let log_file_path = Self::get_log_file_path()?;
        
        // Initialize tracing subscriber
        Self::init_tracing(&log_file_path)?;
        
        Ok(Self { log_file_path })
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

        // Also append to JSON log file for structured storage
        self.append_json_log(&log_entry)?;
        
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

    fn init_tracing(log_file_path: &Path) -> Result<()> {
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
                    .json()
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
        
        if let Ok(entries) = std::fs::read_dir(log_dir) {
            for entry in entries.flatten() {
                if let Ok(metadata) = entry.metadata() {
                    if let Ok(created) = metadata.created() {
                        let created_datetime: DateTime<Utc> = created.into();
                        if created_datetime < cutoff_date {
                            if let Err(e) = std::fs::remove_file(entry.path()) {
                                warn!("Failed to remove old log file {:?}: {}", entry.path(), e);
                            } else {
                                debug!("Removed old log file: {:?}", entry.path());
                            }
                        }
                    }
                }
            }
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
}