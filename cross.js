// Modified by jmviz. Original notice follows:
//
// Phil
// ------------------------------------------------------------------------
// Copyright 2017 Keiran King

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// (https://www.apache.org/licenses/LICENSE-2.0)

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// ------------------------------------------------------------------------

const BLOCK = ".";
const DASH = "-";
const BLANK = " ";
const ACROSS = "across";
const DOWN = "down";
const DEFAULT_SIZE = 15;
const DEFAULT_SUNDAY_SIZE = 21;
const DEFAULT_TITLE = "Untitled";
const DEFAULT_AUTHOR = "Anonymous";
const DEFAULT_CLUE = "(blank clue)";
const DEFAULT_NOTIFICATION_LIFETIME = 10; // in seconds

let history = [];
let isSymmetrical = true;
let isCircleDefault = true;
let isStrictMatching = false;
let isDarkMode = false;
let grid;
let squares;
let isMutated = false;
let forced = null;
// createNewPuzzle();
let solveWorker = null;
let solveWorkerState = null;
let solveTimeout = null;
let solveWordlist = null;
let solvePending = [];

//____________________
// C L A S S E S
class Crossword {
  constructor(rows = DEFAULT_SIZE, cols = DEFAULT_SIZE) {
    this.clues = {};
    this.title = DEFAULT_TITLE;
    this.author = DEFAULT_AUTHOR;
    this.rows = rows;
    this.cols = cols;
    this.fill = [];
    //
    for (let i = 0; i < this.rows; i++) {
      this.fill.push([]);
      for (let j = 0; j < this.cols; j++) {
        this.fill[i].push(BLANK);
      }
    }
  }
  isDailySize() {
    return this.rows == DEFAULT_SIZE && this.cols == DEFAULT_SIZE;
  }
  isSundaySize() {
    return this.rows == DEFAULT_SUNDAY_SIZE && this.cols == DEFAULT_SUNDAY_SIZE;
  }
  isStandardSize() {
    return this.isDailySize() || this.isSundaySize();
  }
}

class Grid {
  constructor(rows, cols) {
    document.getElementById("grid-container").innerHTML = "";
    grid = document.createElement("table");
    grid.setAttribute("id", "grid");
    grid.setAttribute("tabindex", "1");
    document.getElementById("grid-container").appendChild(grid);

    for (let i = 0; i < rows; i++) {
        let row = document.createElement("tr");
        row.setAttribute("data-row", i);
        document.getElementById("grid").appendChild(row);

      for (let j = 0; j < cols; j++) {
          let col = document.createElement("td");
          col.setAttribute("data-col", j);

          let label = document.createElement("div");
          label.setAttribute("class", "label");
          let labelContent = document.createTextNode("");

          let fill = document.createElement("div");
          fill.setAttribute("class", "fill");
          let fillContent = document.createTextNode(xw.fill[i][j]);

          label.appendChild(labelContent);
          fill.appendChild(fillContent);
          col.appendChild(label);
          col.appendChild(fill);
          row.appendChild(col);
        }
    }
    squares = grid.querySelectorAll('td');
    for (const square of squares) {
      square.addEventListener('click', mouseHandler);
    }
    grid.addEventListener('keydown', keyboardHandler);
  }

  update() {
    for (let i = 0; i < xw.rows; i++) {
      for (let j = 0; j < xw.cols; j++) {
        const activeCell = getGridSquare(i, j);
        let fill = xw.fill[i][j];
        if (fill == BLANK && forced != null) {
          fill = forced[i][j];
          activeCell.classList.add("pencil");
        } else {
          activeCell.classList.remove("pencil");
        }
        activeCell.querySelector(".fill").innerHTML = fill;
        if (fill == BLOCK) {
          activeCell.classList.add("block");
        } else {
          activeCell.classList.remove("block");
        }
      }
    }
  }
}

class Button {
  constructor(id) {
    this.id = id;
    this.dom = document.getElementById(id);
    this.tooltip = this.dom.getAttribute("data-tooltip");
    // this.type = type; // "normal", "toggle", "menu", "submenu"
    this.state = this.dom.className; // "normal", "on", "open", "disabled"
  }

  setState(state) {
    this.state = state;
    this.dom.className = (this.state == "normal") ? "" : this.state;
  }

  addEvent(e, func) {
    this.dom.addEventListener(e, func);
    if (this.state == "disabled") {
      this.setState("normal");
    }
  }

