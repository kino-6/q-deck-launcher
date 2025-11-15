# Q-Deck Launcher Test Script
# PowerShell script for running comprehensive tests

param(
    [switch]$Watch,
    [switch]$Coverage,
    [switch]$UI,
    [switch]$Rust,
    [switch]$All,
    [switch]$Verbose
)

Write-Host "Q-Deck Launcher Test Suite" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green
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

# Check dependencies
if (-not (Test-Command "node")) {
    Write-Host "Error: Node.js is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

if ($Rust -or $All) {
    if (-not (Test-Command "cargo")) {
        Write-Host "Error: Rust is not installed or not in PATH" -ForegroundColor Red
        exit 1
    }
}

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "Error: package.json not found" -ForegroundColor Red
    Write-Host "Please run this script from the q-deck-launcher directory" -ForegroundColor Yellow
    exit 1
}

$testsPassed = $true

# Frontend Tests
Write-Host "Running Frontend Tests..." -ForegroundColor Cyan
Write-Host "-------------------------" -ForegroundColor Cyan

try {
    if ($Watch) {
        Write-Host "Starting test watcher..." -ForegroundColor Yellow
        npm run test:watch
    }
    elseif ($Coverage) {
        Write-Host "Running tests with coverage..." -ForegroundColor Yellow
        npm run test:coverage
    }
    elseif ($UI) {
        Write-Host "Starting test UI..." -ForegroundColor Yellow
        npm run test:ui
    }
    else {
        Write-Host "Running unit tests..." -ForegroundColor Yellow
        if ($Verbose) {
            npm run test -- --reporter=verbose
        } else {
            npm run test
        }
        
        if ($LASTEXITCODE -ne 0) {
            $testsPassed = $false
            Write-Host "Frontend tests failed!" -ForegroundColor Red
        } else {
            Write-Host "Frontend tests passed!" -ForegroundColor Green
        }
    }
}
catch {
    $testsPassed = $false
    Write-Host "Error running frontend tests: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Rust Tests
if ($Rust -or $All) {
    Write-Host "Running Rust Tests..." -ForegroundColor Cyan
    Write-Host "--------------------" -ForegroundColor Cyan
    
    try {
        Set-Location "src-tauri"
        
        if ($Verbose) {
            cargo test -- --nocapture
        } else {
            cargo test
        }
        
        if ($LASTEXITCODE -ne 0) {
            $testsPassed = $false
            Write-Host "Rust tests failed!" -ForegroundColor Red
        } else {
            Write-Host "Rust tests passed!" -ForegroundColor Green
        }
        
        Set-Location ".."
    }
    catch {
        $testsPassed = $false
        Write-Host "Error running Rust tests: $($_.Exception.Message)" -ForegroundColor Red
        Set-Location ".."
    }
    
    Write-Host ""
}

# Type Checking
if ($All) {
    Write-Host "Running Type Checks..." -ForegroundColor Cyan
    Write-Host "---------------------" -ForegroundColor Cyan
    
    try {
        Write-Host "Checking TypeScript..." -ForegroundColor Yellow
        npx tsc --noEmit
        
        if ($LASTEXITCODE -ne 0) {
            $testsPassed = $false
            Write-Host "TypeScript type checking failed!" -ForegroundColor Red
        } else {
            Write-Host "TypeScript type checking passed!" -ForegroundColor Green
        }
        
        Write-Host "Checking Rust..." -ForegroundColor Yellow
        Set-Location "src-tauri"
        cargo check
        
        if ($LASTEXITCODE -ne 0) {
            $testsPassed = $false
            Write-Host "Rust type checking failed!" -ForegroundColor Red
        } else {
            Write-Host "Rust type checking passed!" -ForegroundColor Green
        }
        
        Set-Location ".."
    }
    catch {
        $testsPassed = $false
        Write-Host "Error running type checks: $($_.Exception.Message)" -ForegroundColor Red
        Set-Location ".."
    }
    
    Write-Host ""
}

# Summary
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "============" -ForegroundColor Cyan

if ($testsPassed) {
    Write-Host "All tests passed!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "Some tests failed!" -ForegroundColor Red
    exit 1
}