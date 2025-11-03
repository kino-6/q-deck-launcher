use anyhow::Result;
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::thread;
use tracing::{debug, error, info, warn};

#[cfg(windows)]
use winapi::um::{
    winuser::{
        RegisterHotKey, UnregisterHotKey, GetMessageW, TranslateMessage, DispatchMessageW,
        MSG, WM_HOTKEY, MOD_ALT, MOD_CONTROL, MOD_SHIFT, MOD_WIN, VK_ESCAPE, SetTimer,
    },
};

#[derive(Debug, Clone, PartialEq, Eq, Hash, serde::Serialize, serde::Deserialize)]
pub struct HotkeyConfig {
    pub id: u32,
    pub modifiers: Vec<String>,
    pub key: String,
    pub action: String,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ParsedHotkey {
    pub id: u32,
    pub modifiers: u32,
    pub vk_code: u32,
    pub action: String,
}

pub type HotkeyCallback = Arc<dyn Fn(&str) + Send + Sync>;

pub struct HotkeyService {
    registered_hotkeys: Arc<Mutex<HashMap<u32, ParsedHotkey>>>,
    callback: Option<HotkeyCallback>,
    next_id: Arc<Mutex<u32>>,
    #[cfg(windows)]
    message_thread: Option<thread::JoinHandle<()>>,
}

impl HotkeyService {
    pub fn new() -> Result<Self> {
        info!("Initializing hotkey service");
        
        Ok(Self {
            registered_hotkeys: Arc::new(Mutex::new(HashMap::new())),
            callback: None,
            next_id: Arc::new(Mutex::new(1)),
            #[cfg(windows)]
            message_thread: None,
        })
    }

    pub fn set_callback(&mut self, callback: HotkeyCallback) {
        self.callback = Some(callback);
    }

    pub fn register_hotkey(&mut self, hotkey_str: &str, action: String) -> Result<u32> {
        let parsed = self.parse_hotkey_string(hotkey_str)?;
        let id = {
            let mut next_id = self.next_id.lock().unwrap();
            let id = *next_id;
            *next_id += 1;
            id
        };

        let hotkey = ParsedHotkey {
            id,
            modifiers: parsed.modifiers,
            vk_code: parsed.vk_code,
            action,
        };

        // Don't register system hotkey here - it will be registered in the message loop thread
        // self.register_system_hotkey(&hotkey)?;
        
        {
            let mut hotkeys = self.registered_hotkeys.lock().unwrap();
            hotkeys.insert(id, hotkey.clone());
        }

        info!("Queued hotkey for registration: {} with ID {}", hotkey_str, id);
        Ok(id)
    }

    pub fn unregister_hotkey(&mut self, id: u32) -> Result<()> {
        {
            let mut hotkeys = self.registered_hotkeys.lock().unwrap();
            if hotkeys.remove(&id).is_none() {
                return Err(anyhow::anyhow!("Hotkey with ID {} not found", id));
            }
        }

        self.unregister_system_hotkey(id)?;
        info!("Unregistered hotkey with ID {}", id);
        Ok(())
    }

    pub fn register_multiple_hotkeys(&mut self, hotkey_configs: Vec<HotkeyConfig>) -> Result<Vec<u32>> {
        let mut registered_ids = Vec::new();
        let mut failed_registrations = Vec::new();

        for config in hotkey_configs {
            let hotkey_str = self.build_hotkey_string(&config.modifiers, &config.key);
            match self.register_hotkey(&hotkey_str, config.action.clone()) {
                Ok(id) => {
                    registered_ids.push(id);
                    debug!("Successfully registered hotkey: {}", hotkey_str);
                }
                Err(e) => {
                    error!("Failed to register hotkey {}: {}", hotkey_str, e);
                    failed_registrations.push((hotkey_str, e));
                }
            }
        }

        if !failed_registrations.is_empty() {
            warn!("Some hotkeys failed to register: {:?}", failed_registrations);
        }

        Ok(registered_ids)
    }

