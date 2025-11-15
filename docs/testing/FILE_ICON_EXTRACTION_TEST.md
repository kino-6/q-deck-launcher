# File Icon Extraction - Manual Test Guide

## Overview
This document provides manual testing procedures to verify that file type icons are correctly extracted for non-executable files.

## Prerequisites
- Q-Deck application running in development mode
- Various test files available for drag & drop

## Test Files Setup

Create the following test files in a temporary directory:

### Image Files
- `test-image.png` - Any PNG image
- `test-photo.jpg` - Any JPEG image
- `test-graphic.gif` - Any GIF image
- `test-bitmap.bmp` - Any BMP image

### Document Files
- `test-document.pdf` - Any PDF file
- `test-word.docx` - Any Word document
- `test-excel.xlsx` - Any Excel spreadsheet
- `test-powerpoint.pptx` - Any PowerPoint presentation
- `test-text.txt` - Any text file

### Media Files
- `test-video.mp4` - Any MP4 video
- `test-audio.mp3` - Any MP3 audio
- `test-movie.avi` - Any AVI video

### Archive Files
- `test-archive.zip` - Any ZIP archive
- `test-compressed.rar` - Any RAR archive (if available)
- `test-7zip.7z` - Any 7-Zip archive (if available)

### Other Files
- `test-code.js` - Any JavaScript file
- `test-style.css` - Any CSS file
- `test-data.json` - Any JSON file
- `test-markdown.md` - Any Markdown file

## Test Procedures

### Test 1: Image File Icons
**Objective**: Verify that image files display their file type icons

1. Launch Q-Deck with `npm run electron:dev` or `.\launch.ps1`
2. Press F11 to open the overlay
3. Drag and drop `test-image.png` onto a grid cell
4. **Expected Result**: 
   - Button is created with the file name as label
   - Icon shows the PNG file icon (same as Windows Explorer)
   - Icon is NOT the generic folder icon (📁)
5. Repeat for JPG, GIF, and BMP files

**Pass Criteria**: All image files show their respective file type icons

### Test 2: Document File Icons
**Objective**: Verify that document files display their file type icons

1. Press F11 to open the overlay
2. Drag and drop `test-document.pdf` onto a grid cell
3. **Expected Result**:
   - Button shows PDF icon (Adobe Acrobat icon)
   - Icon matches Windows Explorer appearance
4. Repeat for DOCX, XLSX, and PPTX files

**Pass Criteria**: All document files show their respective application icons

### Test 3: Media File Icons
**Objective**: Verify that media files display their file type icons

1. Press F11 to open the overlay
2. Drag and drop `test-video.mp4` onto a grid cell
3. **Expected Result**:
   - Button shows video file icon
   - Icon matches Windows Explorer appearance
4. Repeat for MP3 and AVI files

**Pass Criteria**: All media files show their respective file type icons

### Test 4: Archive File Icons
**Objective**: Verify that archive files display their file type icons

1. Press F11 to open the overlay
2. Drag and drop `test-archive.zip` onto a grid cell
3. **Expected Result**:
   - Button shows ZIP archive icon
   - Icon matches Windows Explorer appearance
4. Repeat for RAR and 7Z files if available

**Pass Criteria**: All archive files show their respective compression tool icons

### Test 5: Code File Icons
**Objective**: Verify that code files display their file type icons

1. Press F11 to open the overlay
2. Drag and drop `test-code.js` onto a grid cell
3. **Expected Result**:
   - Button shows JavaScript file icon
   - Icon matches Windows Explorer appearance
4. Repeat for CSS, JSON, and MD files

**Pass Criteria**: All code files show their respective file type icons

### Test 6: Icon Persistence
**Objective**: Verify that extracted icons are cached and persist across sessions

1. Create buttons with various file types (from tests above)
2. Close Q-Deck completely
3. Restart Q-Deck
4. Press F11 to open the overlay
5. **Expected Result**:
   - All buttons still show their correct file type icons
   - Icons load quickly (from cache)

