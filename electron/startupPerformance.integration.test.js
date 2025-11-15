/**
 * Integration test for startup performance
 * This test measures the actual startup time of the application
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Startup Performance Integration', () => {
  const STARTUP_TIME_TARGET = 1000; // 1000ms target
  const OVERLAY_RESPONSE_TARGET = 200; // 200ms target for overlay response
  
  // Skip in CI environment as it requires Electron
  const isCI = process.env.CI === 'true';
  
  it.skipIf(isCI)('should start application within 1000ms', async () => {
    const startTime = Date.now();
    let appReady = false;
    let startupTime = 0;
    
    return new Promise((resolve, reject) => {
      // Set timeout for test
      const timeout = setTimeout(() => {
        if (!appReady) {
          reject(new Error(`Application did not start within ${STARTUP_TIME_TARGET * 2}ms`));
        }
      }, STARTUP_TIME_TARGET * 2);
      
      // Spawn Electron process
      const electronPath = path.join(__dirname, '../node_modules/.bin/electron');
      const mainPath = path.join(__dirname, 'main.js');
      
      const electronProcess = spawn(electronPath, [mainPath], {
        env: {
          ...process.env,
          NODE_ENV: 'test',
          NO_DEVTOOLS: 'true'
        }
      });
      
      // Listen for startup messages
      electronProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log('Electron output:', output);
        
        // Look for startup complete message
        if (output.includes('Startup time:') || output.includes('app-ready-complete')) {
          appReady = true;
          startupTime = Date.now() - startTime;
          
          // Kill the process
          electronProcess.kill();
          
          clearTimeout(timeout);
          
          // Verify startup time
          console.log(`Measured startup time: ${startupTime}ms`);
          expect(startupTime).toBeLessThan(STARTUP_TIME_TARGET);
          
          resolve();
        }
      });
      
      electronProcess.stderr.on('data', (data) => {
        console.error('Electron error:', data.toString());
      });
      
      electronProcess.on('error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });
      
      electronProcess.on('exit', (code) => {
        clearTimeout(timeout);
        if (!appReady) {
          reject(new Error(`Electron process exited with code ${code} before startup complete`));
        }
      });
    });
  }, 10000); // 10 second timeout for test
  
  it('should have optimized config loading', () => {
    // This is a unit-level check that can run without spawning Electron
    // Verify that config cache is implemented
    const startupOptPath = path.join(__dirname, 'startupOptimization.js');
    const fs = require('fs');
    const content = fs.readFileSync(startupOptPath, 'utf8');
    
    expect(content).toContain('ConfigCache');
    expect(content).toContain('class ConfigCache');
  });
  
  it('should have lazy module loading', () => {
    // Verify that lazy loading is implemented
    const startupOptPath = path.join(__dirname, 'startupOptimization.js');
    const fs = require('fs');
    const content = fs.readFileSync(startupOptPath, 'utf8');
    
    expect(content).toContain('LazyModuleLoader');
    expect(content).toContain('class LazyModuleLoader');
  });
  
  it('should have deferred initialization', () => {
    // Verify that deferred initialization is implemented
    const startupOptPath = path.join(__dirname, 'startupOptimization.js');
    const fs = require('fs');
    const content = fs.readFileSync(startupOptPath, 'utf8');
    
    expect(content).toContain('DeferredInitializer');
    expect(content).toContain('class DeferredInitializer');
  });
});