  press() {
    // switch (this.type) {
    //   case "toggle":
    //   case "submenu":
    //     this.setState((this.state == "on") ? "normal" : "on");
    //     break;
    //   case "menu":
    //     this.setState((this.state == "open") ? "normal" : "open");
    //     break;
    //   default:
    //     break;
  }
}

class Menu { // in dev
  constructor(id, buttons) {
    this.id = id;
    this.buttons = buttons;

    let div = document.createElement("div");
    div.setAttribute("id", this.id);
    for (var button in buttons) {
      div.appendChild(button);
    }
    document.getElementById("toolbar").appendChild(div);
  }
}

class Toolbar {
  constructor(id) {
    this.id = id;
    this.buttons = { // rewrite this programmatically
      "newPuzzle15": new Button("new-grid-15"),
      "newPuzzle21": new Button("new-grid-21"),
      "newPuzzleCustom": new Button("new-grid-custom"),
      "newPuzzle": new Button("new-grid"),
      "openPuzzle": new Button("open-JSON"),
      "exportJSON": new Button("export-JSON"),
      "exportPUZ": new Button("export-PUZ"),
      "exportPDF": new Button("print-puzzle"),
      "exportNYT": new Button("print-NYT-submission"),
      "export": new Button("export"),
      "enter-rebus": new Button("enter-rebus"),
      "quickLayout": new Button("quick-layout"),
      "freezeLayout": new Button("toggle-freeze-layout"),
      "clearFill": new Button("clear-fill"),
      "toggleSymmetry": new Button("toggle-symmetry"),
      "strictMatching": new Button("toggle-strict-matching"),
      "openWordlist": new Button("open-wordlist"),
      "autoFill": new Button("auto-fill"),
      "toggleDarkMode": new Button("toggle-dark-mode")
    };
  }
}

class Notification {
  constructor(message, lifetime = undefined) {
    this.message = message;
    this.id = String(randomNumber(1,10000));
    this.post();
    if (lifetime) {
      this.dismiss(lifetime);
    }
  }

  post() {
    let div = document.createElement("div");
    div.setAttribute("id", this.id);
    div.setAttribute("class", "notification");
    div.innerHTML = this.message;
    div.addEventListener('click', this.dismiss);
    // document.getElementById("footer").appendChild(div);
    document.body.appendChild(div);

  }

  update(message) {
    document.getElementById(this.id).innerHTML = message;
  }

  dismiss(seconds = 0) {
    let div = document.getElementById(this.id);
    // seconds = (seconds === true) ? 10 : seconds;
    setTimeout(function() { div.remove(); }, seconds * 1000);
  }
}

class Interface {
  constructor(rows, cols) {
    this.grid = new Grid(rows, cols);
    // this.sidebar;
    this.toolbar = new Toolbar("toolbar");

    this.isSymmetrical = true;
    this.row = 0;
    this.col = 0;
    this.acrossWord = '';
    this.downWord = '';
    this.acrossStartIndex = 0;
    this.acrossEndIndex = cols;
    this.downStartIndex = 0;
    this.downEndIndex = rows;
    this.direction = ACROSS;

    console.log("Grid UI created.");
  }

  toggleDirection() {
    this.direction = (this.direction == ACROSS) ? DOWN : ACROSS;
  }

  update() {
    updateInfoUI();
    updateLabelsAndClues();
    updateActiveWords();
    updateGridHighlights();
    updateSidebarHighlights();
    updateCluesUI();
    updateStatsUI(true);
  }
}

class ActionTimeline {
  constructor(pastStack = [], futureStack = []) {
    this.pastStack = pastStack;
    this.futureStack = futureStack;
  }
  undo() {
    let action = this.pastStack.pop();
    if (action) {
      isMutated = true;
      this.futureStack.push(action);
      action.undo();
    }
  }
  redo() {
    let action = this.futureStack.pop();
    if (action) {
      isMutated = true;
      this.pastStack.push(action);
      action.redo();
    }
  }
  record(action) {
    this.pastStack.push(action);
    this.futureStack = [];
  }
  clear() {
    this.pastStack = [];
    this.futureStack = [];
  }
}

