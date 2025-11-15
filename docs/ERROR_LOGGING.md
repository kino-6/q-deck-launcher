# Error Logging for Production

## Overview

Q-Deck Launcher implements structured JSON logging for production environments to track application behavior, errors, and performance metrics. This logging system helps diagnose issues in production without impacting application performance.

## Features

- **Structured JSON Format**: All logs are written in JSON format for easy parsing and analysis
- **Production-Only File Logging**: Logs are only written to files in production mode
- **Buffered Writes**: Logs are buffered and flushed periodically to minimize I/O overhead
- **Comprehensive Coverage**: Logs actions, errors, startup metrics, and system events
- **Automatic Cleanup**: Logs are flushed on application shutdown

## Log Location

Logs are stored in the application's user data directory:

- **Windows**: `%APPDATA%\q-deck-launcher\logs\q-deck-YYYY-MM-DD.log`
- **macOS**: `~/Library/Application Support/q-deck-launcher/logs/q-deck-YYYY-MM-DD.log`
- **Linux**: `~/.config/q-deck-launcher/logs/q-deck-YYYY-MM-DD.log`

Each day creates a new log file with the date in the filename.

## Log Entry Format

Each log entry is a single line of JSON with the following structure:

```json
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "level": "info",
  "message": "Action executed",
  "action_type": "LaunchApp",
  "action_id": "notepad",
  "result": "success",
  "execution_time_ms": 150,
  "path": "notepad.exe"
}
```

### Log Levels

- **info**: Normal operational messages
- **warn**: Warning messages (non-critical issues)
- **error**: Error messages (failures and exceptions)
- **action**: Action execution logs (special level for tracking user actions)

## Logged Events

### Application Startup

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "info",
  "message": "Application started",
  "startup_time_ms": 850,
  "critical_path_ms": 300,
  "config_load_ms": 50
}
```

### Action Execution

Successful action:
```json
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "level": "action",
  "message": "Action executed",
  "action_type": "LaunchApp",
  "action_id": "notepad",
  "result": "success",
  "execution_time_ms": 150,
  "path": "notepad.exe"
}
```

Failed action:
```json
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "level": "action",
  "message": "Action executed",
  "action_type": "LaunchApp",
  "action_id": "invalid",
  "result": "failure",
  "execution_time_ms": 50,
  "error_message": "File not found",
  "path": "invalid.exe"
}
```

### Hotkey Registration

```json
{
  "timestamp": "2024-01-15T10:30:01.000Z",
  "level": "info",
  "message": "Hotkey registered",
  "hotkey": "F11"
}
```

### Profile Switch

```json
{
  "timestamp": "2024-01-15T10:31:00.000Z",
  "level": "info",
  "message": "Profile switched",
  "profile_name": "Development",
  "profile_index": 0
}
```

### Configuration Save

```json
{
  "timestamp": "2024-01-15T10:32:00.000Z",
  "level": "info",
  "message": "Configuration saved"
}
```

### Unhandled Errors

```json
{
  "timestamp": "2024-01-15T10:33:00.000Z",
  "level": "error",
  "message": "Unhandled error",
  "error_message": "Cannot read property 'x' of undefined",
  "error_stack": "Error: Cannot read property...\n    at ...",
  "type": "uncaughtException"
}
```

## Performance Characteristics

### Buffering

- Logs are buffered in memory before being written to disk
- Buffer size: 50 entries (configurable)
- Flush interval: 5 seconds (configurable)
- Automatic flush on application shutdown

### Overhead

- Minimal performance impact in production
- Asynchronous file writes
- No blocking operations
- Memory usage: ~1-2 KB per buffered entry

## Development vs Production

### Development Mode (`NODE_ENV=development`)

- Logs are written to console only
- No log files are created
- Full verbose logging
- Dev tools available

### Production Mode (`NODE_ENV=production`)

- Logs are written to both console and file
- Structured JSON format in files
- Minimal console output (warnings and errors only)
- Dev tools disabled

## Analyzing Logs

### Using Command Line Tools

**Count log entries by level:**
```bash
# Windows PowerShell
Get-Content q-deck-2024-01-15.log | ConvertFrom-Json | Group-Object level | Select-Object Name, Count

