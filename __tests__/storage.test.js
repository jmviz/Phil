/**
 * Unit tests for storage.js
 * Tests session storage save/restore functionality
 */

// Mock global variables and functions
global.BLOCK = ".";
global.BLANK = " ";
global.ACROSS = "across";
global.DOWN = "down";
global.DEFAULT_TITLE = "Untitled";
global.DEFAULT_AUTHOR = "Anonymous";
global.DEFAULT_SIZE = 15;

// Mock the global state objects
global.xw = {
  clues: {},
  title: "Test Puzzle",
  author: "Test Author",
  rows: 15,
  cols: 15,
  fill: [
    [" ", " ", "."],
    ["A", "B", "."],
    [".", ".", "."]
  ],
  isDailySize: () => true,
  isSundaySize: () => false,
  isStandardSize: () => true
};

global.current = {
  row: 1,
  col: 1,
  direction: "across",
  acrossWord: "AB",
  downWord: "A",
  acrossStartIndex: 0,
  acrossEndIndex: 3,
  downStartIndex: 0,
  downEndIndex: 3
};

global.isSymmetrical = true;
global.isCircleDefault = true;
global.isStrictMatching = false;
global.isDarkMode = false;

// Store reference to original sessionStorage
const originalSessionStorage = global.sessionStorage;

beforeEach(() => {
  // Clear sessionStorage before each test
  sessionStorage.clear();
  // Reset global state
  global.isSymmetrical = true;
  global.isCircleDefault = true;
  global.isStrictMatching = false;
  global.isDarkMode = false;
});

