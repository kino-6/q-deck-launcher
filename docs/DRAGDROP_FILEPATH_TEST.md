# Drag & Drop File Path Extraction Test

## Purpose
Verify that the full file path is correctly extracted when files are dragged and dropped onto the Q-Deck grid.

## Test Setup
1. Start the application in development mode:
   ```bash
   npm run electron:dev
   ```

2. Press F11 to open the overlay

## Test Cases

### Test 1: Single File Drop
**Steps:**
1. Open File Explorer
2. Navigate to any folder (e.g., `C:\Windows\System32`)
3. Drag `notepad.exe` onto an empty grid cell
4. Open the browser console (F12)

**Expected Results:**
- Console should show: `✅ Full file path extracted: C:\Windows\System32\notepad.exe`
- Console should show: `✅ All paths are full paths`
- The path should contain the drive letter (e.g., `C:`)
- The path should be absolute, not relative

**Actual Results:**
- [ ] Full path extracted correctly
- [ ] Path contains drive letter
- [ ] Path is absolute

### Test 2: Multiple Files Drop
**Steps:**
1. Open File Explorer
2. Navigate to a folder with multiple files
3. Select 2-3 files (e.g., `.exe`, `.txt`, `.pdf`)
4. Drag all selected files onto an empty grid cell
5. Check the browser console

**Expected Results:**
- Console should show full paths for all files
- Each path should be absolute with drive letter
- Console should show: `✅ All paths are full paths`

**Actual Results:**
- [ ] All full paths extracted correctly
- [ ] All paths contain drive letters
- [ ] All paths are absolute

### Test 3: File from Different Drive
**Steps:**
1. If you have multiple drives (e.g., D:, E:), navigate to a file on a different drive
2. Drag a file from the different drive onto the grid
3. Check the console

**Expected Results:**
- Console should show the full path with the correct drive letter
- Path should be: `D:\path\to\file.ext` (or appropriate drive)

**Actual Results:**
- [ ] Correct drive letter in path
- [ ] Full path extracted

### Test 4: File from Network Path
**Steps:**
1. If you have access to a network share (e.g., `\\server\share`)
2. Drag a file from the network location
3. Check the console

**Expected Results:**
- Console should show the UNC path: `\\server\share\path\to\file.ext`
- Path should be complete and absolute

**Actual Results:**
- [ ] UNC path extracted correctly
- [ ] Path is complete

### Test 5: File with Special Characters
**Steps:**
1. Create or find a file with special characters in the name (e.g., `test file (1).txt`)
2. Drag it onto the grid
3. Check the console

**Expected Results:**
- Console should show the full path with special characters preserved
- Path should be properly formatted

**Actual Results:**
- [ ] Special characters preserved
- [ ] Path is valid

## Console Output to Look For

### Success Indicators:
```
🔧 Electron drop handler
✅ Full file path extracted: C:\path\to\file.ext
📁 All dropped file paths: ["C:\path\to\file.ext"]
✅ All paths are full paths
```

### Warning Indicators:
```
⚠️ File path not available for: filename.ext
⚠️ Some paths may not be full paths: ["filename.ext"]
```

## Implementation Details

The file path extraction is implemented in `GridDragDrop.tsx`:

```typescript
const filePaths = files.map(file => {
  const electronFile = file as File & { path?: string };
  const fullPath = electronFile.path;
  
  if (!fullPath) {
    console.warn('⚠️ File path not available for:', file.name);
    return file.name;
  }
  
  console.log('✅ Full file path extracted:', fullPath);
  return fullPath;
});
```

## Verification Checklist

- [ ] Full paths are extracted (not just filenames)
- [ ] Paths include drive letters (e.g., `C:`)
- [ ] Paths are absolute (not relative)
- [ ] UNC paths work (if applicable)
- [ ] Special characters in filenames are preserved
- [ ] Multiple files can be dropped at once
- [ ] Console logs show success messages

## Notes

- In Electron, the `File` object has a `path` property that contains the full file system path
- This is different from web browsers where only the filename is available for security reasons
- The implementation validates that paths are full paths by checking for `:` (Windows drive) or `/` (Unix root)