    pub fn start_message_loop(&mut self) -> Result<()> {
        if self.callback.is_none() {
            return Err(anyhow::anyhow!("Callback not set. Call set_callback() first."));
        }

        #[cfg(windows)]
        {
            let hotkeys = Arc::clone(&self.registered_hotkeys);
            let callback = self.callback.as_ref().unwrap().clone();

            let handle = thread::spawn(move || {
                // Re-register all hotkeys in the message loop thread
                info!("🔄 Re-registering hotkeys in message loop thread...");
                let thread_id = unsafe { winapi::um::processthreadsapi::GetCurrentThreadId() };
                info!("📍 Message loop thread ID: {}", thread_id);
                
                // Get all hotkeys to re-register
                let hotkeys_to_register: Vec<ParsedHotkey> = {
                    let hotkeys_guard = hotkeys.lock().unwrap();
                    hotkeys_guard.values().cloned().collect()
                };
                
                info!("🎯 Re-registering {} hotkeys in message loop thread:", hotkeys_to_register.len());
                
                // Re-register each hotkey in this thread
                for hotkey in &hotkeys_to_register {
                    info!("🔧 Re-registering hotkey ID {} in message loop thread", hotkey.id);
                    unsafe {
                        let result = RegisterHotKey(
                            std::ptr::null_mut(),
                            hotkey.id as i32,
                            hotkey.modifiers,
                            hotkey.vk_code,
                        );
                        
                        if result == 0 {
                            let error_code = winapi::um::errhandlingapi::GetLastError();
                            error!("❌ Failed to re-register hotkey ID {} in message loop thread. Error: {}", hotkey.id, error_code);
                        } else {
                            info!("✅ Successfully re-registered hotkey ID {} in message loop thread", hotkey.id);
                        }
                    }
                }
                
                Self::windows_message_loop(hotkeys, callback);
            });

            self.message_thread = Some(handle);
        }

        info!("✅ Started hotkey message loop thread");
        Ok(())
    }

    #[cfg(windows)]
    fn windows_message_loop(
        hotkeys: Arc<Mutex<HashMap<u32, ParsedHotkey>>>,
        callback: HotkeyCallback,
    ) {
        info!("🚀 Starting Windows message loop for hotkeys");
        
        // Log thread information
        let thread_id = unsafe { winapi::um::processthreadsapi::GetCurrentThreadId() };
        info!("📍 Message loop running on thread ID: {}", thread_id);
        
        unsafe {
            // Set up a timer to generate periodic messages to test the loop
            let timer_id = SetTimer(
                std::ptr::null_mut(),
                1,
                5000, // 5 seconds
                None
            );
            
            if timer_id != 0 {
                info!("✅ Timer set up successfully (ID: {})", timer_id);
            } else {
                warn!("⚠️ Failed to set up timer");
            }
            
            let mut msg: MSG = std::mem::zeroed();
            let mut message_count = 0u64;
            
            // Test if we can receive any messages at all
            info!("🧪 Testing message loop - waiting for first message...");
            
            loop {
                let result = GetMessageW(&mut msg, std::ptr::null_mut(), 0, 0);
                message_count += 1;
                
                // Periodic heartbeat to confirm message loop is alive
                if message_count % 1000 == 0 {
                    info!("💓 Message loop heartbeat: {} messages processed", message_count);
                }
                
                // Special logging for first few messages to ensure loop is working
                if message_count <= 10 {
                    info!("🔍 Early message #{}: 0x{:X} (wParam: 0x{:X}, lParam: 0x{:X})", 
                          message_count, msg.message, msg.wParam, msg.lParam);
                }
                
                if result == 0 {
                    // WM_QUIT received
                    info!("WM_QUIT received, stopping message loop after {} messages", message_count);
                    break;
                } else if result == -1 {
                    // Error occurred
                    error!("Error in GetMessageW after {} messages", message_count);
                    break;
                }

                // Log all messages for debugging (only every 1000th message to avoid spam)
                if message_count % 1000 == 0 || msg.message == WM_HOTKEY {
                    debug!("📨 Message #{}: 0x{:X}, wParam: 0x{:X}, lParam: 0x{:X}", 
                           message_count, msg.message, msg.wParam, msg.lParam);
                }

                if msg.message == WM_HOTKEY {
                    let hotkey_id = msg.wParam as u32;
                    let modifiers = (msg.lParam & 0xFFFF) as u32;
                    let vk_code = ((msg.lParam >> 16) & 0xFFFF) as u32;
                    
                    info!("🔥 HOTKEY TRIGGERED! ID: {}, VK: 0x{:X}, Modifiers: 0x{:X}", 
                          hotkey_id, vk_code, modifiers);
                    
                    if let Ok(hotkeys_guard) = hotkeys.lock() {
                        if let Some(hotkey) = hotkeys_guard.get(&hotkey_id) {
                            info!("Executing hotkey action: {}", hotkey.action);
                            callback(&hotkey.action);
                        } else {
                            warn!("No hotkey found for ID: {}", hotkey_id);
                        }
                    } else {
                        error!("Failed to lock hotkeys mutex");
                    }
                } else {
                    // Log all key-related messages for debugging
                    match msg.message {
                        0x0100 => info!("⌨️  WM_KEYDOWN: VK 0x{:X} ({})", msg.wParam, msg.wParam), // WM_KEYDOWN
                        0x0101 => info!("⌨️  WM_KEYUP: VK 0x{:X} ({})", msg.wParam, msg.wParam),   // WM_KEYUP
                        0x0104 => info!("⌨️  WM_SYSKEYDOWN: VK 0x{:X} ({})", msg.wParam, msg.wParam), // WM_SYSKEYDOWN
                        0x0105 => info!("⌨️  WM_SYSKEYUP: VK 0x{:X} ({})", msg.wParam, msg.wParam),   // WM_SYSKEYUP
                        0x0312 => info!("🔥 WM_HOTKEY detected but not handled properly: wParam={}, lParam={}", msg.wParam, msg.lParam), // WM_HOTKEY
                        0x0113 => info!("⏰ WM_TIMER: Timer ID {}", msg.wParam), // WM_TIMER
                        _ => {
                            // Log any other message that might be relevant
                            if msg.message >= 0x0100 && msg.message <= 0x0109 {
                                debug!("Other key message: 0x{:X}, wParam: 0x{:X}", msg.message, msg.wParam);
                            } else if msg.message == 0x0113 {
                                // Already handled WM_TIMER above
                            } else {
                                // Log other messages occasionally
                                if message_count % 100 == 0 {
                                    debug!("Other message: 0x{:X}, wParam: 0x{:X}", msg.message, msg.wParam);
                                }
                            }
                        }
                    }
                }

                TranslateMessage(&msg);
                DispatchMessageW(&msg);
            }
        }
        info!("Windows message loop ended");
    }

