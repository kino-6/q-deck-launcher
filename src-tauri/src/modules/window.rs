use anyhow::Result;
use std::sync::{Arc, Mutex};
use tauri::{AppHandle, Manager, WebviewWindow, WebviewWindowBuilder, WebviewUrl, Listener};
use tracing::{debug, error, info, warn};

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct WindowConfig {
    pub width: f64,
    pub height: f64,
    pub x: Option<f64>,
    pub y: Option<f64>,
    pub opacity: f64,
    pub always_on_top: bool,
    pub decorations: bool,
    pub resizable: bool,
    pub visible: bool,
    pub transparent: bool,
    pub skip_taskbar: bool,
    pub focus: bool,
}

impl Default for WindowConfig {
    fn default() -> Self {
        Self {
            width: 100.0,
            height: 100.0,
            x: None,
            y: None,
            opacity: 0.92,
            always_on_top: true,
            decorations: false,
            resizable: false,
            visible: false,
            transparent: true,
            skip_taskbar: true,
            focus: true,
        }
    }
}

pub struct WindowManager {
    app_handle: AppHandle,
    overlay_config: Arc<Mutex<WindowConfig>>,
    is_overlay_visible: Arc<Mutex<bool>>,
}

impl WindowManager {
    pub fn new(app_handle: AppHandle) -> Self {
        Self {
            app_handle,
            overlay_config: Arc::new(Mutex::new(WindowConfig::default())),
            is_overlay_visible: Arc::new(Mutex::new(false)),
        }
    }

    pub fn get_app_handle(&self) -> &AppHandle {
        &self.app_handle
    }

    pub fn show_overlay(&self) -> Result<()> {
        info!("Attempting to show overlay window");

        // Check if overlay is already visible
        {
            let mut is_visible = self.is_overlay_visible.lock().unwrap();
            if *is_visible {
                info!("Overlay is already visible");
                return Ok(());
            }
            *is_visible = true;
        }

        // Calculate optimal window size based on grid
        self.calculate_and_update_window_size()?;

        // Try to get existing overlay window
        if let Some(overlay_window) = self.app_handle.get_webview_window("overlay") {
            info!("Using existing overlay window");
            self.configure_overlay_window(&overlay_window)?;
            self.position_overlay_dropdown_top()?; // Position for dropdown animation
            overlay_window.show()?;
            overlay_window.set_focus()?;
        } else {
            info!("Creating new overlay window");
            self.create_overlay_window()?;
            self.position_overlay_dropdown_top()?; // Position for dropdown animation
        }

        info!("Overlay window shown successfully");
        Ok(())
    }

    pub fn hide_overlay(&self) -> Result<()> {
        info!("Attempting to hide overlay window");

        // Update visibility state
        {
            let mut is_visible = self.is_overlay_visible.lock().unwrap();
            if !*is_visible {
                info!("Overlay is already hidden");
                return Ok(());
            }
            *is_visible = false;
        }

        if let Some(overlay_window) = self.app_handle.get_webview_window("overlay") {
            overlay_window.hide()?;
            info!("Overlay window hidden successfully");
        } else {
            warn!("Overlay window not found when trying to hide");
        }

        Ok(())
    }

    pub fn toggle_overlay(&self) -> Result<()> {
        let is_visible = {
            let is_visible = self.is_overlay_visible.lock().unwrap();
            *is_visible
        };

        if is_visible {
            self.hide_overlay()
        } else {
            self.show_overlay()
        }
    }

    pub fn is_overlay_visible(&self) -> bool {
        let is_visible = self.is_overlay_visible.lock().unwrap();
        *is_visible
    }

    pub fn update_overlay_config(&self, config: WindowConfig) -> Result<()> {
        {
            let mut overlay_config = self.overlay_config.lock().unwrap();
            *overlay_config = config;
        }

        // Apply config to existing window if it exists
        if let Some(overlay_window) = self.app_handle.get_webview_window("overlay") {
            self.configure_overlay_window(&overlay_window)?;
        }

        Ok(())
    }

    pub fn get_overlay_config(&self) -> WindowConfig {
        let overlay_config = self.overlay_config.lock().unwrap();
        overlay_config.clone()
    }

    fn create_overlay_window(&self) -> Result<()> {
        let config = self.get_overlay_config();
        
        let mut window_builder = WebviewWindowBuilder::new(
            &self.app_handle,
            "overlay",
            WebviewUrl::App("/overlay".into())
        )
        .title("Q-Deck Overlay")
        .inner_size(config.width, config.height)
        .resizable(config.resizable)
        .maximizable(false)
        .minimizable(false)
        .closable(false)
        .decorations(config.decorations)
        .always_on_top(config.always_on_top)
        .visible(config.visible)
        .transparent(config.transparent)
        .skip_taskbar(config.skip_taskbar)
        .focused(config.focus);

        // Set position if specified
        if let (Some(x), Some(y)) = (config.x, config.y) {
            window_builder = window_builder.position(x, y);
        } else {
            window_builder = window_builder.center();
        }

        let overlay_window = window_builder.build()?;
        
        // Apply additional configuration
        self.configure_overlay_window(&overlay_window)?;
        
        // Set up window event handlers
        self.setup_overlay_event_handlers(&overlay_window)?;

        info!("Overlay window created successfully");
        Ok(())
    }

    fn configure_overlay_window(&self, window: &WebviewWindow) -> Result<()> {
        let config = self.get_overlay_config();

        // Note: Opacity is handled by CSS in Tauri v2

        // Set size
        if let Err(e) = window.set_size(tauri::Size::Physical(tauri::PhysicalSize {
            width: config.width as u32,
            height: config.height as u32,
        })) {
            warn!("Failed to set window size: {}", e);
        }

        // Set position if specified
        if let (Some(x), Some(y)) = (config.x, config.y) {
            if let Err(e) = window.set_position(tauri::Position::Physical(tauri::PhysicalPosition {
                x: x as i32,
                y: y as i32,
            })) {
                warn!("Failed to set window position: {}", e);
            }
        }

        Ok(())
    }

