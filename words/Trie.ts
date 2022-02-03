class TrieNode {
  private children: TrieNode[];
  private isWord: boolean;

  constructor() {
    this.children = [];
    this.isWord = false;
  }

  search (s: string, i: number): boolean {
    if (i == s.length) {
      return this.isWord;
    }

    const charCode: number = s.charCodeAt(i) - 97;

    if (this.children[charCode] == null) {
      return false;
    }

    return this.children[charCode].search(s, i + 1);
  }

  insert(s: string, i: number) {
    if (i == s.length) {
      this.isWord = true;
      return;
    }

    const charCode: number = s.charCodeAt(i) - 97;

    if (this.children[charCode] == null) {
      this.children[charCode] = new TrieNode();
    }

    this.children[charCode].insert(s, i + 1);
  }
}

export class Trie {

  private root: TrieNode;

  constructor() {
    this.root = new TrieNode();
  }

  search(s: string): boolean {
    return this.root.search(s, 0);
  }

  insert(s: string) {
    this.root.insert(s, 0);
  }
}

const trie = new Trie();

trie.insert("hello");
