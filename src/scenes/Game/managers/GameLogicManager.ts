import gsap from "gsap";
import Game from "../Game";
import { wait } from "../../../utils/misc";

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

  public resetHandle() {
    this.game.currentHandleDeg = 0;
    this.game.currentHandleSecretNumber = 0;
    this.game.sceneManager.animateHandleRotation(0);
    this.game.sceneManager.closeDoorWrongGuess();
  }


  public resetHandleCrazy(radians: number) {
    this.game.currentHandleDeg = 0;
    this.game.currentHandleSecretNumber = 0;
    this.game.sceneManager.animateHandleRotationCrazy(radians);
    this.game.sceneManager.closeDoorWrongGuess();
  }



  public checkCombination(guessNum: number) {
    const currentGuess: Pair = {
      value: Math.abs(this.game.currentHandleSecretNumber) % 10,
      rotatingDirection:
        this.game.currentHandleDeg >= 0 ? "clockwise" : "counterclockwise",
    };

    if (!this.game.currentGuess) {
      this.game.currentGuess = { value: 0, rotatingDirection: "clockwise" };
    }

    this.game.currentGuess.rotatingDirection = currentGuess.rotatingDirection;
    this.game.currentGuess.value = currentGuess.value;

    if (this.game.secretCombination[guessNum].value === this.game.currentGuess.value &&
      this.game.secretCombination[guessNum].rotatingDirection === this.game.currentGuess.rotatingDirection &&
      this.game.guessesMade !== 2) {
      this.game.guessesMade++;
      this.resetHandle();
    } else if (this.game.secretCombination[guessNum].value === this.game.currentGuess.value &&
      this.game.secretCombination[guessNum].rotatingDirection === this.game.currentGuess.rotatingDirection &&
      this.game.guessesMade === 2) {
      this.game.sceneManager.openDoor();
      this.game.sceneManager.startBlinking();

      wait(5000).then(() => {
        this.game.sceneManager.closeDoor();
        this.game.sceneManager.stopBlinking();
        this.game.currentGuess = { value: 0, rotatingDirection: "clockwise" };

        wait(2000).then(() => {
          this.resetHandle();
          const targetRadians = 700 * (Math.PI / 180);
          gsap.to([this.game.vaultHandle, this.game.handleShadow], {
            rotation: targetRadians,
            duration: 3.4,
            ease: "back.out(1.2)",
          });
        });

        wait(1300).then(() => {
          this.game.guessesMade = 0;
          console.log("Generated new combination");
          const randomCombination = this.game.gameLogicManager.generateRandomCombination();
          this.game.secretCombination = randomCombination;
          randomCombination.forEach((p: Pair) => console.log(p));
        });
      });
    } else {
      const targetRadians = 400 * (Math.PI);
      this.resetHandleCrazy(targetRadians);
      this.game.soundManager.playLockedSound();
      this.game.guessesMade = 0;
      console.log("Generated new combination");
      const randomCombination = this.game.gameLogicManager.generateRandomCombination();
      this.game.secretCombination = randomCombination;
      randomCombination.forEach((p: Pair) => console.log(p));

    }


  }
}
