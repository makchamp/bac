export interface GameState {
  state: string,
  currentRound: number,
  numOfRounds: number,
  lengthOfRound: number,
  categories: Array<string>,
  letterRotation: boolean ,
  multiScoring: boolean,
  answers: any,
};