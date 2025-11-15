# DevTools Testing - Quick Start

## 🚀 Quick Start

### Automated Testing (Recommended)
```powershell
node test-devtools-overlay.js
```

### Manual Testing
```powershell
npm run electron:dev
# Press F11 to open overlay
# DevTools open automatically
```

## 📚 Documentation

| Document | Purpose | When to Use |
|----------|---------|-------------|
| **DEVTOOLS_CHECKLIST.md** | Quick reference checklist | Daily testing |
| **DEV_TOOLS_TESTING_GUIDE.md** | Comprehensive guide | Deep debugging |
| **DEVTOOLS_CONFIGURATION.md** | Technical details | Configuration issues |
| **DEVTOOLS_TESTING_SUMMARY.md** | Implementation overview | Understanding the system |

## 🔍 What to Check

### 1. Console Tab
```
✓ No red errors
✓ No React warnings
✓ Config loaded
✓ IPC handlers registered
```

### 2. Network Tab
```
✓ All JS/CSS files load (200)
✓ No 404 errors
✓ Icons load correctly
```

### 3. Components Tab (React DevTools)
```
✓ <Overlay> mounted
✓ <Grid> rendered
✓ <ActionButton> components present
✓ Props passed correctly
```

## 🛠️ Common Commands

```powershell
# Standard dev mode (DevTools auto-open)
npm run electron:dev

# Dev mode without DevTools
$env:NO_DEVTOOLS="true"
npm run electron:dev

# Production mode (DevTools disabled)
$env:NODE_ENV="production"
npm run electron:dev

# Run automated tests
node test-devtools-overlay.js
```

## 🐛 Troubleshooting

### Grid Not Rendering?
1. Check Console for errors
2. Verify config in Components tab
3. Check Network tab for CSS loading

### Buttons Not Clickable?
1. Check Elements tab for z-index
2. Verify event listeners attached
3. Check if overlay has focus

### Icons Not Loading?
1. Check Network tab for 404s
2. Verify icon-cache directory
3. Check IPC handler logs

## 📖 Full Documentation

- **Quick Reference:** `DEVTOOLS_CHECKLIST.md` (5 min read)
- **Complete Guide:** `DEV_TOOLS_TESTING_GUIDE.md` (15 min read)
- **Configuration:** `DEVTOOLS_CONFIGURATION.md` (10 min read)
- **Summary:** `DEVTOOLS_TESTING_SUMMARY.md` (5 min read)

## ✅ Task Status

**Task 6.0.10 Sub-task:** Test with development tools
**Status:** ✅ Complete

All testing infrastructure is in place and functional.
