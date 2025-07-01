import { Text, TextStyle } from "pixi.js";
import Game from "../Game";

export default class TextUIManager {
  constructor(private game: Game) { }

  public setupTextDisplays() {
    const instructionsTextStyle = new TextStyle({
      fontSize: 24,
      fill: ["ffffff"],
      align: "left",
      wordWrap: true,
      wordWrapWidth: 340,
      lineHeight: 32,
      dropShadow: true,
      dropShadowColor: "#000000",
      dropShadowBlur: 8,
      dropShadowAngle: Math.PI / 4,
      dropShadowDistance: 6,
      stroke: "#003300",
      strokeThickness: 4,
      letterSpacing: 1,
    });

    this.game.instructionsText = new Text(
      "HOW TO PLAY:\n\n• Find the 3 number and rotation combination\n• Click on the keypad to save your guess",
      instructionsTextStyle,
    );
    this.game.instructionsText.resolution = 2;

    const instructionsPos = this.game.sceneManager.positionRelativeToBg(
      this.game.bgSprite,
      0.15,
      0.5,
    );
    this.game.instructionsText.x = instructionsPos.x;
    this.game.instructionsText.y = instructionsPos.y;
    this.game.instructionsText.anchor.set(0.5);

    const guessesTextStyle = new TextStyle({
      fontFamily: "Impact",
      fontSize: 34,
      fill: ["ffffff"],
      align: "left",
      wordWrap: true,
      wordWrapWidth: 340,
      lineHeight: 42,
      dropShadow: true,
      dropShadowColor: "#000000",
      dropShadowBlur: 8,
      dropShadowAngle: Math.PI / 4,
      dropShadowDistance: 6,
      stroke: "#003300",
      strokeThickness: 4,
      letterSpacing: 1,
    });
    this.game.guessesText = new Text("", guessesTextStyle);
    this.game.guessesText.resolution = 2;

    const guessesPos = this.game.sceneManager.positionRelativeToBg(
      this.game.bgSprite,
      0.85,
      0.5,
    );
    this.game.guessesText.x = guessesPos.x;
    this.game.guessesText.y = guessesPos.y;
    this.game.guessesText.anchor.set(0.5);

    this.game.background.addChild(
      this.game.instructionsText,
      this.game.guessesText,
    );
  }

  public updateGuessesDisplay() {
    let displayText = "";

    displayText += `\n${3 - this.game.currentGuesses.length} MORE ROTATIONS`;

    this.game.guessesText.text = displayText;
  }
}
