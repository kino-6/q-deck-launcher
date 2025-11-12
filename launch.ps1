# Q-Deck Launcher Development Script
# PowerShell version for better error handling and cross-platform compatibility

param(
    [switch]$Force,
    [switch]$NoCleanup,
    [switch]$NoDevTools,
    [int]$StartPort = 1420,
    [int]$MaxPortAttempts = 10
)

Write-Host "Starting Q-Deck Launcher (Electron) in development mode..." -ForegroundColor Green
Write-Host "Parameters:" -ForegroundColor Cyan
Write-Host "  -Force: Terminate existing processes" -ForegroundColor Gray
Write-Host "  -NoCleanup: Skip process cleanup" -ForegroundColor Gray
Write-Host "  -NoDevTools: Disable DevTools (for UX evaluation)" -ForegroundColor Gray
Write-Host "  -StartPort: Starting port number (default: $StartPort)" -ForegroundColor Gray
Write-Host "  -MaxPortAttempts: Maximum port search attempts (default: $MaxPortAttempts)" -ForegroundColor Gray
Write-Host ""

if ($Force) {
    Write-Host "Force mode enabled - will terminate existing processes" -ForegroundColor Yellow
}
if ($NoDevTools) {
    Write-Host "DevTools disabled - running in UX evaluation mode" -ForegroundColor Yellow
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

# Function to check if a port is available
function Test-Port {
    param([int]$Port)
    try {
        $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, $Port)
        $listener.Start()
        $listener.Stop()
        return $true
    }
    catch {
        return $false
    }
}

# Function to find an available port starting from a base port
function Find-AvailablePort {
    param(
        [int]$StartPort = 1420,
        [int]$MaxAttempts = 10
    )
    
    Write-Host "Searching for available port starting from $StartPort..." -ForegroundColor Yellow
    
    for ($i = 0; $i -lt $MaxAttempts; $i++) {
        $testPort = $StartPort + $i
        if (Test-Port -Port $testPort) {
            Write-Host "Found available port: $testPort" -ForegroundColor Green
            return $testPort
        } else {
            Write-Host "Port $testPort is in use, trying next..." -ForegroundColor Gray
        }
    }
    
    Write-Host "Could not find available port in range $StartPort-$($StartPort + $MaxAttempts - 1)" -ForegroundColor Red
    return $null
}

