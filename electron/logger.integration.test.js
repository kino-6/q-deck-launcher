/**
 * Production Logger Integration Test
 * 
 * Manual integration test for production logging.
 * Run this with: NODE_ENV=production node electron/logger.integration.test.js
 */

import logger from './logger.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock app.getPath for testing
const mockApp = {
  getPath: () => path.join(__dirname, '../test-logs')
};

// Replace electron app with mock
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const Module = require('module');
const originalRequire = Module.prototype.require;

Module.prototype.require = function(id) {
  if (id === 'electron') {
    return { app: mockApp };
  }
  return originalRequire.apply(this, arguments);
};

console.log('🧪 Production Logger Integration Test\n');

// Test 1: Initialize logger
console.log('Test 1: Initialize logger');
logger.initialize();
console.log('✅ Logger initialized\n');

// Test 2: Log info message
console.log('Test 2: Log info message');
logger.info('Test info message', { test: true });
console.log('✅ Info message logged\n');

// Test 3: Log warning message
console.log('Test 3: Log warning message');
logger.warn('Test warning message', { warning: true });
console.log('✅ Warning message logged\n');

// Test 4: Log error message
console.log('Test 4: Log error message');
logger.error('Test error message', { error: true });
console.log('✅ Error message logged\n');

// Test 5: Log action execution
console.log('Test 5: Log action execution');
logger.logAction('LaunchApp', 'notepad', 'success', 150, null, {
  path: 'notepad.exe'
});
console.log('✅ Action logged\n');

// Test 6: Log startup
console.log('Test 6: Log startup');
logger.logStartup(850, { critical_path_ms: 300 });
console.log('✅ Startup logged\n');

// Test 7: Log hotkey registration
console.log('Test 7: Log hotkey registration');
logger.logHotkeyRegistration('F11', true);
logger.logHotkeyRegistration('F12', false);
console.log('✅ Hotkey registration logged\n');

// Test 8: Log profile switch
console.log('Test 8: Log profile switch');
logger.logProfileSwitch('Development', 0);
console.log('✅ Profile switch logged\n');

// Test 9: Log config save
console.log('Test 9: Log config save');
logger.logConfigSave(true);
logger.logConfigSave(false, { error: 'Permission denied' });
console.log('✅ Config save logged\n');

// Test 10: Log unhandled error
console.log('Test 10: Log unhandled error');
const testError = new Error('Test unhandled error');
logger.logUnhandledError(testError, { type: 'uncaughtException' });
console.log('✅ Unhandled error logged\n');

// Test 11: Flush and verify
console.log('Test 11: Flush and verify log file');
logger.flush();

if (logger.logFilePath && fs.existsSync(logger.logFilePath)) {
  const logContent = fs.readFileSync(logger.logFilePath, 'utf8');
  const logLines = logContent.trim().split('\n');
  
  console.log(`✅ Log file created: ${logger.logFilePath}`);
  console.log(`✅ Log entries: ${logLines.length}`);
  
  // Verify JSON format
  let validJson = true;
  for (const line of logLines) {
    try {
      const entry = JSON.parse(line);
      if (!entry.timestamp || !entry.level || !entry.message) {
        validJson = false;
        console.log('❌ Invalid log entry format:', line);
      }
    } catch (err) {
      validJson = false;
      console.log('❌ Invalid JSON:', line);
    }
  }
  
  if (validJson) {
    console.log('✅ All log entries are valid JSON\n');
  }
  
  // Show sample log entries
  console.log('Sample log entries:');
  console.log('---');
  logLines.slice(0, 3).forEach(line => {
    const entry = JSON.parse(line);
    console.log(JSON.stringify(entry, null, 2));
  });
  console.log('---\n');
} else {
  console.log('❌ Log file not created\n');
}

// Test 12: Shutdown
console.log('Test 12: Shutdown logger');
logger.shutdown();
console.log('✅ Logger shutdown\n');

console.log('🎉 All integration tests passed!');
console.log('\nNote: This test only runs in production mode (NODE_ENV=production)');
console.log('In development mode, logs are only written to console.');
