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

  public saveCurrentGuess() {
    if (this.game.currentGuesses.length >= 3) {
      this.game.gameLogicManager.checkCombination();
      return;
    }

    const currentGuess: Pair = {
      value: Math.abs(this.game.currentHandleSecretNumber) % 10,
      rotatingDirection:
        this.game.currentHandleDeg >= 0 ? "clockwise" : "counterclockwise",
    };

    this.game.currentGuesses.push(currentGuess);
    this.resetHandle();
    this.game.textUIManager.updateGuessesDisplay();

    if (this.game.currentGuesses.length === 3) {
      this.checkCombination();
    }
  }

  public resetHandle() {
    this.game.currentHandleDeg = 0;
    this.game.currentHandleSecretNumber = 0;
    this.game.animateHandleRotation(0);
    this.game.sceneManager.closeDoor();
  }

  public checkCombination() {
    let isCorrect = true;

    for (let i = 0; i < 3; i++) {
      if (
        this.game.currentGuesses[i].value !==
        this.game.secretCombination[i].value ||
        this.game.currentGuesses[i].rotatingDirection !==
        this.game.secretCombination[i].rotatingDirection
      ) {
        isCorrect = false;
        break;
      }
    }

    if (isCorrect) {
      this.game.sceneManager.openDoor();
      this.game.guessesText.visible = false;
      this.game.sceneManager.startBlinking();

      wait(5000).then(() => {
        this.game.sceneManager.closeDoor();
        this.game.sceneManager.stopBlinking();
        //   this.playResetDoorHandleSound();

        const targetRadians = 700 * (Math.PI / 180);
        gsap.to(this.game.vaultHandle, {
          rotation: targetRadians,
          duration: 2.4,
          ease: "back.out(1.2)",
        });

        gsap.to(this.game.handleShadow, {
          rotation: targetRadians,
          duration: 2.4,
          ease: "back.out(1.2)",
        });

        this.game.currentGuesses = [];

        wait(1000).then(() => {
          this.game.textUIManager.updateGuessesDisplay();
          this.game.guessesText.visible = true;

          this.game.guessesText.style.fill = "#ffffff";
          console.log("Generated new combination");
          const randomCombination =
            this.game.gameLogicManager.generateRandomCombination();
          this.game.secretCombination = randomCombination;
          randomCombination.forEach((p: Pair) => console.log(p));
        });
      });
    } else {
      this.game.soundManager.playLockedSound();
      this.game.currentGuesses = [];
      this.game.gameLogicManager.resetHandle();
      this.game.textUIManager.updateGuessesDisplay();
      console.log("Generated new combination");
      const randomCombination =
        this.game.gameLogicManager.generateRandomCombination();
      this.game.secretCombination = randomCombination;
      randomCombination.forEach((p: Pair) => console.log(p));
      wait(2000).then(() => {
        this.game.guessesText.style.fill = "#ffffff";
        this.game.textUIManager.updateGuessesDisplay();
      });
    }
  }
}
