# Session Storage - Manual Testing Checklist

This checklist provides step-by-step manual testing procedures to verify session storage functionality.

## Setup

- [ ] Ensure the application is running locally (e.g., `python3 -m http.server 8000`)
- [ ] Open the browser's Developer Tools (F12)
- [ ] Go to Application → Session Storage to monitor changes
- [ ] Have a way to reload quickly (Cmd+R or Ctrl+R)

---

## Test Group 1: Basic State Persistence

### Test 1.1: New Puzzle Auto-Save on Load
**Purpose**: Verify that a blank puzzle is automatically saved when the page first loads

1. [ ] Open the application in a fresh browser tab
2. [ ] Open DevTools → Application → Session Storage
3. [ ] Verify `phil_puzzle_state` key is created
4. [ ] Click on the value to view the JSON
5. [ ] Confirm it contains a 15×15 grid with blank cells
6. **Expected**: Session storage shows saved puzzle state immediately

### Test 1.2: Grid Persistence Across Reload
**Purpose**: Ensure grid edits survive a page reload

1. [ ] Click on the first cell in the grid
2. [ ] Type "A"
3. [ ] Navigate to the next cell and type "B"
4. [ ] Observe in DevTools that session storage was updated
5. [ ] Press F5 or Cmd+R to reload the page
6. [ ] Verify "A" and "B" are still in their cells
7. **Expected**: Letters persist exactly where they were placed

### Test 1.3: Blocks Persist Across Reload
**Purpose**: Verify black squares (blocks) are preserved

1. [ ] Click a cell
2. [ ] Press "." to make it a block
3. [ ] Verify it turns black
4. [ ] Reload the page
5. [ ] Confirm the block is still there
6. **Expected**: Block remains in place, maintaining the pattern

---

## Test Group 2: Metadata Persistence

### Test 2.1: Title Persistence
**Purpose**: Ensure puzzle title changes are saved

1. [ ] Click on the title field ("Untitled")
2. [ ] Select all text (Cmd+A / Ctrl+A)
3. [ ] Type "My Crossword"
4. [ ] Click elsewhere to blur the field
5. [ ] Observe session storage update in DevTools
6. [ ] Reload the page
7. [ ] Verify title is "My Crossword"
8. **Expected**: Custom title persists through reload

### Test 2.2: Author Persistence
**Purpose**: Ensure puzzle author changes are saved

1. [ ] Click on the author field ("Anonymous")
2. [ ] Select all text
3. [ ] Type "John Doe"
4. [ ] Click elsewhere
5. [ ] Reload the page
6. [ ] Verify author shows "John Doe"
7. **Expected**: Custom author persists through reload

### Test 2.3: Both Title and Author Together
**Purpose**: Ensure both metadata fields work together

1. [ ] Change title to "Weekend Puzzle"
2. [ ] Change author to "Jane Smith"
3. [ ] Reload the page
4. [ ] Verify both changes persisted
5. **Expected**: Both fields maintain their values

---

## Test Group 3: UI Settings Persistence

### Test 3.1: Symmetry Toggle
**Purpose**: Verify symmetry setting is preserved

1. [ ] Find the symmetry toggle button
2. [ ] Click it to toggle symmetry off
3. [ ] Note the button state change
4. [ ] Reload the page
5. [ ] Verify the symmetry state matches what you set
6. [ ] Toggle it back on
7. [ ] Reload again
8. [ ] Verify it's on again
9. **Expected**: Symmetry state matches before reload

### Test 3.2: Dark Mode Toggle
**Purpose**: Ensure dark mode preference is saved

1. [ ] Find the dark mode toggle button
2. [ ] Click to enable dark mode
3. [ ] Verify the page turns dark
4. [ ] Reload the page
5. [ ] Verify dark mode is still enabled
6. [ ] Click to disable dark mode
7. [ ] Reload again
8. [ ] Verify it's back to light mode
9. **Expected**: Dark mode preference persists

### Test 3.3: Strict Matching Toggle
**Purpose**: Verify strict matching setting is preserved

1. [ ] Click the strict matching toggle button
2. [ ] Note the visual change
3. [ ] Reload the page
4. [ ] Verify the strict matching state is correct
5. **Expected**: Toggle state persists