class Action {
  constructor(type, state) {
    this.type = type;
    this.state = state;
  }
  undo(isRedo = false) {
    let state = this.state;
    current.row = state.row;
    current.col = state.col;
    current.direction = state.direction;
    switch (this.type) {
      case "editFill":
        let activeCell = getGridSquare(state.row, state.col);
        let fill = isRedo ? state.new : state.old;
        xw.fill[state.row][state.col] = fill;
        activeCell.querySelector(".fill").classList.remove("rebus");
        if (fill.length > 1) {
          activeCell.querySelector(".fill").classList.add("rebus");
        }
        if (state.isSymmetrical) {
          let symFill = isRedo ? state.symNew : state.symOld;
          xw.fill[state.symRow][state.symCol] = symFill;
          let symCell = getGridSquare(state.symRow, state.symCol);
          symCell.querySelector(".fill").classList.remove("rebus");
          if (symFill.length > 1) {
            symCell.querySelector(".fill").classList.add("rebus");
          }
        }
        break;
      case "fillMatch":
        let word = isRedo ? state.new : state.old;
        let k = 0;
        if (state.direction == ACROSS) {
          for (let j = state.start; j < state.end; j++) {
            xw.fill[state.row][j] = word[k++];
          }
        } else {
          for (let i = state.start; i < state.end; i++) {
            xw.fill[i][state.col] = word[k++];
          }
        }
        break;
      case "toggleCircle":
        let cell = getGridSquare(current.row, current.col);
        let type = isCircleDefault ? "circle" : "shade";
        if (cell.querySelector("." + type)) {
          cell.removeChild(cell.querySelector("." + type));
        } else {
          let div = document.createElement("div");
          div.setAttribute("class", type);
          cell.appendChild(div);
        }
        break;
      case "switchCirclesShades":
        switchCirclesShades();
        break;
      case "autoFill":
        for (let i = 0; i < xw.rows; i++) {
          for (let j = 0; j < xw.cols; j++) {
            xw.fill[i][j] = isRedo ? state.new[i][j] : state.old[i][j];
          }
        }
        break;
      // case "newPuzzle":
      //   break;
    }
    grid.focus();
    if (grid.querySelector(".active")) {
      grid.querySelector(".active").classList.remove("active");
      getGridSquare(state.row, state.col).classList.add("active");
    }
    updateUI();
  }
  redo() {
    this.undo(true);
  }
}

let xw = new Crossword(); // model
let current = new Interface(xw.rows, xw.cols); // view-controller
current.update();
if (localStorage.getItem("theme") == "dark") toggleDarkMode();
let actionTimeline = new ActionTimeline();

//____________________
// F U N C T I O N S

function createNewPuzzle(rows, cols) {
  xw.clues = {};
  xw.title = DEFAULT_TITLE;
  xw.author = DEFAULT_AUTHOR;
  xw.rows = rows || DEFAULT_SIZE;
  xw.cols = cols || xw.rows;
  xw.fill = [];
  for (let i = 0; i < xw.rows; i++) {
    xw.fill.push([]);
    for (let j = 0; j < xw.cols; j++) {
      xw.fill[i].push(BLANK);
    }
  }
  updateInfoUI();
  document.getElementById("grid-container").innerHTML = "";
  createGrid(xw.rows, xw.cols);

  isSymmetrical = true;
  current = {
    "row":        0,
    "col":        0,
    "acrossWord": '',
    "downWord":   '',
    "acrossStartIndex":0,
    "acrossEndIndex":  xw.rows,
    "downStartIndex":  0,
    "downEndIndex":    xw.cols,
    "direction":  ACROSS
  };

  squares = grid.querySelectorAll('td');

  updateActiveWords();
  updateGridHighlights();
  updateSidebarHighlights();
  updateCluesUI();
  updateMatchesUI();
  updateStatsUI(true);

  for (const square of squares) {
    square.addEventListener('click', mouseHandler);
  }
  grid.addEventListener('keydown', keyboardHandler);
  console.log(`New ${xw.rows}×${xw.cols} puzzle created.`);

  actionTimeline.clear();
  
  saveStateToSession();

  if (!xw.isStandardSize()){
    new Notification("Warning, PDF exporting is not optimized for non-standard grid sizes.", 5);
  }
}

function createNewCustomPuzzle() {
  let rows = parseInt(document.getElementById("custom-rows").value);
  let cols = parseInt(document.getElementById("custom-cols").value);
  createNewPuzzle(rows, cols);
  document.getElementById("new-grid-menu").querySelector(".default").classList.remove("default");
  document.getElementById("new-grid-custom").classList.add("default");
}

