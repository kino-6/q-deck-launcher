use std::sync::Mutex;
use tauri::{State, Manager};
use anyhow::Result;

mod modules;

use modules::{
    config::{ConfigManager, QDeckConfig},
    logger::{LoggerService, ActionLog},
    hotkey::{HotkeyService, HotkeyConfig, ParsedHotkey},
    action::ActionRunner,
    profile::ProfileManager,
    window::{WindowManager, WindowConfig},
};

// Application state
pub struct AppState {
    config_manager: Mutex<ConfigManager>,
    logger_service: Mutex<LoggerService>,
    hotkey_service: Mutex<HotkeyService>,
    action_runner: Mutex<ActionRunner>,
    profile_manager: Mutex<ProfileManager>,
    window_manager: Mutex<WindowManager>,
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
async fn execute_action(action_id: String, state: State<'_, AppState>) -> Result<(), String> {
    // Implementation will be added in task 5
    tracing::info!("Execute action command called: {}", action_id);
    Ok(())
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
    
    let profile_manager = ProfileManager::new()
        .expect("Failed to initialize profile manager");

    tracing::info!("Starting Q-Deck application");

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
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
                        // TODO: Implement profile switching in later tasks
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

            // Register Escape key to hide overlay
            match hotkey_service.register_hotkey("Escape", "hide_overlay".to_string()) {
                Ok(id) => {
                    tracing::info!("✅ Registered Escape key for hiding overlay with ID {}", id);
                }
                Err(e) => {
                    tracing::warn!("⚠️ Failed to register Escape key: {}", e);
                }
            }

            // Start hotkey message loop
            if let Err(e) = hotkey_service.start_message_loop() {
                tracing::error!("Failed to start hotkey message loop: {}", e);
            }

            // Create application state
            let app_state = AppState {
                config_manager: Mutex::new(config_manager),
                logger_service: Mutex::new(logger_service),
                hotkey_service: Mutex::new(hotkey_service),
                action_runner: Mutex::new(action_runner),
                profile_manager: Mutex::new(profile_manager),
                window_manager: Mutex::new(window_manager),
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
            register_hotkey,
            unregister_hotkey,
            register_multiple_hotkeys,
            get_registered_hotkeys,
            is_hotkey_available
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
