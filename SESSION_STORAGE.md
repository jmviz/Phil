# Session Storage Implementation

## Overview
This document explains how the session storage feature works in Phil to preserve puzzle state across browser reloads.

## How It Works

### Automatic State Preservation
When you work on a crossword puzzle in Phil, your work is automatically saved to the browser's `sessionStorage`. This means:

- **On Page Reload**: When you refresh the page or accidentally close and reopen the tab, your puzzle state is restored
- **Session Duration**: The saved state persists for the duration of your browser tab session
- **Automatic Clearing**: When you close the tab, the saved state is cleared (this is standard browser behavior)

### What Gets Saved
The following data is persisted in session storage:

1. **Puzzle Grid Data**
   - Grid dimensions (rows, columns)
   - Fill data (all letters, blocks, spaces, and rebus entries)
   - Clues (across and down)
   - Title and author

2. **Current Position**
   - Selected cell row and column
   - Current direction (across or down)

3. **UI Settings**
   - Symmetry toggle state
   - Circle/Shade default setting
   - Strict matching toggle state
   - Dark mode toggle state

## Implementation Details

### Files Modified

1. **storage.js** (NEW)
   - `saveStateToSession()` - Saves current puzzle state to sessionStorage
   - `loadStateFromSession()` - Loads saved state from sessionStorage
   - `clearSessionState()` - Manually clears the saved state
   - `initializeSessionStorage()` - Called on page load to restore state

2. **index.html**
   - Added `<script src="storage.js"></script>` before cross.js
   - Added DOMContentLoaded event listener that:
     - Creates a new blank puzzle
     - Attempts to restore saved state
     - If no saved state exists, saves the new blank puzzle

3. **cross.js**
   - Added `saveStateToSession()` calls in:
     - `updateUI()` - When grid is mutated
     - `createNewPuzzle()` - When a new puzzle is created
     - `setTitle()` - When title is changed
     - `setAuthor()` - When author is changed
     - `toggleSymmetry()` - When symmetry setting changes
     - `toggleStrictMatching()` - When strict matching changes
     - `toggleDarkMode()` - When dark mode changes
     - `switchCirclesShades()` - When circle/shade preference changes

4. **files.js**
   - Added `saveStateToSession()` call after puzzle is imported/loaded

5. **input.js**
   - Added `updateUI()` call after undo/redo operations to ensure state is saved

## Usage

### Automatic Operation
No action is required from the user. State preservation happens automatically whenever:
- Puzzle grid is edited
- Settings are changed
- A new puzzle is created or imported

### Manual Clear (Optional)
If you want to clear the saved session state (e.g., to start fresh), you can open the browser console and run:

```javascript
clearSessionState();
```

Then either refresh the page or create a new puzzle.

## Browser Compatibility

Session storage works in all modern browsers:
- Chrome/Edge: ✓
- Firefox: ✓
- Safari: ✓
- Opera: ✓

Session storage typically has a size limit of 5-10MB per origin, which is more than sufficient for crossword puzzles.

## Notes

- Session storage is separate from localStorage (which persists longer)
- Session storage is not shared between tabs/windows
- Session storage is cleared when the browser tab is closed
- Session storage data is not sent to any server (stays entirely on the client)