# Linux/macOS
cat q-deck-2024-01-15.log | jq -r '.level' | sort | uniq -c
```

**Find all errors:**
```bash
# Windows PowerShell
Get-Content q-deck-2024-01-15.log | ConvertFrom-Json | Where-Object { $_.level -eq 'error' }

# Linux/macOS
cat q-deck-2024-01-15.log | jq 'select(.level == "error")'
```

**Calculate average action execution time:**
```bash
# Linux/macOS
cat q-deck-2024-01-15.log | jq -r 'select(.level == "action") | .execution_time_ms' | awk '{sum+=$1; count++} END {print sum/count}'
```

**Find failed actions:**
```bash
# Linux/macOS
cat q-deck-2024-01-15.log | jq 'select(.level == "action" and .result == "failure")'
```

### Using Log Analysis Tools

Popular tools for analyzing JSON logs:

- **jq**: Command-line JSON processor
- **Elasticsearch + Kibana**: For large-scale log analysis
- **Splunk**: Enterprise log management
- **Grafana Loki**: Log aggregation system

## Troubleshooting

### Logs Not Being Created

1. Check that `NODE_ENV=production` is set
2. Verify the logs directory exists and is writable
3. Check console for initialization errors

### Large Log Files

Log files are created daily and not automatically rotated. To manage log file size:

1. Implement log rotation (delete logs older than X days)
2. Compress old log files
3. Archive logs to external storage

Example cleanup script (PowerShell):
```powershell
# Delete logs older than 30 days
$logDir = "$env:APPDATA\q-deck-launcher\logs"
Get-ChildItem $logDir -Filter "q-deck-*.log" | 
  Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-30) } | 
  Remove-Item
```

### Missing Log Entries

If log entries are missing:

1. Check that the application shut down gracefully (logs are flushed on shutdown)
2. Verify the buffer wasn't full (increase buffer size if needed)
3. Check for file system errors

## Privacy Considerations

### What is Logged

- Action types and execution times
- Application paths and file paths
- Error messages and stack traces
- Configuration changes
- Performance metrics

### What is NOT Logged

- File contents
- User credentials or passwords
- Personal data from files
- Network traffic
- Clipboard contents

### GDPR Compliance

The logging system does not collect personal data by default. However:

- File paths may contain usernames
- Error messages may contain file names
- Consider anonymizing logs before sharing

## Requirements

This logging system fulfills:

- **Requirement 6.5**: "Q-DeckシステムはすべてのアクションとエラーをJSON形式の構造化ログファイルに記録すること"
- **Design Specification**: Structured logging with JSON format as specified in the design document

## API Reference

### Logger Methods

#### `initialize()`
Initialize the logger. Must be called after Electron app is ready.

#### `shutdown()`
Shutdown the logger and flush remaining logs.

#### `info(message, context)`
Log an info message.

#### `warn(message, context)`
Log a warning message.

#### `error(message, context)`
Log an error message.

#### `logAction(actionType, actionId, result, executionTimeMs, errorMessage, context)`
Log an action execution.

#### `logStartup(startupTimeMs, context)`
Log application startup.

#### `logHotkeyRegistration(hotkey, success, context)`
Log hotkey registration.

#### `logProfileSwitch(profileName, profileIndex, context)`
Log profile switch.

#### `logConfigSave(success, context)`
Log configuration save.

#### `logUnhandledError(error, context)`
Log unhandled errors.

## Testing

### Manual Integration Test

Run the integration test in production mode:

```bash
# Set production environment
$env:NODE_ENV="production"

# Run integration test
node electron/logger.integration.test.js
```

This will create test logs and verify the logging system works correctly.

### Automated Tests

Unit tests are available in `electron/logger.test.js`. Note that some tests may fail in browser environments due to Node.js module mocking limitations.

## Future Enhancements

Potential improvements for future versions:

1. **Log Rotation**: Automatic deletion of old log files
2. **Log Levels Configuration**: Allow users to configure log verbosity
3. **Remote Logging**: Send logs to remote server for centralized monitoring
4. **Log Encryption**: Encrypt sensitive log data
5. **Performance Metrics**: Track and log detailed performance metrics
6. **User Opt-Out**: Allow users to disable logging

## References

- [Requirement 6.5](.kiro/specs/q-deck-launcher/requirements.md)
- [Design Document](.kiro/specs/q-deck-launcher/design.md)
- [Production Build Documentation](./PRODUCTION_BUILD.md)