// Load the storage module
describe('Session Storage Module', () => {
  
  describe('saveStateToSession()', () => {
    
    test('should save puzzle state to sessionStorage', () => {
      // Import the function after globals are set up
      const { saveStateToSession } = require('./storage.js');
      
      saveStateToSession();
      
      const saved = sessionStorage.getItem('phil_puzzle_state');
      expect(saved).not.toBeNull();
      expect(typeof saved).toBe('string');
    });

    test('should save correct puzzle data', () => {
      const { saveStateToSession } = require('./storage.js');
      
      saveStateToSession();
      
      const saved = JSON.parse(sessionStorage.getItem('phil_puzzle_state'));
      
      expect(saved.xw.title).toBe("Test Puzzle");
      expect(saved.xw.author).toBe("Test Author");
      expect(saved.xw.rows).toBe(15);
      expect(saved.xw.cols).toBe(15);
      expect(saved.xw.fill.length).toBe(3);
    });

    test('should save current position', () => {
      const { saveStateToSession } = require('./storage.js');
      
      global.current.row = 5;
      global.current.col = 7;
      global.current.direction = "down";
      
      saveStateToSession();
      
      const saved = JSON.parse(sessionStorage.getItem('phil_puzzle_state'));
      
      expect(saved.current.row).toBe(5);
      expect(saved.current.col).toBe(7);
      expect(saved.current.direction).toBe("down");
    });

    test('should save UI settings', () => {
      const { saveStateToSession } = require('./storage.js');
      
      global.isSymmetrical = false;
      global.isCircleDefault = false;
      global.isStrictMatching = true;
      global.isDarkMode = true;
      
      saveStateToSession();
      
      const saved = JSON.parse(sessionStorage.getItem('phil_puzzle_state'));
      
      expect(saved.uiSettings.isSymmetrical).toBe(false);
      expect(saved.uiSettings.isCircleDefault).toBe(false);
      expect(saved.uiSettings.isStrictMatching).toBe(true);
      expect(saved.uiSettings.isDarkMode).toBe(true);
    });

    test('should include timestamp', () => {
      const { saveStateToSession } = require('./storage.js');
      
      saveStateToSession();
      
      const saved = JSON.parse(sessionStorage.getItem('phil_puzzle_state'));
      
      expect(saved.timestamp).toBeDefined();
      expect(typeof saved.timestamp).toBe('string');
      // Verify it's a valid ISO date string
      expect(() => new Date(saved.timestamp)).not.toThrow();
    });

    test('should handle errors gracefully', () => {
      const { saveStateToSession } = require('./storage.js');
      
      // Mock sessionStorage.setItem to throw an error
      const originalSetItem = sessionStorage.setItem;
      sessionStorage.setItem = jest.fn(() => {
        throw new Error('Storage quota exceeded');
      });
      
      // Should not throw
      expect(() => saveStateToSession()).not.toThrow();
      
      sessionStorage.setItem = originalSetItem;
    });
  });

  describe('loadStateFromSession()', () => {
    
    test('should return false when no saved state exists', () => {
      const { loadStateFromSession } = require('./storage.js');
      
      const result = loadStateFromSession();
      
      expect(result).toBe(false);
    });

    test('should load valid saved state', () => {
      const { saveStateToSession, loadStateFromSession } = require('./storage.js');
      
      global.xw.title = "Original Title";
      saveStateToSession();
      
      // Change in-memory state
      global.xw.title = "Changed Title";
      
      // Load should restore
      const result = loadStateFromSession();
      
      expect(result).toBe(true);
      expect(global.xw.title).toBe("Original Title");
    });

    test('should restore grid data correctly', () => {
      const { saveStateToSession, loadStateFromSession } = require('./storage.js');
      
      global.xw.fill = [["A", "B"], ["C", "D"]];
      saveStateToSession();
      
      global.xw.fill = [[" ", " "], [" ", " "]];
      
      loadStateFromSession();
      
      expect(global.xw.fill).toEqual([["A", "B"], ["C", "D"]]);
    });

    test('should restore current position', () => {
      const { saveStateToSession, loadStateFromSession } = require('./storage.js');
      
      global.current = { row: 3, col: 4, direction: "down" };
      saveStateToSession();
      
      global.current = { row: 0, col: 0, direction: "across" };
      
      loadStateFromSession();
      
      expect(global.current.row).toBe(3);
      expect(global.current.col).toBe(4);
      expect(global.current.direction).toBe("down");
    });

    test('should restore UI settings', () => {
      const { saveStateToSession, loadStateFromSession } = require('./storage.js');
      
      global.isSymmetrical = false;
      global.isDarkMode = true;
      saveStateToSession();
      
      global.isSymmetrical = true;
      global.isDarkMode = false;
      
      loadStateFromSession();
      
      expect(global.isSymmetrical).toBe(false);
      expect(global.isDarkMode).toBe(true);
    });

    test('should handle corrupted data gracefully', () => {
      const { loadStateFromSession } = require('./storage.js');
      
      sessionStorage.setItem('phil_puzzle_state', 'corrupted{]data');
      
      const result = loadStateFromSession();
      
      expect(result).toBe(false);
      expect(sessionStorage.getItem('phil_puzzle_state')).toBeNull();
    });

    test('should clear bad data from storage', () => {
      const { loadStateFromSession } = require('./storage.js');
      
      sessionStorage.setItem('phil_puzzle_state', 'invalid json');
      
      loadStateFromSession();
      
      expect(sessionStorage.getItem('phil_puzzle_state')).toBeNull();
    });
  });

  describe('clearSessionState()', () => {
    
    test('should remove saved state from sessionStorage', () => {
      const { saveStateToSession, clearSessionState } = require('./storage.js');
      
      saveStateToSession();
      expect(sessionStorage.getItem('phil_puzzle_state')).not.toBeNull();
      
      clearSessionState();
      
      expect(sessionStorage.getItem('phil_puzzle_state')).toBeNull();
    });

    test('should handle errors gracefully', () => {
      const { clearSessionState } = require('./storage.js');
      
      // Mock sessionStorage.removeItem to throw
      const originalRemoveItem = sessionStorage.removeItem;
      sessionStorage.removeItem = jest.fn(() => {
        throw new Error('Cannot remove');
      });
      
      expect(() => clearSessionState()).not.toThrow();
      
      sessionStorage.removeItem = originalRemoveItem;
    });
  });

  describe('Data integrity', () => {
    
    test('should preserve complex fill patterns with rebus', () => {
      const { saveStateToSession, loadStateFromSession } = require('./storage.js');
      
      global.xw.fill = [
        ["A", "BC", ".", "D"],
        [" ", "EF", " ", "G"],
        [".", ".", ".", "."],
        ["H", "", "I", ""]
      ];
      
      saveStateToSession();
      global.xw.fill = []; // Clear
      
      loadStateFromSession();
      
      expect(global.xw.fill[0][1]).toBe("BC"); // Rebus preserved
      expect(global.xw.fill[1][1]).toBe("EF");
      expect(global.xw.fill[3][1]).toBe("");
    });

    test('should preserve clues object', () => {
      const { saveStateToSession, loadStateFromSession } = require('./storage.js');
      
      global.xw.clues = {
        "1,0,across": "Famous scientist",
        "1,0,down": "Not down"
      };
      
      saveStateToSession();
      global.xw.clues = {};
      
      loadStateFromSession();
      
      expect(global.xw.clues["1,0,across"]).toBe("Famous scientist");
      expect(global.xw.clues["1,0,down"]).toBe("Not down");
    });

    test('should round-trip large grids', () => {
      const { saveStateToSession, loadStateFromSession } = require('./storage.js');
      
      // Create a 21x21 grid (Sunday-sized)
      const largeFill = [];
      for (let i = 0; i < 21; i++) {
        largeFill.push([]);
        for (let j = 0; j < 21; j++) {
          largeFill[i].push(i % 2 === 0 ? "." : "A");
        }
      }
      
      global.xw.fill = largeFill;
      global.xw.rows = 21;
      global.xw.cols = 21;
      
      saveStateToSession();
      const stateString = sessionStorage.getItem('phil_puzzle_state');
      const stateSize = new Blob([stateString]).size;
      
      // Verify size is reasonable (< 100KB for a 21x21)
      expect(stateSize).toBeLessThan(100000);
      
      global.xw.fill = [];
      global.xw.rows = 0;
      
      loadStateFromSession();
      
      expect(global.xw.rows).toBe(21);
      expect(global.xw.fill.length).toBe(21);
      expect(global.xw.fill[0].length).toBe(21);
    });
  });
});