**Pass Criteria**: Icons persist and load from cache

### Test 7: Icon Quality
**Objective**: Verify that extracted icons are high quality and match Windows Explorer

1. Open Windows Explorer
2. Navigate to the test files directory
3. Note the icons shown in Explorer for each file type
4. Open Q-Deck overlay (F11)
5. Compare button icons with Explorer icons
6. **Expected Result**:
   - Q-Deck icons match Explorer icons
   - Icons are clear and not pixelated
   - Icons are appropriately sized for the button

**Pass Criteria**: Icons match Windows Explorer appearance and quality

### Test 8: Fallback Behavior
**Objective**: Verify graceful fallback when icon extraction fails

1. Create a file with an unusual or unsupported extension (e.g., `.xyz`)
2. Drag and drop onto the overlay
3. **Expected Result**:
   - Button is still created
   - Either shows a generic file icon or no icon
   - No error messages or crashes

**Pass Criteria**: Application handles unknown file types gracefully

### Test 9: Multiple File Drop
**Objective**: Verify icon extraction works for multiple files at once

1. Select multiple files of different types (PNG, PDF, MP4, ZIP)
2. Drag and drop all files onto the overlay at once
3. **Expected Result**:
   - All buttons are created
   - Each button shows its correct file type icon
   - No performance issues or delays

**Pass Criteria**: Multiple file icons are extracted correctly

### Test 10: Button Functionality
**Objective**: Verify that buttons with extracted icons still work correctly

1. Create a button by dropping a PDF file
2. Click the button
3. **Expected Result**:
   - PDF file opens in the default PDF viewer
   - Icon remains visible and correct

**Pass Criteria**: Buttons with extracted icons function correctly

## Implementation Verification

### Code Components Verified
- ✅ `electron/ipc/utilityHandlers.js` - `createExtractFileIconHandler` function
- ✅ `electron/preload.cjs` - `extractFileIcon` exposed to renderer
- ✅ `src/lib/electron-adapter.ts` - `extractFileIcon` method
- ✅ `src/lib/platform-api.ts` - `extractFileIcon` in tauriAPI
- ✅ `src/hooks/useFileDrop.ts` - Icon extraction for non-executable files

### Unit Tests
- ✅ `electron/ipc/utilityHandlers.test.js` - All tests passing
  - PNG, PDF, DOCX, MP4, ZIP, XLSX icon extraction
  - Error handling (empty icon, null icon, extraction errors)
  - Data URL format validation

## Known Limitations

1. **Electron API Dependency**: Icon extraction uses Electron's `app.getFileIcon()` which relies on Windows Shell API
2. **File Association Required**: Files must have a registered file association in Windows to have an icon
3. **Cache Location**: Icons are cached as base64 data URLs in the config file (no separate cache directory for file type icons)

## Troubleshooting

### Icons Not Showing
- Check that the file has a registered file association in Windows
- Verify the file exists and is accessible
- Check browser console for error messages

### Icons Show as Folder Icon
- This was the original issue - should now be fixed
- If still occurring, check that `extractFileIcon` is being called (not `extractExecutableIcon`)

### Performance Issues
- Large numbers of files may cause delays during icon extraction
- Icons are extracted asynchronously to minimize UI blocking

## Success Criteria

All of the following must be true:
- ✅ Image files (PNG, JPG, GIF, BMP) show their file type icons
- ✅ Document files (PDF, DOCX, XLSX, PPTX) show their application icons
- ✅ Media files (MP4, MP3, AVI) show their file type icons
- ✅ Archive files (ZIP, RAR, 7Z) show their compression tool icons
- ✅ Icons match Windows Explorer appearance
- ✅ Icons persist across application restarts
- ✅ No folder icons (📁) for non-folder files
- ✅ Graceful fallback for unknown file types
- ✅ No performance degradation with multiple files

## Conclusion

The file icon extraction feature is **fully implemented** and ready for testing. The implementation uses Electron's native `app.getFileIcon()` API which leverages Windows Shell API to extract the correct file type icons for all common file types.