    fn parse_hotkey_string(&self, hotkey_str: &str) -> Result<ParsedHotkey> {
        debug!("🔍 Parsing hotkey string: '{}'", hotkey_str);
        
        let parts: Vec<&str> = hotkey_str.split('+').map(|s| s.trim()).collect();
        
        if parts.is_empty() {
            return Err(anyhow::anyhow!("Invalid hotkey string: {}", hotkey_str));
        }

        let key = parts.last().unwrap();
        let modifiers = &parts[..parts.len() - 1];

        debug!("Key: '{}', Modifiers: {:?}", key, modifiers);

        let mut mod_flags = 0u32;
        for modifier in modifiers {
            match modifier.to_lowercase().as_str() {
                "ctrl" | "control" => {
                    mod_flags |= MOD_CONTROL as u32;
                    debug!("Added CTRL modifier (0x{:X})", MOD_CONTROL);
                }
                "alt" => {
                    mod_flags |= MOD_ALT as u32;
                    debug!("Added ALT modifier (0x{:X})", MOD_ALT);
                }
                "shift" => {
                    mod_flags |= MOD_SHIFT as u32;
                    debug!("Added SHIFT modifier (0x{:X})", MOD_SHIFT);
                }
                "win" | "windows" | "cmd" => {
                    mod_flags |= MOD_WIN as u32;
                    debug!("Added WIN modifier (0x{:X})", MOD_WIN);
                }
                _ => return Err(anyhow::anyhow!("Unknown modifier: {}", modifier)),
            }
        }

        let vk_code = self.parse_key_code(key)?;
        debug!("Parsed VK code: 0x{:X} for key '{}'", vk_code, key);

        let parsed = ParsedHotkey {
            id: 0, // Will be set by caller
            modifiers: mod_flags,
            vk_code,
            action: String::new(), // Will be set by caller
        };

        info!("📋 Parsed hotkey '{}' -> Modifiers: 0x{:X}, VK: 0x{:X}", 
              hotkey_str, parsed.modifiers, parsed.vk_code);

        Ok(parsed)
    }

