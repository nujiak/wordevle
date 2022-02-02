var Result;
(function (Result) {
    Result[Result["CORRECT"] = 0] = "CORRECT";
    Result[Result["MISPLACED"] = 1] = "MISPLACED";
    Result[Result["WRONG"] = 2] = "WRONG";
})(Result || (Result = {}));
const word = "kaijun";
const answer = word.split("");
const maxAttempts = 6;
const results = [];
const resultBoxes = [];
function isValidEntry(entry) {
    return entry.length == word.length;
}
function addNewEntry(entry) {
    if (!isValidEntry(entry)) {
        return null;
    }
    const attemptNumber = results.length;
    const result = [];
    const entryArr = entry.split("");
    for (let i = 0; i < word.length; i++) {
        if (entryArr[i] == word.charAt(i)) {
            result[i] = Result.CORRECT;
            resultBoxes[attemptNumber][i].classList.add("correct");
        }
        else if (word.includes(entryArr[i])) {
            result[i] = Result.MISPLACED;
            resultBoxes[attemptNumber][i].classList.add("misplaced");
        }
        else {
            result[i] = Result.WRONG;
            resultBoxes[attemptNumber][i].classList.add("wrong");
        }
    }
    results.push(result);
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
            const resultBox = document.createElement("p");
            resultBox.classList.add("resultBox");
            resultRow.appendChild(resultBox);
            // Save resultBox
            resultBoxes[i][j] = resultBox;
        }
        resultPanel.appendChild(resultRow);
    }
}
function setupInput() {
    console.log("Setting up input");
    document.getElementById("entrySubmit").addEventListener("click", () => {
        const entry = document.getElementById("entryInput").value;
        addNewEntry(entry);
        console.log(entry);
    });
}
function init() {
    setupResultPanel();
    setupInput();
}
init();
