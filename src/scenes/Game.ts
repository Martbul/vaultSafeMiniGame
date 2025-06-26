import { Container, Text, Graphics, Sprite, Texture, TextStyle } from "pixi.js";
import { centerObjects } from "../utils/misc";
import { SceneUtils } from "../core/App";
import gsap from "gsap";


type RotatingDirection = "clockwise" | "counterclockwise";

type Pair = {
  value: number,
  rotatingDirection: RotatingDirection,
}


//TODO: Make the UI responsible based on divice
//TODO: Fix prod
//TODO: Add posthood tyo track wnners, loosers, needed trys
//TODO: Delete comments
//TODO: Clean up


export default class Game extends Container {
  name = "Game";

  private background!: Container;
  private saveCurrentGuessContainer!: Container;
  private bgSprite!: Sprite;
  private vaultDoor!: Sprite;
  private vaultHandle!: Sprite;
  private vaultBlink1!: Sprite;
  private vaultBlink2!: Sprite;
  private vaultBlink3!: Sprite;
  private doorShadow!: Sprite;
  private instructionsText!: Text;
  private guessesText!: Text;
  private handleShadow!: Sprite;
  private arrowRight!: Sprite;
  private arrowLeft!: Sprite;
  private isDoorOpen = false;
  private currentHandleDeg = 0
  private currentHandleSecretNumber = 0
  private currentGuesses: Pair[] = [];
  private secretCombination!: Pair[];

  constructor(protected utils: SceneUtils) {
    super();
  }

  async load() {
    const bg = new Graphics()
      .beginFill(0x2c2c2c)
      .drawRect(0, 0, window.innerWidth, window.innerHeight);

    const text = new Text("Loading Vault Safe Game", {
      fontFamily: "Verdana",
      fontSize: 50,
      fill: "white",
    });

    text.resolution = 2;
    centerObjects(text);

    this.addChild(bg, text);

    await this.utils.assetLoader.loadAssets();
  }

  async start() {
    const randomCombination = this.generateRandomCombination();
    randomCombination.forEach((p: Pair) => console.log(p))
    this.secretCombination = randomCombination;

    this.removeChildren();

    this.setupVaultBackground();
    this.setupTextDisplays();

    this.addChild(this.background);

    this.setupArrowInteraction();
    this.updateGuessesDisplay();
  }

