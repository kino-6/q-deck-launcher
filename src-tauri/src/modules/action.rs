// Action execution module
use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

use std::process::{Command, Stdio};
use tokio::time::{sleep, Duration};
use tracing::{info, error, warn, debug};

#[cfg(windows)]
use winapi::um::shellapi::ShellExecuteW;
#[cfg(windows)]
use winapi::um::winuser::{SW_SHOWNORMAL};
#[cfg(windows)]
use std::ffi::OsStr;
#[cfg(windows)]
use std::os::windows::ffi::OsStrExt;

// Action execution result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActionResult {
    pub success: bool,
    pub message: String,
    pub execution_time_ms: u64,
    pub output: Option<String>,
    pub error_code: Option<i32>,
}

// Action configuration for different action types
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum ActionConfig {
    LaunchApp {
        path: String,
        args: Option<Vec<String>>,
        workdir: Option<String>,
        env: Option<HashMap<String, String>>,
    },
    Open {
        target: String,
        verb: Option<String>, // "open", "edit", "print", etc.
    },
    Terminal {
        terminal: String, // "WindowsTerminal", "PowerShell", "Cmd", "WSL"
        profile: Option<String>,
        workdir: Option<String>,
        command: Option<String>,
        env: Option<HashMap<String, String>>,
        args: Option<Vec<String>>,
    },
    SendKeys {
        keys: String,
        delay_ms: Option<u64>,
    },
    PowerShell {
        script: String,
        workdir: Option<String>,
        execution_policy: Option<String>,
    },
    MultiAction {
        actions: Vec<ActionConfig>,
        delay_between_ms: Option<u64>,
        stop_on_error: Option<bool>,
    },
}

// Trait for action executors
#[async_trait::async_trait]
pub trait ActionExecutor: Send + Sync {
    async fn execute(&self, config: &ActionConfig) -> Result<ActionResult>;
    fn supports_action_type(&self, config: &ActionConfig) -> bool;
}

// Launch App Action Executor
pub struct LaunchAppActionExecutor;

#[async_trait::async_trait]
impl ActionExecutor for LaunchAppActionExecutor {
    async fn execute(&self, config: &ActionConfig) -> Result<ActionResult> {
        let start_time = std::time::Instant::now();
        
        if let ActionConfig::LaunchApp { path, args, workdir, env } = config {
            info!("🚀 Launching application: {}", path);
            
            let mut command = Command::new(path);
            
            // Set arguments
            if let Some(args) = args {
                command.args(args);
                debug!("📝 Arguments: {:?}", args);
            }
            
            // Set working directory
            if let Some(workdir) = workdir {
                let expanded_workdir = expand_environment_variables(workdir);
                command.current_dir(&expanded_workdir);
                debug!("📁 Working directory: {}", expanded_workdir);
            }
            
            // Set environment variables
            if let Some(env) = env {
                for (key, value) in env {
                    let expanded_value = expand_environment_variables(value);
                    command.env(key, expanded_value);
                    debug!("🌍 Environment: {}={}", key, value);
                }
            }
            
            // Configure stdio
            command.stdout(Stdio::null()).stderr(Stdio::null());
            
            match command.spawn() {
                Ok(mut child) => {
                    let execution_time = start_time.elapsed().as_millis() as u64;
                    
                    // Don't wait for the process to complete, just ensure it started
                    match child.try_wait() {
                        Ok(Some(status)) => {
                            if status.success() {
                                info!("✅ Application launched successfully in {}ms", execution_time);
                                Ok(ActionResult {
                                    success: true,
                                    message: format!("Application '{}' launched successfully", path),
                                    execution_time_ms: execution_time,
                                    output: None,
                                    error_code: None,
                                })
                            } else {
                                let error_code = status.code();
                                error!("❌ Application exited with error code: {:?}", error_code);
                                Ok(ActionResult {
                                    success: false,
                                    message: format!("Application '{}' exited with error", path),
                                    execution_time_ms: execution_time,
                                    output: None,
                                    error_code,
                                })
                            }
                        }
                        Ok(None) => {
                            // Process is still running, which is expected for GUI applications
                            info!("✅ Application launched successfully in {}ms", execution_time);
                            Ok(ActionResult {
                                success: true,
                                message: format!("Application '{}' launched successfully", path),
                                execution_time_ms: execution_time,
                                output: None,
                                error_code: None,
                            })
                        }
                        Err(e) => {
                            error!("❌ Failed to check application status: {}", e);
                            Ok(ActionResult {
                                success: false,
                                message: format!("Failed to check application status: {}", e),
                                execution_time_ms: start_time.elapsed().as_millis() as u64,
                                output: None,
                                error_code: None,
                            })
                        }
                    }
                }
                Err(e) => {
                    let execution_time = start_time.elapsed().as_millis() as u64;
                    error!("❌ Failed to launch application '{}': {}", path, e);
                    Ok(ActionResult {
                        success: false,
                        message: format!("Failed to launch application '{}': {}", path, e),
                        execution_time_ms: execution_time,
                        output: None,
                        error_code: None,
                    })
                }
            }
        } else {
            Err(anyhow::anyhow!("Invalid action config for LaunchApp executor"))
        }
    }
    