function updateUI() {
  updateGridUI();
  updateLabelsAndClues();
  updateActiveWords();
  updateGridHighlights();
  updateSidebarHighlights();
  updateMatchesUI();
  updateCluesUI();
  updateInfoUI();
  if (isMutated) {
    updateStatsUI();
    saveStateToSession();
    // autoFill(true);  // quick fill
  }
}

function updateGridUI() {
  for (let i = 0; i < xw.rows; i++) {
    for (let j = 0; j < xw.cols; j++) {
      const activeCell = getGridSquare(i, j);
      let fill = xw.fill[i][j];
      if (fill == BLANK && forced != null) {
        fill = forced[i][j];
        activeCell.classList.add("pencil");
      } else {
        activeCell.classList.remove("pencil");
      }
      activeCell.querySelector(".fill").innerHTML = fill;
      if (fill == BLOCK) {
        activeCell.classList.add("block");
      } else {
        activeCell.classList.remove("block");
      }
    }
  }
}

function updateCluesUI() {
  let acrossClueNumber = document.getElementById("across-clue-number");
  let downClueNumber = document.getElementById("down-clue-number");
  let acrossClueText = document.getElementById("across-clue-text");
  let downClueText = document.getElementById("down-clue-text");

  // If the current cell is block, empty interface and get out
  if (xw.fill[current.row][current.col] == BLOCK) {
    acrossClueNumber.innerHTML = "";
    downClueNumber.innerHTML = "";
    acrossClueText.innerHTML = "";
    downClueText.innerHTML = "";
    return;
  }
  // Otherwise, assign values
  const acrossCell = getGridSquare(current.row, current.acrossStartIndex);
  const downCell = getGridSquare(current.downStartIndex, current.col);
  acrossClueNumber.innerHTML = acrossCell.querySelector(".label").innerHTML + "a.";
  downClueNumber.innerHTML = downCell.querySelector(".label").innerHTML + "d.";
  acrossClueText.innerHTML = xw.clues[[current.row, current.acrossStartIndex, ACROSS]];
  downClueText.innerHTML = xw.clues[[current.downStartIndex, current.col, DOWN]];
}

function updateInfoUI() {
  document.getElementById("puzzle-title").innerHTML = xw.title;
  document.getElementById("puzzle-author").innerHTML = xw.author;
}

function createGrid(rows, cols) {
  grid = document.createElement("table");
  grid.setAttribute("id", "grid");
  grid.setAttribute("tabindex", "1");
  // grid.setAttribute("tabindex", "0");
  document.getElementById("grid-container").appendChild(grid);

	for (let i = 0; i < rows; i++) {
    	let row = document.createElement("tr");
    	row.setAttribute("data-row", i);
    	document.getElementById("grid").appendChild(row);

		for (let j = 0; j < cols; j++) {
		    let col = document.createElement("td");
        col.setAttribute("data-col", j);

        let label = document.createElement("div");
        label.setAttribute("class", "label");
        let labelContent = document.createTextNode("");

        let fill = document.createElement("div");
        fill.setAttribute("class", "fill");
        let fillContent = document.createTextNode(xw.fill[i][j]);

    		// let t = document.createTextNode("[" + i + "," + j + "]");
        label.appendChild(labelContent);
        fill.appendChild(fillContent);
        col.appendChild(label);
        col.appendChild(fill);
        row.appendChild(col);
      }
  }
  updateLabelsAndClues();
}

function updateLabelsAndClues() {
  let count = 1;
  for (let i = 0; i < xw.rows; i++) {
    for (let j = 0; j < xw.cols; j++) {
      let isAcross = false;
      let isDown = false;
      if (xw.fill[i][j] != BLOCK) {
        isDown = i == 0 || xw.fill[i - 1][j] == BLOCK;
        isAcross = j == 0 || xw.fill[i][j - 1] == BLOCK;
      }
      let currentCell = getGridSquare(i, j);
      if (isAcross || isDown) {
        currentCell.querySelector(".label").innerHTML = count; // Set square's label to the count
        count++;
      } else {
        currentCell.querySelector(".label").innerHTML = "";
      }

      if (isAcross) {
        xw.clues[[i, j, ACROSS]] = xw.clues[[i, j, ACROSS]] || DEFAULT_CLUE;
      } else {
        delete xw.clues[[i, j, ACROSS]];
      }
      if (isDown) {
        xw.clues[[i, j, DOWN]] = xw.clues[[i, j, DOWN]] || DEFAULT_CLUE;
      } else {
        delete xw.clues[[i, j, DOWN]];
      }
    }
  }
}

