export function saveProgress(key: string, input: string[][]) {
  const value = input.map((line) => line.join("")).join("");

  localStorage.setItem(key, value);
}

export function recoverProgress(key: string, wordLength: number): string[][] {
  const value = localStorage.getItem(key);

  if (!value) {
    return [[]];
  }

  const progress: string[][] = [];

  for (let attemptNum = 0; attemptNum < value.length / wordLength ; attemptNum++) {
    progress.push([]);
    for (let letter = 0; letter < wordLength; letter++) {
      progress[attemptNum][letter] = value.charAt(attemptNum * wordLength + letter);
    }
  }

  return progress;
}