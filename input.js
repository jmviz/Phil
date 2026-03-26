const letterKeys = [
  "a","b","c","d","e","f","g","h","i","j","k","l","m",
  "n","o","p","q","r","s","t","u","v","w","x","y","z"
];
const ARROW_LEFT = "ArrowLeft";
const ARROW_RIGHT = "ArrowRight";
const ARROW_UP = "ArrowUp";
const ARROW_DOWN = "ArrowDown";
const arrowKeys = [ARROW_LEFT, ARROW_RIGHT, ARROW_UP, ARROW_DOWN];
const ENTER = "Enter";
const DELETE = "Backspace";
const ESCAPE = "Escape";
const BACKTICK = "`";
const SPACE = " ";

function mouseHandler(e) {
  const previousCell = getGridSquare(current.row, current.col);
  previousCell.classList.remove("active");
  const activeCell = e.currentTarget;
  if (activeCell == previousCell) {
    current.direction = (current.direction == ACROSS) ? DOWN : ACROSS;
  }
  current.row = Number(activeCell.parentNode.dataset.row);
  current.col = Number(activeCell.dataset.col);
  // console.log("[" + current.row + "," + current.col + "]");
  activeCell.classList.add("active");

  isMutated = false;
  updateUI();
}

function keyboardHandler(e) {
  // console.log(e.key);
  if (e.key.toLowerCase() == "z" && (e.ctrlKey || e.metaKey)) {
    if (e.shiftKey) {
      redo();
    } else {
      undo();
    }
    isMutated = true;
    updateUI();
    return;
  }
  isMutated = false;
  let actionRow = current.row;
  let actionCol = current.col;
  let actionDirection = current.direction;
  let actionOld = xw.fill[current.row][current.col];
  let activeCell = getGridSquare(current.row, current.col);
  const symRow = xw.rows - 1 - current.row;
  const symCol = xw.cols - 1 - current.col;
  let symCell = getGridSquare(symRow, symCol);
  let symOld = xw.fill[symRow][symCol];

  if (letterKeys.includes(e.key.toLowerCase()) || e.key == SPACE) {
    let oldContent = xw.fill[current.row][current.col];
    xw.fill[current.row][current.col] = e.key.toUpperCase();
    activeCell.querySelector(".fill").classList.remove("rebus");
    if (oldContent == BLOCK) {
      if (isSymmetrical) {
        xw.fill[symRow][symCol] = BLANK;
      }
    }
    // move the cursor
    if (current.direction == ACROSS) {
      e = new KeyboardEvent("keydown", {"key": ARROW_RIGHT});
    } else {
      e = new KeyboardEvent("keydown", {"key": ARROW_DOWN});
    }
    isMutated = true;
  }
  if (e.key == BLOCK) {
      if (xw.fill[current.row][current.col] == BLOCK) { // if already block...
        e = new KeyboardEvent("keydown", {"key": DELETE}); // make it a white square
      } else {
        xw.fill[current.row][current.col] = BLOCK;
        activeCell.querySelector(".fill").classList.remove("rebus");
        if (isSymmetrical) {
          xw.fill[symRow][symCol] = BLOCK;
          symCell.querySelector(".fill").classList.remove("rebus");
        }
      }
      isMutated = true;
  }
  if (e.key == ESCAPE) {
    enterRebus(e);
  }
  if (e.key == BACKTICK) {
    toggleCircle(isCircleDefault);
  }
  if (e.key == ENTER) {
      current.direction = (current.direction == ACROSS) ? DOWN : ACROSS;
  }
  if (e.key == DELETE) {
    e.preventDefault();
    let oldContent = xw.fill[current.row][current.col];
    xw.fill[current.row][current.col] = BLANK;
    activeCell.querySelector(".fill").classList.remove("rebus");
      if (oldContent == BLOCK) {
        if (isSymmetrical) {
          xw.fill[symRow][symCol] = BLANK;
        }
      } else { // move the cursor
        if (current.direction == ACROSS) {
          e = new KeyboardEvent("keydown", {"key": ARROW_LEFT});
        } else {
          e = new KeyboardEvent("keydown", {"key": ARROW_UP});
        }
      }
      isMutated = true;
  }
  if (actionOld != xw.fill[actionRow][actionCol]) {
    let state = {
      "row": actionRow,
      "col": actionCol,
      "direction": actionDirection,
      "old": actionOld,
      "new": xw.fill[actionRow][actionCol]
    };
    if (isSymmetrical) {
      let symState = {
        "isSymmetrical": isSymmetrical,
        "symRow": symRow,
        "symCol": symCol,
        "symOld": symOld,
        "symNew": xw.fill[symRow][symCol]
      };
      Object.assign(state, symState);
    }
    actionTimeline.record(new Action("editFill", state));
  }
  if (arrowKeys.includes(e.key)) {
      e.preventDefault();
      const previousCell = getGridSquare(current.row, current.col);
      previousCell.classList.remove("active");
      let content = xw.fill[current.row][current.col];
      let move = 1;
      switch (e.key) {
        case ARROW_LEFT:
          if (current.direction == ACROSS || content == BLOCK) {
            if (e.altKey && content != BLOCK) {
              move = current.col - current.acrossStartIndex || 1;
            } else if (e.ctrlKey || e.metaKey){
              move = current.col;
            }
            current.col -= (current.col == 0) ? 0 : move;
          }
          current.direction = ACROSS;
          break;
        case ARROW_UP:
          if (current.direction == DOWN || content == BLOCK) {
            if (e.altKey && content != BLOCK) {
              move = current.row - current.downStartIndex || 1;
            } else if (e.ctrlKey || e.metaKey){
              move = current.row;
            }
            current.row -= (current.row == 0) ? 0 : move;
          }
          current.direction = DOWN;
          break;
        case ARROW_RIGHT:
          if (current.direction == ACROSS || content == BLOCK) {
            if (e.altKey && content != BLOCK) {
              move = current.acrossEndIndex - 1 - current.col || 1;
            } else if (e.ctrlKey || e.metaKey){
              move = xw.cols - 1 - current.col;
            }
            current.col += (current.col == xw.cols - 1) ? 0 : move;
          }
          current.direction = ACROSS;
          break;
        case ARROW_DOWN:
          if (current.direction == DOWN || content == BLOCK) {
            if (e.altKey && content != BLOCK) {
              move = current.downEndIndex - 1 - current.row || 1;
            } else if (e.ctrlKey || e.metaKey){
              move = xw.rows - 1 - current.row;
            }
            current.row += (current.row == xw.rows - 1) ? 0 : move;
          }
          current.direction = DOWN;
          break;
      }
      // console.log("[" + current.row + "," + current.col + "]");
      activeCell = getGridSquare(current.row, current.col);
      activeCell.classList.add("active");
  }
  updateUI();
}

function mobileKeyboardHandler(char) {
  let e;
  switch (char) {
    case '⌫':
      e = new KeyboardEvent("keydown", {"key": DELETE});
      break;
    case '␣':
      e = new KeyboardEvent("keydown", {"key": SPACE});
      break;
    case '👁️':
      e = new KeyboardEvent("keydown", {"key": ESCAPE});
      break;
    default:
      e = new KeyboardEvent("keydown", {"key": char});

  }
  keyboardHandler(e);
  if (char != '👁️') {
    grid.focus();
  }
}