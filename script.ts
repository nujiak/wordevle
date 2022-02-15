import { url } from "inspector";
import { isMobile } from "mobile-device-detect";
import { recoverProgress, saveProgress } from "./data/Storage";
import { decrypt, encrypt } from "./security/AesCbc";
import { getWordOfTheDay, isWordInWordBank } from "./words/WordBank";
import { Triple } from "./Triple"
import { Entries } from "./game/Entries";
import { Result } from "./game/Result";

class ResultBox {
  box: HTMLDivElement;
  label: HTMLHeadingElement;

  constructor(box: HTMLDivElement, label: HTMLHeadingElement) {
    this.box = box;
    this.label = label;
  }
}

class Game {
  private entries: Entries;
  readonly word: string;
  readonly attempts: number;
  readonly results: Result[][] = [];
  readonly isWordOfTheDay: boolean;
  private _isCompleted: boolean = false;
  readonly key: string;

  constructor(word: string, attempts: number, isWordOfTheDay: boolean) {
    this.entries = new Entries(word, attempts);
    this.word = word.toUpperCase();
    this.attempts = attempts;
    this.isWordOfTheDay = isWordOfTheDay;
    if (isWordOfTheDay) {
      this.key = new Date().toDateString();
    } else {
      this.key = window.location.search;
    }
  }

  public getAttemptsMade(): number {
    return this.results.length;
  }

  public deleteCharacter(): boolean {
    const success = this.entries.deleteLastCharacter();
    if (success) {
      this.save();
    }
    return success;
  }

  public addCharacter(c: string): boolean {
    const success = this.entries.addCharacter(c);
    if (success) {
      this.save();
    }
    return success;
  }

  private isCorrect(results: Result[]): boolean {
    for (let i = 0; i < results.length; i++) {
      if (results[i] !== Result.CORRECT) {
        return false;
      }
    }
    return true;
  }

  public submitEntry() {
    if (this.entries.getCurrentLength() < this.word.length) {
      return;
    }

    if (!isWordValid(this.entries.getCurrentEntry().join(""))) {
      showError("Invalid word", 2000)
      return;
    }

    const result: Result[] = [];

    const currentEntry = this.entries.getCurrentEntry();

    const results = this.entries.checkResults();

    for (let i = 0; i < this.word.length; i++) {
      const result = results[i];
      setKeyboardResult(currentEntry[i], result);
      resultBoxes[this.results.length][i].box.classList.add(result);
    }

    this.results.push(results);

    this._isCompleted = this.isCorrect(results) || this.getAttemptsMade() == this.attempts;

    if (this._isCompleted) {
      Ui.showGameOver();
    }

    this.entries.nextAttempt();

    this.save();

    return result;
  }

  public getEntryLength() {
    return this.entries.getCurrentLength();
  }

  public isCompleted(): boolean {
    return this._isCompleted;
  }

  private save() {
    saveProgress(this.key, this.entries.getAllEntries());
  }
}

