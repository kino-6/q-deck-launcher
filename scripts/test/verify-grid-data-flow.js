/**
 * Data Flow Verification Script for Grid Component
 * 
 * This script verifies that:
 * 1. Config is being passed to Overlay component
 * 2. Profile and page data is available
 * 3. Buttons array is populated
 * 4. Grid component receives correct props
 */

import electron from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const { app, BrowserWindow } = electron;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let verificationResults = {
  configLoaded: false,
  profileDataAvailable: false,
  pageDataAvailable: false,
  buttonsPopulated: false,
  gridPropsCorrect: false,
  errors: []
};

async function verifyDataFlow() {
  console.log('\n🔍 Starting Grid Data Flow Verification...\n');
  
  // Create a hidden window for testing
  const testWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'electron', 'preload.js')
    }
  });

  // Load the overlay page
  const overlayPath = path.join(__dirname, 'dist', 'index.html');
  await testWindow.loadFile(overlayPath);

  // Wait for the page to fully load
  await new Promise(resolve => setTimeout(resolve, 2000));

  try {
    // Step 1: Verify config is loaded in Overlay
    console.log('📋 Step 1: Checking if config is loaded in Overlay component...');
    const configCheck = await testWindow.webContents.executeJavaScript(`
      (function() {
        // Check if config state exists in the Overlay component
        const overlayContainer = document.querySelector('.overlay-container');
        if (!overlayContainer) {
          return { success: false, error: 'Overlay container not found' };
        }
        
        // Check for loading spinner (indicates config is still loading)
        const loadingSpinner = document.querySelector('.loading-spinner');
        if (loadingSpinner) {
          return { success: false, error: 'Config still loading' };
        }
        
        // Check for error message
        const errorMessage = document.querySelector('.error-message');
        if (errorMessage) {
          return { success: false, error: 'Error loading config: ' + errorMessage.textContent };
        }
        
        // Check if Grid component is rendered (indicates config is loaded)
        const gridElement = document.querySelector('.grid');
        if (!gridElement) {
          return { success: false, error: 'Grid component not rendered' };
        }
        
        return { success: true, message: 'Config loaded and Grid rendered' };
      })()
    `);

    if (configCheck.success) {
      console.log('✅ Config is loaded in Overlay component');
      verificationResults.configLoaded = true;
    } else {
      console.log('❌ Config loading failed:', configCheck.error);
      verificationResults.errors.push(`Config: ${configCheck.error}`);
    }

    // Step 2: Verify profile data is available
    console.log('\n👤 Step 2: Checking if profile data is available...');
    const profileCheck = await testWindow.webContents.executeJavaScript(`
      (function() {
        // Check for profile info in navigation header
        const profileName = document.querySelector('.profile-name');
        if (!profileName) {
          return { success: false, error: 'Profile name not found in UI' };
        }
        
        const profileNameText = profileName.textContent.trim();
        if (!profileNameText || profileNameText === '') {
          return { success: false, error: 'Profile name is empty' };
        }
        
        return { 
          success: true, 
          message: 'Profile data available',
          profileName: profileNameText
        };
      })()
    `);

    if (profileCheck.success) {
      console.log('✅ Profile data is available:', profileCheck.profileName);
      verificationResults.profileDataAvailable = true;
    } else {
      console.log('❌ Profile data not available:', profileCheck.error);
      verificationResults.errors.push(`Profile: ${profileCheck.error}`);
    }

    // Step 3: Verify page data is available
    console.log('\n📄 Step 3: Checking if page data is available...');
    const pageCheck = await testWindow.webContents.executeJavaScript(`
      (function() {
        // Check for page info in navigation header
        const pageInfo = document.querySelector('.page-info');
        if (!pageInfo) {
          return { success: false, error: 'Page info not found in UI' };
        }
        
        const pageInfoText = pageInfo.textContent.trim();
        if (!pageInfoText || pageInfoText === '') {
          return { success: false, error: 'Page info is empty' };
        }
        
        return { 
          success: true, 
          message: 'Page data available',
          pageInfo: pageInfoText
        };
      })()
    `);

    if (pageCheck.success) {
      console.log('✅ Page data is available:', pageCheck.pageInfo);
      verificationResults.pageDataAvailable = true;
    } else {
      console.log('❌ Page data not available:', pageCheck.error);
      verificationResults.errors.push(`Page: ${pageCheck.error}`);
    }

    // Step 4: Verify buttons array is populated
    console.log('\n🔘 Step 4: Checking if buttons array is populated...');
    const buttonsCheck = await testWindow.webContents.executeJavaScript(`
      (function() {
        // Check for grid cells
        const gridCells = document.querySelectorAll('.grid-cell');
        if (!gridCells || gridCells.length === 0) {
          return { success: false, error: 'No grid cells found' };
        }
        
        // Count non-empty cells (cells with buttons)
        const buttonCells = Array.from(gridCells).filter(cell => {
          return cell.querySelector('.action-button') !== null;
        });
        
        if (buttonCells.length === 0) {
          return { 
            success: false, 
            error: 'No buttons found in grid',
            totalCells: gridCells.length,
            buttonCells: 0
          };
        }
        
        return { 
          success: true, 
          message: 'Buttons array is populated',
          totalCells: gridCells.length,
          buttonCells: buttonCells.length
        };
      })()
    `);

    if (buttonsCheck.success) {
      console.log(`✅ Buttons array is populated: ${buttonsCheck.buttonCells} buttons in ${buttonsCheck.totalCells} cells`);
      verificationResults.buttonsPopulated = true;
    } else {
      console.log('❌ Buttons array not populated:', buttonsCheck.error);
      if (buttonsCheck.totalCells !== undefined) {
        console.log(`   Total cells: ${buttonsCheck.totalCells}, Button cells: ${buttonsCheck.buttonCells || 0}`);
      }
      verificationResults.errors.push(`Buttons: ${buttonsCheck.error}`);
    }

    // Step 5: Verify Grid component receives correct props
    console.log('\n🎯 Step 5: Checking if Grid component receives correct props...');
    const propsCheck = await testWindow.webContents.executeJavaScript(`
      (function() {
        // Check if Grid component is rendered with proper structure
        const grid = document.querySelector('.grid');
        if (!grid) {
          return { success: false, error: 'Grid element not found' };
        }
        
        // Check if grid has proper styling (indicates gridStyle prop is applied)
        const gridStyle = window.getComputedStyle(grid);
        const hasGridDisplay = gridStyle.display === 'grid';
        const hasGridTemplateColumns = gridStyle.gridTemplateColumns !== 'none';
        const hasGridTemplateRows = gridStyle.gridTemplateRows !== 'none';
        
        if (!hasGridDisplay) {
          return { success: false, error: 'Grid does not have display: grid' };
        }
        
        if (!hasGridTemplateColumns || !hasGridTemplateRows) {
          return { success: false, error: 'Grid template columns/rows not set' };
        }
        
        // Check if grid cells are properly positioned
        const gridCells = document.querySelectorAll('.grid-cell');
        if (gridCells.length === 0) {
          return { success: false, error: 'No grid cells rendered' };
        }
        
        return { 
          success: true, 
          message: 'Grid component receives correct props',
          gridDisplay: hasGridDisplay,
          hasTemplateColumns: hasGridTemplateColumns,
          hasTemplateRows: hasGridTemplateRows,
          cellCount: gridCells.length
        };
      })()
    `);

    if (propsCheck.success) {
      console.log('✅ Grid component receives correct props');
      console.log(`   Grid display: ${propsCheck.gridDisplay}`);
      console.log(`   Template columns: ${propsCheck.hasTemplateColumns}`);
      console.log(`   Template rows: ${propsCheck.hasTemplateRows}`);
      console.log(`   Cell count: ${propsCheck.cellCount}`);
      verificationResults.gridPropsCorrect = true;
    } else {
      console.log('❌ Grid component props incorrect:', propsCheck.error);
      verificationResults.errors.push(`Grid Props: ${propsCheck.error}`);
    }

  } catch (error) {
    console.error('❌ Verification error:', error);
    verificationResults.errors.push(`Verification error: ${error.message}`);
  } finally {
    testWindow.close();
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 VERIFICATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`Config loaded:           ${verificationResults.configLoaded ? '✅' : '❌'}`);
  console.log(`Profile data available:  ${verificationResults.profileDataAvailable ? '✅' : '❌'}`);
  console.log(`Page data available:     ${verificationResults.pageDataAvailable ? '✅' : '❌'}`);
  console.log(`Buttons populated:       ${verificationResults.buttonsPopulated ? '✅' : '❌'}`);
  console.log(`Grid props correct:      ${verificationResults.gridPropsCorrect ? '✅' : '❌'}`);
  console.log('='.repeat(60));

  if (verificationResults.errors.length > 0) {
    console.log('\n❌ ERRORS:');
    verificationResults.errors.forEach((error, index) => {
      console.log(`   ${index + 1}. ${error}`);
    });
  }

  const allPassed = verificationResults.configLoaded &&
                    verificationResults.profileDataAvailable &&
                    verificationResults.pageDataAvailable &&
                    verificationResults.buttonsPopulated &&
                    verificationResults.gridPropsCorrect;

  if (allPassed) {
    console.log('\n✅ All verification checks passed!');
    console.log('   Data flow to Grid component is working correctly.\n');
  } else {
    console.log('\n❌ Some verification checks failed!');
    console.log('   Please review the errors above.\n');
  }

  return allPassed;
}

// Run verification when app is ready
app.whenReady().then(async () => {
  const success = await verifyDataFlow();
  app.exit(success ? 0 : 1);
});

app.on('window-all-closed', () => {
  app.quit();
});