# Function to kill processes using specific ports (only our own processes)
function Stop-PortProcesses {
    param(
        [int[]]$Ports,
        [switch]$Force
    )
    
    foreach ($port in $Ports) {
        Write-Host "Checking processes using port $port..." -ForegroundColor Yellow
        
        try {
            # Get processes using the port
            $netstatOutput = netstat -ano | Select-String ":$port "
            
            if ($netstatOutput) {
                $pids = @()
                foreach ($line in $netstatOutput) {
                    if ($line -match '\s+(\d+)$') {
                        $processId = $matches[1]
                        if ($processId -ne "0" -and $pids -notcontains $processId) {
                            $pids += $processId
                        }
                    }
                }
                
                foreach ($processId in $pids) {
                    try {
                        $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
                        if ($process) {
                            # Check if this is a Q-Deck related process
                            $processName = $process.ProcessName.ToLower()
                            $commandLine = ""
                            
                            try {
                                $commandLine = (Get-CimInstance Win32_Process -Filter "ProcessId = $processId" -ErrorAction SilentlyContinue).CommandLine
                            }
                            catch {
                                # Ignore errors getting command line
                            }
                            
                            # Only kill if it's clearly a Q-Deck development process
                            $isQDeckProcess = $false
                            
                            # Check if it's node/vite running Q-Deck
                            if ($processName -match "node" -and $commandLine -match "q-deck|vite.*1420|vite.*1421|vite.*1422") {
                                $isQDeckProcess = $true
                            }
                            # Check if it's explicitly named q-deck
                            elseif ($processName -match "q-deck") {
                                $isQDeckProcess = $true
                            }
                            # Check if it's vite dev server
                            elseif ($processName -match "vite" -and $commandLine -match "q-deck") {
                                $isQDeckProcess = $true
                            }
                            
                            if ($isQDeckProcess) {
                                Write-Host "  Terminating Q-Deck process: $($process.ProcessName) (PID: $processId)" -ForegroundColor Yellow
                                $process.Kill()
                                Write-Host "  Successfully terminated" -ForegroundColor Green
                            } else {
                                Write-Host "  Skipping non-Q-Deck process: $($process.ProcessName) (PID: $processId)" -ForegroundColor DarkGray
                            }
                        }
                    }
                    catch {
                        Write-Host "  Could not terminate process PID: $processId" -ForegroundColor Red
                    }
                }
            } else {
                Write-Host "  No processes found using port $port" -ForegroundColor Green
            }
        }
        catch {
            Write-Host "  Error checking port $port`: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

# Check if Node.js is installed
if (-not (Test-Command "node")) {
    Write-Host "Error: Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Note: Rust is no longer required for Electron version

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
    
    # Kill development server processes using common ports
    $commonPorts = @(1420, 1421, 1422, 1423, 1424, 1425)
    Stop-PortProcesses -Ports $commonPorts -Force:$Force
    
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
    
    # Check for Q-Deck specific node/vite processes that might be hanging
    if ($Force) {
        Write-Host "Checking for hanging Q-Deck Node.js processes..." -ForegroundColor Yellow
        $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
        
        if ($nodeProcesses) {
            foreach ($proc in $nodeProcesses) {
                try {
                    # Get command line to verify it's a Q-Deck process
                    $commandLine = (Get-CimInstance Win32_Process -Filter "ProcessId = $($proc.Id)" -ErrorAction SilentlyContinue).CommandLine
                    
                    # Only kill if it's clearly running Q-Deck related code
                    if ($commandLine -match "q-deck|vite.*1420|vite.*1421|vite.*1422|electron.*q-deck") {
                        Write-Host "  Terminating Q-Deck Node process (PID: $($proc.Id))" -ForegroundColor Yellow
                        $proc.Kill()
                    }
                    else {
                        Write-Host "  Skipping non-Q-Deck Node process (PID: $($proc.Id))" -ForegroundColor DarkGray
                    }
                }
                catch {
                    # Ignore errors
                }
            }
        }
    }
    
    # Force cleanup of Q-Deck specific Electron processes only
    if ($Force) {
        Write-Host "Performing cleanup of Q-Deck Electron processes..." -ForegroundColor Yellow
        
        # Get all Electron processes
        $electronProcesses = Get-Process -Name "electron" -ErrorAction SilentlyContinue
        
        if ($electronProcesses) {
            foreach ($proc in $electronProcesses) {
                try {
                    # Check if this Electron process is related to Q-Deck
                    # Method 1: Check command line arguments
                    $commandLine = (Get-CimInstance Win32_Process -Filter "ProcessId = $($proc.Id)" -ErrorAction SilentlyContinue).CommandLine
                    
                    # Method 2: Check working directory
                    $workingDir = $proc.Path
                    
                    # Only kill if it's clearly a Q-Deck process
                    $isQDeckProcess = $false
                    
                    if ($commandLine -match "q-deck|Q-Deck") {
                        $isQDeckProcess = $true
                    }
                    elseif ($proc.MainWindowTitle -match "q-deck|Q-Deck") {
                        $isQDeckProcess = $true
                    }
                    elseif ($workingDir -and $workingDir -match "q-deck") {
                        $isQDeckProcess = $true
                    }
                    
                    if ($isQDeckProcess) {
                        Write-Host "  Terminating Q-Deck Electron process: $($proc.ProcessName) (PID: $($proc.Id))" -ForegroundColor Gray
                        $proc.Kill()
                        Start-Sleep -Milliseconds 100
                    }
                    else {
                        Write-Host "  Skipping non-Q-Deck Electron process (PID: $($proc.Id))" -ForegroundColor DarkGray
                    }
                }
                catch {
                    Write-Host "  Could not process Electron PID: $($proc.Id)" -ForegroundColor Red
                }
            }
        }
        
        # Wait a moment for processes to fully terminate
        Start-Sleep -Seconds 1
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
Write-Host "Starting Electron development server..." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the application" -ForegroundColor Yellow
Write-Host ""
Write-Host "Default hotkey: F11 to show overlay" -ForegroundColor Cyan
Write-Host ""

# Find available port for Vite dev server
$availablePort = Find-AvailablePort -StartPort $StartPort -MaxAttempts $MaxPortAttempts

if ($null -eq $availablePort) {
    Write-Host "Error: Could not find available port for development server" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Set environment variables for dynamic port configuration
Write-Host "Configuring development server to use port $availablePort..." -ForegroundColor Yellow
$env:VITE_PORT = $availablePort
$env:PORT = $availablePort

# Set DevTools flag
if ($NoDevTools) {
    $env:NO_DEVTOOLS = "true"
    Write-Host "DevTools will be disabled" -ForegroundColor Yellow
} else {
    $env:NO_DEVTOOLS = "false"
}

Write-Host "Environment configured:" -ForegroundColor Green
Write-Host "  VITE_PORT = $availablePort" -ForegroundColor Gray
Write-Host "  HMR_PORT = $($availablePort + 1)" -ForegroundColor Gray
Write-Host "  NO_DEVTOOLS = $env:NO_DEVTOOLS" -ForegroundColor Gray

Write-Host ""
Write-Host "Starting Electron development server on port $availablePort..." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the application" -ForegroundColor Yellow
Write-Host ""
Write-Host "Default hotkey: F11 to show overlay" -ForegroundColor Cyan
Write-Host "Development server will be available at: http://localhost:$availablePort" -ForegroundColor Cyan
Write-Host ""

# Start the development server
try {
    npm run electron:dev
}
catch {
    Write-Host "Error: Failed to start development server" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    # Cleanup on failure
    if (-not $NoCleanup) {
        Write-Host "Cleaning up processes..." -ForegroundColor Yellow
        Stop-PortProcesses -Ports @($availablePort) -Force
    }
    
    Read-Host "Press Enter to exit"
    exit 1
}