    fn parse_key_code(&self, key: &str) -> Result<u32> {
        match key.to_lowercase().as_str() {
            // Function keys
            "f1" => Ok(0x70),
            "f2" => Ok(0x71),
            "f3" => Ok(0x72),
            "f4" => Ok(0x73),
            "f5" => Ok(0x74),
            "f6" => Ok(0x75),
            "f7" => Ok(0x76),
            "f8" => Ok(0x77),
            "f9" => Ok(0x78),
            "f10" => Ok(0x79),
            "f11" => Ok(0x7A),
            "f12" => Ok(0x7B),
            
            // Special keys
            "escape" | "esc" => Ok(VK_ESCAPE as u32),
            "space" => Ok(0x20),
            "enter" | "return" => Ok(0x0D),
            "tab" => Ok(0x09),
            "backspace" => Ok(0x08),
            "delete" | "del" => Ok(0x2E),
            "insert" | "ins" => Ok(0x2D),
            "home" => Ok(0x24),
            "end" => Ok(0x23),
            "pageup" | "pgup" => Ok(0x21),
            "pagedown" | "pgdn" => Ok(0x22),
            
            // Arrow keys
            "up" => Ok(0x26),
            "down" => Ok(0x28),
            "left" => Ok(0x25),
            "right" => Ok(0x27),
            
            // Number keys
            "0" => Ok(0x30),
            "1" => Ok(0x31),
            "2" => Ok(0x32),
            "3" => Ok(0x33),
            "4" => Ok(0x34),
            "5" => Ok(0x35),
            "6" => Ok(0x36),
            "7" => Ok(0x37),
            "8" => Ok(0x38),
            "9" => Ok(0x39),
            
            // Letter keys (A-Z)
            key if key.len() == 1 && key.chars().next().unwrap().is_ascii_alphabetic() => {
                let ch = key.to_uppercase().chars().next().unwrap();
                Ok(ch as u32)
            }
            
            // Special characters
            "oem3" | "`" | "~" => Ok(0xC0), // Backtick/Tilde key
            "oem1" | ";" | ":" => Ok(0xBA), // Semicolon/Colon key
            "oemplus" | "=" | "+" => Ok(0xBB), // Plus/Equal key
            "oemcomma" | "," | "<" => Ok(0xBC), // Comma/Less than key
            "oemminus" | "-" | "_" => Ok(0xBD), // Minus/Underscore key
            "oemperiod" | "." | ">" => Ok(0xBE), // Period/Greater than key
            "oem2" | "/" | "?" => Ok(0xBF), // Forward slash/Question mark key
            
            _ => Err(anyhow::anyhow!("Unknown key: {}", key)),
        }
    }

    fn build_hotkey_string(&self, modifiers: &[String], key: &str) -> String {
        if modifiers.is_empty() {
            key.to_string()
        } else {
            format!("{}+{}", modifiers.join("+"), key)
        }
    }

    #[cfg(windows)]
    fn register_system_hotkey(&self, hotkey: &ParsedHotkey) -> Result<()> {
        info!("🔧 Registering system hotkey - ID: {}, Modifiers: 0x{:X}, VK: 0x{:X}", 
              hotkey.id, hotkey.modifiers, hotkey.vk_code);
        
        // Get current thread ID for debugging
        let thread_id = unsafe { winapi::um::processthreadsapi::GetCurrentThreadId() };
        info!("📍 Registering hotkey on thread ID: {}", thread_id);
        
        unsafe {
            let result = RegisterHotKey(
                std::ptr::null_mut(),
                hotkey.id as i32,
                hotkey.modifiers,
                hotkey.vk_code,
            );
            
            if result == 0 {
                let error_code = winapi::um::errhandlingapi::GetLastError();
                error!("❌ Failed to register hotkey (ID: {}). Error code: {}. This hotkey may already be in use by another application.", 
                       hotkey.id, error_code);
                return Err(anyhow::anyhow!(
                    "Failed to register hotkey (ID: {}). Error code: {}. This hotkey may already be in use by another application.",
                    hotkey.id,
                    error_code
                ));
            } else {
                info!("✅ Successfully registered system hotkey ID: {} on thread {}", hotkey.id, thread_id);
                
                // Verify the hotkey is actually registered by trying to register it again
                let verify_result = RegisterHotKey(
                    std::ptr::null_mut(),
                    (hotkey.id + 1000) as i32, // Use different ID for verification
                    hotkey.modifiers,
                    hotkey.vk_code,
                );
                
                if verify_result == 0 {
                    let verify_error = winapi::um::errhandlingapi::GetLastError();
                    if verify_error == 1409 { // ERROR_HOTKEY_ALREADY_REGISTERED
                        info!("🔍 Verification: Hotkey is properly registered (error 1409 expected)");
                    } else {
                        warn!("🔍 Verification: Unexpected error code: {}", verify_error);
                    }
                } else {
                    warn!("🔍 Verification: Hotkey verification registered unexpectedly");
                    // Unregister the verification hotkey
                    UnregisterHotKey(std::ptr::null_mut(), (hotkey.id + 1000) as i32);
                }
            }
        }
        Ok(())
    }

    #[cfg(windows)]
    fn unregister_system_hotkey(&self, id: u32) -> Result<()> {
        unsafe {
            let result = UnregisterHotKey(std::ptr::null_mut(), id as i32);
            if result == 0 {
                let error_code = winapi::um::errhandlingapi::GetLastError();
                return Err(anyhow::anyhow!(
                    "Failed to unregister hotkey (ID: {}). Error code: {}",
                    id,
                    error_code
                ));
            }
        }
        Ok(())
    }

