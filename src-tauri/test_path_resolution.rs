// Standalone test to verify path resolution behavior
use std::path::Path;
use std::env;

fn main() {
    println!("=== Path Resolution Test ===");
    
    // Get current directory
    match env::current_dir() {
        Ok(current_dir) => {
            println!("Current directory: {}", current_dir.display());
            
            // Test relative path resolution
            let relative_path = "project.godot";
            let absolute_path = current_dir.join(relative_path);
            
            println!("Relative path: {}", relative_path);
            println!("Resolved absolute path: {}", absolute_path.display());
            println!("File exists: {}", absolute_path.exists());
            
            // Test if we're in src-tauri directory
            if current_dir.file_name().and_then(|n| n.to_str()) == Some("src-tauri") {
                println!("WARNING: Currently in src-tauri directory!");
                
                if let Some(parent) = current_dir.parent() {
                    let parent_path = parent.join(relative_path);
                    println!("Parent directory path: {}", parent_path.display());
                    println!("File exists in parent: {}", parent_path.exists());
                }
            }
        }
        Err(e) => {
            println!("Failed to get current directory: {}", e);
        }
    }
    
    // Test path conversion logic (similar to drag_drop.rs)
    let test_path = "test_file.txt";
    let converted_path = if Path::new(test_path).is_absolute() {
        test_path.to_string()
    } else {
        match env::current_dir() {
            Ok(current_dir) => {
                let absolute = current_dir.join(test_path);
                absolute.to_string_lossy().to_string()
            }
            Err(_) => test_path.to_string()
        }
    };
    
    println!("\n=== Path Conversion Test ===");
    println!("Input: {}", test_path);
    println!("Output: {}", converted_path);
    println!("Is absolute: {}", Path::new(&converted_path).is_absolute());
}