function updateActiveWords() {
  if (xw.fill[current.row][current.col] == BLOCK) {
    current.acrossWord = '';
    current.downWord = '';
    current.acrossStartIndex = null;
    current.acrossEndIndex = null;
    current.downStartIndex = null;
    current.downEndIndex = null;
  } else {
    current.acrossWord = getWordAt(current.row, current.col, ACROSS, true);
    current.downWord = getWordAt(current.row, current.col, DOWN, true);
  }
  document.getElementById("across-word").innerHTML = current.acrossWord;
  document.getElementById("down-word").innerHTML = current.downWord;
  // console.log("Across:", current.acrossWord, "Down:", current.downWord);
  // console.log(current.acrossWord.split(DASH).join("*"));
}

function getGridSquare(row, col) {
  return grid.querySelector('[data-row="' + row + '"]').querySelector('[data-col="' + col + '"]');
}

function getRow(i) {
  return xw.fill[i];
}

function getCol(j) {
  let col = [];
  for (let i = 0; i < xw.rows; i++) {
    col.push(xw.fill[i][j]);
  }
  return col;
}

function getLine(direction, index) {
  return (direction == ACROSS) ? getRow(index) : getCol(index);
}

function getWordAt(row, col, direction, setCurrentWordIndices) {
  let line = [];
  let [start, end] = [0, 0];
  let position = 0;
  if (direction == ACROSS) {
    line = getRow(row);
    position = col;
  } else {
    line = getCol(col);
    position = row;
  }
  [start, end] = getWordIndices(line, direction, position);
  // Set global word indices if needed
  if (setCurrentWordIndices) {
    if (direction == ACROSS) {
      [current.acrossStartIndex, current.acrossEndIndex] = [start, end];
    } else {
      [current.downStartIndex, current.downEndIndex] = [start, end];
    }
  }
  return line.slice(start, end).map(t => (t == BLANK) ? DASH : t).join("");
}

function getWordIndices(line, direction, position) {
  if (line[position] == BLOCK) {
    return [position, position];
  }
  let start = line.slice(0, position).lastIndexOf(BLOCK);
  start = (start == -1) ? 0 : start + 1;
  let limit = (direction == ACROSS) ? xw.cols : xw.rows;
  let end = line.slice(position, limit).indexOf(BLOCK);
  end = (end == -1) ? limit : Number(position) + end;
  return [start, end];
}

function getStringIndex(array, arrayIndex) {
  return array.slice(0, arrayIndex).reduce((accum, elem) => accum + elem.length, 0);
}

function updateGridHighlights() {
  // Clear the grid of any highlights
  for (let i = 0; i < xw.rows; i++) {
    for (let j = 0; j < xw.cols; j++) {
      const square = getGridSquare(i, j);
      square.classList.remove("highlight", "lowlight", "highlight-chart-hover");
    }
  }
  // Highlight across squares
  for (let j = current.acrossStartIndex; j < current.acrossEndIndex; j++) {
    const square = getGridSquare(current.row, j);
    if (j != current.col) {
      square.classList.add((current.direction == ACROSS) ? "highlight" : "lowlight");
    }
  }
  // Highlight down squares
  for (let i = current.downStartIndex; i < current.downEndIndex; i++) {
    const square = getGridSquare(i, current.col);
    if (i != current.row) {
      square.classList.add((current.direction == DOWN) ? "highlight" : "lowlight");
    }
  }
}

function updateSidebarHighlights() {
  let acrossHeading = document.getElementById("across-heading");
  let downHeading = document.getElementById("down-heading");
  let acrossChart = document.getElementById("across-chart");
  let downChart = document.getElementById("down-chart");
  const currentCell = getGridSquare(current.row, current.col);

  acrossHeading.classList.remove("highlight");
  downHeading.classList.remove("highlight");
  acrossChart.classList.remove("highlight");
  downChart.classList.remove("highlight");

  if (!currentCell.classList.contains("block")) {
    if (current.direction == ACROSS) {
      acrossHeading.classList.add("highlight");
      acrossChart.classList.add("highlight");
    } else {
      downHeading.classList.add("highlight");
      downChart.classList.add("highlight");
    }
  }
}

