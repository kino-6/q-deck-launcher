// Simple test to verify absolute path handling
use std::path::Path;
use std::env;
use std::collections::HashMap;

#[derive(Debug, Clone, PartialEq)]
pub enum DroppedFileType {
    Document,
}

#[derive(Debug, Clone)]
pub struct DroppedFile {
    pub path: String,
    pub name: String,
    pub file_type: DroppedFileType,
    pub size_bytes: u64,
    pub is_directory: bool,
    pub icon_hint: Option<String>,
}

fn create_open_config(file: &DroppedFile) -> HashMap<String, String> {
    let mut config = HashMap::new();
    
    // Simple path resolution: preserve absolute paths, convert relative paths to absolute
    let absolute_target = {
        let path = std::path::Path::new(&file.path);
        
        if path.is_absolute() {
            // For drag-drop scenarios, absolute paths should be used as-is
            println!("🎯 Using absolute path as-is: {}", file.path);
            file.path.clone()
        } else {
            // Convert relative path to absolute based on current directory
            if let Ok(current_dir) = std::env::current_dir() {
                let absolute_path = current_dir.join(path);
                println!("🎯 Converting relative to absolute: {} -> {}", file.path, absolute_path.display());
                absolute_path.to_string_lossy().to_string()
            } else {
                // Fallback: return original path
                println!("⚠️ Could not get current directory, using original path: {}", file.path);
                file.path.clone()
            }
        }
    };
    
    config.insert("target".to_string(), absolute_target);
    config.insert("verb".to_string(), "open".to_string());
    
    config
}

fn main() {
    println!("=== Simple Drag-Drop Path Test ===\n");
    
    // Test real drag-drop scenarios (absolute paths)
    let test_cases = vec![
        r"C:\Users\tkino\Documents\ecliptica\project.godot",
        r"C:\Users\tkino\Desktop\ComfyUI2025_16418_.png", 
        r"C:\Projects\MyApp\src\main.rs",
        "relative_file.txt",  // This should be converted to absolute
    ];
    
    for test_path in test_cases {
        println!("--- Testing path: {} ---", test_path);
        
        let dropped_file = DroppedFile {
            path: test_path.to_string(),
            name: Path::new(test_path).file_name().unwrap_or_default().to_string_lossy().to_string(),
            file_type: DroppedFileType::Document,
            size_bytes: 100,
            is_directory: false,
            icon_hint: Some("📄".to_string()),
        };
        
        let config = create_open_config(&dropped_file);
        let target = config.get("target").unwrap();
        
        println!("Input path: {}", test_path);
        println!("Generated target: {}", target);
        println!("Is absolute: {}", Path::new(target).is_absolute());
        
        if Path::new(test_path).is_absolute() {
            if test_path == target {
                println!("✅ CORRECT: Absolute path passed through unchanged");
            } else {
                println!("❌ PROBLEM: Absolute path was modified!");
            }
        } else {
            if Path::new(target).is_absolute() {
                println!("✅ CORRECT: Relative path converted to absolute");
            } else {
                println!("❌ PROBLEM: Relative path not converted to absolute!");
            }
        }
        println!();
    }
}