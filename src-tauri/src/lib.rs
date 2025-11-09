use std::sync::Mutex;
use tauri::{State, Manager, Emitter};
use anyhow::Result;

mod modules;

use modules::{
    config::{ConfigManager, QDeckConfig},
    logger::{LoggerService, ActionLog},
    hotkey::{HotkeyService, HotkeyConfig, ParsedHotkey},
    action::ActionRunner,
    profile::ProfileManager,
    window::{WindowManager, WindowConfig},
    icon::{IconService, IconInfo, CacheStats},
    drag_drop::{DragDropService, DroppedFile, ButtonGenerationRequest, ButtonGenerationResult, UndoOperation},
};

// Application state
pub struct AppState {
    config_manager: Mutex<ConfigManager>,
    logger_service: Mutex<LoggerService>,
    hotkey_service: Mutex<HotkeyService>,
    action_runner: Mutex<ActionRunner>,
    profile_manager: Mutex<ProfileManager>,
    window_manager: Mutex<WindowManager>,
    icon_service: Mutex<IconService>,
    drag_drop_service: Mutex<DragDropService>,
}

// Tauri commands
#[tauri::command]
async fn get_config(state: State<'_, AppState>) -> Result<QDeckConfig, String> {
    let config_manager = state.config_manager.lock().map_err(|e| e.to_string())?;
    Ok(config_manager.get_config().clone())
}

#[tauri::command]
async fn save_config(config: QDeckConfig, state: State<'_, AppState>) -> Result<(), String> {
    tracing::info!("💾 save_config command called");
    tracing::debug!("💾 Config to save: {:#?}", config);
    
    let mut config_manager = state.config_manager.lock().map_err(|e| {
        tracing::error!("❌ Failed to lock config_manager: {}", e);
        e.to_string()
    })?;
    
    match config_manager.update_config(config) {
        Ok(_) => {
            tracing::info!("✅ Configuration saved successfully");
            Ok(())
        }
        Err(e) => {
            tracing::error!("❌ Failed to save configuration: {}", e);
            Err(e.to_string())
        }
    }
}

#[tauri::command]
async fn show_overlay(state: State<'_, AppState>) -> Result<(), String> {
    let window_manager = state.window_manager.lock().map_err(|e| e.to_string())?;
    window_manager.show_overlay().map_err(|e| e.to_string())
}

#[tauri::command]
async fn hide_overlay(state: State<'_, AppState>) -> Result<(), String> {
    let window_manager = state.window_manager.lock().map_err(|e| e.to_string())?;
    window_manager.hide_overlay().map_err(|e| e.to_string())
}

#[tauri::command]
async fn toggle_overlay(state: State<'_, AppState>) -> Result<(), String> {
    let window_manager = state.window_manager.lock().map_err(|e| e.to_string())?;
    window_manager.toggle_overlay().map_err(|e| e.to_string())
}

#[tauri::command]
async fn is_overlay_visible(state: State<'_, AppState>) -> Result<bool, String> {
    let window_manager = state.window_manager.lock().map_err(|e| e.to_string())?;
    Ok(window_manager.is_overlay_visible())
}

#[tauri::command]
async fn update_overlay_config(config: WindowConfig, state: State<'_, AppState>) -> Result<(), String> {
    let window_manager = state.window_manager.lock().map_err(|e| e.to_string())?;
    window_manager.update_overlay_config(config).map_err(|e| e.to_string())
}

#[tauri::command]
async fn position_overlay(placement: String, state: State<'_, AppState>) -> Result<(), String> {
    let window_manager = state.window_manager.lock().map_err(|e| e.to_string())?;
    match placement.as_str() {
        "dropdown-top" => window_manager.position_overlay_dropdown_top().map_err(|e| e.to_string()),
        "center" => window_manager.position_overlay_center().map_err(|e| e.to_string()),
        _ => Err(format!("Unknown placement: {}", placement)),
    }
}

