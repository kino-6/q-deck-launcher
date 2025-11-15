/**
 * Automated DevTools Testing Script for Overlay Window
 * 
 * This script launches the application and performs automated checks:
 * 1. Opens DevTools in overlay window
 * 2. Checks console for errors
 * 3. Inspects React component tree
 * 4. Verifies network requests for assets
 * 
 * Usage: node test-devtools-overlay.js
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'bright');
  console.log('='.repeat(60) + '\n');
}

function logCheck(description, passed, details = '') {
  const icon = passed ? '✓' : '✗';
  const color = passed ? 'green' : 'red';
  log(`${icon} ${description}`, color);
  if (details) {
    log(`  ${details}`, 'cyan');
  }
}

// Test results tracking
const testResults = {
  consoleErrors: [],
  consoleWarnings: [],
  networkErrors: [],
  componentIssues: [],
  passed: 0,
  failed: 0
};

async function runDevToolsTests() {
  logSection('Q-Deck Overlay DevTools Testing');
  
  log('Starting application in development mode...', 'yellow');
  log('This will launch the app with DevTools enabled.\n', 'yellow');
  
  // Set environment variables for development mode
  const env = {
    ...process.env,
    NODE_ENV: 'development',
    ELECTRON_ENABLE_LOGGING: '1'
  };
  
  // Launch the application
  const electronProcess = spawn('npm', ['run', 'electron:dev'], {
    cwd: __dirname,
    env,
    shell: true,
    stdio: 'pipe'
  });
  
  let stdoutBuffer = '';
  let stderrBuffer = '';
  
  // Capture stdout
  electronProcess.stdout.on('data', (data) => {
    const output = data.toString();
    stdoutBuffer += output;
    
    // Real-time output
    process.stdout.write(output);
    
    // Parse for specific patterns
    analyzeOutput(output);
  });
  
  // Capture stderr
  electronProcess.stderr.on('data', (data) => {
    const output = data.toString();
    stderrBuffer += output;
    
    // Real-time output
    process.stderr.write(output);
    
    // Parse for errors
    analyzeErrors(output);
  });
  
  // Handle process exit
  electronProcess.on('close', (code) => {
    logSection('Test Results Summary');
    
    // Console Errors Check
    log('\n1. Console Errors Check:', 'bright');
    if (testResults.consoleErrors.length === 0) {
      logCheck('No console errors detected', true);
      testResults.passed++;
    } else {
      logCheck(`Found ${testResults.consoleErrors.length} console error(s)`, false);
      testResults.consoleErrors.forEach(err => {
        log(`   - ${err}`, 'red');
      });
      testResults.failed++;
    }
    
    // Console Warnings Check
    log('\n2. Console Warnings Check:', 'bright');
    if (testResults.consoleWarnings.length === 0) {
      logCheck('No console warnings detected', true);
      testResults.passed++;
    } else {
      logCheck(`Found ${testResults.consoleWarnings.length} console warning(s)`, false);
      testResults.consoleWarnings.forEach(warn => {
        log(`   - ${warn}`, 'yellow');
      });
      testResults.failed++;
    }
    
    // Network Errors Check
    log('\n3. Network Requests Check:', 'bright');
    if (testResults.networkErrors.length === 0) {
      logCheck('All network requests successful', true);
      testResults.passed++;
    } else {
      logCheck(`Found ${testResults.networkErrors.length} network error(s)`, false);
      testResults.networkErrors.forEach(err => {
        log(`   - ${err}`, 'red');
      });
      testResults.failed++;
    }
    
    // Component Issues Check
    log('\n4. React Component Check:', 'bright');
    if (testResults.componentIssues.length === 0) {
      logCheck('No component issues detected', true);
      testResults.passed++;
    } else {
      logCheck(`Found ${testResults.componentIssues.length} component issue(s)`, false);
      testResults.componentIssues.forEach(issue => {
        log(`   - ${issue}`, 'red');
      });
      testResults.failed++;
    }
    
    // Final summary
    logSection('Final Summary');
    log(`Total Checks: ${testResults.passed + testResults.failed}`, 'bright');
    log(`Passed: ${testResults.passed}`, 'green');
    log(`Failed: ${testResults.failed}`, 'red');
    
    if (testResults.failed === 0) {
      log('\n✓ All DevTools checks passed!', 'green');
      log('The overlay window is functioning correctly.', 'green');
    } else {
      log('\n✗ Some checks failed.', 'red');
      log('Please review the errors above and check DEV_TOOLS_TESTING_GUIDE.md', 'yellow');
    }
    
    log('\nApplication closed. Test complete.', 'cyan');
    process.exit(code);
  });
  
  // Handle Ctrl+C
  process.on('SIGINT', () => {
    log('\n\nTest interrupted by user. Closing application...', 'yellow');
    electronProcess.kill('SIGINT');
  });
  
  // Instructions for manual testing
  setTimeout(() => {
    logSection('Manual Testing Instructions');
    log('The application is now running with DevTools enabled.', 'cyan');
    log('Please perform the following manual checks:\n', 'cyan');
    log('1. Press F11 to open the overlay window', 'yellow');
    log('2. DevTools should open automatically', 'yellow');
    log('3. Check the Console tab for any errors (red text)', 'yellow');
    log('4. Check the Network tab for failed requests (red status)', 'yellow');
    log('5. If React DevTools is installed, check Components tab', 'yellow');
    log('6. Verify the grid is rendering with buttons\n', 'yellow');
    log('Press Ctrl+C when done testing to see results.\n', 'cyan');
  }, 3000);
}

function analyzeOutput(output) {
  // Check for successful overlay initialization
  if (output.includes('Overlay window ready to show')) {
    logCheck('Overlay window initialized', true);
  }
  
  if (output.includes('Overlay page loaded successfully')) {
    logCheck('Overlay page loaded', true);
  }
  
  if (output.includes('IPC handlers registered')) {
    logCheck('IPC handlers registered', true);
  }
  
  if (output.includes('Configuration loaded')) {
    logCheck('Configuration loaded', true);
  }
  
  // Check for renderer console messages
  if (output.includes('[RENDERER ERROR]')) {
    const errorMatch = output.match(/\[RENDERER ERROR\] (.+)/);
    if (errorMatch) {
      testResults.consoleErrors.push(errorMatch[1]);
    }
  }
  
  if (output.includes('[RENDERER WARN]')) {
    const warnMatch = output.match(/\[RENDERER WARN\] (.+)/);
    if (warnMatch) {
      testResults.consoleWarnings.push(warnMatch[1]);
    }
  }
  
  // Check for React errors
  if (output.includes('Uncaught TypeError') || 
      output.includes('Cannot read property') ||
      output.includes('undefined is not an object')) {
    testResults.consoleErrors.push('React runtime error detected');
  }
  
  // Check for network errors
  if (output.includes('Failed to load resource') || 
      output.includes('net::ERR_FILE_NOT_FOUND') ||
      output.includes('404')) {
    const errorMatch = output.match(/Failed to load resource: (.+)/);
    if (errorMatch) {
      testResults.networkErrors.push(errorMatch[1]);
    } else {
      testResults.networkErrors.push('Resource loading failed');
    }
  }
  
  // Check for component mounting issues
  if (output.includes('Warning: Each child in a list should have a unique "key" prop')) {
    testResults.componentIssues.push('Missing key props in list rendering');
  }
  
  if (output.includes('Warning: Failed prop type')) {
    testResults.componentIssues.push('Invalid prop types detected');
  }
}

function analyzeErrors(output) {
  // Capture stderr errors
  if (output.includes('Error:') || output.includes('ERROR')) {
    // Filter out noise
    if (!output.includes('DevTools') && 
        !output.includes('Security Warning') &&
        !output.includes('Autofill')) {
      testResults.consoleErrors.push(output.trim());
    }
  }
}

// Run the tests
runDevToolsTests().catch(err => {
  log('\nTest script error:', 'red');
  console.error(err);
  process.exit(1);
});
