export class Triple<S, T, U> {
  readonly first: S;
  readonly second: T;
  readonly third: U;

  constructor(first: S, second: T, third: U) {
    this.first = first;
    this.second = second;
    this.third = third;
  }
}