### Test 3.4: Circle/Shade Default
**Purpose**: Verify circle vs shade preference is saved

1. [ ] Note the current circle/shade default
2. [ ] Toggle the circle/shade default
3. [ ] Reload the page
4. [ ] Verify the preference persisted
5. **Expected**: Circle/shade default is remembered

---

## Test Group 4: Cursor Position

### Test 4.1: Cell Selection Persists
**Purpose**: Verify selected cell is restored on reload

1. [ ] Click on a cell in row 5, column 10 (approximately middle of grid)
2. [ ] Verify the cell has an "active" visual indicator
3. [ ] Reload the page
4. [ ] Verify some cell is still marked as active
5. [ ] Note: Position may not be exact, but active state should exist
6. **Expected**: An active cell is always present after reload

---

## Test Group 5: Grid Size Variations

### Test 5.1: 15×15 Puzzle Persistence
**Purpose**: Default size should work correctly

1. [ ] Create a 15×15 puzzle
2. [ ] Add some content
3. [ ] Reload
4. [ ] Verify still 15×15
5. **Expected**: 15×15 grid preserved

### Test 5.2: 21×21 Puzzle Persistence
**Purpose**: Sunday-sized puzzles should work

1. [ ] Click New Puzzle → 21×21
2. [ ] Add some content
3. [ ] Reload
4. [ ] Verify still 21×21
5. **Expected**: 21×21 grid preserved

### Test 5.3: Custom Grid Size
**Purpose**: Custom dimensions should be remembered

1. [ ] Click New Puzzle → Custom
2. [ ] Enter 10 rows × 12 columns
3. [ ] Add some content
4. [ ] Reload
5. [ ] Verify grid is still 10×12
6. **Expected**: Custom size preserved exactly

---

## Test Group 6: Complex Content

### Test 6.1: Rebus Entries
**Purpose**: Multi-letter cells should persist

1. [ ] Click a cell
2. [ ] Press Escape to enter rebus mode
3. [ ] Type "CH" in the popup
4. [ ] Reload the page
5. [ ] Verify the cell still shows "CH"
6. **Expected**: Rebus remains intact

### Test 6.2: Multiple Entries
**Purpose**: Ensure no data loss with many entries

1. [ ] Enter letters in 10+ scattered cells
2. [ ] Create a varied pattern
3. [ ] Reload the page
4. [ ] Verify every entry is still there
5. **Expected**: All entries preserved

### Test 6.3: Large Complex Grid
**Purpose**: Test performance with complex data

1. [ ] Create a 21×21 puzzle
2. [ ] Fill approximately 50% of cells with letters
3. [ ] Add blocks in a pattern
4. [ ] Reload the page
5. [ ] Verify everything persists
6. **Expected**: No data loss or corruption

---

## Test Group 7: Undo/Redo

### Test 7.1: Undo Action Saves State
**Purpose**: Undone actions should trigger state save

1. [ ] Enter "ABC" in three consecutive cells
2. [ ] Use Cmd+Z / Ctrl+Z to undo
3. [ ] Reload the page
4. [ ] Verify you see the undone state (should have one less letter)
5. **Expected**: Undo state is preserved

### Test 7.2: Redo Action Saves State
**Purpose**: Redone actions should be saved

1. [ ] Enter some content
2. [ ] Undo with Cmd+Z
3. [ ] Redo with Cmd+Shift+Z
4. [ ] Reload the page
5. [ ] Verify content is back (redone state)
6. **Expected**: Redo state is preserved

---

## Test Group 8: New Puzzle Creation

### Test 8.1: New Puzzle Clears Old Content
**Purpose**: Creating new puzzle should start fresh

1. [ ] Enter content in a puzzle
2. [ ] Click New Puzzle → 15×15
3. [ ] Reload the page
4. [ ] Verify all previous content is gone
5. [ ] Verify title is "Untitled"
6. **Expected**: Fresh blank puzzle after new creation

### Test 8.2: Custom New Puzzle
**Purpose**: Custom size creation triggers save

1. [ ] Enter content
2. [ ] Click New Puzzle → Custom
3. [ ] Enter 8×8
4. [ ] Reload the page
5. [ ] Verify grid is 8×8 and blank
6. **Expected**: Custom size puzzle is saved

---