    fn supports_action_type(&self, config: &ActionConfig) -> bool {
        matches!(config, ActionConfig::LaunchApp { .. })
    }
}

// Open Action Executor (uses Windows ShellExecute)
pub struct OpenActionExecutor;

#[async_trait::async_trait]
impl ActionExecutor for OpenActionExecutor {
    async fn execute(&self, config: &ActionConfig) -> Result<ActionResult> {
        let start_time = std::time::Instant::now();
        
        if let ActionConfig::Open { target, verb } = config {
            info!("📂 Opening target: {}", target);
            
            #[cfg(windows)]
            {
                let expanded_target = expand_environment_variables(target);
                let verb_str = verb.as_deref().unwrap_or("open");
                
                debug!("🎯 Target: {}", expanded_target);
                debug!("🔧 Verb: {}", verb_str);
                
                let result = unsafe {
                    let target_wide: Vec<u16> = OsStr::new(&expanded_target)
                        .encode_wide()
                        .chain(std::iter::once(0))
                        .collect();
                    
                    let verb_wide: Vec<u16> = OsStr::new(verb_str)
                        .encode_wide()
                        .chain(std::iter::once(0))
                        .collect();
                    
                    ShellExecuteW(
                        std::ptr::null_mut(),
                        verb_wide.as_ptr(),
                        target_wide.as_ptr(),
                        std::ptr::null(),
                        std::ptr::null(),
                        SW_SHOWNORMAL,
                    )
                };
                
                let execution_time = start_time.elapsed().as_millis() as u64;
                
                if result as usize > 32 {
                    info!("✅ Target opened successfully in {}ms", execution_time);
                    Ok(ActionResult {
                        success: true,
                        message: format!("Opened '{}' successfully", target),
                        execution_time_ms: execution_time,
                        output: None,
                        error_code: None,
                    })
                } else {
                    error!("❌ Failed to open target '{}': ShellExecute error code {}", target, result as i32);
                    Ok(ActionResult {
                        success: false,
                        message: format!("Failed to open '{}': System error {}", target, result as i32),
                        execution_time_ms: execution_time,
                        output: None,
                        error_code: Some(result as i32),
                    })
                }
            }
            
            #[cfg(not(windows))]
            {
                let execution_time = start_time.elapsed().as_millis() as u64;
                Ok(ActionResult {
                    success: false,
                    message: "Open action is only supported on Windows".to_string(),
                    execution_time_ms: execution_time,
                    output: None,
                    error_code: None,
                })
            }
        } else {
            Err(anyhow::anyhow!("Invalid action config for Open executor"))
        }
    }
    
    fn supports_action_type(&self, config: &ActionConfig) -> bool {
        matches!(config, ActionConfig::Open { .. })
    }
}

