enum Result {
  CORRECT,
  MISPLACED,
  WRONG,
}

const word: String = "hello";

const answer: String[] = word.split("");

const results: Result[][] = [];

function isValidEntry(entry: string): boolean {
  return entry.length == word.length
}

function addNewEntry(entry: string): Result[] {
  if (!isValidEntry(entry)) {
    return null;
  }
  const result: Result[] = [];
  const entryArr: string[] = entry.split("");
  for (let i = 0; i < word.length; i++) {
    if (entryArr[i] == word.charAt(i)) {
      result[i] = Result.CORRECT;
    } else if (word.includes(entryArr[i])) {
      result[i] = Result.MISPLACED;
    } else {
      result[i] = Result.WRONG;
    }
  }
  results.push(result);
  return result;
}
