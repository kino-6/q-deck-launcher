use std::path::{Path, PathBuf};
use std::collections::HashMap;
use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use tracing::{info, warn, debug};
use base64::{Engine as _, engine::general_purpose};

#[cfg(windows)]
use winapi::um::{
    shellapi::{ExtractIconW, ExtractAssociatedIconW},
    winuser::{GetIconInfo, ICONINFO},
    wingdi::{GetObjectW, BITMAP},
};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IconInfo {
    pub path: String,
    pub icon_type: IconType,
    pub size: Option<IconSize>,
    pub data_url: Option<String>, // Base64 encoded image data
    pub extracted_from: Option<String>, // Source executable path
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum IconType {
    Emoji,
    File,
    Extracted,
    Url,
    Base64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IconSize {
    pub width: u32,
    pub height: u32,
}

pub struct IconService {
    icon_cache: HashMap<String, IconInfo>,
    cache_dir: PathBuf,
}

impl IconService {
    pub fn new() -> Result<Self> {
        let cache_dir = Self::get_cache_directory()?;
        std::fs::create_dir_all(&cache_dir)
            .context("Failed to create icon cache directory")?;
        
        Ok(Self {
            icon_cache: HashMap::new(),
            cache_dir,
        })
    }

    /// Process an icon specification and return processed icon info
    pub fn process_icon(&mut self, icon_spec: &str, fallback_executable: Option<&str>) -> Result<IconInfo> {
        debug!("Processing icon: {}", icon_spec);
        
        // Check cache first
        if let Some(cached) = self.icon_cache.get(icon_spec) {
            debug!("Found cached icon for: {}", icon_spec);
            return Ok(cached.clone());
        }

        let icon_info = if self.is_emoji(icon_spec) {
            // Handle emoji icons
            IconInfo {
                path: icon_spec.to_string(),
                icon_type: IconType::Emoji,
                size: None,
                data_url: None,
                extracted_from: None,
            }
        } else if self.is_url(icon_spec) {
            // Handle URL icons
            self.process_url_icon(icon_spec)?
        } else if self.is_base64(icon_spec) {
            // Handle base64 encoded icons
            self.process_base64_icon(icon_spec)?
        } else if Path::new(icon_spec).exists() {
            // Handle file path icons
            self.process_file_icon(icon_spec)?
        } else if let Some(exe_path) = fallback_executable {
            // Extract icon from executable
            self.extract_executable_icon(exe_path, icon_spec)?
        } else {
            // Return a default icon
            warn!("Could not process icon '{}', using default", icon_spec);
            self.get_default_icon()?
        };

        // Cache the result
        self.icon_cache.insert(icon_spec.to_string(), icon_info.clone());
        Ok(icon_info)
    }

    /// Extract icon from Windows executable
    #[cfg(windows)]
    pub fn extract_executable_icon(&self, exe_path: &str, icon_id: &str) -> Result<IconInfo> {
        use std::ffi::OsStr;
        use std::os::windows::ffi::OsStrExt;

        debug!("Extracting icon from executable: {}", exe_path);

        let mut exe_path_wide: Vec<u16> = OsStr::new(exe_path)
            .encode_wide()
            .chain(std::iter::once(0))
            .collect();

        unsafe {
            // Try to extract the first icon
            let icon_handle = ExtractIconW(
                std::ptr::null_mut(),
                exe_path_wide.as_ptr(),
                0, // First icon
            );

            if icon_handle.is_null() || icon_handle as isize == 1 {
                // Try associated icon
                let icon_handle = ExtractAssociatedIconW(
                    std::ptr::null_mut(),
                    exe_path_wide.as_mut_ptr(),
                    std::ptr::null_mut(),
                );

                if icon_handle.is_null() {
                    return Err(anyhow::anyhow!("Failed to extract icon from {}", exe_path));
                }
            }

            // Get icon information
            let mut icon_info = ICONINFO {
                fIcon: 0,
                xHotspot: 0,
                yHotspot: 0,
                hbmMask: std::ptr::null_mut(),
                hbmColor: std::ptr::null_mut(),
            };

            if GetIconInfo(icon_handle, &mut icon_info) == 0 {
                return Err(anyhow::anyhow!("Failed to get icon info"));
            }

            // Get bitmap information for size
            let mut bitmap = BITMAP {
                bmType: 0,
                bmWidth: 0,
                bmHeight: 0,
                bmWidthBytes: 0,
                bmPlanes: 0,
                bmBitsPixel: 0,
                bmBits: std::ptr::null_mut(),
            };

            if GetObjectW(
                icon_info.hbmColor as *mut _,
                std::mem::size_of::<BITMAP>() as i32,
                &mut bitmap as *mut _ as *mut _,
            ) > 0 {
                info!("Extracted icon from {}: {}x{}", exe_path, bitmap.bmWidth, bitmap.bmHeight);
                
                // Save icon to cache file
                let _cache_filename = format!("{}.ico", self.generate_cache_key(exe_path, icon_id));
                let _cache_path = self.cache_dir.join(_cache_filename);
                
                // TODO: Convert HICON to file format and save
                // For now, return the executable path as reference
                
                Ok(IconInfo {
                    path: exe_path.to_string(),
                    icon_type: IconType::Extracted,
                    size: Some(IconSize {
                        width: bitmap.bmWidth as u32,
                        height: bitmap.bmHeight as u32,
                    }),
                    data_url: None,
                    extracted_from: Some(exe_path.to_string()),
                })
            } else {
                Err(anyhow::anyhow!("Failed to get bitmap info"))
            }
        }
    }

    #[cfg(not(windows))]
    pub fn extract_executable_icon(&self, exe_path: &str, icon_id: &str) -> Result<IconInfo> {
        warn!("Icon extraction not supported on this platform");
        self.get_default_icon()
    }

    /// Process file-based icons (PNG, ICO, SVG)
    pub fn process_file_icon(&self, file_path: &str) -> Result<IconInfo> {
        let path = Path::new(file_path);
        
        if !path.exists() {
            return Err(anyhow::anyhow!("Icon file does not exist: {}", file_path));
        }

        let extension = path.extension()
            .and_then(|ext| ext.to_str())
            .unwrap_or("")
            .to_lowercase();

        match extension.as_str() {
            "png" | "jpg" | "jpeg" | "gif" | "bmp" => {
                self.process_image_file(file_path)
            }
            "ico" => {
                self.process_ico_file(file_path)
            }
            "svg" => {
                self.process_svg_file(file_path)
            }
            _ => {
                warn!("Unsupported icon file format: {}", extension);
                self.get_default_icon()
            }
        }
    }

    /// Process image files (PNG, JPG, etc.)
    fn process_image_file(&self, file_path: &str) -> Result<IconInfo> {
        debug!("Processing image file: {}", file_path);
        
        // Read file and convert to base64 data URL
        let file_data = std::fs::read(file_path)
            .context("Failed to read image file")?;
        
        let mime_type = self.get_mime_type(file_path);
        let base64_data = general_purpose::STANDARD.encode(&file_data);
        let data_url = format!("data:{};base64,{}", mime_type, base64_data);
        
        // Try to get image dimensions (basic implementation)
        let size = self.get_image_dimensions(&file_data);
        
        Ok(IconInfo {
            path: file_path.to_string(),
            icon_type: IconType::File,
            size,
            data_url: Some(data_url),
            extracted_from: None,
        })
    }

    /// Process ICO files
    fn process_ico_file(&self, file_path: &str) -> Result<IconInfo> {
        debug!("Processing ICO file: {}", file_path);
        
        let file_data = std::fs::read(file_path)
            .context("Failed to read ICO file")?;
        
        let base64_data = general_purpose::STANDARD.encode(&file_data);
        let data_url = format!("data:image/x-icon;base64,{}", base64_data);
        
        Ok(IconInfo {
            path: file_path.to_string(),
            icon_type: IconType::File,
            size: None, // ICO files can contain multiple sizes
            data_url: Some(data_url),
            extracted_from: None,
        })
    }

    /// Process SVG files
    fn process_svg_file(&self, file_path: &str) -> Result<IconInfo> {
        debug!("Processing SVG file: {}", file_path);
        
        let file_data = std::fs::read_to_string(file_path)
            .context("Failed to read SVG file")?;
        
        let base64_data = general_purpose::STANDARD.encode(file_data.as_bytes());
        let data_url = format!("data:image/svg+xml;base64,{}", base64_data);
        
        Ok(IconInfo {
            path: file_path.to_string(),
            icon_type: IconType::File,
            size: None, // SVG is vector-based
            data_url: Some(data_url),
            extracted_from: None,
        })
    }

    /// Process URL-based icons
    fn process_url_icon(&self, url: &str) -> Result<IconInfo> {
        debug!("Processing URL icon: {}", url);
        
        // For now, just return the URL as-is
        // In a full implementation, you might want to download and cache the icon
        Ok(IconInfo {
            path: url.to_string(),
            icon_type: IconType::Url,
            size: None,
            data_url: None,
            extracted_from: None,
        })
    }

    /// Process base64 encoded icons
    fn process_base64_icon(&self, base64_data: &str) -> Result<IconInfo> {
        debug!("Processing base64 icon");
        
        Ok(IconInfo {
            path: "base64".to_string(),
            icon_type: IconType::Base64,
            size: None,
            data_url: Some(base64_data.to_string()),
            extracted_from: None,
        })
    }

    /// Get default icon when others fail
    fn get_default_icon(&self) -> Result<IconInfo> {
        Ok(IconInfo {
            path: "❓".to_string(),
            icon_type: IconType::Emoji,
            size: None,
            data_url: None,
            extracted_from: None,
        })
    }

    /// Check if the icon specification is an emoji
    fn is_emoji(&self, icon_spec: &str) -> bool {
        // Simple emoji detection - check if it's a single Unicode character
        // that's likely an emoji (in the emoji Unicode ranges)
        if icon_spec.chars().count() == 1 {
            if let Some(ch) = icon_spec.chars().next() {
                let code = ch as u32;
                // Common emoji ranges
                return (0x1F600..=0x1F64F).contains(&code) || // Emoticons
                       (0x1F300..=0x1F5FF).contains(&code) || // Misc Symbols and Pictographs
                       (0x1F680..=0x1F6FF).contains(&code) || // Transport and Map
                       (0x1F1E6..=0x1F1FF).contains(&code) || // Regional indicators
                       (0x2600..=0x26FF).contains(&code) ||   // Misc symbols
                       (0x2700..=0x27BF).contains(&code);     // Dingbats
            }
        }
        false
    }

    /// Check if the icon specification is a URL
    fn is_url(&self, icon_spec: &str) -> bool {
        icon_spec.starts_with("http://") || icon_spec.starts_with("https://")
    }

    /// Check if the icon specification is base64 data
    fn is_base64(&self, icon_spec: &str) -> bool {
        icon_spec.starts_with("data:")
    }

    /// Get MIME type for file extension
    fn get_mime_type(&self, file_path: &str) -> &'static str {
        let extension = Path::new(file_path)
            .extension()
            .and_then(|ext| ext.to_str())
            .unwrap_or("")
            .to_lowercase();

        match extension.as_str() {
            "png" => "image/png",
            "jpg" | "jpeg" => "image/jpeg",
            "gif" => "image/gif",
            "bmp" => "image/bmp",
            "svg" => "image/svg+xml",
            "ico" => "image/x-icon",
            _ => "application/octet-stream",
        }
    }

    /// Get image dimensions (basic implementation)
    fn get_image_dimensions(&self, _file_data: &[u8]) -> Option<IconSize> {
        // This is a placeholder - in a full implementation, you would
        // use an image processing library to get actual dimensions
        None
    }

    /// Generate cache key for icons
    fn generate_cache_key(&self, source: &str, identifier: &str) -> String {
        use std::collections::hash_map::DefaultHasher;
        use std::hash::{Hash, Hasher};

        let mut hasher = DefaultHasher::new();
        source.hash(&mut hasher);
        identifier.hash(&mut hasher);
        format!("{:x}", hasher.finish())
    }

    /// Get cache directory for icons
    fn get_cache_directory() -> Result<PathBuf> {
        let exe_path = std::env::current_exe()
            .context("Failed to get executable path")?;
        
        let cache_dir = if let Some(exe_dir) = exe_path.parent() {
            exe_dir.join("cache").join("icons")
        } else {
            std::env::current_dir()
                .context("Failed to get current directory")?
                .join("cache")
                .join("icons")
        };
        
        Ok(cache_dir)
    }

    /// Clear icon cache
    pub fn clear_cache(&mut self) -> Result<()> {
        self.icon_cache.clear();
        
        if self.cache_dir.exists() {
            std::fs::remove_dir_all(&self.cache_dir)
                .context("Failed to remove cache directory")?;
            std::fs::create_dir_all(&self.cache_dir)
                .context("Failed to recreate cache directory")?;
        }
        
        info!("Icon cache cleared");
        Ok(())
    }

    /// Get cache statistics
    pub fn get_cache_stats(&self) -> CacheStats {
        let cache_size = self.icon_cache.len();
        let cache_dir_size = self.get_directory_size(&self.cache_dir).unwrap_or(0);
        
        CacheStats {
            cached_icons: cache_size,
            cache_size_bytes: cache_dir_size,
            cache_directory: self.cache_dir.clone(),
        }
    }

    /// Get directory size in bytes
    fn get_directory_size(&self, dir: &Path) -> Result<u64> {
        let mut size = 0;
        
        if dir.exists() && dir.is_dir() {
            for entry in std::fs::read_dir(dir)? {
                let entry = entry?;
                let metadata = entry.metadata()?;
                if metadata.is_file() {
                    size += metadata.len();
                } else if metadata.is_dir() {
                    size += self.get_directory_size(&entry.path())?;
                }
            }
        }
        
        Ok(size)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CacheStats {
    pub cached_icons: usize,
    pub cache_size_bytes: u64,
    pub cache_directory: PathBuf,
}

// Add base64 dependency to Cargo.toml
// base64 = "0.21"