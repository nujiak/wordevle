var Result;
(function (Result) {
    Result[Result["CORRECT"] = 0] = "CORRECT";
    Result[Result["MISPLACED"] = 1] = "MISPLACED";
    Result[Result["WRONG"] = 2] = "WRONG";
})(Result || (Result = {}));
const word = "hello";
const answer = word.split("");
const results = [];
function isValidEntry(entry) {
    return entry.length == word.length;
}
function addNewEntry(entry) {
    if (!isValidEntry(entry)) {
        return false;
    }
    const result = [];
    const entryArr = entry.split("");
    for (let i = 0; i < word.length; i++) {
        if (entryArr[i] == word.charAt(i)) {
            result[i] = Result.CORRECT;
        }
        else if (word.includes(entryArr[i])) {
            result[i] = Result.MISPLACED;
        }
        else {
            result[i] = Result.WRONG;
        }
    }
    results.push(result);
    return true;
}
addNewEntry("heloo");
addNewEntry("testo");
console.log(results);
