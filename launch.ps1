# Q-Deck Launcher Development Script
# PowerShell version for better error handling and cross-platform compatibility

param(
    [switch]$Force,
    [switch]$NoCleanup
)

Write-Host "Starting Q-Deck Launcher in development mode..." -ForegroundColor Green
if ($Force) {
    Write-Host "Force mode enabled - will terminate existing processes" -ForegroundColor Yellow
}
Write-Host ""

# Function to check if a command exists
function Test-Command {
    param($Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

# Check if Node.js is installed
if (-not (Test-Command "node")) {
    Write-Host "Error: Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if Rust is installed
if (-not (Test-Command "cargo")) {
    Write-Host "Error: Rust is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Rust from https://rustup.rs/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "Error: package.json not found" -ForegroundColor Red
    Write-Host "Please run this script from the q-deck-launcher directory" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Function to kill existing Q-Deck processes (only very specific ones)
function Stop-QDeckProcesses {
    param(
        [switch]$Force
    )
    
    Write-Host "Checking for existing Q-Deck processes..." -ForegroundColor Yellow
    
    # Only kill processes with exact name match to avoid conflicts
    $processes = Get-Process -Name "q-deck-launcher" -ErrorAction SilentlyContinue
    if ($processes) {
        Write-Host "Found $($processes.Count) existing Q-Deck launcher process(es)" -ForegroundColor Yellow
        if ($Force) {
            Write-Host "Terminating Q-Deck launcher processes..." -ForegroundColor Yellow
            $processes | ForEach-Object {
                try {
                    Write-Host "  Terminating process ID: $($_.Id)" -ForegroundColor Gray
                    $_.Kill()
                    Write-Host "  Successfully terminated" -ForegroundColor Green
                }
                catch {
                    Write-Host "  Failed to terminate process ID: $($_.Id)" -ForegroundColor Red
                }
            }
            Start-Sleep -Seconds 2
        } else {
            Write-Host "Use -Force parameter to terminate existing processes" -ForegroundColor Yellow
            Write-Host "Or manually close the existing Q-Deck application" -ForegroundColor Yellow
        }
    } else {
        Write-Host "No existing Q-Deck launcher processes found" -ForegroundColor Green
    }
    
    # Clean up any locked files in target directory
    $targetDir = "src-tauri\target"
    if (Test-Path $targetDir) {
        Write-Host "Cleaning up build artifacts..." -ForegroundColor Yellow
        try {
            # Remove any .lock files
            Get-ChildItem -Path $targetDir -Recurse -Filter "*.lock" -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
            # Remove any .tmp files
            Get-ChildItem -Path $targetDir -Recurse -Filter "*.tmp" -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
        }
        catch {
            Write-Host "Warning: Could not clean all build artifacts" -ForegroundColor Yellow
        }
    }
}

# Check for existing processes (only force kill if explicitly requested)
if (-not $NoCleanup) {
    Stop-QDeckProcesses -Force:$Force
}

# Display versions
Write-Host "Environment Check:" -ForegroundColor Cyan
Write-Host "Node.js: $(node --version)" -ForegroundColor Gray
Write-Host "npm: $(npm --version)" -ForegroundColor Gray
Write-Host "Rust: $(cargo --version)" -ForegroundColor Gray
Write-Host ""

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
try {
    npm install
    if ($LASTEXITCODE -ne 0) {
        throw "npm install failed"
    }
}
catch {
    Write-Host "Error: Failed to install dependencies" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Starting Tauri development server..." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the application" -ForegroundColor Yellow
Write-Host ""
Write-Host "Default hotkey: Ctrl+F12 to show overlay" -ForegroundColor Cyan
Write-Host ""

# Start the development server
try {
    npm run tauri dev
}
catch {
    Write-Host "Error: Failed to start development server" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}