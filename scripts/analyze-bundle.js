#!/usr/bin/env node

/**
 * Bundle Size Analyzer
 * 
 * Analyzes the production build and reports bundle sizes
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.join(__dirname, '..', 'dist');
const assetsPath = path.join(distPath, 'assets');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (err) {
    return 0;
  }
}

function analyzeDirectory(dirPath) {
  const files = [];
  
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stats = fs.statSync(fullPath);
      
      if (stats.isFile()) {
        files.push({
          name: item,
          path: fullPath,
          size: stats.size,
          type: path.extname(item).slice(1) || 'unknown'
        });
      }
    }
  } catch (err) {
    console.error(`Error reading directory ${dirPath}:`, err.message);
  }
  
  return files;
}

function categorizeFiles(files) {
  const categories = {
    js: [],
    css: [],
    html: [],
    images: [],
    other: []
  };
  
  for (const file of files) {
    if (file.type === 'js') {
      categories.js.push(file);
    } else if (file.type === 'css') {
      categories.css.push(file);
    } else if (file.type === 'html') {
      categories.html.push(file);
    } else if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'ico', 'webp'].includes(file.type)) {
      categories.images.push(file);
    } else {
      categories.other.push(file);
    }
  }
  
  return categories;
}

function printReport(categories) {
  console.log(`\n${colors.bright}${colors.cyan}=== Bundle Size Analysis ===${colors.reset}\n`);
  
  // Calculate totals
  let totalSize = 0;
  const categoryTotals = {};
  
  for (const [category, files] of Object.entries(categories)) {
    const categorySize = files.reduce((sum, file) => sum + file.size, 0);
    categoryTotals[category] = categorySize;
    totalSize += categorySize;
  }
  
  // Print JavaScript files
  if (categories.js.length > 0) {
    console.log(`${colors.bright}JavaScript Files:${colors.reset}`);
    categories.js.sort((a, b) => b.size - a.size);
    
    for (const file of categories.js) {
      const sizeStr = formatBytes(file.size);
      const color = file.size > 200000 ? colors.red : file.size > 100000 ? colors.yellow : colors.green;
      console.log(`  ${file.name.padEnd(50)} ${color}${sizeStr.padStart(10)}${colors.reset}`);
    }
    
    console.log(`  ${'Total:'.padEnd(50)} ${colors.bright}${formatBytes(categoryTotals.js).padStart(10)}${colors.reset}\n`);
  }
  
  // Print CSS files
  if (categories.css.length > 0) {
    console.log(`${colors.bright}CSS Files:${colors.reset}`);
    categories.css.sort((a, b) => b.size - a.size);
    
    for (const file of categories.css) {
      const sizeStr = formatBytes(file.size);
      const color = file.size > 50000 ? colors.yellow : colors.green;
      console.log(`  ${file.name.padEnd(50)} ${color}${sizeStr.padStart(10)}${colors.reset}`);
    }
    
    console.log(`  ${'Total:'.padEnd(50)} ${colors.bright}${formatBytes(categoryTotals.css).padStart(10)}${colors.reset}\n`);
  }
  
  // Print HTML files
  if (categories.html.length > 0) {
    console.log(`${colors.bright}HTML Files:${colors.reset}`);
    
    for (const file of categories.html) {
      const sizeStr = formatBytes(file.size);
      console.log(`  ${file.name.padEnd(50)} ${colors.green}${sizeStr.padStart(10)}${colors.reset}`);
    }
    
    console.log(`  ${'Total:'.padEnd(50)} ${colors.bright}${formatBytes(categoryTotals.html).padStart(10)}${colors.reset}\n`);
  }
  
  // Print images
  if (categories.images.length > 0) {
    console.log(`${colors.bright}Images:${colors.reset}`);
    categories.images.sort((a, b) => b.size - a.size);
    
    for (const file of categories.images) {
      const sizeStr = formatBytes(file.size);
      const color = file.size > 100000 ? colors.yellow : colors.green;
      console.log(`  ${file.name.padEnd(50)} ${color}${sizeStr.padStart(10)}${colors.reset}`);
    }
    
    console.log(`  ${'Total:'.padEnd(50)} ${colors.bright}${formatBytes(categoryTotals.images).padStart(10)}${colors.reset}\n`);
  }
  
  // Print other files
  if (categories.other.length > 0) {
    console.log(`${colors.bright}Other Files:${colors.reset}`);
    
    for (const file of categories.other) {
      const sizeStr = formatBytes(file.size);
      console.log(`  ${file.name.padEnd(50)} ${colors.green}${sizeStr.padStart(10)}${colors.reset}`);
    }
    
    console.log(`  ${'Total:'.padEnd(50)} ${colors.bright}${formatBytes(categoryTotals.other).padStart(10)}${colors.reset}\n`);
  }
  
  // Print summary
  console.log(`${colors.bright}${colors.cyan}=== Summary ===${colors.reset}\n`);
  console.log(`  ${'Total Bundle Size:'.padEnd(50)} ${colors.bright}${formatBytes(totalSize).padStart(10)}${colors.reset}`);
  
  // Estimate gzipped size (rough estimate: ~30% of original)
  const estimatedGzipped = Math.floor(totalSize * 0.3);
  console.log(`  ${'Estimated Gzipped:'.padEnd(50)} ${colors.bright}${formatBytes(estimatedGzipped).padStart(10)}${colors.reset}`);
  
  // Check against targets
  console.log(`\n${colors.bright}${colors.cyan}=== Targets ===${colors.reset}\n`);
  
  const targets = {
    'JavaScript': { actual: categoryTotals.js, target: 370000 }, // 370 KB
    'CSS': { actual: categoryTotals.css, target: 50000 },        // 50 KB
    'Total': { actual: totalSize, target: 520000 },              // 520 KB
    'Gzipped (est.)': { actual: estimatedGzipped, target: 180000 } // 180 KB
  };
  
  for (const [name, { actual, target }] of Object.entries(targets)) {
    const percentage = (actual / target * 100).toFixed(1);
    const status = actual <= target ? `${colors.green}✓ PASS${colors.reset}` : `${colors.red}✗ FAIL${colors.reset}`;
    const actualStr = formatBytes(actual);
    const targetStr = formatBytes(target);
    
    console.log(`  ${name.padEnd(20)} ${actualStr.padStart(10)} / ${targetStr.padStart(10)} (${percentage.padStart(5)}%) ${status}`);
  }
  
  console.log();
  
  // Recommendations
  if (totalSize > 520000) {
    console.log(`${colors.yellow}⚠ Bundle size exceeds target. Consider:${colors.reset}`);
    console.log(`  - Lazy loading heavy components`);
    console.log(`  - Removing unused dependencies`);
    console.log(`  - Optimizing images`);
    console.log(`  - Code splitting routes\n`);
  } else {
    console.log(`${colors.green}✓ Bundle size is within target!${colors.reset}\n`);
  }
}

function main() {
  // Check if dist directory exists
  if (!fs.existsSync(distPath)) {
    console.error(`${colors.red}Error: dist directory not found. Run 'npm run build' first.${colors.reset}`);
    process.exit(1);
  }
  
  // Analyze root dist files
  const rootFiles = analyzeDirectory(distPath);
  
  // Analyze assets directory
  let assetFiles = [];
  if (fs.existsSync(assetsPath)) {
    assetFiles = analyzeDirectory(assetsPath);
  }
  
  // Combine all files
  const allFiles = [...rootFiles, ...assetFiles];
  
  if (allFiles.length === 0) {
    console.error(`${colors.red}Error: No files found in dist directory.${colors.reset}`);
    process.exit(1);
  }
  
  // Categorize and print report
  const categories = categorizeFiles(allFiles);
  printReport(categories);
}

main();