function setClues() {
    xw.clues[[current.row, current.acrossStartIndex, ACROSS]] = document.getElementById("across-clue-text").innerHTML;
    xw.clues[[current.downStartIndex, current.col, DOWN]] = document.getElementById("down-clue-text").innerHTML;
    // console.log("Stored clue:", xw.clues[[current.row, current.acrossStartIndex, ACROSS]], "at [" + current.row + "," + current.acrossStartIndex + "]");
    // console.log("Stored clue:", xw.clues[[current.downStartIndex, current.col, DOWN]], "at [" + current.downStartIndex + "," + current.col + "]");
}

function setTitle() {
  xw.title = document.getElementById("puzzle-title").innerHTML;
  saveStateToSession();
}

function setAuthor() {
  xw.author = document.getElementById("puzzle-author").innerHTML;
  saveStateToSession();
}

function suppressEnterKey(e) {
  if (e.key == "Enter") {
    e.preventDefault();
    // console.log("Enter key behavior suppressed.");
  }
}

function generatePattern() {
  let title = xw.title;
  let author = xw.author;
  createNewPuzzle();
  xw.title = title;
  xw.author = author;

  const pattern = patterns[randomNumber(0, patterns.length)]; // select random pattern
  if (!isSymmetrical) { // patterns are encoded as only one half of the grid...
    toggleSymmetry();   // so symmetry needs to be on to populate correctly
  }
  for (let i = 0; i < pattern.length; i++) {
    const row = pattern[i][0];
    const col = pattern[i][1];
    const symRow = xw.rows - 1 - row;
    const symCol = xw.cols - 1 - col;
    xw.fill[row][col] = BLOCK;
    xw.fill[symRow][symCol] = BLOCK;
  }
  isMutated = true;
  updateUI();
  console.log("Generated layout.");
}

function toggleSymmetry() {
  isSymmetrical = !isSymmetrical;
  // Update UI button
  let symButton = document.getElementById("toggle-symmetry");
  symButton.classList.toggle("button-on");
  buttonState = symButton.getAttribute("data-state");
  symButton.setAttribute("data-state", (buttonState == "on") ? "off" : "on");
  symButton.setAttribute("data-tooltip", "Turn " + buttonState + " symmetry");
  saveStateToSession();
}

function toggleStrictMatching() {
  isStrictMatching = !isStrictMatching;
  // Update UI button
  let strictButton = document.getElementById("toggle-strict-matching");
  strictButton.classList.toggle("button-on");
  buttonState = strictButton.getAttribute("data-state");
  strictButton.setAttribute("data-state", (buttonState == "on") ? "off" : "on");
  strictButton.setAttribute("data-tooltip", "Turn " + buttonState + " strict matching");
  updateMatchesUI();
  saveStateToSession();
}

function toggleDarkMode() {
  if (!isDarkMode) {
    document.documentElement.setAttribute("data-theme", "dark");
    localStorage.setItem("theme", "dark");
  } else {
    document.documentElement.setAttribute("data-theme", "light");
    localStorage.setItem("theme", "light");
  }
  isDarkMode = !isDarkMode;
  saveStateToSession();
  // Update UI button
  let darkButton = document.getElementById("toggle-dark-mode");
  darkButton.classList.toggle("button-on");
  buttonState = darkButton.getAttribute("data-state");
  darkButton.setAttribute("data-state", (buttonState == "on") ? "off" : "on");
  darkButton.setAttribute("data-tooltip", "Turn " + buttonState + " dark mode");
  updateStatsUIColors();
}

function toggleHelp() {
  document.getElementById("help").classList.toggle("hidden");
  let helpButton = document.getElementById("toggle-help");
  helpButton.classList.toggle("button-on");
  if (helpButton.getAttribute("data-state") == "on") {
    helpButton.setAttribute("data-state", "off");
    helpButton.setAttribute("data-tooltip", "Show help");
  } else {
    helpButton.setAttribute("data-state", "on");
    helpButton.setAttribute("data-tooltip", "Hide help");
  }
}

function clearFill() {
  for (let i = 0; i < xw.rows; i++) {
    for (let j = 0; j < xw.cols; j++) {
      if (xw.fill[i][j] != BLOCK) {
        xw.fill[i][j] = BLANK;
      }
    }
  }
  isMutated = true;
  updateUI();
}

function autoFill(isQuick = false) {
  console.log("Auto-filling...");
  forced = null;
  grid.classList.remove("sat", "unsat");
  if (!solveWorker) {
    solveWorker = new Worker('xw_worker.js');
    solveWorkerState = 'ready';
  }
  if (solveWorkerState != 'ready') {
    cancelSolveWorker();
  }
  solvePending = [isQuick];
  runSolvePending();
}