// Terminal Action Executor
pub struct TerminalActionExecutor;

#[async_trait::async_trait]
impl ActionExecutor for TerminalActionExecutor {
    async fn execute(&self, config: &ActionConfig) -> Result<ActionResult> {
        let start_time = std::time::Instant::now();
        
        if let ActionConfig::Terminal { terminal, profile, workdir, command, env, args } = config {
            info!("💻 Opening terminal: {}", terminal);
            
            let mut cmd = match terminal.as_str() {
                "WindowsTerminal" | "wt" => {
                    let mut cmd_builder = Command::new("wt");
                    
                    // Add profile if specified
                    if let Some(profile) = profile {
                        cmd_builder.args(&["-p", profile]);
                        debug!("👤 Profile: {}", profile);
                    }
                    
                    // Add working directory
                    if let Some(workdir) = workdir {
                        let expanded_workdir = expand_environment_variables(workdir);
                        cmd_builder.args(&["-d", &expanded_workdir]);
                        debug!("📁 Working directory: {}", expanded_workdir);
                    }
                    
                    // Add command to execute
                    if let Some(cmd_str) = command {
                        cmd_builder.args(&["--", "powershell", "-NoExit", "-Command", cmd_str]);
                        debug!("⚡ Command: {}", cmd_str);
                    }
                    
                    cmd_builder
                }
                "PowerShell" | "pwsh" => {
                    let mut cmd_builder = Command::new("powershell");
                    cmd_builder.arg("-NoExit");
                    
                    // Set working directory
                    if let Some(workdir) = workdir {
                        let expanded_workdir = expand_environment_variables(workdir);
                        cmd_builder.current_dir(&expanded_workdir);
                        debug!("📁 Working directory: {}", expanded_workdir);
                    }
                    
                    // Add command to execute
                    if let Some(cmd_str) = command {
                        cmd_builder.args(&["-Command", cmd_str]);
                        debug!("⚡ Command: {}", cmd_str);
                    }
                    
                    cmd_builder
                }
                "Cmd" | "cmd" => {
                    let mut cmd_builder = Command::new("cmd");
                    cmd_builder.arg("/K"); // Keep window open
                    
                    // Set working directory
                    if let Some(workdir) = workdir {
                        let expanded_workdir = expand_environment_variables(workdir);
                        cmd_builder.current_dir(&expanded_workdir);
                        debug!("📁 Working directory: {}", expanded_workdir);
                    }
                    
                    // Add command to execute
                    if let Some(cmd_str) = command {
                        cmd_builder.args(&["/C", &format!("{} & pause", cmd_str)]);
                        debug!("⚡ Command: {}", cmd_str);
                    }
                    
                    cmd_builder
                }
                "WSL" | "wsl" => {
                    let mut cmd_builder = Command::new("wsl");
                    
                    // Add distribution if specified in profile
                    if let Some(profile) = profile {
                        cmd_builder.args(&["-d", profile]);
                        debug!("🐧 Distribution: {}", profile);
                    }
                    
                    // Set working directory (WSL format)
                    if let Some(workdir) = workdir {
                        let expanded_workdir = expand_environment_variables(workdir);
                        // Convert Windows path to WSL path if needed
                        let wsl_path = if expanded_workdir.starts_with("C:") {
                            expanded_workdir.replace("C:", "/mnt/c").replace("\\", "/")
                        } else {
                            expanded_workdir
                        };
                        cmd_builder.args(&["--cd", &wsl_path]);
                        debug!("📁 WSL Working directory: {}", wsl_path);
                    }
                    
                    // Add command to execute
                    if let Some(cmd_str) = command {
                        cmd_builder.args(&["--exec", "bash", "-c", &format!("{}; exec bash", cmd_str)]);
                        debug!("⚡ WSL Command: {}", cmd_str);
                    } else {
                        cmd_builder.args(&["--exec", "bash"]);
                    }
                    
                    cmd_builder
                }
                _ => {
                    return Ok(ActionResult {
                        success: false,
                        message: format!("Unsupported terminal type: {}", terminal),
                        execution_time_ms: start_time.elapsed().as_millis() as u64,
                        output: None,
                        error_code: None,
                    });
                }
            };
            
            // Add custom arguments if specified
            if let Some(args) = args {
                cmd.args(args);
                debug!("📝 Additional arguments: {:?}", args);
            }
            
            // Set environment variables
            if let Some(env) = env {
                for (key, value) in env {
                    let expanded_value = expand_environment_variables(value);
                    cmd.env(key, expanded_value);
                    debug!("🌍 Environment: {}={}", key, value);
                }
            }
            
            // Configure stdio
            cmd.stdout(Stdio::null()).stderr(Stdio::null());
            
            match cmd.spawn() {
                Ok(mut child) => {
                    let execution_time = start_time.elapsed().as_millis() as u64;
                    
                    // Don't wait for the terminal to close, just ensure it started
                    match child.try_wait() {
                        Ok(Some(status)) => {
                            if status.success() {
                                info!("✅ Terminal opened successfully in {}ms", execution_time);
                                Ok(ActionResult {
                                    success: true,
                                    message: format!("Terminal '{}' opened successfully", terminal),
                                    execution_time_ms: execution_time,
                                    output: None,
                                    error_code: None,
                                })
                            } else {
                                let error_code = status.code();
                                error!("❌ Terminal exited with error code: {:?}", error_code);
                                Ok(ActionResult {
                                    success: false,
                                    message: format!("Terminal '{}' exited with error", terminal),
                                    execution_time_ms: execution_time,
                                    output: None,
                                    error_code,
                                })
                            }
                        }
                        Ok(None) => {
                            // Terminal is still running, which is expected
                            info!("✅ Terminal opened successfully in {}ms", execution_time);
                            Ok(ActionResult {
                                success: true,
                                message: format!("Terminal '{}' opened successfully", terminal),
                                execution_time_ms: execution_time,
                                output: None,
                                error_code: None,
                            })
                        }
                        Err(e) => {
                            error!("❌ Failed to check terminal status: {}", e);
                            Ok(ActionResult {
                                success: false,
                                message: format!("Failed to check terminal status: {}", e),
                                execution_time_ms: start_time.elapsed().as_millis() as u64,
                                output: None,
                                error_code: None,
                            })
                        }
                    }
                }
                Err(e) => {
                    let execution_time = start_time.elapsed().as_millis() as u64;
                    error!("❌ Failed to open terminal '{}': {}", terminal, e);
                    Ok(ActionResult {
                        success: false,
                        message: format!("Failed to open terminal '{}': {}", terminal, e),
                        execution_time_ms: execution_time,
                        output: None,
                        error_code: None,
                    })
                }
            }
        } else {
            Err(anyhow::anyhow!("Invalid action config for Terminal executor"))
        }
    }
    
