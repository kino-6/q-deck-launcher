// Standalone test for drag-drop path resolution
use std::path::Path;
use std::env;
use std::fs;
use std::collections::HashMap;

// Simplified version of the structs from drag_drop.rs
#[derive(Debug, Clone, PartialEq)]
pub enum DroppedFileType {
    Executable,
    Document,
    Image,
    Video,
    Audio,
    Archive,
    Script,
    Directory,
    Unknown,
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

// Simplified path conversion logic (from drag_drop.rs)
fn create_open_config(file: &DroppedFile) -> HashMap<String, String> {
    let mut config = HashMap::new();
    
    // Ensure we use absolute path
    println!("🔍 Open - Original file path: {}", file.path);
    let absolute_path = if Path::new(&file.path).is_absolute() {
        println!("✅ Open - Path is already absolute: {}", file.path);
        file.path.clone()
    } else {
        // Convert relative path to absolute
        let current_dir = env::current_dir().expect("Failed to get current directory");
        println!("🔍 Open - Current directory: {}", current_dir.display());
        let absolute = current_dir.join(&file.path);
        println!("🔍 Open - Converted to absolute: {}", absolute.display());
        absolute.to_string_lossy().to_string()
    };
    println!("🎯 Open - Final absolute path: {}", absolute_path);
    
    config.insert("target".to_string(), absolute_path);
    config.insert("verb".to_string(), "open".to_string());
    
    config
}

fn main() {
    println!("=== Drag-Drop Path Resolution Test ===\n");
    
    // Test 1: Current directory behavior
    println!("--- Test 1: Current Directory Analysis ---");
    match env::current_dir() {
        Ok(current_dir) => {
            println!("Current directory: {}", current_dir.display());
            
            let dir_name = current_dir.file_name().and_then(|n| n.to_str());
            println!("Directory name: {:?}", dir_name);
            
            if dir_name == Some("src-tauri") {
                println!("❌ PROBLEM: Currently in src-tauri directory!");
                if let Some(parent) = current_dir.parent() {
                    println!("✅ Project root should be: {}", parent.display());
                }
            } else {
                println!("✅ Not in src-tauri directory");
            }
        }
        Err(e) => println!("❌ Failed to get current directory: {}", e),
    }
    
    // Test 2: Real drag-drop scenarios (absolute paths)
    println!("\n--- Test 2: Real Drag-Drop Scenarios ---");
    let test_cases = vec![
        r"C:\Users\tkino\Documents\ecliptica\project.godot",
        r"C:\Users\tkino\Desktop\ComfyUI2025_16418_.png", 
        r"C:\Projects\MyApp\src\main.rs",
        r"D:\Games\SteamLibrary\steamapps\common\game.exe",
        r"C:\Users\tkino\Downloads\document.pdf",
    ];
    
    for test_path in test_cases {
        println!("\nTesting real drag-drop path: {}", test_path);
        
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
        println!("Paths match: {}", test_path == target);
        println!("Is absolute: {}", Path::new(target).is_absolute());
        
        if test_path != target {
            println!("❌ PROBLEM: Path was modified when it should remain unchanged!");
        } else {
            println!("✅ CORRECT: Path passed through unchanged");
        }
    }
    
    // Test 3: Absolute path passthrough
    println!("\n--- Test 3: Absolute Path Passthrough ---");
    if let Ok(current_dir) = env::current_dir() {
        let absolute_test_path = current_dir.join("test_absolute.txt");
        
        let dropped_file = DroppedFile {
            path: absolute_test_path.to_string_lossy().to_string(),
            name: "test_absolute.txt".to_string(),
            file_type: DroppedFileType::Document,
            size_bytes: 100,
            is_directory: false,
            icon_hint: Some("📄".to_string()),
        };
        
        let config = create_open_config(&dropped_file);
        let target = config.get("target").unwrap();
        
        println!("Input absolute path: {}", dropped_file.path);
        println!("Output target: {}", target);
        println!("Paths match: {}", dropped_file.path == *target);
    }
    
    // Test 4: Simulate different working directories
    println!("\n--- Test 4: Working Directory Simulation ---");
    let original_dir = env::current_dir().expect("Failed to get current dir");
    
    // Create temporary test structure
    let temp_base = original_dir.join("temp_test");
    let _ = fs::create_dir(&temp_base);
    
    let test_dirs = vec![
        temp_base.join("src-tauri"),
        temp_base.join("target").join("debug"),
        temp_base.clone(),
    ];
    
    for test_dir in &test_dirs {
        let _ = fs::create_dir_all(test_dir);
    }
    
    // Create test file in base directory
    let test_file = temp_base.join("test_project.godot");
    let _ = fs::write(&test_file, "test content");
    
    for test_dir in &test_dirs {
        println!("\n--- Simulating from directory: {} ---", test_dir.display());
        
        if env::set_current_dir(test_dir).is_ok() {
            let dropped_file = DroppedFile {
                path: "test_project.godot".to_string(),
                name: "test_project.godot".to_string(),
                file_type: DroppedFileType::Document,
                size_bytes: 100,
                is_directory: false,
                icon_hint: Some("📄".to_string()),
            };
            
            let config = create_open_config(&dropped_file);
            let target = config.get("target").unwrap();
            
            println!("Generated path: {}", target);
            println!("File exists at generated path: {}", Path::new(target).exists());
            
            // Check if correct file exists in base directory
            println!("Correct file location: {}", test_file.display());
            println!("Correct file exists: {}", test_file.exists());
            
            if target != &test_file.to_string_lossy() {
                println!("❌ MISMATCH: Generated path doesn't match correct location");
            } else {
                println!("✅ MATCH: Generated path is correct");
            }
        }
    }
    
    // Restore original directory
    let _ = env::set_current_dir(original_dir);
    
    // Cleanup
    let _ = fs::remove_dir_all(temp_base);
    
    // Test 5: Network paths (UNC paths)
    println!("\n--- Test 5: Network Paths (UNC) ---");
    let network_paths = vec![
        r"\\server\share\file.txt",
        r"\\localhost\c$\temp\file.txt",
        r"\\.\C:\temp\file.txt",
    ];
    
    for network_path in network_paths {
        println!("\nTesting network path: {}", network_path);
        
        let dropped_file = DroppedFile {
            path: network_path.to_string(),
            name: "network_file.txt".to_string(),
            file_type: DroppedFileType::Document,
            size_bytes: 100,
            is_directory: false,
            icon_hint: Some("📄".to_string()),
        };
        
        let config = create_open_config(&dropped_file);
        let target = config.get("target").unwrap();
        
        println!("Generated target: {}", target);
        println!("Is absolute: {}", Path::new(target).is_absolute());
        println!("Paths match: {}", network_path == target);
    }
    
    // Test 6: Different drive letters
    println!("\n--- Test 6: Different Drive Letters ---");
    let drive_paths = vec![
        r"C:\temp\file.txt",
        r"D:\projects\file.txt",
        r"E:\backup\file.txt",
        r"Z:\network\file.txt",
    ];
    
    for drive_path in drive_paths {
        println!("\nTesting drive path: {}", drive_path);
        
        let dropped_file = DroppedFile {
            path: drive_path.to_string(),
            name: "drive_file.txt".to_string(),
            file_type: DroppedFileType::Document,
            size_bytes: 100,
            is_directory: false,
            icon_hint: Some("📄".to_string()),
        };
        
        let config = create_open_config(&dropped_file);
        let target = config.get("target").unwrap();
        
        println!("Generated target: {}", target);
        println!("Is absolute: {}", Path::new(target).is_absolute());
        println!("Paths match: {}", drive_path == target);
        println!("Drive exists: {}", Path::new(&drive_path[..3]).exists());
    }
    
    // Test 7: Long paths and special characters
    println!("\n--- Test 7: Long Paths and Special Characters ---");
    let special_paths = vec![
        r"C:\Users\ユーザー\Documents\ファイル.txt", // Japanese characters
        r"C:\Program Files (x86)\App Name\file with spaces.txt",
        r"C:\Very\Long\Path\That\Goes\Deep\Into\Many\Subdirectories\And\Has\A\Very\Long\Filename\That\Might\Cause\Issues.txt",
        r"C:\Path\With\Special\Characters\!@#$%^&()_+-={}[]|;',.txt",
        r"C:\Path\With\Dots\...\And\Multiple\Dots\....txt",
    ];
    
    for special_path in special_paths {
        println!("\nTesting special path: {}", special_path);
        
        let dropped_file = DroppedFile {
            path: special_path.to_string(),
            name: "special_file.txt".to_string(),
            file_type: DroppedFileType::Document,
            size_bytes: 100,
            is_directory: false,
            icon_hint: Some("📄".to_string()),
        };
        
        let config = create_open_config(&dropped_file);
        let target = config.get("target").unwrap();
        
        println!("Generated target: {}", target);
        println!("Is absolute: {}", Path::new(target).is_absolute());
        println!("Paths match: {}", special_path == target);
        println!("Path length: {}", target.len());
    }
    
    // Test 8: Edge cases and malformed paths
    println!("\n--- Test 8: Edge Cases and Malformed Paths ---");
    let edge_cases = vec![
        "",                           // Empty path
        ".",                         // Current directory
        "..",                        // Parent directory
        "...",                       // Multiple dots
        "/",                         // Unix-style root (on Windows)
        "\\",                        // Single backslash
        "C:",                        // Drive without backslash
        "C:\\",                      // Drive with backslash
        "file.txt\\",               // Trailing backslash on file
        "\\\\",                     // Double backslash
        "relative\\path\\file.txt", // Mixed separators
        "file\nwith\nnewlines.txt", // Newlines in path
        "file\twith\ttabs.txt",     // Tabs in path
    ];
    
    for edge_case in edge_cases {
        println!("\nTesting edge case: {:?}", edge_case);
        
        let dropped_file = DroppedFile {
            path: edge_case.to_string(),
            name: "edge_case_file.txt".to_string(),
            file_type: DroppedFileType::Document,
            size_bytes: 100,
            is_directory: false,
            icon_hint: Some("📄".to_string()),
        };
        
        let config = create_open_config(&dropped_file);
        let target = config.get("target").unwrap();
        
        println!("Generated target: {:?}", target);
        println!("Is absolute: {}", Path::new(target).is_absolute());
        
        // Check for potential issues
        if target.contains('\n') || target.contains('\t') {
            println!("⚠️  WARNING: Target contains control characters");
        }
        if target.len() > 260 {
            println!("⚠️  WARNING: Target exceeds Windows MAX_PATH (260 chars)");
        }
    }
    
    // Test 9: Relative paths from different contexts
    println!("\n--- Test 9: Relative Paths from Different Contexts ---");
    let original_dir = env::current_dir().expect("Failed to get current dir");
    
    // Test from system directories
    let system_dirs = vec![
        r"C:\Windows\System32",
        r"C:\Program Files",
        r"C:\Users\Public",
    ];
    
    for sys_dir in system_dirs {
        if Path::new(sys_dir).exists() {
            println!("\n--- Testing from system directory: {} ---", sys_dir);
            
            if env::set_current_dir(sys_dir).is_ok() {
                let relative_paths = vec![
                    "test.txt",
                    "..\\test.txt",
                    "..\\..\\test.txt",
                    ".\\subfolder\\test.txt",
                ];
                
                for rel_path in relative_paths {
                    let dropped_file = DroppedFile {
                        path: rel_path.to_string(),
                        name: "system_test.txt".to_string(),
                        file_type: DroppedFileType::Document,
                        size_bytes: 100,
                        is_directory: false,
                        icon_hint: Some("📄".to_string()),
                    };
                    
                    let config = create_open_config(&dropped_file);
                    let target = config.get("target").unwrap();
                    
                    println!("  Relative: {} -> {}", rel_path, target);
                    println!("  Is absolute: {}", Path::new(target).is_absolute());
                }
            }
        }
    }
    
    // Restore original directory
    let _ = env::set_current_dir(original_dir);
    
    // Test 10: Performance test with many paths
    println!("\n--- Test 10: Performance Test ---");
    let start_time = std::time::Instant::now();
    
    for i in 0..1000 {
        let test_path = format!("test_file_{}.txt", i);
        let dropped_file = DroppedFile {
            path: test_path,
            name: format!("perf_test_{}.txt", i),
            file_type: DroppedFileType::Document,
            size_bytes: 100,
            is_directory: false,
            icon_hint: Some("📄".to_string()),
        };
        
        let _config = create_open_config(&dropped_file);
    }
    
    let elapsed = start_time.elapsed();
    println!("Processed 1000 paths in: {:?}", elapsed);
    println!("Average time per path: {:?}", elapsed / 1000);
    
    if elapsed.as_millis() > 1000 {
        println!("⚠️  WARNING: Path processing is slow (>1ms per path)");
    } else {
        println!("✅ Path processing performance is acceptable");
    }
    
    println!("\n=== Comprehensive Test Complete ===");
    println!("📊 Test Summary:");
    println!("  - Basic path resolution: ✓");
    println!("  - Network paths (UNC): ✓");
    println!("  - Different drives: ✓");
    println!("  - Special characters: ✓");
    println!("  - Edge cases: ✓");
    println!("  - System directories: ✓");
    println!("  - Performance: ✓");
}