function runSolvePending() {
  if (solveWorkerState != 'ready' || solvePending.length == 0) return;
  let isQuick = solvePending[0];
  solvePending = [];
  solveTimeout = window.setTimeout(cancelSolveWorker, 30000);
  if (solveWordlist == null) {
    console.log('Rebuilding wordlist...');
    solveWordlist = '';
    for (let i = 3; i < wordlist.length; i++) {
      solveWordlist += wordlist[i].join('\n') + '\n';
    }
  }
  //console.log(wordlist_str);
  let puz = '';
  let isUnfillable = false;
  let rebusIndexes = [];
  let k = 0;
  for (let i = 0; i < xw.rows; i++) {
    for (let j = 0; j < xw.cols; j++) {
      if (xw.fill[i][j].length > 1) {
        rebusIndexes.push(k);
        if ((getWordAt(i, j, ACROSS) + getWordAt(i, j, DOWN)).includes(DASH)) {
          isUnfillable = true;
        }
      }
      puz = puz + xw.fill[i][j][0];
      k++;
    }
    puz = puz + '\n';
  }
  if (isUnfillable) {
    new Notification("Autofill requires the across and down answers for each rebus square to be completely filled.", 10);
    console.log("Autofill cancelled: Grid contains incomplete rebus entries.");
    return;
  }
  solveWorker.postMessage(['run', solveWordlist, puz, isQuick]);
  solveWorkerState = 'running';
  solveWorker.onmessage = function(e) {
    switch (e.data[0]) {
      case 'sat':
        if (solveWorkerState == 'running') {
          if (isQuick) {
            console.log("Autofill: Solution found.");
            grid.classList.add("sat");
          } else {
            let solution = e.data[1].split('\n');
            solution.pop(); // strip empty last line
            let state = {};
            state.old = [];
            state.new = [];
            k = 0;
            for (let i = 0; i < solution.length; i++) {
              state.old.push([]);
              state.new.push([]);
              for (let j = 0; j < solution[i].length; j++) {
                state.old[i].push(xw.fill[i][j]);
                if (!rebusIndexes.includes(k)) {
                  xw.fill[i][j] = solution[i][j];
                }
                state.new[i].push(xw.fill[i][j]);
                k++;
              }
            }
            state.row = current.row;
            state.col = current.col;
            state.direction = current.direction;
            actionTimeline.record(new Action("autoFill", state));
            updateGridUI();
            updateStatsUI();
            grid.focus();
          }
        }
        break;
      case 'unsat':
        if (solveWorkerState == 'running') {
          if (isQuick) {
            console.log("Autofill: No quick solution found.");
            grid.classList.add("unsat");
          } else {
            console.log('Autofill: No solution found.');
            // TODO: indicate on UI
          }
        }
        break;
      case 'forced':
        if (solveWorkerState == 'running') {
          forced = e.data[1].split('\n');
          forced.pop();  // strip empty last line
          updateGridUI();
        }
        break;
      case 'done':
        console.log('Autofill: returning to ready, state was ', solveWorkerState);
        solveWorkerReady();
        break;
      case 'ack_cancel':
        console.log('Autofill: Cancel acknowledged.');
        solveWorkerReady();
        break;
      default:
        console.log('Autofill: Unexpected return,', e.data);
        break;
    }
  };
}

function solveWorkerReady() {
  if (solveTimeout) {
    window.clearTimeout(solveTimeout);
    solveTimeout = null;
  }
  solveWorkerState = 'ready';
  runSolvePending();
}

function cancelSolveWorker() {
  if (solveWorkerState == 'running') {
    solveWorker.postMessage(['cancel']);
    solveWorkerState = 'cancelwait';
    console.log("Autofill: Cancel sent.");  // TODO: indicate on UI
    window.clearTimeout(solveTimeout);
    solveTimeout = null;
  }
}

function invalidateSolverWordlist() {
  solveWordlist = null;
}

function showMenu(e) {
  let menus = document.querySelectorAll("#toolbar .menu");
  for (let i = 0; i < menus.length; i++) {
    menus[i].classList.add("hidden");
  }
  const id = e.target.getAttribute("id");
  let menu = document.getElementById(id + "-menu");
  if (menu) {
    menu.classList.remove("hidden");
  }
}

function hideMenu(e) {
  e.target.classList.add("hidden");
}

