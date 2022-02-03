import { Trie } from "./Trie";

export function isWordInWordBank(s: string) {
  return trie.search(s);
}

const trie = new Trie();
const words = require('an-array-of-english-words')

for (let i = 0; i < words.length; i++) {
  trie.insert(words[i]);
}