  private setupVaultBackground() {
    this.background = new Container();
    this.saveCurrentGuessContainer = new Container();

    const texture = Texture.from("bg");
    const bgSprite = new Sprite(texture);
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    const scaleX = screenW / texture.width;
    const scaleY = screenH / texture.height;
    const scale = Math.max(scaleX, scaleY);

    bgSprite.scale.set(scale);
    bgSprite.anchor.set(0.5);
    bgSprite.x = screenW / 2;
    bgSprite.y = screenH / 2;
    this.bgSprite = bgSprite;
    this.background.addChild(bgSprite);



    const vaultDoorTex = Texture.from("door");
    const tempDoor = new Sprite(vaultDoorTex);
    const doorScale = Math.min(
      (bgSprite.height * 0.61) / tempDoor.height,
      (bgSprite.width * 0.43) / tempDoor.width
    );

    const doorPos = this.positionRelativeToBg(bgSprite, 0.68, 0.79);
    this.vaultDoor = new Sprite(vaultDoorTex);
    this.vaultDoor.anchor.set(1);
    this.vaultDoor.x = doorPos.x;
    this.vaultDoor.y = doorPos.y;
    this.vaultDoor.scale.set(doorScale);


    const saveCurrentGuessContainerPos = this.positionRelativeToBg(bgSprite, 0.304, 0.492);
    this.saveCurrentGuessContainer.x = saveCurrentGuessContainerPos.x;
    this.saveCurrentGuessContainer.y = saveCurrentGuessContainerPos.y;
    this.saveCurrentGuessContainer.scale.set(doorScale);

    const redBackground = new Graphics();
    const width = 270;
    const height = 420;
    redBackground.beginFill(0xff0000);
    redBackground.drawRect(-width / 2, -height / 2, width, height);
    redBackground.endFill();
    this.saveCurrentGuessContainer.addChild(redBackground);
    this.saveCurrentGuessContainer.interactive = true;
    this.saveCurrentGuessContainer.on("pointerdown", () => {
      this.saveCurrentGuess();
    });
    this.background.addChild(this.saveCurrentGuessContainer);


    const doorShadowPos = this.positionRelativeToBg(bgSprite, 0.867, 0.806);
    this.doorShadow = new Sprite(Texture.from("doorOpenShadow"));
    this.doorShadow.anchor.set(1);
    this.doorShadow.x = doorShadowPos.x;
    this.doorShadow.y = doorShadowPos.y;
    this.doorShadow.scale.set(doorScale);
    this.doorShadow.visible = false;

    const handlePos = this.positionRelativeToBg(bgSprite, 0.498, 0.484);
    this.vaultHandle = new Sprite(Texture.from("handle"));
    this.vaultHandle.anchor.set(0.5);
    this.vaultHandle.x = handlePos.x;
    this.vaultHandle.y = handlePos.y;
    this.vaultHandle.scale.set(doorScale);

    const handleShadowPos = this.positionRelativeToBg(bgSprite, 0.5, 0.493);
    this.handleShadow = new Sprite(Texture.from("handleShadow"));
    this.handleShadow.anchor.set(0.5);
    this.handleShadow.x = handleShadowPos.x;
    this.handleShadow.y = handleShadowPos.y;
    this.handleShadow.scale.set(doorScale);
    this.handleShadow.visible = true;

    const blinkPos1 = this.positionRelativeToBg(bgSprite, 0.41, 0.5);
    this.vaultBlink1 = new Sprite(Texture.from("blink"));
    this.vaultBlink1.anchor.set(0.5);
    this.vaultBlink1.x = blinkPos1.x;
    this.vaultBlink1.y = blinkPos1.y;
    this.vaultBlink1.scale.set(doorScale * 0.5);
    this.vaultBlink1.visible = false;

    const blinkPos2 = this.positionRelativeToBg(bgSprite, 0.52, 0.61);
    this.vaultBlink2 = new Sprite(Texture.from("blink"));
    this.vaultBlink2.anchor.set(0.5);
    this.vaultBlink2.x = blinkPos2.x;
    this.vaultBlink2.y = blinkPos2.y;
    this.vaultBlink2.scale.set(doorScale * 0.5);
    this.vaultBlink2.visible = false;

    const blinkPos3 = this.positionRelativeToBg(bgSprite, 0.48, 0.5);
    this.vaultBlink3 = new Sprite(Texture.from("blink"));
    this.vaultBlink3.anchor.set(0.5);
    this.vaultBlink3.x = blinkPos3.x;
    this.vaultBlink3.y = blinkPos3.y;
    this.vaultBlink3.scale.set(doorScale * 0.5);
    this.vaultBlink3.visible = false;

    const arrowRightPos = this.positionRelativeToBg(bgSprite, 0.583, 0.49);
    this.arrowRight = new Sprite(Texture.from("rightrotatearrow"));
    this.arrowRight.anchor.set(0.5);
    this.arrowRight.x = arrowRightPos.x;
    this.arrowRight.y = arrowRightPos.y;
    this.arrowRight.scale.set(doorScale * 0.55);
    this.arrowRight.rotation = 105 * (Math.PI / 180);


    const arrowLeftPos = this.positionRelativeToBg(bgSprite, 0.41, 0.49);
    this.arrowLeft = new Sprite(Texture.from("rightrotatearrow"));
    this.arrowLeft.anchor.set(0.5);
    this.arrowLeft.x = arrowLeftPos.x;
    this.arrowLeft.y = arrowLeftPos.y;
    this.arrowLeft.scale.set(doorScale * 0.55);
    this.arrowLeft.scale.x *= -1;
    this.arrowLeft.rotation = 240 * (Math.PI / 180);

    this.background.addChild(
      this.doorShadow,
      this.vaultDoor,
      this.handleShadow,
      this.vaultHandle,
      this.vaultBlink1,
      this.vaultBlink2,
      this.vaultBlink3,
      this.arrowRight,
      this.arrowLeft,
    );

  }

