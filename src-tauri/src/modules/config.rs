use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::{Path, PathBuf};
use anyhow::{Context, Result};
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QDeckConfig {
    pub version: String,
    pub ui: UIConfig,
    pub profiles: Vec<Profile>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UIConfig {
    pub summon: SummonConfig,
    pub window: WindowConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SummonConfig {
    pub hotkeys: Vec<String>,
    pub edge_trigger: Option<EdgeTriggerConfig>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EdgeTriggerConfig {
    pub enabled: bool,
    pub edges: Vec<String>,
    pub dwell_ms: u32,
    pub margin_px: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WindowConfig {
    pub placement: String,
    pub width_px: u32,
    pub height_px: u32,
    pub cell_size_px: u32,
    pub gap_px: u32,
    pub opacity: f32,
    pub theme: String,
    pub animation: AnimationConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnimationConfig {
    pub enabled: bool,
    pub duration_ms: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Profile {
    pub name: String,
    pub hotkey: Option<String>,
    pub pages: Vec<Page>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Page {
    pub name: String,
    pub rows: u32,
    pub cols: u32,
    pub buttons: Vec<ActionButton>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActionButton {
    pub position: Position,
    #[serde(rename = "type")]
    pub action_type: ActionType,
    pub label: String,
    pub icon: Option<String>,
    pub config: HashMap<String, serde_json::Value>,
    pub style: Option<ButtonStyle>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Position {
    pub row: u32,
    pub col: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ActionType {
    LaunchApp,
    Open,
    Terminal,
    SendKeys,
    PowerShell,
    Folder,
    MultiAction,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ButtonStyle {
    pub background_color: Option<String>,
    pub text_color: Option<String>,
    pub font_size: Option<u32>,
    pub font_family: Option<String>,
}

impl Default for QDeckConfig {
    fn default() -> Self {
        Self {
            version: "1.0".to_string(),
            ui: UIConfig::default(),
            profiles: vec![Profile::default()],
        }
    }
}

impl Default for UIConfig {
    fn default() -> Self {
        Self {
            summon: SummonConfig::default(),
            window: WindowConfig::default(),
        }
    }
}

impl Default for SummonConfig {
    fn default() -> Self {
        Self {
            hotkeys: vec!["F11".to_string()],
            edge_trigger: Some(EdgeTriggerConfig::default()),
        }
    }
}

impl Default for EdgeTriggerConfig {
    fn default() -> Self {
        Self {
            enabled: false,
            edges: vec!["top".to_string()],
            dwell_ms: 300,
            margin_px: 5,
        }
    }
}

impl Default for WindowConfig {
    fn default() -> Self {
        Self {
            placement: "dropdown-top".to_string(),
            width_px: 1000,
            height_px: 600,
            cell_size_px: 96,
            gap_px: 8,
            opacity: 0.92,
            theme: "dark".to_string(),
            animation: AnimationConfig::default(),
        }
    }
}

impl Default for AnimationConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            duration_ms: 150,
        }
    }
}

impl Default for Profile {
    fn default() -> Self {
        Self {
            name: "Default".to_string(),
            hotkey: None,
            pages: vec![Page::default()],
        }
    }
}

impl Default for Page {
    fn default() -> Self {
        Self {
            name: "Main".to_string(),
            rows: 3,
            cols: 6,
            buttons: vec![],
        }
    }
}

pub struct ConfigManager {
    config_path: PathBuf,
    config: QDeckConfig,
}

impl ConfigManager {
    pub fn new() -> Result<Self> {
        let config_path = Self::get_config_path()?;
        let config = Self::load_or_create_config(&config_path)?;
        
        Ok(Self {
            config_path,
            config,
        })
    }

    pub fn get_config(&self) -> &QDeckConfig {
        &self.config
    }

    pub fn update_config(&mut self, config: QDeckConfig) -> Result<()> {
        self.validate_config(&config)?;
        self.config = config;
        self.save_config()
    }

    pub fn save_config(&self) -> Result<()> {
        let yaml_content = serde_yaml::to_string(&self.config)
            .context("Failed to serialize config to YAML")?;
        
        if let Some(parent) = self.config_path.parent() {
            std::fs::create_dir_all(parent)
                .context("Failed to create config directory")?;
        }
        
        std::fs::write(&self.config_path, yaml_content)
            .context("Failed to write config file")?;
        
        Ok(())
    }

    fn get_config_path() -> Result<PathBuf> {
        // Always use portable mode (config in app directory)
        let exe_path = std::env::current_exe()
            .context("Failed to get executable path")?;
        
        if let Some(exe_dir) = exe_path.parent() {
            let portable_config = exe_dir.join("config.yaml");
            tracing::info!("Using portable config path: {}", portable_config.display());
            return Ok(portable_config);
        }
        
        // Fallback to current directory if exe path detection fails
        let current_dir = std::env::current_dir()
            .context("Failed to get current directory")?;
        
        let fallback_config = current_dir.join("config.yaml");
        tracing::warn!("Falling back to current directory config: {}", fallback_config.display());
        Ok(fallback_config)
    }

    fn load_or_create_config(config_path: &Path) -> Result<QDeckConfig> {
        if config_path.exists() {
            let content = std::fs::read_to_string(config_path)
                .context("Failed to read config file")?;
            
            let config: QDeckConfig = serde_yaml::from_str(&content)
                .context("Failed to parse config YAML")?;
            
            Ok(config)
        } else {
            let default_config = QDeckConfig::default();
            
            // Create config file with default values
            let yaml_content = serde_yaml::to_string(&default_config)
                .context("Failed to serialize default config")?;
            
            if let Some(parent) = config_path.parent() {
                std::fs::create_dir_all(parent)
                    .context("Failed to create config directory")?;
            }
            
            std::fs::write(config_path, yaml_content)
                .context("Failed to write default config file")?;
            
            Ok(default_config)
        }
    }

    fn validate_config(&self, config: &QDeckConfig) -> Result<()> {
        // Validate version
        if config.version.is_empty() {
            return Err(anyhow::anyhow!("Config version cannot be empty"));
        }

        // Validate UI config
        if config.ui.window.width_px == 0 || config.ui.window.height_px == 0 {
            return Err(anyhow::anyhow!("Window dimensions must be greater than 0"));
        }

        if config.ui.window.opacity < 0.0 || config.ui.window.opacity > 1.0 {
            return Err(anyhow::anyhow!("Window opacity must be between 0.0 and 1.0"));
        }

        // Validate profiles
        if config.profiles.is_empty() {
            return Err(anyhow::anyhow!("At least one profile must be defined"));
        }

        for profile in &config.profiles {
            if profile.name.is_empty() {
                return Err(anyhow::anyhow!("Profile name cannot be empty"));
            }

            if profile.pages.is_empty() {
                return Err(anyhow::anyhow!("Profile must have at least one page"));
            }

            for page in &profile.pages {
                if page.name.is_empty() {
                    return Err(anyhow::anyhow!("Page name cannot be empty"));
                }

                if page.rows == 0 || page.cols == 0 {
                    return Err(anyhow::anyhow!("Page dimensions must be greater than 0"));
                }

                // Validate button positions
                for button in &page.buttons {
                    if button.position.row > page.rows || button.position.col > page.cols {
                        return Err(anyhow::anyhow!(
                            "Button position ({}, {}) exceeds page dimensions ({}, {})",
                            button.position.row, button.position.col,
                            page.rows, page.cols
                        ));
                    }

                    if button.label.is_empty() {
                        return Err(anyhow::anyhow!("Button label cannot be empty"));
                    }
                }
            }
        }

        Ok(())
    }

    pub fn export_config(&self, export_path: &Path) -> Result<()> {
        let yaml_content = serde_yaml::to_string(&self.config)
            .context("Failed to serialize config for export")?;
        
        std::fs::write(export_path, yaml_content)
            .context("Failed to write exported config file")?;
        
        Ok(())
    }

    pub fn import_config(&mut self, import_path: &Path) -> Result<()> {
        let content = std::fs::read_to_string(import_path)
            .context("Failed to read import config file")?;
        
        let imported_config: QDeckConfig = serde_yaml::from_str(&content)
            .context("Failed to parse imported config YAML")?;
        
        self.validate_config(&imported_config)?;
        self.config = imported_config;
        self.save_config()?;
        
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[test]
    fn test_default_config_validation() {
        let config = QDeckConfig::default();
        let manager = ConfigManager {
            config_path: PathBuf::from("test.yaml"),
            config: config.clone(),
        };
        
        assert!(manager.validate_config(&config).is_ok());
    }

    #[test]
    fn test_invalid_config_validation() {
        let mut config = QDeckConfig::default();
        config.ui.window.width_px = 0;
        
        let manager = ConfigManager {
            config_path: PathBuf::from("test.yaml"),
            config: QDeckConfig::default(),
        };
        
        assert!(manager.validate_config(&config).is_err());
    }

    #[test]
    fn test_config_serialization() {
        let config = QDeckConfig::default();
        let yaml = serde_yaml::to_string(&config).unwrap();
        let deserialized: QDeckConfig = serde_yaml::from_str(&yaml).unwrap();
        
        assert_eq!(config.version, deserialized.version);
        assert_eq!(config.profiles.len(), deserialized.profiles.len());
    }
}