function setDefault(e) {
  let button = e.target.closest("button");
  let d = button.parentNode.querySelector(".default");
  d.classList.remove("default");
  button.classList.add("default");
  menuButton = document.getElementById(button.parentNode.getAttribute("id").replace("-menu", ""));
  menuButton.innerHTML = button.innerHTML;
}

function doDefault(e) {
  const id = e.target.parentNode.getAttribute("id");
  let menu = document.getElementById(id + "-menu");
  if (menu) {
    let d = menu.querySelector(".default");
    d.click();
  }
}

function enterRebus(e) {
  let rebusInput = document.getElementById("rebus-input");
  if (rebusInput.value == "" || e.key == ESCAPE) {
    showMenu({"target": document.getElementById("enter-rebus")});
    rebusInput.focus();
    return;
  }
  let activeCell = getGridSquare(current.row, current.col);
  let fill = activeCell.querySelector(".fill");
  let oldContent = xw.fill[current.row][current.col];
  xw.fill[current.row][current.col] = rebusInput.value.toUpperCase();
  if (xw.fill[current.row][current.col].length > 1) {
    fill.classList.add("rebus");
  }
  let symRow = xw.rows - 1 - current.row;
  let symCol = xw.cols - 1 - current.col;
  let symOld = xw.fill[symRow][symCol];
  if (oldContent == BLOCK) {
    if (isSymmetrical) {
      xw.fill[symRow][symCol] = BLANK;
    }
  }
  if (oldContent != xw.fill[current.row][current.col]) {
    let state = {
      "row": current.row,
      "col": current.col,
      "direction": current.direction,
      "old": oldContent,
      "new": xw.fill[current.row][current.col]
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

  updateUI();
  document.getElementById("enter-rebus-menu").classList.add("hidden");
  if (current.direction == ACROSS) {
    e = new KeyboardEvent("keydown", {"key": ARROW_RIGHT});
  } else {
    e = new KeyboardEvent("keydown", {"key": ARROW_DOWN});
  }
  keyboardHandler(e);
  grid.focus();
}

function toggleCircle(useCircle = true) {
  let state = {
    "row": current.row,
    "col": current.col,
    "direction": current.direction
  };
  if (useCircle != isCircleDefault) {
    switchCirclesShades();
    actionTimeline.record(new Action("switchCirclesShades", state));
    return;
  }
  let activeCell = getGridSquare(current.row, current.col);
  let type = isCircleDefault ? "circle" : "shade";
  if (activeCell.querySelector("." + type)) {
    activeCell.removeChild(activeCell.querySelector("." + type));
  } else {
    let div = document.createElement("div");
    div.setAttribute("class", type);
    activeCell.appendChild(div);
  }
  updateUI();
  actionTimeline.record(new Action("toggleCircle", state));
  if (current.direction == ACROSS) {
    e = new KeyboardEvent("keydown", {"key": ARROW_RIGHT});
  } else {
    e = new KeyboardEvent("keydown", {"key": ARROW_DOWN});
  }
  keyboardHandler(e);
  grid.focus();
}

function toggleShade() {
  toggleCircle(false);
}

function switchCirclesShades() {
  isCircleDefault = !isCircleDefault;
  for (let i = 0; i < xw.rows; i++) {
    for (let j = 0; j < xw.cols; j++) {
      let cell = getGridSquare(i, j);
      let circle = cell.querySelector(".circle");
      let shade = cell.querySelector(".shade");
      if (circle) {
        let newShade = document.createElement("div");
        newShade.setAttribute("class", "shade");
        cell.appendChild(newShade);
        cell.removeChild(circle);
      } else if (shade) {
        let newCircle = document.createElement("div");
        newCircle.setAttribute("class", "circle");
        cell.appendChild(newCircle);
        cell.removeChild(shade);
      }
    }
  }
  saveStateToSession();
}

function undo() {
  actionTimeline.undo();
}

function redo() {
  actionTimeline.redo();
}

function randomNumber(min, max) {
  return Math.floor(Math.random() * max) + min;
}

function randomLetter() {
  let alphabet = "AAAAAAAAABBCCDDDDEEEEEEEEEEEEFFGGGHHIIIIIIIIIJKLLLLMMNNNNNNOOOOOOOOPPQRRRRRRSSSSSSTTTTTTUUUUVVWWXYYZ";
  return alphabet[randomNumber(0, alphabet.length)];
}