#[tauri::command]
async fn execute_action(action_id: String, state: State<'_, AppState>) -> Result<modules::action::ActionResult, String> {
    tracing::info!("🎯 Execute action command called: {}", action_id);
    
    // Clone the config to avoid holding locks across await
    let config = {
        let config_manager = state.config_manager.lock().map_err(|e| {
            tracing::error!("❌ Failed to lock config_manager: {}", e);
            e.to_string()
        })?;
        config_manager.get_config().clone()
    };
    
    // Create a new action runner to avoid holding locks across await
    let action_runner = modules::action::ActionRunner::new().map_err(|e| e.to_string())?;
    
    // Find the action in the configuration
    let mut action_config = None;
    tracing::info!("🔍 Searching for action: {}", action_id);
    
    'outer: for profile in &config.profiles {
        tracing::debug!("🔍 Checking profile: {}", profile.name);
        for page in &profile.pages {
            tracing::debug!("🔍 Checking page: {}", page.name);
            for button in &page.buttons {
                // Create a unique ID for each button (profile:page:row:col)
                let button_id = format!("{}:{}:{}:{}", 
                    profile.name, page.name, button.position.row, button.position.col);
                
                tracing::debug!("🔍 Checking button: {} (ID: {}, Label: {})", button.label, button_id, button.label);
                
                if button_id == action_id || button.label == action_id {
                    tracing::info!("✅ Found matching button: {}", button.label);
                    // Convert button config to ActionConfig
                    if let Some(config) = button_to_action_config(button) {
                        action_config = Some(config);
                        break 'outer;
                    } else {
                        tracing::warn!("⚠️ Failed to convert button config for: {}", button.label);
                    }
                }
            }
        }
    }
    
    let action_config = action_config.ok_or_else(|| format!("Action not found: {}", action_id))?;
    
    match action_runner.execute_action_config(&action_config).await {
        Ok(result) => {
            if result.success {
                tracing::info!("✅ Action '{}' executed successfully in {}ms", action_id, result.execution_time_ms);
            } else {
                tracing::error!("❌ Action '{}' failed: {}", action_id, result.message);
            }
            
            // Log the action execution
            {
                let logger = state.logger_service.lock().map_err(|e| e.to_string())?;
                let log_entry = modules::logger::ActionLog {
                    timestamp: chrono::Utc::now(),
                    action_type: "execute_action".to_string(),
                    action_id: action_id.clone(),
                    result: if result.success { 
                        modules::logger::ActionResult::Success 
                    } else { 
                        modules::logger::ActionResult::Failed 
                    },
                    execution_time_ms: result.execution_time_ms,
                    error_message: if result.success { None } else { Some(result.message.clone()) },
                    context: std::collections::HashMap::new(),
                };
                
                if let Err(e) = logger.log_action(log_entry) {
                    tracing::warn!("⚠️ Failed to log action execution: {}", e);
                }
            }
            
            Ok(result)
        }
        Err(e) => {
            tracing::error!("❌ Failed to execute action '{}': {}", action_id, e);
            Err(e.to_string())
        }
    }
}

#[tauri::command]
async fn get_recent_logs(limit: usize, state: State<'_, AppState>) -> Result<Vec<ActionLog>, String> {
    let logger = state.logger_service.lock().map_err(|e| e.to_string())?;
    logger.get_recent_logs(limit).map_err(|e| e.to_string())
}

#[tauri::command]
async fn register_hotkey(hotkey_str: String, action: String, state: State<'_, AppState>) -> Result<u32, String> {
    let mut hotkey_service = state.hotkey_service.lock().map_err(|e| e.to_string())?;
    hotkey_service.register_hotkey(&hotkey_str, action).map_err(|e| e.to_string())
}

#[tauri::command]
async fn unregister_hotkey(id: u32, state: State<'_, AppState>) -> Result<(), String> {
    let mut hotkey_service = state.hotkey_service.lock().map_err(|e| e.to_string())?;
    hotkey_service.unregister_hotkey(id).map_err(|e| e.to_string())
}