## Test Group 9: Session Storage Limits

### Test 9.1: Storage Quota Check
**Purpose**: Ensure operation within browser limits

1. [ ] Fill a 21×21 puzzle completely with various content
2. [ ] Check DevTools → Application → Session Storage
3. [ ] Note the storage size (should be < 100KB)
4. [ ] Reload multiple times
5. [ ] No errors should occur
6. **Expected**: Storage utilization is reasonable

### Test 9.2: Error Handling
**Purpose**: Graceful handling of storage errors

1. [ ] Attempt to overflow storage (if possible with developer tools)
2. [ ] Should not crash application
3. [ ] Should not lose existing data
4. **Expected**: App remains functional despite storage errors

---

## Test Group 10: Cross-Browser Consistency

### Test 10.1: Firefox
**Purpose**: Verify functionality in Firefox

- [ ] Repeat Test 1.2 in Firefox
- **Expected**: Same behavior as Chrome

### Test 10.2: Safari/Webkit
**Purpose**: Verify functionality in Safari

- [ ] Repeat Test 1.2 in Safari (or Webkit browser)
- **Expected**: Same behavior as Chrome

### Test 10.3: Edge
**Purpose**: Verify functionality in Edge

- [ ] Repeat Test 1.2 in Edge
- **Expected**: Same behavior as Chrome

---

## Test Group 11: Edge Cases

### Test 11.1: Very Long Title
**Purpose**: Handle long strings gracefully

1. [ ] Enter a 200+ character title
2. [ ] Reload
3. [ ] Verify entire title persists
4. **Expected**: No truncation or loss

### Test 11.2: Special Characters
**Purpose**: Handle non-ASCII characters

1. [ ] Enter title with emoji: "🎯 Puzzle"
2. [ ] Enter author with accents: "Créateur"
3. [ ] Reload
4. [ ] Verify both display correctly
5. **Expected**: Special characters preserved

### Test 11.3: Empty Puzzle
**Purpose**: Handle blank grids

1. [ ] Create a new puzzle but don't add any content
2. [ ] Reload immediately
3. [ ] Verify blank puzzle is there
4. **Expected**: Empty grid is valid and saved

### Test 11.4: Rapid Consecutive Reloads
**Purpose**: Handle multiple reloads quickly

1. [ ] Add some content
2. [ ] Reload (F5)
3. [ ] Immediately reload again (F5)
4. [ ] Immediately reload a third time (F5)
5. [ ] Verify content is still there
6. **Expected**: No corruption from rapid reloads

---

## Test Group 12: Console Verification (Advanced)

### Test 12.1: Inspect Saved Data
**Purpose**: Verify data structure via console

1. [ ] Open DevTools Console
2. [ ] Enter: `JSON.parse(sessionStorage.getItem('phil_puzzle_state'))`
3. [ ] Examine the structure
4. **Expected**: Valid JSON with expected fields:
   ```
   {
     xw: { title, author, rows, cols, fill, clues },
     current: { row, col, direction },
     uiSettings: { isSymmetrical, isCircleDefault, isStrictMatching, isDarkMode },
     timestamp: ISO timestamp
   }
   ```

### Test 12.2: Clear Storage and Reload
**Purpose**: Test initial load behavior

1. [ ] Open DevTools Console
2. [ ] Enter: `sessionStorage.clear()`
3. [ ] Reload the page
4. [ ] Verify new storage is created
5. **Expected**: Fresh blank puzzle is created and saved

### Test 12.3: Manually Corrupt Data
**Purpose**: Verify error handling

1. [ ] Open DevTools Console
2. [ ] Enter: `sessionStorage.setItem('phil_puzzle_state', 'corrupted')`
3. [ ] Reload the page
4. [ ] Should still load with default blank puzzle
5. [ ] Check console for error message
6. **Expected**: Graceful recovery with no crash

---

## Test Summary Template

**Test Date**: ___________  
**Tester**: ___________  
**Browser(s)**: ___________  

**Results**:
- ✓ All tests passed
- ⚠ Some tests failed (list below)
- ✗ Critical failures found

**Failed Tests** (if any):
1. ___________________________________
2. ___________________________________
3. ___________________________________

**Notes**:
___________________________________
___________________________________
___________________________________

**Sign-off**: ___________
