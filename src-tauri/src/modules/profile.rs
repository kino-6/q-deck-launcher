// Profile management module
use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tracing::{info, warn, debug};
use crate::modules::config::{QDeckConfig, Profile, Page};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProfileState {
    pub current_profile_index: usize,
    pub current_page_index: usize,
    pub last_active_pages: HashMap<String, usize>, // profile_name -> page_index
}

impl Default for ProfileState {
    fn default() -> Self {
        Self {
            current_profile_index: 0,
            current_page_index: 0,
            last_active_pages: HashMap::new(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProfileInfo {
    pub name: String,
    pub index: usize,
    pub page_count: usize,
    pub current_page_index: usize,
    pub hotkey: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PageInfo {
    pub name: String,
    pub index: usize,
    pub rows: u32,
    pub cols: u32,
    pub button_count: usize,
}

pub struct ProfileManager {
    state: ProfileState,
}

impl ProfileManager {
    pub fn new() -> Result<Self> {
        info!("📋 Initializing ProfileManager");
        
        Ok(Self {
            state: ProfileState::default(),
        })
    }

    /// Get current profile state
    pub fn get_state(&self) -> &ProfileState {
        &self.state
    }

    /// Get list of all profiles with their information
    pub fn get_profiles(&self, config: &QDeckConfig) -> Vec<ProfileInfo> {
        config.profiles.iter().enumerate().map(|(index, profile)| {
            let current_page_index = self.state.last_active_pages
                .get(&profile.name)
                .copied()
                .unwrap_or(0)
                .min(profile.pages.len().saturating_sub(1));

            ProfileInfo {
                name: profile.name.clone(),
                index,
                page_count: profile.pages.len(),
                current_page_index,
                hotkey: profile.hotkey.clone(),
            }
        }).collect()
    }

    /// Get current profile information
    pub fn get_current_profile(&self, config: &QDeckConfig) -> Result<ProfileInfo> {
        if self.state.current_profile_index >= config.profiles.len() {
            return Err(anyhow::anyhow!("Current profile index {} is out of bounds", self.state.current_profile_index));
        }

        let profile = &config.profiles[self.state.current_profile_index];
        let current_page_index = self.state.last_active_pages
            .get(&profile.name)
            .copied()
            .unwrap_or(0)
            .min(profile.pages.len().saturating_sub(1));

        Ok(ProfileInfo {
            name: profile.name.clone(),
            index: self.state.current_profile_index,
            page_count: profile.pages.len(),
            current_page_index,
            hotkey: profile.hotkey.clone(),
        })
    }

    /// Switch to a specific profile by index
    pub fn switch_to_profile(&mut self, profile_index: usize, config: &QDeckConfig) -> Result<ProfileInfo> {
        if profile_index >= config.profiles.len() {
            return Err(anyhow::anyhow!("Profile index {} is out of bounds", profile_index));
        }

        let profile = &config.profiles[profile_index];
        info!("🔄 Switching to profile: {} (index: {})", profile.name, profile_index);

        // Update current profile
        self.state.current_profile_index = profile_index;

        // Get the last active page for this profile, or default to 0
        let page_index = self.state.last_active_pages
            .get(&profile.name)
            .copied()
            .unwrap_or(0)
            .min(profile.pages.len().saturating_sub(1));

        self.state.current_page_index = page_index;

        debug!("📄 Active page for profile '{}': {} ({})", 
               profile.name, page_index, 
               profile.pages.get(page_index).map(|p| p.name.as_str()).unwrap_or("Unknown"));

        Ok(ProfileInfo {
            name: profile.name.clone(),
            index: profile_index,
            page_count: profile.pages.len(),
            current_page_index: page_index,
            hotkey: profile.hotkey.clone(),
        })
    }

    /// Switch to a profile by name
    pub fn switch_to_profile_by_name(&mut self, profile_name: &str, config: &QDeckConfig) -> Result<ProfileInfo> {
        let profile_index = config.profiles.iter()
            .position(|p| p.name == profile_name)
            .ok_or_else(|| anyhow::anyhow!("Profile '{}' not found", profile_name))?;

        self.switch_to_profile(profile_index, config)
    }

    /// Get pages for current profile
    pub fn get_current_profile_pages(&self, config: &QDeckConfig) -> Result<Vec<PageInfo>> {
        if self.state.current_profile_index >= config.profiles.len() {
            return Err(anyhow::anyhow!("Current profile index {} is out of bounds", self.state.current_profile_index));
        }

        let profile = &config.profiles[self.state.current_profile_index];
        Ok(profile.pages.iter().enumerate().map(|(index, page)| {
            PageInfo {
                name: page.name.clone(),
                index,
                rows: page.rows,
                cols: page.cols,
                button_count: page.buttons.len(),
            }
        }).collect())
    }

    /// Get pages for a specific profile
    pub fn get_profile_pages(&self, profile_index: usize, config: &QDeckConfig) -> Result<Vec<PageInfo>> {
        if profile_index >= config.profiles.len() {
            return Err(anyhow::anyhow!("Profile index {} is out of bounds", profile_index));
        }

        let profile = &config.profiles[profile_index];
        Ok(profile.pages.iter().enumerate().map(|(index, page)| {
            PageInfo {
                name: page.name.clone(),
                index,
                rows: page.rows,
                cols: page.cols,
                button_count: page.buttons.len(),
            }
        }).collect())
    }

    /// Get current page information
    pub fn get_current_page(&self, config: &QDeckConfig) -> Result<PageInfo> {
        if self.state.current_profile_index >= config.profiles.len() {
            return Err(anyhow::anyhow!("Current profile index {} is out of bounds", self.state.current_profile_index));
        }

        let profile = &config.profiles[self.state.current_profile_index];
        let page_index = self.state.current_page_index;

        if page_index >= profile.pages.len() {
            return Err(anyhow::anyhow!("Current page index {} is out of bounds for profile '{}'", page_index, profile.name));
        }

        let page = &profile.pages[page_index];
        Ok(PageInfo {
            name: page.name.clone(),
            index: page_index,
            rows: page.rows,
            cols: page.cols,
            button_count: page.buttons.len(),
        })
    }

    /// Switch to a specific page in the current profile
    pub fn switch_to_page(&mut self, page_index: usize, config: &QDeckConfig) -> Result<PageInfo> {
        if self.state.current_profile_index >= config.profiles.len() {
            return Err(anyhow::anyhow!("Current profile index {} is out of bounds", self.state.current_profile_index));
        }

        let profile = &config.profiles[self.state.current_profile_index];

        if page_index >= profile.pages.len() {
            return Err(anyhow::anyhow!("Page index {} is out of bounds for profile '{}'", page_index, profile.name));
        }

        let page = &profile.pages[page_index];
        info!("📄 Switching to page: {} (index: {}) in profile: {}", page.name, page_index, profile.name);

        // Update current page
        self.state.current_page_index = page_index;

        // Remember this as the last active page for this profile
        self.state.last_active_pages.insert(profile.name.clone(), page_index);

        Ok(PageInfo {
            name: page.name.clone(),
            index: page_index,
            rows: page.rows,
            cols: page.cols,
            button_count: page.buttons.len(),
        })
    }

    /// Switch to next page in current profile (circular)
    pub fn next_page(&mut self, config: &QDeckConfig) -> Result<PageInfo> {
        if self.state.current_profile_index >= config.profiles.len() {
            return Err(anyhow::anyhow!("Current profile index {} is out of bounds", self.state.current_profile_index));
        }

        let profile = &config.profiles[self.state.current_profile_index];
        if profile.pages.is_empty() {
            return Err(anyhow::anyhow!("No pages in current profile"));
        }

        let next_page_index = (self.state.current_page_index + 1) % profile.pages.len();
        self.switch_to_page(next_page_index, config)
    }

    /// Switch to previous page in current profile (circular)
    pub fn previous_page(&mut self, config: &QDeckConfig) -> Result<PageInfo> {
        if self.state.current_profile_index >= config.profiles.len() {
            return Err(anyhow::anyhow!("Current profile index {} is out of bounds", self.state.current_profile_index));
        }

        let profile = &config.profiles[self.state.current_profile_index];
        if profile.pages.is_empty() {
            return Err(anyhow::anyhow!("No pages in current profile"));
        }

        let prev_page_index = if self.state.current_page_index == 0 {
            profile.pages.len() - 1
        } else {
            self.state.current_page_index - 1
        };
        
        self.switch_to_page(prev_page_index, config)
    }

    /// Get the current profile and page data
    pub fn get_current_profile_and_page<'a>(&self, config: &'a QDeckConfig) -> Result<(&'a Profile, &'a Page)> {
        if self.state.current_profile_index >= config.profiles.len() {
            return Err(anyhow::anyhow!("Current profile index {} is out of bounds", self.state.current_profile_index));
        }

        let profile = &config.profiles[self.state.current_profile_index];
        let page_index = self.state.current_page_index;

        if page_index >= profile.pages.len() {
            return Err(anyhow::anyhow!("Current page index {} is out of bounds for profile '{}'", page_index, profile.name));
        }

        let page = &profile.pages[page_index];
        Ok((profile, page))
    }

    /// Initialize state from config (called on startup)
    pub fn initialize_from_config(&mut self, config: &QDeckConfig) -> Result<()> {
        info!("🔧 Initializing ProfileManager from config");

        if config.profiles.is_empty() {
            warn!("⚠️ No profiles found in config");
            return Ok(());
        }

        // Ensure current profile index is valid
        if self.state.current_profile_index >= config.profiles.len() {
            warn!("⚠️ Current profile index {} is out of bounds, resetting to 0", self.state.current_profile_index);
            self.state.current_profile_index = 0;
        }

        // Ensure current page index is valid for the current profile
        let profile = &config.profiles[self.state.current_profile_index];
        if self.state.current_page_index >= profile.pages.len() {
            warn!("⚠️ Current page index {} is out of bounds for profile '{}', resetting to 0", 
                  self.state.current_page_index, profile.name);
            self.state.current_page_index = 0;
        }

        // Initialize last active pages for all profiles
        for (index, profile) in config.profiles.iter().enumerate() {
            if !self.state.last_active_pages.contains_key(&profile.name) {
                self.state.last_active_pages.insert(profile.name.clone(), 0);
            }
        }

        info!("✅ ProfileManager initialized with {} profiles", config.profiles.len());
        debug!("📋 Current profile: {} ({})", profile.name, self.state.current_profile_index);
        debug!("📄 Current page: {} ({})", 
               profile.pages.get(self.state.current_page_index).map(|p| p.name.as_str()).unwrap_or("Unknown"),
               self.state.current_page_index);

        Ok(())
    }

    /// Reset to default state
    pub fn reset(&mut self) {
        info!("🔄 Resetting ProfileManager to default state");
        self.state = ProfileState::default();
    }

    /// Get navigation context (for breadcrumbs, etc.)
    pub fn get_navigation_context(&self, config: &QDeckConfig) -> Result<NavigationContext> {
        let (profile, page) = self.get_current_profile_and_page(config)?;
        
        Ok(NavigationContext {
            profile_name: profile.name.clone(),
            profile_index: self.state.current_profile_index,
            page_name: page.name.clone(),
            page_index: self.state.current_page_index,
            total_profiles: config.profiles.len(),
            total_pages: profile.pages.len(),
            has_previous_page: self.state.current_page_index > 0,
            has_next_page: self.state.current_page_index < profile.pages.len().saturating_sub(1),
        })
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NavigationContext {
    pub profile_name: String,
    pub profile_index: usize,
    pub page_name: String,
    pub page_index: usize,
    pub total_profiles: usize,
    pub total_pages: usize,
    pub has_previous_page: bool,
    pub has_next_page: bool,
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::modules::config::{QDeckConfig, Profile, Page, UIConfig, SummonConfig, WindowConfig, AnimationConfig};

    fn create_test_config() -> QDeckConfig {
        QDeckConfig {
            version: "1.0".to_string(),
            ui: UIConfig {
                summon: SummonConfig {
                    hotkeys: vec!["F11".to_string()],
                    edge_trigger: None,
                },
                window: WindowConfig {
                    placement: "dropdown-top".to_string(),
                    width_px: 1000,
                    height_px: 600,
                    cell_size_px: 96,
                    gap_px: 8,
                    opacity: 0.92,
                    theme: "dark".to_string(),
                    animation: AnimationConfig {
                        enabled: true,
                        duration_ms: 150,
                    },
                },
            },
            profiles: vec![
                Profile {
                    name: "Profile1".to_string(),
                    hotkey: Some("Ctrl+1".to_string()),
                    pages: vec![
                        Page {
                            name: "Page1".to_string(),
                            rows: 3,
                            cols: 4,
                            buttons: vec![],
                        },
                        Page {
                            name: "Page2".to_string(),
                            rows: 2,
                            cols: 3,
                            buttons: vec![],
                        },
                    ],
                },
                Profile {
                    name: "Profile2".to_string(),
                    hotkey: Some("Ctrl+2".to_string()),
                    pages: vec![
                        Page {
                            name: "MainPage".to_string(),
                            rows: 4,
                            cols: 5,
                            buttons: vec![],
                        },
                    ],
                },
            ],
        }
    }

    #[test]
    fn test_profile_manager_creation() {
        let manager = ProfileManager::new().unwrap();
        assert_eq!(manager.state.current_profile_index, 0);
        assert_eq!(manager.state.current_page_index, 0);
    }

    #[test]
    fn test_switch_to_profile() {
        let mut manager = ProfileManager::new().unwrap();
        let config = create_test_config();
        
        manager.initialize_from_config(&config).unwrap();
        
        let profile_info = manager.switch_to_profile(1, &config).unwrap();
        assert_eq!(profile_info.name, "Profile2");
        assert_eq!(profile_info.index, 1);
        assert_eq!(manager.state.current_profile_index, 1);
    }

    #[test]
    fn test_switch_to_profile_by_name() {
        let mut manager = ProfileManager::new().unwrap();
        let config = create_test_config();
        
        manager.initialize_from_config(&config).unwrap();
        
        let profile_info = manager.switch_to_profile_by_name("Profile2", &config).unwrap();
        assert_eq!(profile_info.name, "Profile2");
        assert_eq!(profile_info.index, 1);
    }

    #[test]
    fn test_page_navigation() {
        let mut manager = ProfileManager::new().unwrap();
        let config = create_test_config();
        
        manager.initialize_from_config(&config).unwrap();
        
        // Switch to page 1
        let page_info = manager.switch_to_page(1, &config).unwrap();
        assert_eq!(page_info.name, "Page2");
        assert_eq!(page_info.index, 1);
        
        // Test next page (should wrap to 0)
        let page_info = manager.next_page(&config).unwrap();
        assert_eq!(page_info.index, 0);
        
        // Test previous page (should wrap to last page)
        let page_info = manager.previous_page(&config).unwrap();
        assert_eq!(page_info.index, 1);
    }

    #[test]
    fn test_last_active_pages() {
        let mut manager = ProfileManager::new().unwrap();
        let config = create_test_config();
        
        manager.initialize_from_config(&config).unwrap();
        
        // Switch to page 1 in profile 0
        manager.switch_to_page(1, &config).unwrap();
        
        // Switch to profile 1
        manager.switch_to_profile(1, &config).unwrap();
        
        // Switch back to profile 0 - should remember page 1
        let profile_info = manager.switch_to_profile(0, &config).unwrap();
        assert_eq!(profile_info.current_page_index, 1);
    }
}