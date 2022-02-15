import { Entry } from "./Entry";
import { Result } from "./Result";

export class Entries {
  private entries: Entry[];
  private attempts: number;
  private word: string

  constructor(word: string, attempts: number) {
    this.entries = [new Entry(word)];
    this.word = word;
    this.attempts = attempts;
  }

  private getWorkingEntry(): Entry {
    return this.entries[this.entries.length - 1];
  }

  public addCharacter(c: string): boolean {
    return this.getWorkingEntry().addCharacter(c);
  }

  public deleteLastCharacter(): boolean {
    return this.getWorkingEntry().deleteCharacter();
  }

  public nextAttempt(): boolean {
    if (this.entries.length >= this.attempts) {
      return false;
    }
    this.entries.push(new Entry(this.word));
  }

  public getCurrentLength(): number {
    return this.getWorkingEntry().getLength();
  }

  public getCurrentEntry(): string[] {
    return this.getWorkingEntry().getLetters();
  }

  public getAllEntries(): string[][] {
    return this.entries.map((entry) => entry.getLetters());
  }

  public checkResults(): Result[] {
    return this.getWorkingEntry().checkResults();
  }
}
