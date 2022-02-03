var Result;
(function (Result) {
    Result[Result["CORRECT"] = 0] = "CORRECT";
    Result[Result["MISPLACED"] = 1] = "MISPLACED";
    Result[Result["WRONG"] = 2] = "WRONG";
})(Result || (Result = {}));
class ResultBox {
    constructor(box, label) {
        this.box = box;
        this.label = label;
    }
}
const word = "thorn".toUpperCase();
const answer = word.split("");
const maxAttempts = 6;
const results = [];
const resultBoxes = [];
const currentEntry = [];
let isGameCompleted = false;
function isValidEntry(entry) {
    return entry.length == word.length;
}
function isWordValid(word) {
    return true;
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
    const result = [];
    isGameCompleted = true;
    for (let i = 0; i < word.length; i++) {
        if (currentEntry[i] == word.charAt(i)) {
            result[i] = Result.CORRECT;
            resultBoxes[attemptNumber][i].box.classList.add("correct");
        }
        else if (word.includes(currentEntry[i])) {
            result[i] = Result.MISPLACED;
            resultBoxes[attemptNumber][i].box.classList.add("misplaced");
            isGameCompleted = false;
        }
        else {
            result[i] = Result.WRONG;
            resultBoxes[attemptNumber][i].box.classList.add("wrong");
            isGameCompleted = false;
        }
    }
    results.push(result);
    currentEntry.length = 0;
    return result;
}
function setupResultPanel() {
    const resultPanel = document.getElementById("resultPanel");
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
    resultBoxes[results.length][currentEntry.length].label.innerText = "";
}
function inputCharacter(e) {
    if (isGameCompleted) {
        return;
    }
    const c = e.key;
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
    resultBoxes[results.length][currentEntry.length - 1].label.innerText = c.toUpperCase();
}
function setUpKeyboardInput() {
    document.addEventListener("keyup", inputCharacter);
}
function init() {
    setupResultPanel();
    setUpKeyboardInput();
}
init();