    fn setup_overlay_event_handlers(&self, window: &WebviewWindow) -> Result<()> {
        let window_manager = self.clone();
        let window_clone = window.clone();

        // Handle window focus lost (click outside to close)
        window.on_window_event(move |event| {
            match event {
                tauri::WindowEvent::Focused(focused) => {
                    if !focused {
                        debug!("Overlay window lost focus, hiding");
                        if let Err(e) = window_manager.hide_overlay() {
                            error!("Failed to hide overlay on focus lost: {}", e);
                        }
                    }
                }
                tauri::WindowEvent::CloseRequested { api, .. } => {
                    debug!("Overlay window close requested, hiding instead");
                    api.prevent_close();
                    if let Err(e) = window_manager.hide_overlay() {
                        error!("Failed to hide overlay on close request: {}", e);
                    }
                }
                _ => {}
            }
        });

        // Set up keyboard event handler for Escape key
        let window_manager_clone = self.clone();
        window_clone.listen("keydown", move |event| {
            let payload = event.payload();
            if payload.contains("\"key\":\"Escape\"") {
                debug!("Escape key pressed, hiding overlay");
                if let Err(e) = window_manager_clone.hide_overlay() {
                    error!("Failed to hide overlay on Escape key: {}", e);
                }
            }
        });

        Ok(())
    }

    pub fn position_overlay_dropdown_top(&self) -> Result<()> {
        if let Some(overlay_window) = self.app_handle.get_webview_window("overlay") {
            // Get primary monitor size
            if let Some(monitor) = overlay_window.primary_monitor()? {
                let monitor_size = monitor.size();
                let config = self.get_overlay_config();
                
                // Position at top center of screen
                let x = (monitor_size.width as f64 - config.width) / 2.0;
                let y = 20.0; // 20px from top for better visibility
                
                overlay_window.set_position(tauri::Position::Physical(tauri::PhysicalPosition {
                    x: x as i32,
                    y: y as i32,
                }))?;
                
                info!("Positioned overlay at dropdown-top: ({}, {})", x, y);
            }
        }
        Ok(())
    }

    pub fn position_overlay_center(&self) -> Result<()> {
        if let Some(overlay_window) = self.app_handle.get_webview_window("overlay") {
            if let Some(monitor) = overlay_window.primary_monitor()? {
                let monitor_size = monitor.size();
                let config = self.get_overlay_config();
                
                // Position at center of screen
                let x = (monitor_size.width as f64 - config.width) / 2.0;
                let y = (monitor_size.height as f64 - config.height) / 2.0;
                
                overlay_window.set_position(tauri::Position::Physical(tauri::PhysicalPosition {
                    x: x as i32,
                    y: y as i32,
                }))?;
                
                info!("Positioned overlay at center: ({}, {})", x, y);
            }
        }
        Ok(())
    }

    fn calculate_and_update_window_size(&self) -> Result<()> {
        // Load config to get grid dimensions
        use crate::modules::config::ConfigManager;
        
        let config_manager = ConfigManager::new()?;
        let config = config_manager.get_config();
        
        // Get the first profile and page for size calculation
        if let Some(profile) = config.profiles.first() {
            if let Some(page) = profile.pages.first() {
                // Calculate grid size
                let cell_size = config.ui.window.cell_size_px as f64;
                let gap_size = config.ui.window.gap_px as f64;
                let padding = 0.75 * 16.0; // 0.75rem converted to pixels (assuming 16px = 1rem)
                
                // Calculate content size
                let grid_width = (page.cols as f64 * cell_size) + ((page.cols - 1) as f64 * gap_size);
                let grid_height = (page.rows as f64 * cell_size) + ((page.rows - 1) as f64 * gap_size);
                
                // Add padding, border, and config button space
                // Config button: 2.5rem (40px) + margin-bottom 0.5rem (8px) = 48px
                let config_button_space = 48.0; // Space for config button
                let total_width = grid_width + (padding * 2.0) + 2.0; // 2px for border
                let total_height = grid_height + (padding * 2.0) + 2.0 + config_button_space; // Add config button space
                
                // Update window config
                {
                    let mut overlay_config = self.overlay_config.lock().unwrap();
                    overlay_config.width = total_width;
                    overlay_config.height = total_height;
                }
                
                info!("Calculated window size: {}x{} for grid {}x{}", 
                      total_width, total_height, page.cols, page.rows);
            }
        }
        
        Ok(())
    }
}

impl Clone for WindowManager {
    fn clone(&self) -> Self {
        Self {
            app_handle: self.app_handle.clone(),
            overlay_config: Arc::clone(&self.overlay_config),
            is_overlay_visible: Arc::clone(&self.is_overlay_visible),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_window_config_default() {
        let config = WindowConfig::default();
        assert_eq!(config.width, 1000.0);
        assert_eq!(config.height, 600.0);
        assert_eq!(config.opacity, 0.92);
        assert!(config.always_on_top);
        assert!(!config.decorations);
        assert!(!config.resizable);
        assert!(!config.visible);
        assert!(config.transparent);
        assert!(config.skip_taskbar);
        assert!(config.focus);
    }

    #[test]
    fn test_window_config_clone() {
        let config1 = WindowConfig::default();
        let config2 = config1.clone();
        
        assert_eq!(config1.width, config2.width);
        assert_eq!(config1.height, config2.height);
        assert_eq!(config1.opacity, config2.opacity);
    }
}