  private positionRelativeToBg(bg: Sprite, offsetX: number, offsetY: number): { x: number; y: number } {
    return {
      x: bg.x + (offsetX - 0.5) * bg.width,
      y: bg.y + (offsetY - 0.5) * bg.height
    };
  }

  private setupTextDisplays() {

    const instructionsTextStyle = new TextStyle({
      fontFamily: "Arial",
      fontSize: 24,
      fill: "#ffffff",
      align: "left",
      wordWrap: true,
      wordWrapWidth: 300,
      lineHeight: 30
    });

    this.instructionsText = new Text("HOW TO PLAY:\n\n• Use arrows to rotate handle\n• Each number needs specific rotation direction\n• Click red button to save your guess\n• Find the 3-number combination\n• Open the vault to win!", instructionsTextStyle);
    this.instructionsText.resolution = 2;

    const instructionsPos = this.positionRelativeToBg(this.bgSprite, 0.15, 0.5);
    this.instructionsText.x = instructionsPos.x;
    this.instructionsText.y = instructionsPos.y;
    this.instructionsText.anchor.set(0.5);

    const guessesTextStyle = new TextStyle({
      fontFamily: "Arial",
      fontSize: 22,
      fill: "#00ff00",
      align: "left",
      wordWrap: true,
      wordWrapWidth: 280,
      lineHeight: 28
    });
    this.guessesText = new Text("", guessesTextStyle);
    this.guessesText.resolution = 2;

    const guessesPos = this.positionRelativeToBg(this.bgSprite, 0.85, 0.5);
    this.guessesText.x = guessesPos.x;
    this.guessesText.y = guessesPos.y;
    this.guessesText.anchor.set(0.5);

    this.background.addChild(this.instructionsText, this.guessesText);
  }

  private updateGuessesDisplay() {
    let displayText = "CURRENT STATE:\n\n";

    if (this.currentGuesses.length === 0) {
      displayText += "No guesses yet...\n\n";
    } else {
      displayText += "Your Guesses:\n";
      this.currentGuesses.forEach((guess, index) => {
        const direction = guess.rotatingDirection === "clockwise" ? "→" : "←";
        displayText += `${index + 1}. ${guess.value} ${direction}\n`;
      });
      displayText += "\n";
    }

    displayText += `Current Handle:\nNumber: ${Math.abs(this.currentHandleSecretNumber) % 10}\nRotation: ${this.currentHandleDeg}°`;

    if (this.currentGuesses.length < 3) {
      displayText += `\n\nNeed ${3 - this.currentGuesses.length} more guess(es)`;
    } else {
      displayText += "\n\nReady to check combination!";
    }

    this.guessesText.text = displayText;
  }

  private saveCurrentGuess() {
    if (this.currentGuesses.length >= 3) {
      this.checkCombination();
      return;
    }

    const currentGuess: Pair = {
      value: Math.abs(this.currentHandleSecretNumber) % 10,
      rotatingDirection: this.currentHandleDeg >= 0 ? "clockwise" : "counterclockwise"
    };

    this.currentGuesses.push(currentGuess);
    this.resetHandle();
    this.updateGuessesDisplay();

    if (this.currentGuesses.length === 3) {
      this.checkCombination();
    }
  }

  private checkCombination() {
    let isCorrect = true;

    for (let i = 0; i < 3; i++) {
      if (this.currentGuesses[i].value !== this.secretCombination[i].value ||
        this.currentGuesses[i].rotatingDirection !== this.secretCombination[i].rotatingDirection) {
        isCorrect = false;
        break;
      }
    }

    if (isCorrect) {
      this.openDoor();
      this.guessesText.text = "SUCCESS!\n\nVault Opened!\n\nCongratulations!";
      this.guessesText.style.fill = "#ffff00";
    } else {
      this.currentGuesses = [];
      this.resetHandle();
      this.updateGuessesDisplay();

      //const originalText = this.guessesText.text;
      this.guessesText.text = "WRONG COMBINATION!\n\nTry again...";
      this.guessesText.style.fill = "#ff0000";

      setTimeout(() => {
        this.guessesText.style.fill = "#00ff00";
        this.updateGuessesDisplay();
      }, 2000);
    }
  }

