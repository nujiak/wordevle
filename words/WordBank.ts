import { shortWords } from "./ShortWords";
import { Trie } from "./Trie";

export function isWordInWordBank(s: string) {
  return trie.search(s);
}

export function getWordOfTheDay(): string {
  const start = 1644681600000;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const index = (today.valueOf() - start) / (1000 * 60 * 60 * 24);
  return shortWords[index].toUpperCase();
}

const trie = new Trie();
const words = require('an-array-of-english-words')

for (let i = 0; i < words.length; i++) {
  const word = words[i];
  trie.insert(word);
}
