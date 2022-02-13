import { url } from "inspector";
import { encode } from "punycode";
import { decrypt, encrypt } from "./security/AesCbc";
import { getWordOfTheDay, isWordInWordBank } from "./words/WordBank";

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

const WORD_PARAM_KEY = "w";
const ATTEMPTS_PARAM_KEY = "a";
const NAME_PARAM_KEY = "n";
const TIME_PARAM_KEY = "t";

let word: string = "HELLO";

const answer: string[] = word.split("");

let maxAttempts: number = 6;

const results: Result[][] = [];

const resultBoxes: ResultBox[][] = [];

const keyboardKeys: HTMLButtonElement[] = [];

const currentEntry: string[] = [];

let isGameCompleted: boolean = false;

const isWordOfTheDay: boolean = window.location.search === "";

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

  document.getElementById("gameOverAttemptsMade").innerText = results.length.toString();

  document.getElementById("gameOverMaxAttempts").innerText = maxAttempts.toString();

  const message = getShareMessage(isLost);

  document.getElementById("share").addEventListener("click", () => {
      share("Play Wordevle", message);
  })

  document.getElementById("create").addEventListener("click", () => {
    openCustomWordForm();
  })

  const dailyTimer = document.getElementById("dailyTimer");

  const nextDay = new Date();
  nextDay.setHours(24, 0, 0, 0);
  const nextDayMs = nextDay.valueOf();

  // Set up timer for next word
  if (isWordOfTheDay) {
    updateClock();
    setTimeout(() => {
      updateClock();
      setInterval(() => {
        updateClock();
      }, 1000);
    }, 1000 - new Date().getMilliseconds());

    function updateClock() {
      const diff = nextDayMs - (new Date()).valueOf();
      const hours = Math.floor(diff / 1000 / 60 / 60);
      const minutes = Math.floor(diff / 1000 / 60 % 60);
      const seconds = Math.floor(diff / 1000 % 60);
      dailyTimer.innerText = `${hours.toString().padStart(2, "0")}`
          + `:${minutes.toString().padStart(2, "0")}`
          + `:${seconds.toString().padStart(2, "0")}`;
    }
  } else {
    dailyTimer.style.display = "none";
    document.getElementById("dailyTimerHeader").style.display = "none";
  }
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
  let message = 'Wordevle ' +`${results.length}/${maxAttempts} ` + (isLost ? "❌" : "✅") +"\n";
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

  message += `\nChallenge my score on Wordevle:\n\n${window.location.href}`

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
  document.getElementById("setUpSubmit").onclick = submitSetUpOptions;

  // Share on clicking button
  document.getElementById("setUpShare").onclick = shareSetUpOptions;

  document.getElementById("closeCreateBox").onclick = closeCustomWordForm;

  const attemptsIndicator = document.getElementById("attemptsIndicator");

  const attemptsSlider = <HTMLInputElement> document.getElementById("attemptsSlider");

  // Set initial value
  attemptsIndicator.innerText = attemptsSlider.value;

  attemptsSlider.addEventListener("input", () => {
    attemptsIndicator.innerText = attemptsSlider.value;
  });
}

function closeCustomWordForm() {
  document.getElementById("setUpBox").classList.remove("shown");
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

  let message = "";
  for (let i = 0; i < word.length; i++) {
    message += "⬜";
  }
  message += `\n\nTry to guess this ${word.length}-letter word on Wordevle in ${attempts} tries or less:\n\n${encodeUrl(word, name, attempts)}`;

  share("Play Wordevle!", message)
}

function encodeUrl(word: string, name: string, attempts: number) {
  const url = new URL(window.location.origin);

  const searchParams = new URLSearchParams();
  searchParams.append(WORD_PARAM_KEY, word);
  searchParams.append(ATTEMPTS_PARAM_KEY, attempts.toString());
  if (/[a-zA-Z\d]/.test(name)) {
    searchParams.append(NAME_PARAM_KEY, name.trim());
    searchParams.append(TIME_PARAM_KEY, (new Date()).getTime().toString())
  }
  const encodedParams = encrypt(searchParams.toString());
  return url + "?" + encodedParams;
}

function setNameTime(urlParams: URLSearchParams) {
  if(!urlParams.has(NAME_PARAM_KEY)) {
    return;
  }
  document.getElementById("wordInfo").style.display = "block";
  const name = urlParams.get(NAME_PARAM_KEY);
  document.getElementById("name").innerText = name;
  const time = new Date(parseInt(urlParams.get(TIME_PARAM_KEY)));
  document.getElementById("time").innerText = time.toLocaleDateString();
}

function setUpWord(): boolean {
  const query = window.location.search;
  const encryptedParams = query.slice(1)
  const urlParams = new URLSearchParams(decrypt(encryptedParams));

  if (query === "") {
    word = getWordOfTheDay().toUpperCase();
    switch (word.length) {
      case 4:
        maxAttempts = 8;
        break;
      case 5:
        maxAttempts = 6;
        break;
      default:
        maxAttempts = 7;
        break;
    }
    return true;
  }

  if (urlParams.has(WORD_PARAM_KEY)) {
    const customWord:string = urlParams.get(WORD_PARAM_KEY);
    if (isWordValid(customWord)) {
      word = customWord.toUpperCase();
      maxAttempts = parseInt(urlParams.get(ATTEMPTS_PARAM_KEY));
      if (maxAttempts > 12) {
        maxAttempts = 12;
      } else if (maxAttempts < 3) {
        maxAttempts = 3;
      }
      setNameTime(urlParams);
      return true;
    }
  }

  return false;
}

function init() {

  require('dotenv').config();

  if (!setUpWord()) {
    window.location.replace(window.location.origin);
    return;
  }

  document.getElementById("title").addEventListener("click", () => {
    window.location.assign(window.location.origin);
  });

  document.getElementById("tagline").addEventListener("click", () => {
    window.location.assign(window.location.origin);
  });

  setupResultPanel();
  setUpKeyboardInput();
  setUpVirtualKeyboard();

  const loadingScreen = document.getElementById("loadingScreen");
  loadingScreen.classList.add("hidden");
  setTimeout(() => {
    loadingScreen.style.display = "none";
  }, 500);
}

init()
