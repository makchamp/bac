export class GameSettings {
  numOfRounds: number;
  lengthOfRound: number;
  numOfCategories: number;
  letters: {};
  letterRotation: boolean;

  constructor(
    numOfRounds: number = 3,
    lengthOfRound: number = 120,
    numOfCategories = 12,
    letterRotation: boolean = false
  ) {
    this.numOfRounds = numOfRounds;
    this.lengthOfRound = lengthOfRound;
    this.numOfCategories = numOfCategories;
    this.letterRotation = letterRotation;
    this.letters = this.generateLetters();
  }

  generateLetters() {
    const leastCommon5 = ['x', 'z', 'y', 'q', 'k'];
    const alphabet = {};
    for (let i = 97; i <= 122; i++) {
      const letter = String.fromCharCode(i);
      alphabet[letter] = {
        isActive: !leastCommon5.includes(letter),
      };
    }
    return alphabet;
  }
}