    #[cfg(not(windows))]
    fn register_system_hotkey(&self, _hotkey: &ParsedHotkey) -> Result<()> {
        Err(anyhow::anyhow!("Hotkey registration is only supported on Windows"))
    }

    #[cfg(not(windows))]
    fn unregister_system_hotkey(&self, _id: u32) -> Result<()> {
        Err(anyhow::anyhow!("Hotkey unregistration is only supported on Windows"))
    }

    pub fn get_registered_hotkeys(&self) -> Vec<ParsedHotkey> {
        let hotkeys = self.registered_hotkeys.lock().unwrap();
        hotkeys.values().cloned().collect()
    }

    pub fn is_hotkey_available(&self, hotkey_str: &str) -> bool {
        match self.parse_hotkey_string(hotkey_str) {
            Ok(parsed) => {
                // Try to register temporarily to check availability
                #[cfg(windows)]
                unsafe {
                    let temp_id = 9999; // Use a high ID for testing
                    let result = RegisterHotKey(
                        std::ptr::null_mut(),
                        temp_id,
                        parsed.modifiers,
                        parsed.vk_code,
                    );
                    
                    if result != 0 {
                        // Successfully registered, so unregister immediately
                        UnregisterHotKey(std::ptr::null_mut(), temp_id);
                        true
                    } else {
                        false
                    }
                }
                
                #[cfg(not(windows))]
                false
            }
            Err(_) => false,
        }
    }
}

impl Drop for HotkeyService {
    fn drop(&mut self) {
        // Unregister all hotkeys when service is dropped
        let hotkey_ids: Vec<u32> = {
            let hotkeys = self.registered_hotkeys.lock().unwrap();
            hotkeys.keys().cloned().collect()
        };

        for id in hotkey_ids {
            if let Err(e) = self.unregister_hotkey(id) {
                error!("Failed to unregister hotkey {} during cleanup: {}", id, e);
            }
        }

        info!("Hotkey service cleanup completed");
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_hotkey_string() {
        let service = HotkeyService::new().unwrap();
        
        // Test basic hotkey parsing
        let parsed = service.parse_hotkey_string("Ctrl+Alt+F1").unwrap();
        assert_eq!(parsed.modifiers, (MOD_CONTROL | MOD_ALT) as u32);
        assert_eq!(parsed.vk_code, 0x70); // F1
        
        // Test single key
        let parsed = service.parse_hotkey_string("F12").unwrap();
        assert_eq!(parsed.modifiers, 0);
        assert_eq!(parsed.vk_code, 0x7B); // F12
        
        // Test letter key
        let parsed = service.parse_hotkey_string("Ctrl+A").unwrap();
        assert_eq!(parsed.modifiers, MOD_CONTROL as u32);
        assert_eq!(parsed.vk_code, 'A' as u32);
    }

    #[test]
    fn test_parse_key_code() {
        let service = HotkeyService::new().unwrap();
        
        assert_eq!(service.parse_key_code("F1").unwrap(), 0x70);
        assert_eq!(service.parse_key_code("A").unwrap(), 'A' as u32);
        assert_eq!(service.parse_key_code("escape").unwrap(), VK_ESCAPE as u32);
        assert_eq!(service.parse_key_code("space").unwrap(), 0x20);
        
        // Test case insensitivity
        assert_eq!(service.parse_key_code("f1").unwrap(), 0x70);
        assert_eq!(service.parse_key_code("a").unwrap(), 'A' as u32);
    }

    #[test]
    fn test_build_hotkey_string() {
        let service = HotkeyService::new().unwrap();
        
        let modifiers = vec!["Ctrl".to_string(), "Alt".to_string()];
        let result = service.build_hotkey_string(&modifiers, "F1");
        assert_eq!(result, "Ctrl+Alt+F1");
        
        let no_modifiers: Vec<String> = vec![];
        let result = service.build_hotkey_string(&no_modifiers, "F1");
        assert_eq!(result, "F1");
    }

    #[test]
    fn test_hotkey_config() {
        let config = HotkeyConfig {
            id: 1,
            modifiers: vec!["Ctrl".to_string(), "Shift".to_string()],
            key: "F1".to_string(),
            action: "show_overlay".to_string(),
        };
        
        assert_eq!(config.id, 1);
        assert_eq!(config.modifiers.len(), 2);
        assert_eq!(config.key, "F1");
        assert_eq!(config.action, "show_overlay");
    }
}