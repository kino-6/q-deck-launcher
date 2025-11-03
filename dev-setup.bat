@echo off
echo Q-Deck Launcher - Development Environment Setup
echo ================================================
echo.

REM Check if Node.js is installed
echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed
    echo Please install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
) else (
    echo [OK] Node.js is installed: 
    node --version
)

REM Check if Rust is installed
echo Checking Rust installation...
cargo --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Rust is not installed
    echo Please install Rust from: https://rustup.rs/
    echo.
    pause
    exit /b 1
) else (
    echo [OK] Rust is installed: 
    cargo --version
)

REM Check if Tauri CLI is installed
echo Checking Tauri CLI...
npm list -g @tauri-apps/cli >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Installing Tauri CLI globally...
    npm install -g @tauri-apps/cli
    if %errorlevel% neq 0 (
        echo [WARNING] Failed to install Tauri CLI globally
        echo This is not critical, local installation will be used
    )
) else (
    echo [OK] Tauri CLI is installed
)

echo.
echo Installing project dependencies...
npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Running initial build check...
npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Initial build failed
    pause
    exit /b 1
)

echo.
echo ================================================
echo Setup completed successfully!
echo ================================================
echo.
echo Available commands:
echo   launch.bat     - Start development server
echo   build.bat      - Build for production
echo   npm run tauri dev - Manual development start
echo.
echo Default hotkey: Ctrl+` (backtick)
echo.
pause