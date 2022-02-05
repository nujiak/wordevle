import { url } from "inspector";
import { encode } from "punycode";
import { decrypt, encrypt } from "./security/AesCbc";
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

let maxAttempts: number = 6;

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
    showError("Invalid word", 2000)
    return;
  }
  const attemptNumber = results.length;
  const result: Result[] = [];

  isGameCompleted = true;

  const wordArr: string[] = word.split("");

  // Check for greens
  currentEntry.forEach((character, index) => {
    if (character === wordArr[index]) {
      result[index] = Result.CORRECT;
      resultBoxes[attemptNumber][index].box.classList.add(Result.CORRECT);
      setKeyboardResult(character, Result.CORRECT);

      wordArr[index] = null;
      currentEntry[index] = null;
    }
  });

  // Check remainders for yellows
  currentEntry.forEach((character, index) => {
    if (character != null && wordArr.includes(character)) {
      result[index] = Result.MISPLACED;
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
  console.log(result);
  console.log(results);

  if (results.length == maxAttempts) {
    isGameCompleted = true;
  }

  if (isGameCompleted) {
    showGameOver();
  }

  currentEntry.length = 0;

  return result;
}

function showGameOver() {
  const isLost = results[results.length - 1].includes(Result.MISPLACED) || results[results.length - 1].includes(Result.WRONG);

  const gameOverBox = document.getElementById("gameOverBox");
  gameOverBox.classList.add("shown");

  // Hide the win/lose elements
  const elements = isLost
  ? document.getElementsByClassName("win")
  : document.getElementsByClassName("lose");

  console.log(elements);

  for (let i = 0; i < elements.length; i++) {
    const element = <HTMLElement> elements[i];
    if (element) {
      element.style.display = "none";
    }
  }

  document.getElementById("gameOverAnswer").innerText = word.toLowerCase();

  const message = getShareMessage(isLost);

  document.getElementById("share").addEventListener("click", () => {
      share("Play Wordevle", message);
  })

  document.getElementById("create").addEventListener("click", () => {
    window.location.assign(window.location.origin);
  })
}

function share(title: string, text: string) {

  if (navigator.share) {
    navigator.share({
      title: title,
      text: text
     })
  } else {
    navigator.clipboard.writeText(text)
    .then(() => showError("Copied to clipboard!", 3000));
  }
}

function getShareMessage(isLost: boolean): string {
  let message = 'Wordevle'  +`${results.length}/${maxAttempts}\n`;
  console.log(results);

  for (let i = 0; i < results.length; i++) {
    const row = results[i];
    console.log(row);
    for (let j = 0; j < row.length; j++) {
      const result = row[j];
      console.log(result);
      message += (result === Result.CORRECT
        ? "🟩"
        : result === Result.MISPLACED
          ? "🟨"
          : "⬜")
    }
    message += "\n";
  }

  message += `\nChallenge my score at: \n ${window.location.href}`

  return message;
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

function showError(errorMsg: string, duration: number) {
  const errorBox = document.getElementById("errorBox");
  const errorLabel = document.getElementById("errorMessage");

  errorLabel.innerText = errorMsg;

  errorBox.classList.add("shown");
  setTimeout(() => {
    errorBox.classList.remove("shown");
  }, duration);
}

function openCustomWordForm() {
  document.getElementById("setUpBox").classList.add("shown");

  // Submit on clicking button
  document.getElementById("setUpSubmit").addEventListener("click", submitSetUpOptions);

  // Share on clicking button
  document.getElementById("setUpShare").addEventListener("click", shareSetUpOptions);

  const attemptsIndicator = document.getElementById("attemptsIndicator");

  const attemptsSlider = <HTMLInputElement> document.getElementById("attemptsSlider");

  // Set initial value
  attemptsIndicator.innerText = attemptsSlider.value;

  attemptsSlider.addEventListener("input", () => {
    attemptsIndicator.innerText = attemptsSlider.value;
  });
}

function submitSetUpOptions() {
  const customWordField = <HTMLInputElement> document.getElementById("setUpWordInput")
  const customNameField = <HTMLInputElement> document.getElementById("setUpNameInput")
  const maxAttemptsSlider = <HTMLInputElement> document.getElementById("attemptsSlider")

  if (!isWordValid(customWordField.value.trim())) {
    showError("Invalid word", 3000);
    return;
  }

  if (customNameField.value.trim().length > 32) {
    showError("Name is too long", 3000);
    return;
  }

  const word = customWordField.value.trim();
  const name = customNameField.value.trim();
  const attempts = parseInt(maxAttemptsSlider.value);
  window.location.assign(encodeUrl(word, name, attempts));
}

function shareSetUpOptions() {
  const customWordField = <HTMLInputElement> document.getElementById("setUpWordInput")
  const customNameField = <HTMLInputElement> document.getElementById("setUpNameInput")
  const maxAttemptsSlider = <HTMLInputElement> document.getElementById("attemptsSlider")
  const name = customNameField.value.trim();

  if (!isWordValid(customWordField.value.trim())) {
    showError("Invalid word", 3000);
    return;
  }

  if (customNameField.value.trim().length > 32) {
    showError("Name is too long", 3000);
    return;
  }

  const word = customWordField.value.trim();
  const attempts = parseInt(maxAttemptsSlider.value);
  share("Play Wordevle!", `Try to guess this ${word.length}-letter word on Wordevle at\n${encodeUrl(word, name, attempts)}`)
}

function encodeUrl(word: string, name: string, attempts: number) {
  const url = new URL(window.location.origin);

  const searchParams = new URLSearchParams();
  searchParams.append("word", word);
  searchParams.append("attempts", attempts.toString());
  if (/[a-zA-Z\d]/.test(name)) {
    searchParams.append("name", name.trim());
    searchParams.append("time", (new Date()).getTime().toString())
  }
  const encodedParams = encrypt(searchParams.toString());
  return url + "?" + encodedParams;
}

function init() {

  require('dotenv').config();

  const loadingScreen = document.getElementById("loadingScreen");
  loadingScreen.classList.add("hidden");
  setTimeout(() => {
    loadingScreen.style.display = "none";
  }, 500);

  let hasCustomWord: boolean = false;

  const query = window.location.search;
  const encryptedParams = query.slice(1)
  const urlParams = new URLSearchParams(decrypt(encryptedParams));

  if (urlParams.has("word")) {
    const customWord:string = urlParams.get("word");
    if (isWordValid(customWord)) {
      word = customWord.toUpperCase();
      hasCustomWord = true;
      maxAttempts = parseInt(urlParams.get("attempts"));
      if (maxAttempts > 12) {
        maxAttempts = 12;
      } else if (maxAttempts < 3) {
        maxAttempts = 3;
      }
      setNameTime(urlParams);
    }
  }

  document.getElementById("title").addEventListener("click", () => {
    window.location.assign(window.location.origin);
  });

  document.getElementById("tagline").addEventListener("click", () => {
    window.location.assign(window.location.origin);
  });

  if (hasCustomWord) {
    setupResultPanel();
    setUpKeyboardInput();
    setUpVirtualKeyboard();
  } else {
    openCustomWordForm();
  }
}

function setNameTime(urlParams: URLSearchParams) {
  console.log(urlParams.has("name"))
  if(!urlParams.has("name")) {
    return;
  }
  document.getElementById("wordInfo").style.display = "block";
  const name = urlParams.get("name");
  document.getElementById("name").innerText = name;
  const time = new Date(parseInt(urlParams.get("time")));
  document.getElementById("time").innerText = time.toLocaleDateString();
}

init()
