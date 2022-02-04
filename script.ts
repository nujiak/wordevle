import { isWordInWordBank } from "./words/WordBank";

enum Result {
  CORRECT = "correct",
  MISPLACED = "misplaced",
  WRONG = "wrong",
}

class ResultBox {
  box: HTMLDivElement;
  label: HTMLHeadingElement;

  constructor(box: HTMLDivElement, label: HTMLHeadingElement) {
    this.box = box;
    this.label = label;
  }
}

let word: string = "HELLO";

const answer: string[] = word.split("");

const maxAttempts: number = 6;

const results: Result[][] = [];

const resultBoxes: ResultBox[][] = [];

const keyboardKeys: HTMLButtonElement[] = [];

const currentEntry: string[] = [];

let isGameCompleted: boolean = false;

function isValidEntry(entry: string): boolean {
  return entry.length == word.length
}

function isWordValid(word: string): boolean {
  return isWordInWordBank(word.toLowerCase());
}

function getIndex(c: string): number {
  return c.toUpperCase().charCodeAt(0) - 65;
}

function setKeyboardResult(c: string, result: Result) {

  const key = keyboardKeys[getIndex(c)];

  if (key.classList.contains(result) || key.classList.contains(Result.CORRECT)) {
    return;
  }

  if (result === Result.CORRECT) {
    key.classList.remove(Result.MISPLACED);
    key.classList.remove(Result.WRONG);
    key.classList.add(Result.CORRECT);
    return;
  }

  if (result == Result.MISPLACED) {
    key.classList.remove(Result.WRONG);
    key.classList.add(Result.MISPLACED);
    return;
  }

  if (result == Result.WRONG && !key.classList.contains(Result.MISPLACED)) {
    key.classList.add(Result.WRONG);
    return;
  }
}

function submitEntry() {
  if (currentEntry.length < word.length) {
    return;
  }

  if (!isWordValid(currentEntry.join(""))) {
    alert("Invalid word");
    return;
  }
  const attemptNumber = results.length;
  const result: Result[] = [];

  isGameCompleted = true;

  const wordArr: string[] = word.split("");

  // Check for greens
  currentEntry.forEach((character, index) => {
    if (character === wordArr[index]) {
      resultBoxes[attemptNumber][index].box.classList.add(Result.CORRECT);
      setKeyboardResult(character, Result.CORRECT);

      wordArr[index] = null;
      currentEntry[index] = null;
    }
  });

  // Check remainders for yellows
  currentEntry.forEach((character, index) => {
    if (character != null && wordArr.includes(character)) {
      resultBoxes[attemptNumber][index].box.classList.add(Result.MISPLACED);
      setKeyboardResult(character, Result.MISPLACED);

      wordArr[wordArr.indexOf(character)] = null;
      currentEntry[index] = null;
    }
  });

  // Mark remainders as red
  currentEntry.forEach((character, index) => {
    if (character != null) {
      result[index] = Result.WRONG;
      resultBoxes[attemptNumber][index].box.classList.add(Result.WRONG);
      setKeyboardResult(character, Result.WRONG);
      isGameCompleted = false;
    }
  });

  results.push(result);

  currentEntry.length = 0;

  return result;
}

function setupResultPanel() {
  const resultPanel: HTMLElement = document.getElementById("resultPanel");

  for (let i = 0; i < maxAttempts; i++) {
    // Create result row
    const resultRow = document.createElement("div");
    resultRow.classList.add("resultRow");
    resultRow.id = `resultRow${i}`;

    resultBoxes[i] = [];

    // Populate row
    for (let j = 0; j < word.length; j++) {
      const resultBox = document.createElement("div");
      resultBox.classList.add("resultBox");

      const resultLabel = document.createElement("h1");
      resultLabel.classList.add("resultLabel");

      resultBox.appendChild(resultLabel);
      resultRow.appendChild(resultBox);

      // Save resultBox
      resultBoxes[i][j] = new ResultBox(resultBox, resultLabel);
    }

    resultPanel.appendChild(resultRow);
  }
}

function deleteCharacter() {
  if (currentEntry.length === 0) {
    return;
  }

  currentEntry.pop();
  resultBoxes[results.length][currentEntry.length].label.innerText = ""
}

function inputCharacter(c: string) {

  if (isGameCompleted) {
    return;
  }

  if (c == "Backspace") {
    deleteCharacter();
  }

  if (c == "Enter") {
    submitEntry();
  }

  if (!/^[a-zA-Z]$/.test(c)) {
    return;
  }

  if (results.length >= maxAttempts) {
    return;
  }

  if (currentEntry.length >= word.length) {
    return;
  }

  currentEntry.push(c.toUpperCase());

  resultBoxes[results.length][currentEntry.length - 1].label.innerText = c.toUpperCase()
}

function setUpKeyboardInput() {
  document.addEventListener("keyup", (e) => inputCharacter(e.key));
}

function setUpVirtualKeyboard() {
  const buttons = document.getElementsByClassName("keyboardKey")
  for (let i = 0; i < buttons.length; i++) {
    const button = buttons[i];
    if (button.id == "enter") {
      // Enter button
      button.addEventListener("click", submitEntry);
    } else if (button.id == "backspace") {
      // Backspace button
      button.addEventListener("click", deleteCharacter);
    } else {
      // Letter button, fetch character from id
      button.addEventListener("click", () => inputCharacter(button.id.toUpperCase()))
    }
  }

  for (let i = 97; i <= 122; i++) {
    keyboardKeys[i - 97] = <HTMLButtonElement> document.getElementById(String.fromCharCode(i));
  }
}

function init() {
  const query = window.location.search;

  const urlParams = new URLSearchParams(query);

  if (urlParams.has("word")) {
    const customWord = urlParams.get("word");

    if (isWordValid(customWord)) {
      word = customWord.toUpperCase();
    }
  }

  setupResultPanel();
  setUpKeyboardInput();
  setUpVirtualKeyboard();
}

init()