class Ui {
  public static showGameOver() {
    const results = game.results;
    const isLost = results[results.length - 1].includes(Result.MISPLACED) || results[results.length - 1].includes(Result.WRONG);

    const gameOverBox = document.getElementById("gameOverBox");
    gameOverBox.classList.add("shown");

    // Hide the win/lose elements
    const elements = isLost
    ? document.getElementsByClassName("win")
    : document.getElementsByClassName("lose");

    for (let i = 0; i < elements.length; i++) {
      const element = <HTMLElement> elements[i];
      if (element) {
        element.style.display = "none";
      }
    }

    document.getElementById("gameOverAnswer").innerText = game.word.toLowerCase();

    document.getElementById("gameOverAttemptsMade").innerText = results.length.toString();

    document.getElementById("gameOverMaxAttempts").innerText = game.attempts.toString();

    const message = getShareMessage(isLost);

    document.getElementById("share").addEventListener("click", () => {
        share("Play Wordevle", message);
    })

    document.getElementById("create").addEventListener("click", () => {
      Ui.openCustomWordForm();
    })

    const dailyTimer = document.getElementById("dailyTimer");

    const nextDay = new Date();
    nextDay.setHours(24, 0, 0, 0);
    const nextDayMs = nextDay.valueOf();

    // Set up timer for next word
    if (game.isWordOfTheDay) {
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

  public static openCustomWordForm() {
    document.getElementById("setUpBox").classList.add("shown");

    // Submit on clicking button
    document.getElementById("setUpSubmit").onclick = submitSetUpOptions;

    // Share on clicking button
    document.getElementById("setUpShare").onclick = shareSetUpOptions;

    document.getElementById("closeCreateBox").onclick = Ui.closeCustomWordForm;

    const attemptsIndicator = document.getElementById("attemptsIndicator");

    const attemptsSlider = <HTMLInputElement> document.getElementById("attemptsSlider");

    // Set initial value
    attemptsIndicator.innerText = attemptsSlider.value;

    attemptsSlider.addEventListener("input", () => {
      attemptsIndicator.innerText = attemptsSlider.value;
    });
  }

  public static closeCustomWordForm() {
    document.getElementById("setUpBox").classList.remove("shown");
  }

}

const WORD_PARAM_KEY = "w";
const ATTEMPTS_PARAM_KEY = "a";
const NAME_PARAM_KEY = "n";
const TIME_PARAM_KEY = "t";

let name: string = "";

let game: Game;

const resultBoxes: ResultBox[][] = [];

const keyboardKeys: HTMLButtonElement[] = [];

let isGameCompleted: boolean = false;

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

function share(title: string, text: string) {
  if (navigator.share && isMobile) {
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
  const results = game.results;
  let message = 'Wordevle ' +`${results.length}/${game.attempts} ` + (isLost ? "❌" : "✅") +"\n";

  for (let i = 0; i < results.length; i++) {
    const row = results[i];
    for (let j = 0; j < row.length; j++) {
      const result = row[j];
      message += (result === Result.CORRECT
        ? "🟩"
        : result === Result.MISPLACED
          ? "🟨"
          : "⬜")
    }
    message += "\n";
  }

  if (game.isWordOfTheDay) {
    message += `\nGuess the Word of the Day:\n\n${window.location.origin}`;
  } else {
    message += `\nChallenge my score on Wordevle:\n\n${window.location.href}`;
  }

  return message;
}

function setupResultPanel() {
  const resultPanel: HTMLElement = document.getElementById("resultPanel");

  for (let i = 0; i < game.attempts; i++) {
    // Create result row
    const resultRow = document.createElement("div");
    resultRow.classList.add("resultRow");
    resultRow.id = `resultRow${i}`;

    resultBoxes[i] = [];

    // Populate row
    for (let j = 0; j < game.word.length; j++) {
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
  if (game.deleteCharacter()) {
    resultBoxes[game.getAttemptsMade()][game.getEntryLength()].label.innerText = ""
  }
}

function inputCharacter(c: string) {

  if (isGameCompleted) {
    return;
  }

  if (c == "Backspace") {
    deleteCharacter();
  }

  if (c == "Enter") {
    game.submitEntry();
  }

  if (!/^[a-zA-Z]$/.test(c)) {
    return;
  }

  if (game.getAttemptsMade() >= game.attempts) {
    return;
  }

  if (game.addCharacter(c.toUpperCase())) {
    const resultBox = resultBoxes[game.getAttemptsMade()][game.getEntryLength() - 1]
    resultBox.label.innerText = c.toUpperCase();
    resultBox.box.scrollIntoView({behavior: "smooth", block: "end"});
  }

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
      button.addEventListener("click", game.submitEntry);
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

  share("Play Wordevle", message);
}

function shareMidgame(word: string, attempts: number, name: string): void {
  let message = "";
  for (let i = 0; i < word.length; i++) {
    message += "⬜";
  }
  if (game.isWordOfTheDay) {
    message += `\n\nGuess the Word of the Day for ${new Date().toLocaleDateString()}:\n\n${window.location.origin}`
  } else {
    message += `\n\nTry to guess this ${word.length}-letter word on Wordevle in ${attempts} tries or less:\n\n${encodeUrl(word, name, attempts)}`;
  }

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
  name = urlParams.get(NAME_PARAM_KEY);
  document.getElementById("name").innerText = name;
  const time = new Date(parseInt(urlParams.get(TIME_PARAM_KEY)));
  document.getElementById("time").innerText = time.toLocaleDateString();
}

function setUpWord(): Triple<string, number, boolean> {
  let word: string;
  let attempts: number;

  const query = window.location.search;
  const encryptedParams = query.slice(1)
  const urlParams = new URLSearchParams(decrypt(encryptedParams));

  if (query === "") {
    word = getWordOfTheDay().toUpperCase();
    switch (word.length) {
      case 4:
        attempts = 8;
        break;
      case 5:
        attempts = 6;
        break;
      default:
        attempts = 7;
        break;
    }
    document.getElementById("wordOfTheDayText").style.display = "block"
    document.getElementById("date").innerText = new Date().toLocaleDateString();
    return new Triple(word, attempts, true);
  }

  if (urlParams.has(WORD_PARAM_KEY)) {
    const customWord:string = urlParams.get(WORD_PARAM_KEY);
    if (isWordValid(customWord)) {
      word = customWord.toUpperCase();
      attempts = parseInt(urlParams.get(ATTEMPTS_PARAM_KEY));
      if (attempts > 12) {
        attempts = 12;
      } else if (attempts < 3) {
        attempts = 3;
      }
      setNameTime(urlParams);
      return new Triple(word, attempts, false);
    }
  }

  return null;
}

function recover() {
  const progress = recoverProgress(game.key, game.word.length);

  progress.forEach((line) => {
    line.forEach(inputCharacter);
    game.submitEntry();
  })
}

function init() {

  require('dotenv').config();

  const wordResult = setUpWord();

  if (!wordResult) {
    window.location.replace(window.location.origin);
    return;
  }

  const word = wordResult.first,
        attempts = wordResult.second,
        isWordOfTheDay = wordResult.third

  game = new Game(word, attempts, isWordOfTheDay);

  document.getElementById("title").addEventListener("click", () => {
    window.location.assign(window.location.origin);
  });

  document.getElementById("tagline").addEventListener("click", () => {
    window.location.assign(window.location.origin);
  });

  document.getElementById("headerCreate").onclick = Ui.openCustomWordForm;

  document.getElementById("headerShare").onclick = () => shareMidgame(word, game.attempts, name)

  setupResultPanel();
  setUpKeyboardInput();
  setUpVirtualKeyboard();

  recover();

  const loadingScreen = document.getElementById("loadingScreen");
  loadingScreen.classList.add("hidden");
  setTimeout(() => {
    loadingScreen.style.display = "none";
  }, 500);
}

init()