    fn supports_action_type(&self, config: &ActionConfig) -> bool {
        matches!(config, ActionConfig::Terminal { .. })
    }
}

// Multi Action Executor
pub struct MultiActionExecutor {
    action_runner: std::sync::Arc<ActionRunner>,
}

impl MultiActionExecutor {
    pub fn new(action_runner: std::sync::Arc<ActionRunner>) -> Self {
        Self { action_runner }
    }
}

#[async_trait::async_trait]
impl ActionExecutor for MultiActionExecutor {
    async fn execute(&self, config: &ActionConfig) -> Result<ActionResult> {
        let start_time = std::time::Instant::now();
        
        if let ActionConfig::MultiAction { actions, delay_between_ms, stop_on_error } = config {
            info!("🔄 Executing multi-action with {} steps", actions.len());
            
            let delay_ms = delay_between_ms.unwrap_or(100);
            let stop_on_error = stop_on_error.unwrap_or(true);
            let mut results = Vec::new();
            let mut total_success = true;
            
            for (index, action) in actions.iter().enumerate() {
                info!("▶️ Executing step {} of {}", index + 1, actions.len());
                
                match self.action_runner.execute_action_config(action).await {
                    Ok(result) => {
                        let success = result.success;
                        results.push(result);
                        
                        if !success {
                            total_success = false;
                            error!("❌ Step {} failed", index + 1);
                            
                            if stop_on_error {
                                error!("🛑 Stopping multi-action due to error in step {}", index + 1);
                                break;
                            }
                        } else {
                            info!("✅ Step {} completed successfully", index + 1);
                        }
                    }
                    Err(e) => {
                        total_success = false;
                        error!("❌ Step {} failed with error: {}", index + 1, e);
                        
                        results.push(ActionResult {
                            success: false,
                            message: format!("Step {} error: {}", index + 1, e),
                            execution_time_ms: 0,
                            output: None,
                            error_code: None,
                        });
                        
                        if stop_on_error {
                            error!("🛑 Stopping multi-action due to error in step {}", index + 1);
                            break;
                        }
                    }
                }
                
                // Add delay between actions (except after the last one)
                if index < actions.len() - 1 && delay_ms > 0 {
                    debug!("⏱️ Waiting {}ms before next step", delay_ms);
                    sleep(Duration::from_millis(delay_ms)).await;
                }
            }
            
            let execution_time = start_time.elapsed().as_millis() as u64;
            let successful_steps = results.iter().filter(|r| r.success).count();
            
            if total_success {
                info!("✅ Multi-action completed successfully in {}ms", execution_time);
            } else {
                warn!("⚠️ Multi-action completed with errors in {}ms", execution_time);
            }
            
            Ok(ActionResult {
                success: total_success,
                message: format!("Multi-action: {}/{} steps successful", successful_steps, results.len()),
                execution_time_ms: execution_time,
                output: Some(serde_json::to_string(&results)?),
                error_code: None,
            })
        } else {
            Err(anyhow::anyhow!("Invalid action config for MultiAction executor"))
        }
    }
    
