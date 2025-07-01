import Game from "../Game";

export default class GameLogicManager {
  constructor(private game: Game) { }

  public generateRandomCombination(): Pair[] {
    const pairs: Pair[] = [];

    for (let i = 0; i < 3; i++) {
      const randomNumber = Math.floor(Math.random() * 9) + 1;
      const oddOrEvenNum = Math.random();
      let rotatingDirection: RotatingDirection;

      if (oddOrEvenNum < 0.5) {
        rotatingDirection = "clockwise";
      } else {
        rotatingDirection = "counterclockwise";
      }

      const pair: Pair = {
        value: randomNumber,
        rotatingDirection: rotatingDirection,
      };

      pairs.push(pair);
    }

    return pairs;
  }

  public saveCurrentGuess() {
    if (this.game.currentGuesses.length >= 3) {
      this.game.checkCombination();
      return;
    }

    const currentGuess: Pair = {
      value: Math.abs(this.game.currentHandleSecretNumber) % 10,
      rotatingDirection:
        this.game.currentHandleDeg >= 0 ? "clockwise" : "counterclockwise",
    };

    this.game.currentGuesses.push(currentGuess);
    this.game.resetHandle();
    this.game.updateGuessesDisplay();

    if (this.game.currentGuesses.length === 3) {
      this.game.checkCombination();
    }
  }
}