  // private startBlinking() {
  //  const blink = () => {
  //   this.vaultBlink1.alpha = this.vaultBlink1.alpha === 1 ? 0.3 : 1;
  //  setTimeout(blink, 800 + Math.random() * 400);
  //};
  //blink();
  //}

  private setupArrowInteraction() {
    this.arrowLeft.eventMode = "static";
    this.arrowLeft.cursor = 'pointer';
    this.arrowRight.eventMode = "static";
    this.arrowRight.cursor = 'pointer';

    this.arrowRight.on("pointerdown", () => {
      this.currentHandleDeg += 60;
      this.currentHandleSecretNumber += 1;

      this.animateHandleRotation(this.currentHandleDeg);
    });

    this.arrowLeft.on("pointerdown", () => {
      this.currentHandleDeg -= 60;
      this.currentHandleSecretNumber -= 1;

      this.animateHandleRotation(this.currentHandleDeg);
    });
  }

  private resetHandle() {
    this.currentHandleDeg = 0;
    this.currentHandleSecretNumber = 0;
    this.animateHandleRotation(0);
    this.closeDoor();
  }

  private animateHandleRotation(targetDegrees: number) {
    const targetRadians = targetDegrees * (Math.PI / 180);

    gsap.to(this.vaultHandle, {
      rotation: targetRadians,
      duration: 0.5,
      ease: "back.out(1.2)",

    });

    gsap.to(this.handleShadow, {
      rotation: targetRadians,
      duration: 0.5,
      ease: "back.out(1.2)"
    });
  }

  private openDoor() {
    this.isDoorOpen = true;
    this.vaultDoor.texture = Texture.from("doorOpen");

    const openPos = this.positionRelativeToBg(this.bgSprite, 0.845, 0.79);
    this.vaultDoor.x = openPos.x;
    this.vaultDoor.y = openPos.y;

    this.doorShadow.visible = true;
    this.handleShadow.visible = false;
    this.vaultHandle.visible = false;
    this.vaultBlink1.visible = true;
    this.vaultBlink2.visible = true;
    this.vaultBlink3.visible = true;
    this.arrowLeft.visible = false;
    this.arrowRight.visible = false;
  }

  private closeDoor() {
    this.isDoorOpen = false;
    this.vaultDoor.texture = Texture.from("door");

    const closedPos = this.positionRelativeToBg(this.bgSprite, 0.68, 0.79);
    this.vaultDoor.x = closedPos.x;
    this.vaultDoor.y = closedPos.y;

    this.doorShadow.visible = false;
    this.handleShadow.visible = true;
    this.vaultHandle.visible = true;
    this.vaultBlink1.visible = false;
    this.vaultBlink2.visible = false;
    this.vaultBlink3.visible = false;
    this.arrowRight.visible = true;
    this.arrowLeft.visible = true;
  }


