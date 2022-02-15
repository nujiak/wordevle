import { Result } from "./Result";

export class Entry {
  private letters: string[];
  private word: string;

  constructor(word: string) {
    this.word = word;
    this.letters = [];
  }

  public getLetters(): string[] {
    return [...this.letters];
  }

  public getLength() {
    return this.letters.length;
  }

  public addCharacter(c: string): boolean {
    if (c.length != 1) {
      return false;
    }

    if (this.letters.length >= this.word.length) {
      return false;
    }

    this.letters.push(c);
    return true;
  }

  public deleteCharacter(): boolean {
    if (this.letters.length <= 0) {
      return false;
    }

    this.letters.pop();
    return true;
  }

  public checkResults(): Result[] {

    const currentEntry = [...this.letters];
    const wordArr = this.word.split("");
    const results: Result[] = [];

    // Check for greens
    currentEntry.forEach((character, index) => {
      if (character === wordArr[index]) {
        results[index] = Result.CORRECT;
        wordArr[index] = null;
        currentEntry[index] = null;
      }
    });

    // Check remainders for yellows
    currentEntry.forEach((character, index) => {
      if (character != null && wordArr.includes(character)) {
        results[index] = Result.MISPLACED;
        wordArr[wordArr.indexOf(character)] = null;
        currentEntry[index] = null;
      }
    });

    // Mark remainders as red
    currentEntry.forEach((character, index) => {
      if (character != null) {
        results[index] = Result.WRONG;
      }
    });

    return results;
  }
}