#[tauri::command]
async fn register_multiple_hotkeys(hotkey_configs: Vec<HotkeyConfig>, state: State<'_, AppState>) -> Result<Vec<u32>, String> {
    let mut hotkey_service = state.hotkey_service.lock().map_err(|e| e.to_string())?;
    hotkey_service.register_multiple_hotkeys(hotkey_configs).map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_registered_hotkeys(state: State<'_, AppState>) -> Result<Vec<ParsedHotkey>, String> {
    let hotkey_service = state.hotkey_service.lock().map_err(|e| e.to_string())?;
    Ok(hotkey_service.get_registered_hotkeys())
}

#[tauri::command]
async fn is_hotkey_available(hotkey_str: String, state: State<'_, AppState>) -> Result<bool, String> {
    let hotkey_service = state.hotkey_service.lock().map_err(|e| e.to_string())?;
    Ok(hotkey_service.is_hotkey_available(&hotkey_str))
}

#[tauri::command]
async fn process_icon(icon_spec: String, fallback_executable: Option<String>, state: State<'_, AppState>) -> Result<IconInfo, String> {
    let mut icon_service = state.icon_service.lock().map_err(|e| e.to_string())?;
    icon_service.process_icon(&icon_spec, fallback_executable.as_deref()).map_err(|e| e.to_string())
}

#[tauri::command]
async fn extract_executable_icon(exe_path: String, icon_id: String, state: State<'_, AppState>) -> Result<IconInfo, String> {
    let icon_service = state.icon_service.lock().map_err(|e| e.to_string())?;
    icon_service.extract_executable_icon(&exe_path, &icon_id).map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_icon_cache_stats(state: State<'_, AppState>) -> Result<CacheStats, String> {
    let icon_service = state.icon_service.lock().map_err(|e| e.to_string())?;
    Ok(icon_service.get_cache_stats())
}

#[tauri::command]
async fn clear_icon_cache(state: State<'_, AppState>) -> Result<(), String> {
    let mut icon_service = state.icon_service.lock().map_err(|e| e.to_string())?;
    icon_service.clear_cache().map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_profiles(state: State<'_, AppState>) -> Result<Vec<modules::profile::ProfileInfo>, String> {
    let profile_manager = state.profile_manager.lock().map_err(|e| e.to_string())?;
    let config_manager = state.config_manager.lock().map_err(|e| e.to_string())?;
    
    Ok(profile_manager.get_profiles(config_manager.get_config()))
}

#[tauri::command]
async fn get_current_profile(state: State<'_, AppState>) -> Result<modules::profile::ProfileInfo, String> {
    let profile_manager = state.profile_manager.lock().map_err(|e| e.to_string())?;
    let config_manager = state.config_manager.lock().map_err(|e| e.to_string())?;
    
    profile_manager.get_current_profile(config_manager.get_config()).map_err(|e| e.to_string())
}

#[tauri::command]
async fn switch_to_profile(profile_index: usize, state: State<'_, AppState>) -> Result<modules::profile::ProfileInfo, String> {
    let mut profile_manager = state.profile_manager.lock().map_err(|e| e.to_string())?;
    let config_manager = state.config_manager.lock().map_err(|e| e.to_string())?;
    
    profile_manager.switch_to_profile(profile_index, config_manager.get_config()).map_err(|e| e.to_string())
}

#[tauri::command]
async fn switch_to_profile_by_name(profile_name: String, state: State<'_, AppState>) -> Result<modules::profile::ProfileInfo, String> {
    let mut profile_manager = state.profile_manager.lock().map_err(|e| e.to_string())?;
    let config_manager = state.config_manager.lock().map_err(|e| e.to_string())?;
    
    profile_manager.switch_to_profile_by_name(&profile_name, config_manager.get_config()).map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_current_profile_pages(state: State<'_, AppState>) -> Result<Vec<modules::profile::PageInfo>, String> {
    let profile_manager = state.profile_manager.lock().map_err(|e| e.to_string())?;
    let config_manager = state.config_manager.lock().map_err(|e| e.to_string())?;
    
    profile_manager.get_current_profile_pages(config_manager.get_config()).map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_current_page(state: State<'_, AppState>) -> Result<modules::profile::PageInfo, String> {
    let profile_manager = state.profile_manager.lock().map_err(|e| e.to_string())?;
    let config_manager = state.config_manager.lock().map_err(|e| e.to_string())?;
    
    profile_manager.get_current_page(config_manager.get_config()).map_err(|e| e.to_string())
}

#[tauri::command]
async fn switch_to_page(page_index: usize, state: State<'_, AppState>) -> Result<modules::profile::PageInfo, String> {
    let mut profile_manager = state.profile_manager.lock().map_err(|e| e.to_string())?;
    let config_manager = state.config_manager.lock().map_err(|e| e.to_string())?;
    
    profile_manager.switch_to_page(page_index, config_manager.get_config()).map_err(|e| e.to_string())
}

#[tauri::command]
async fn next_page(state: State<'_, AppState>) -> Result<modules::profile::PageInfo, String> {
    let mut profile_manager = state.profile_manager.lock().map_err(|e| e.to_string())?;
    let config_manager = state.config_manager.lock().map_err(|e| e.to_string())?;
    
    profile_manager.next_page(config_manager.get_config()).map_err(|e| e.to_string())
}

#[tauri::command]
async fn previous_page(state: State<'_, AppState>) -> Result<modules::profile::PageInfo, String> {
    let mut profile_manager = state.profile_manager.lock().map_err(|e| e.to_string())?;
    let config_manager = state.config_manager.lock().map_err(|e| e.to_string())?;
    
    profile_manager.previous_page(config_manager.get_config()).map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_navigation_context(state: State<'_, AppState>) -> Result<modules::profile::NavigationContext, String> {
    let profile_manager = state.profile_manager.lock().map_err(|e| e.to_string())?;
    let config_manager = state.config_manager.lock().map_err(|e| e.to_string())?;
    
    profile_manager.get_navigation_context(config_manager.get_config()).map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_log_stats(state: State<'_, AppState>) -> Result<modules::logger::LogStats, String> {
    let logger = state.logger_service.lock().map_err(|e| e.to_string())?;
    logger.get_log_stats().map_err(|e| e.to_string())
}

#[tauri::command]
async fn rotate_logs(state: State<'_, AppState>) -> Result<(), String> {
    let logger = state.logger_service.lock().map_err(|e| e.to_string())?;
    logger.rotate_logs().map_err(|e| e.to_string())
}

#[tauri::command]
async fn cleanup_logs_by_size(max_size_mb: u64, state: State<'_, AppState>) -> Result<(), String> {
    let logger = state.logger_service.lock().map_err(|e| e.to_string())?;
    logger.cleanup_logs_by_size(max_size_mb).map_err(|e| e.to_string())
}

// Drag and drop commands
#[tauri::command]
async fn analyze_dropped_files(file_paths: Vec<String>, state: State<'_, AppState>) -> Result<Vec<DroppedFile>, String> {
    tracing::info!("🎯 TAURI_COMMAND - analyze_dropped_files called");
    tracing::info!("🎯 TAURI_COMMAND - Input file_paths: {:?}", file_paths);
    tracing::info!("🎯 TAURI_COMMAND - Number of paths: {}", file_paths.len());
    
    // Log current working directory at command level
    if let Ok(current_dir) = std::env::current_dir() {
        tracing::info!("🎯 TAURI_COMMAND - Current working directory: {}", current_dir.display());
    }
    
    let drag_drop_service = state.drag_drop_service.lock().map_err(|e| {
        tracing::error!("❌ TAURI_COMMAND - Failed to lock drag_drop_service: {}", e);
        e.to_string()
    })?;
    
    match drag_drop_service.analyze_dropped_files(file_paths) {
        Ok(result) => {
            tracing::info!("✅ TAURI_COMMAND - analyze_dropped_files completed successfully");
            tracing::info!("✅ TAURI_COMMAND - Analyzed {} files", result.len());
            for (index, file) in result.iter().enumerate() {
                tracing::info!("✅ TAURI_COMMAND - File[{}]: '{}' -> {:?}", index, file.path, file.file_type);
            }
            Ok(result)
        }
        Err(e) => {
            tracing::error!("❌ TAURI_COMMAND - analyze_dropped_files failed: {}", e);
            Err(e.to_string())
        }
    }
}

#[tauri::command]
async fn generate_buttons_from_files(request: ButtonGenerationRequest, state: State<'_, AppState>) -> Result<ButtonGenerationResult, String> {
    tracing::info!("🎯 TAURI_COMMAND - generate_buttons_from_files called");
    tracing::info!("🎯 TAURI_COMMAND - Request files count: {}", request.files.len());
    tracing::info!("🎯 TAURI_COMMAND - Target position: {:?}", request.target_position);
    tracing::info!("🎯 TAURI_COMMAND - Grid size: {}x{}", request.grid_rows, request.grid_cols);
    
    for (index, file) in request.files.iter().enumerate() {
        tracing::info!("🎯 TAURI_COMMAND - Request file[{}]: '{}' ({:?})", index, file.path, file.file_type);
    }
    
    let mut drag_drop_service = state.drag_drop_service.lock().map_err(|e| {
        tracing::error!("❌ TAURI_COMMAND - Failed to lock drag_drop_service: {}", e);
        e.to_string()
    })?;
    
    match drag_drop_service.generate_buttons_from_files(request) {
        Ok(result) => {
            tracing::info!("✅ TAURI_COMMAND - generate_buttons_from_files completed successfully");
            tracing::info!("✅ TAURI_COMMAND - Generated {} buttons", result.generated_buttons.len());
            tracing::info!("✅ TAURI_COMMAND - {} conflicts, {} errors", result.conflicts.len(), result.errors.len());
            
            for (index, button) in result.generated_buttons.iter().enumerate() {
                if let Some(target) = button.config.get("target") {
                    tracing::info!("✅ TAURI_COMMAND - Generated button[{}]: '{}' -> target: '{}'", 
                        index, button.label, target.as_str().unwrap_or("N/A"));
                }
            }
            
            Ok(result)
        }
        Err(e) => {
            tracing::error!("❌ TAURI_COMMAND - generate_buttons_from_files failed: {}", e);
            Err(e.to_string())
        }
    }
}

#[tauri::command]
async fn add_undo_operation(operation: UndoOperation, state: State<'_, AppState>) -> Result<(), String> {
    let mut drag_drop_service = state.drag_drop_service.lock().map_err(|e| e.to_string())?;
    drag_drop_service.add_undo_operation(operation);
    Ok(())
}

#[tauri::command]
async fn get_last_undo_operation(state: State<'_, AppState>) -> Result<Option<UndoOperation>, String> {
    let drag_drop_service = state.drag_drop_service.lock().map_err(|e| e.to_string())?;
    Ok(drag_drop_service.get_last_undo_operation().cloned())
}

#[tauri::command]
async fn undo_last_operation(state: State<'_, AppState>) -> Result<Option<UndoOperation>, String> {
    let mut drag_drop_service = state.drag_drop_service.lock().map_err(|e| e.to_string())?;
    Ok(drag_drop_service.pop_undo_operation())
}

#[tauri::command]
async fn clear_undo_history(state: State<'_, AppState>) -> Result<(), String> {
    let mut drag_drop_service = state.drag_drop_service.lock().map_err(|e| e.to_string())?;
    drag_drop_service.clear_undo_history();
    Ok(())
}

#[tauri::command]
async fn get_undo_stats(state: State<'_, AppState>) -> Result<(usize, usize), String> {
    let drag_drop_service = state.drag_drop_service.lock().map_err(|e| e.to_string())?;
    Ok(drag_drop_service.get_undo_stats())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Initialize logging first
    let logger_service = LoggerService::new()
        .expect("Failed to initialize logging service");
    
    // Initialize other services
    let config_manager = ConfigManager::new()
        .expect("Failed to initialize config manager");
    
    let mut hotkey_service = HotkeyService::new()
        .expect("Failed to initialize hotkey service");
    
    let action_runner = ActionRunner::new()
        .expect("Failed to initialize action runner");
    
    let _profile_manager = ProfileManager::new()
        .expect("Failed to initialize profile manager");
    
    let icon_service = IconService::new()
        .expect("Failed to initialize icon service");
    
    let drag_drop_service = DragDropService::new()
        .expect("Failed to initialize drag drop service");

    tracing::info!("Starting Q-Deck application");

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            // Change working directory to the parent of src-tauri (project root)
            if let Ok(current_exe) = std::env::current_exe() {
                tracing::info!("🔍 STARTUP - Current executable: {}", current_exe.display());
                if let Some(exe_dir) = current_exe.parent() {
                    tracing::info!("🔍 STARTUP - Executable directory: {}", exe_dir.display());
                    
                    // Check if we're in development mode (target/debug) or production (src-tauri)
                    let dir_name = exe_dir.file_name().and_then(|n| n.to_str());
                    tracing::info!("🔍 STARTUP - Directory name: {:?}", dir_name);
                    
                    let project_root = if dir_name == Some("src-tauri") {
                        // Production build
                        exe_dir.parent()
                    } else if dir_name == Some("debug") || dir_name == Some("release") {
                        // Development build (target/debug or target/release)
                        // Go up: target/debug -> target -> src-tauri -> project_root
                        exe_dir.parent().and_then(|p| p.parent()).and_then(|p| p.parent())
                    } else {
                        None
                    };
                    
                    if let Some(project_root) = project_root {
                        tracing::info!("🔍 STARTUP - Attempting to change to project root: {}", project_root.display());
                        if let Err(e) = std::env::set_current_dir(project_root) {
                            tracing::warn!("Failed to change working directory to project root: {}", e);
                        } else {
                            tracing::info!("✅ Changed working directory to: {}", project_root.display());
                        }
                    } else {
                        tracing::warn!("Could not determine project root from executable path");
                    }
                } else {
                    tracing::warn!("Could not get parent directory of executable");
                }
            } else {
                tracing::warn!("Could not get current executable path");
            }
            
            // Log current working directory for debugging
            if let Ok(current_dir) = std::env::current_dir() {
                tracing::info!("🔍 STARTUP - Current working directory: {}", current_dir.display());
            } else {
                tracing::error!("❌ STARTUP - Failed to get current working directory");
            }
            
            // Initialize window manager with app handle
            let window_manager = WindowManager::new(app.handle().clone());
            
            // Create shared reference for hotkey callback
            let window_manager_for_callback = window_manager.clone();
            
            // Set up hotkey callback that actually controls the overlay
            let callback = std::sync::Arc::new(move |action: &str| {
                tracing::info!("Hotkey triggered: {}", action);
                match action {
                    "show_overlay" => {
                        tracing::info!("Show overlay hotkey triggered");
                        if let Err(e) = window_manager_for_callback.show_overlay() {
                            tracing::error!("Failed to show overlay from hotkey: {}", e);
                        }
                    }
                    "hide_overlay" => {
                        tracing::info!("Hide overlay hotkey triggered");
                        if let Err(e) = window_manager_for_callback.hide_overlay() {
                            tracing::error!("Failed to hide overlay from hotkey: {}", e);
                        }
                    }
                    "toggle_overlay" => {
                        tracing::info!("Toggle overlay hotkey triggered");
                        if let Err(e) = window_manager_for_callback.toggle_overlay() {
                            tracing::error!("Failed to toggle overlay from hotkey: {}", e);
                        }
                    }
                    action if action.starts_with("switch_profile:") => {
                        let profile_name = &action[15..]; // Remove "switch_profile:" prefix
                        tracing::info!("Switch profile hotkey triggered: {}", profile_name);
                        
                        // Get the app state to access profile manager and config
                        let app_handle = window_manager_for_callback.get_app_handle();
                        if let Some(app_state) = app_handle.try_state::<AppState>() {
                            let mut profile_manager = match app_state.profile_manager.lock() {
                                Ok(pm) => pm,
                                Err(e) => {
                                    tracing::error!("Failed to lock profile manager: {}", e);
                                    return;
                                }
                            };
                            
                            let config_manager = match app_state.config_manager.lock() {
                                Ok(cm) => cm,
                                Err(e) => {
                                    tracing::error!("Failed to lock config manager: {}", e);
                                    return;
                                }
                            };
                            
                            match profile_manager.switch_to_profile_by_name(profile_name, config_manager.get_config()) {
                                Ok(profile_info) => {
                                    tracing::info!("✅ Switched to profile: {} ({})", profile_info.name, profile_info.index);
                                    
                                    // Emit an event to notify the frontend
                                    if let Err(e) = app_handle.emit("profile-changed", &profile_info) {
                                        tracing::error!("Failed to emit profile-changed event: {}", e);
                                    }
                                }
                                Err(e) => {
                                    tracing::error!("❌ Failed to switch to profile '{}': {}", profile_name, e);
                                }
                            }
                        }
                    }
                    _ => {
                        tracing::info!("Unknown hotkey action: {}", action);
                    }
                }
            });
            
            hotkey_service.set_callback(callback);

            // Register default hotkeys from config
            let config = config_manager.get_config();
            
            // Register summon hotkeys
            for hotkey_str in &config.ui.summon.hotkeys {
                // First check if hotkey is available
                let is_available = hotkey_service.is_hotkey_available(hotkey_str);
                tracing::info!("🔍 Hotkey '{}' availability check: {}", hotkey_str, is_available);
                
                match hotkey_service.register_hotkey(hotkey_str, "toggle_overlay".to_string()) {
                    Ok(id) => {
                        tracing::info!("✅ Registered summon hotkey '{}' with ID {}", hotkey_str, id);
                    }
                    Err(e) => {
                        tracing::error!("❌ Failed to register summon hotkey '{}': {}", hotkey_str, e);
                        
                        // Try alternative hotkeys if the primary one fails
                        let alternatives = vec!["Ctrl+Alt+Q", "Ctrl+F11", "Alt+F12"];
                        for alt_hotkey in alternatives {
                            tracing::info!("🔄 Trying alternative hotkey: {}", alt_hotkey);
                            match hotkey_service.register_hotkey(alt_hotkey, "toggle_overlay".to_string()) {
                                Ok(alt_id) => {
                                    tracing::info!("✅ Successfully registered alternative hotkey '{}' with ID {}", alt_hotkey, alt_id);
                                    break;
                                }
                                Err(alt_e) => {
                                    tracing::warn!("⚠️ Alternative hotkey '{}' also failed: {}", alt_hotkey, alt_e);
                                }
                            }
                        }
                    }
                }
            }
            
            // Register profile-specific hotkeys
            for profile in &config.profiles {
                if let Some(hotkey_str) = &profile.hotkey {
                    let action = format!("switch_profile:{}", profile.name);
                    match hotkey_service.register_hotkey(hotkey_str, action) {
                        Ok(id) => {
                            tracing::info!("Registered profile hotkey '{}' for profile '{}' with ID {}", hotkey_str, profile.name, id);
                        }
                        Err(e) => {
                            tracing::error!("Failed to register profile hotkey '{}' for profile '{}': {}", hotkey_str, profile.name, e);
                        }
                    }
                }
            }

            // Note: Escape key should be handled by the frontend when overlay is visible,
            // not as a global hotkey. Global Escape would interfere with other applications.

            // Start hotkey message loop
            if let Err(e) = hotkey_service.start_message_loop() {
                tracing::error!("Failed to start hotkey message loop: {}", e);
            }

            // Initialize profile manager with config
            let mut profile_manager = ProfileManager::new()
                .expect("Failed to initialize profile manager");
            
            if let Err(e) = profile_manager.initialize_from_config(&config) {
                tracing::error!("Failed to initialize profile manager from config: {}", e);
            }

            // Create application state
            let app_state = AppState {
                config_manager: Mutex::new(config_manager),
                logger_service: Mutex::new(logger_service),
                hotkey_service: Mutex::new(hotkey_service),
                action_runner: Mutex::new(action_runner),
                profile_manager: Mutex::new(profile_manager),
                window_manager: Mutex::new(window_manager),
                icon_service: Mutex::new(icon_service),
                drag_drop_service: Mutex::new(drag_drop_service),
            };

            app.manage(app_state);
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_config,
            save_config,
            show_overlay,
            hide_overlay,
            toggle_overlay,
            is_overlay_visible,
            update_overlay_config,
            position_overlay,
            execute_action,
            get_recent_logs,
            get_log_stats,
            rotate_logs,
            cleanup_logs_by_size,
            register_hotkey,
            unregister_hotkey,
            register_multiple_hotkeys,
            get_registered_hotkeys,
            is_hotkey_available,
            process_icon,
            extract_executable_icon,
            get_icon_cache_stats,
            clear_icon_cache,
            get_profiles,
            get_current_profile,
            switch_to_profile,
            switch_to_profile_by_name,
            get_current_profile_pages,
            get_current_page,
            switch_to_page,
            next_page,
            previous_page,
            get_navigation_context,
            analyze_dropped_files,
            generate_buttons_from_files,
            add_undo_operation,
            get_last_undo_operation,
            undo_last_operation,
            clear_undo_history,
            get_undo_stats
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
// Helper function to convert ActionButton to ActionConfig
fn button_to_action_config(button: &modules::config::ActionButton) -> Option<modules::action::ActionConfig> {
    use modules::config::ActionType;
    
    tracing::debug!("🔄 Converting button config for: {} (type: {:?})", button.label, button.action_type);
    
    match button.action_type {
        ActionType::LaunchApp => {
            tracing::debug!("🚀 Processing LaunchApp action");
            let path = button.config.get("path")?.as_str()?.to_string();
            tracing::debug!("📁 App path: {}", path);
            
            let args = button.config.get("args")
                .and_then(|v| v.as_array())
                .map(|arr| arr.iter().filter_map(|v| v.as_str().map(|s| s.to_string())).collect());
            let workdir = button.config.get("workdir")
                .and_then(|v| v.as_str())
                .map(|s| s.to_string());
            let env = button.config.get("env")
                .and_then(|v| v.as_object())
                .map(|obj| obj.iter()
                    .filter_map(|(k, v)| v.as_str().map(|s| (k.clone(), s.to_string())))
                    .collect());
            
            let action_config = modules::action::ActionConfig::LaunchApp { path, args, workdir, env };
            tracing::debug!("✅ Created LaunchApp config");
            Some(action_config)
        }
        ActionType::Open => {
            tracing::debug!("📂 Processing Open action");
            let target = button.config.get("target")?.as_str()?.to_string();
            tracing::debug!("🎯 Open target: {}", target);
            
            let verb = button.config.get("verb")
                .and_then(|v| v.as_str())
                .map(|s| s.to_string());
            
            let action_config = modules::action::ActionConfig::Open { target, verb };
            tracing::debug!("✅ Created Open config");
            Some(action_config)
        }
        ActionType::Terminal => {
            tracing::debug!("💻 Processing Terminal action");
            let terminal = button.config.get("terminal")?.as_str()?.to_string();
            tracing::debug!("🖥️ Terminal type: {}", terminal);
            
            let profile = button.config.get("profile")
                .and_then(|v| v.as_str())
                .map(|s| s.to_string());
            let workdir = button.config.get("workdir")
                .and_then(|v| v.as_str())
                .map(|s| s.to_string());
            let command = button.config.get("command")
                .and_then(|v| v.as_str())
                .map(|s| s.to_string());
            let env = button.config.get("env")
                .and_then(|v| v.as_object())
                .map(|obj| obj.iter()
                    .filter_map(|(k, v)| v.as_str().map(|s| (k.clone(), s.to_string())))
                    .collect());
            let args = button.config.get("args")
                .and_then(|v| v.as_array())
                .map(|arr| arr.iter().filter_map(|v| v.as_str().map(|s| s.to_string())).collect());
            
            let action_config = modules::action::ActionConfig::Terminal { terminal, profile, workdir, command, env, args };
            tracing::debug!("✅ Created Terminal config");
            Some(action_config)
        }
        ActionType::MultiAction => {
            let actions_array = button.config.get("actions")?.as_array()?;
            let mut actions = Vec::new();
            
            for action_value in actions_array {
                if let Some(action_obj) = action_value.as_object() {
                    // Create a temporary ActionButton to convert
                    let temp_button = modules::config::ActionButton {
                        position: modules::config::Position { row: 0, col: 0 },
                        action_type: serde_json::from_value(action_obj.get("action_type")?.clone()).ok()?,
                        label: "temp".to_string(),
                        icon: None,
                        config: action_obj.get("config")?.as_object()?.iter()
                            .map(|(k, v)| (k.clone(), v.clone()))
                            .collect(),
                        style: None,
                        action: None,
                    };
                    
                    if let Some(action_config) = button_to_action_config(&temp_button) {
                        actions.push(action_config);
                    }
                }
            }
            
            let delay_between_ms = button.config.get("delay_between_ms")
                .and_then(|v| v.as_u64());
            let stop_on_error = button.config.get("stop_on_error")
                .and_then(|v| v.as_bool());
            
            Some(modules::action::ActionConfig::MultiAction { actions, delay_between_ms, stop_on_error })
        }
        _ => {
            tracing::warn!("⚠️ Unsupported action type: {:?}", button.action_type);
            None // SendKeys, PowerShell, Folder not implemented yet
        }
    }
}