// Session Storage Manager
// Preserves puzzle state across browser reloads

const SESSION_STORAGE_KEY = 'phil_puzzle_state';

/**
 * Save the current puzzle state to sessionStorage
 */
function saveStateToSession() {
  try {
    const state = {
      xw: {
        clues: xw.clues,
        title: xw.title,
        author: xw.author,
        rows: xw.rows,
        cols: xw.cols,
        fill: xw.fill
      },
      current: current,
      uiSettings: {
        isSymmetrical: isSymmetrical,
        isCircleDefault: isCircleDefault,
        isStrictMatching: isStrictMatching,
        isDarkMode: isDarkMode
      },
      timestamp: new Date().toISOString()
    };
    
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(state));
    console.log("Puzzle state saved to sessionStorage");
  } catch (e) {
    console.error("Failed to save state to sessionStorage:", e);
  }
}

/**
 * Load puzzle state from sessionStorage if it exists
 * @returns {boolean} true if state was loaded, false otherwise
 */
function loadStateFromSession() {
  try {
    const savedState = sessionStorage.getItem(SESSION_STORAGE_KEY);
    
    if (!savedState) {
      console.log("No saved puzzle state found in sessionStorage");
      return false;
    }
    
    const state = JSON.parse(savedState);
    
    // Restore puzzle data
    xw.clues = state.xw.clues;
    xw.title = state.xw.title;
    xw.author = state.xw.author;
    xw.rows = state.xw.rows;
    xw.cols = state.xw.cols;
    xw.fill = state.xw.fill;
    
    // Restore current position and direction
    current = state.current;
    
    // Restore UI settings
    isSymmetrical = state.uiSettings.isSymmetrical;
    isCircleDefault = state.uiSettings.isCircleDefault;
    isStrictMatching = state.uiSettings.isStrictMatching;
    isDarkMode = state.uiSettings.isDarkMode;
    
    console.log("Puzzle state restored from sessionStorage (saved at " + state.timestamp + ")");
    return true;
  } catch (e) {
    console.error("Failed to load state from sessionStorage:", e);
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    return false;
  }
}

/**
 * Clear the saved state from sessionStorage
 */
function clearSessionState() {
  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    console.log("Puzzle state cleared from sessionStorage");
  } catch (e) {
    console.error("Failed to clear sessionStorage:", e);
  }
}

/**
 * Initialize page load - restore saved state if available
 * Call this after DOM is ready
 */
function initializeSessionStorage() {
  // Check if there's a saved state and load it
  if (loadStateFromSession()) {
    // Recreate the grid UI with restored dimensions
    updateInfoUI();
    createGrid(xw.rows, xw.cols);
    
    // Restore all the squares
    squares = grid.querySelectorAll('td');
    
    // Restore grid display with saved fill data
    for (let i = 0; i < xw.rows; i++) {
      for (let j = 0; j < xw.cols; j++) {
        let fill = xw.fill[i][j];
        let cell = getGridSquare(i, j);
        if (cell) {
          let fillDiv = cell.querySelector(".fill");
          fillDiv.textContent = fill;
          fillDiv.classList.remove("rebus");
          if (fill.length > 1) {
            fillDiv.classList.add("rebus");
          }
          
          // Restore block styling
          if (fill === BLOCK) {
            cell.classList.add("block");
          } else {
            cell.classList.remove("block");
          }
        }
      }
    }
    
    // Restore UI highlights and clues
    updateActiveWords();
    updateGridHighlights();
    updateSidebarHighlights();
    updateCluesUI();
    updateMatchesUI();
    updateStatsUI(true);
    
    // Restore dark mode if it was enabled
    if (isDarkMode) {
      document.body.classList.add("dark-mode");
    }
    
    // Restore symmetry toggle button state
    if (isSymmetrical) {
      document.getElementById("toggle-symmetry").classList.add("on");
    }
    
    // Restore circle default toggle state
    if (!isCircleDefault) {
      document.getElementById("toggle-circle-default").classList.add("on");
    }
    
    // Restore strict matching state
    if (isStrictMatching) {
      document.getElementById("toggle-strict-matching").classList.add("on");
    }
    
    // Set up event listeners
    for (const square of squares) {
      square.addEventListener('click', mouseHandler);
    }
    grid.addEventListener('keydown', keyboardHandler);
    
    console.log("Session state fully restored and UI regenerated");
    return true;
  }
  
  return false;
}