  onResize(width: number, height: number) {
    if (this.bgSprite) {
      const scaleX = width / this.bgSprite.texture.width;
      const scaleY = height / this.bgSprite.texture.height;
      const scale = Math.max(scaleX, scaleY);

      this.bgSprite.scale.set(scale);
      this.bgSprite.x = width / 2;
      this.bgSprite.y = height / 2;

      const doorScale = Math.min(
        (this.bgSprite.height * 0.61) / this.vaultDoor.texture.height,
        (this.bgSprite.width * 0.43) / this.vaultDoor.texture.width
      );

      if (this.vaultDoor) {
        const doorPos = this.isDoorOpen ?
          this.positionRelativeToBg(this.bgSprite, 0.845, 0.79) :
          this.positionRelativeToBg(this.bgSprite, 0.68, 0.79);
        this.vaultDoor.x = doorPos.x;
        this.vaultDoor.y = doorPos.y;
        this.vaultDoor.scale.set(doorScale);
      }

      if (this.doorShadow) {
        const doorShadowPos = this.positionRelativeToBg(this.bgSprite, 0.867, 0.806);
        this.doorShadow.x = doorShadowPos.x;
        this.doorShadow.y = doorShadowPos.y;
        this.doorShadow.scale.set(doorScale);
      }

      if (this.vaultHandle) {
        const handlePos = this.positionRelativeToBg(this.bgSprite, 0.498, 0.484);
        this.vaultHandle.x = handlePos.x;
        this.vaultHandle.y = handlePos.y;
        this.vaultHandle.scale.set(doorScale);
      }

      if (this.handleShadow) {
        const handleShadowPos = this.positionRelativeToBg(this.bgSprite, 0.5, 0.493);
        this.handleShadow.x = handleShadowPos.x;
        this.handleShadow.y = handleShadowPos.y;
        this.handleShadow.scale.set(doorScale);
      }

      if (this.vaultBlink1) {
        const blinkPos1 = this.positionRelativeToBg(this.bgSprite, 0.41, 0.5);
        this.vaultBlink1.x = blinkPos1.x;
        this.vaultBlink1.y = blinkPos1.y;
        this.vaultBlink1.scale.set(doorScale * 0.5);
      }

      if (this.vaultBlink2) {
        const blinkPos2 = this.positionRelativeToBg(this.bgSprite, 0.52, 0.61);
        this.vaultBlink2.x = blinkPos2.x;
        this.vaultBlink2.y = blinkPos2.y;
        this.vaultBlink2.scale.set(doorScale * 0.5);
      }

      if (this.vaultBlink3) {
        const blinkPos3 = this.positionRelativeToBg(this.bgSprite, 0.48, 0.5);
        this.vaultBlink3.x = blinkPos3.x;
        this.vaultBlink3.y = blinkPos3.y;
        this.vaultBlink3.scale.set(doorScale * 0.5);
      }

      if (this.arrowRight) {
        const arrowRightPos = this.positionRelativeToBg(this.bgSprite, 0.583, 0.49);
        this.arrowRight.x = arrowRightPos.x;
        this.arrowRight.y = arrowRightPos.y;
        this.arrowRight.scale.set(doorScale * 0.55);
      }

      if (this.arrowLeft) {
        const arrowLeftPos = this.positionRelativeToBg(this.bgSprite, 0.41, 0.49);
        this.arrowLeft.x = arrowLeftPos.x;
        this.arrowLeft.y = arrowLeftPos.y;
        this.arrowLeft.scale.set(doorScale * 0.55);
        this.arrowLeft.scale.x = -doorScale * 0.55;
      }

      if (this.saveCurrentGuessContainer) {
        const saveCurrentGuessContainerPos = this.positionRelativeToBg(this.bgSprite, 0.304, 0.492);
        this.saveCurrentGuessContainer.x = saveCurrentGuessContainerPos.x;
        this.saveCurrentGuessContainer.y = saveCurrentGuessContainerPos.y;
        this.saveCurrentGuessContainer.scale.set(doorScale);
      }

      if (this.instructionsText) {
        const instructionsPos = this.positionRelativeToBg(this.bgSprite, 0.15, 0.5);
        this.instructionsText.x = instructionsPos.x;
        this.instructionsText.y = instructionsPos.y;

        const textScale = Math.min(width / 1920, height / 1080) * 1.2;
        this.instructionsText.style.fontSize = Math.max(16, 24 * textScale);
        this.instructionsText.style.wordWrapWidth = Math.max(200, 300 * textScale);
      }

      if (this.guessesText) {
        const guessesPos = this.positionRelativeToBg(this.bgSprite, 0.85, 0.5);
        this.guessesText.x = guessesPos.x;
        this.guessesText.y = guessesPos.y;

        const textScale = Math.min(width / 1920, height / 1080) * 1.2;
        this.guessesText.style.fontSize = Math.max(14, 22 * textScale);
        this.guessesText.style.wordWrapWidth = Math.max(180, 280 * textScale);
      }
    }
  }

  private generateRandomCombination(): Pair[] {
    let pairs: Pair[] = [];

    for (let i = 0; i < 3; i++) {
      const randomNumber = Math.floor(Math.random() * 9) + 1;
      const oddOrEvenNum = Math.random();
      let rotatingDirection: RotatingDirection;

      if (oddOrEvenNum % 2 == 0) {
        rotatingDirection = "clockwise"
      } else {
        rotatingDirection = "counterclockwise"
      }

      const pair: Pair = {
        value: randomNumber,
        rotatingDirection: rotatingDirection
      }

      pairs.push(pair)
    }

    return pairs;
  }

}