    fn supports_action_type(&self, config: &ActionConfig) -> bool {
        matches!(config, ActionConfig::MultiAction { .. })
    }
}

// Main Action Runner
pub struct ActionRunner {
    executors: Vec<Box<dyn ActionExecutor>>,
}

impl ActionRunner {
    pub fn new() -> Result<Self> {
        let mut runner = Self {
            executors: Vec::new(),
        };
        
        // Register built-in executors
        runner.executors.push(Box::new(LaunchAppActionExecutor));
        runner.executors.push(Box::new(OpenActionExecutor));
        runner.executors.push(Box::new(TerminalActionExecutor));
        
        info!("🎯 ActionRunner initialized with {} executors", runner.executors.len());
        Ok(runner)
    }
    
    pub async fn execute_action_config(&self, config: &ActionConfig) -> Result<ActionResult> {
        debug!("🎯 Executing action: {:?}", config);
        
        // Find appropriate executor
        for executor in &self.executors {
            if executor.supports_action_type(config) {
                return executor.execute(config).await;
            }
        }
        
        // Handle MultiAction separately since it needs a reference to the runner
        if let ActionConfig::MultiAction { .. } = config {
            let multi_executor = MultiActionExecutor::new(std::sync::Arc::new(Self::new()?));
            return multi_executor.execute(config).await;
        }
        
        Err(anyhow::anyhow!("No executor found for action type"))
    }
    

}

// Helper function to expand environment variables
fn expand_environment_variables(input: &str) -> String {
    let mut result = input.to_string();
    
    // Handle %VARIABLE% format
    while let Some(start) = result.find('%') {
        if let Some(end) = result[start + 1..].find('%') {
            let var_name = &result[start + 1..start + 1 + end];
            if let Ok(var_value) = std::env::var(var_name) {
                result.replace_range(start..start + end + 2, &var_value);
            } else {
                // If variable not found, leave it as is and move past it
                break;
            }
        } else {
            break;
        }
    }
    
    result
}

