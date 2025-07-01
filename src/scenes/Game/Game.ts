import { Container, Text, Graphics, Sprite, Texture, TextStyle } from "pixi.js";
import gsap from "gsap";
import { SceneUtils } from "../../core/App";
import SoundManager from "./managers/SoundManager";
import { centerObjects } from "../../utils/misc";
import GameLogicManager from "./managers/GameLogicManager";
import SceneManager from "./managers/SceneManager";
import TextUIManager from "./managers/TextUIManager";
export default class Game extends Container {
  name = "Game";

  private soundManager: SoundManager;
  private gameLogicManager: GameLogicManager;
  private sceneManager: SceneManager;
  private textUIManager: TextUIManager;

  public background!: Container;
  public saveCurrentGuessContainer!: Container;
  private bgSprite!: Sprite;
  private vaultDoor!: Sprite;
  private vaultHandle!: Sprite;
  public vaultBlink1!: Sprite;
  public vaultBlink2!: Sprite;
  public vaultBlink3!: Sprite;
  private doorShadow!: Sprite;
  private instructionsText!: Text;
  private guessesText!: Text;
  private handleShadow!: Sprite;
  private arrowRight!: Sprite;
  private arrowLeft!: Sprite;
  private isDoorOpen = false;
  public currentHandleDeg = 0;
  public currentHandleSecretNumber = 0;
  public currentGuesses: Pair[] = [];
  private secretCombination!: Pair[];
  public blinkTimeouts: number[] = [];

  constructor(protected utils: SceneUtils) {
    super();
    this.soundManager = new SoundManager();
    this.gameLogicManager = new GameLogicManager(this);
    this.sceneManager = new SceneManager(this);
    this.textUIManager = new TextUIManager(this);
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
    console.log("Generated new combination");
    const randomCombination = this.gameLogicManager.generateRandomCombination();
    randomCombination.forEach((p: Pair) => console.log(p));
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

    const bgSprite = this.sceneManager.getBackgroundSprite();
    this.bgSprite = bgSprite;

    const vaultDoor = this.sceneManager.getVaultDoor();
    this.vaultDoor = vaultDoor;

    this.sceneManager.setUpSaveCurrGuessContainer();
    this.saveCurrentGuessContainer.on("pointerdown", () => {
      this.soundManager.playClickingSound();
      this.gameLogicManager.saveCurrentGuess();
    });

    const doorShadow = this.sceneManager.getDoorShadow();
    this.doorShadow = doorShadow;

    const vaultHandle = this.sceneManager.getVaultHandle();
    this.vaultHandle = vaultHandle;

    const handleShadow = this.sceneManager.getHandleShadow();
    this.handleShadow = handleShadow;

    const vaultBlinks = this.sceneManager.getVaultBlinks();
    this.vaultBlink1 = vaultBlinks.blink1;
    this.vaultBlink2 = vaultBlinks.blink2;
    this.vaultBlink3 = vaultBlinks.blink3;

    const arrowRight = this.sceneManager.getArrowRight();
    this.arrowRight = arrowRight;

    const arrowLeft = this.sceneManager.getArrowLeft();
    this.arrowLeft = arrowLeft;

    this.background.addChild(
      this.bgSprite,
      this.doorShadow,
      this.vaultDoor,
      this.saveCurrentGuessContainer,
      this.handleShadow,
      this.vaultHandle,
      this.arrowLeft,
      this.arrowRight,
      this.vaultBlink1,
      this.vaultBlink2,
      this.vaultBlink3,
    );
  }

  private setupTextDisplays() {
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

    this.instructionsText = new Text(
      "HOW TO PLAY:\n\n• Find the 3 number and rotation combination\n• Click on the keypad to save your guess",
      instructionsTextStyle,
    );
    this.instructionsText.resolution = 2;

    const instructionsPos = this.sceneManager.positionRelativeToBg(
      this.bgSprite,
      0.15,
      0.5,
    );
    this.instructionsText.x = instructionsPos.x;
    this.instructionsText.y = instructionsPos.y;
    this.instructionsText.anchor.set(0.5);

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
    this.guessesText = new Text("", guessesTextStyle);
    this.guessesText.resolution = 2;

    const guessesPos = this.sceneManager.positionRelativeToBg(
      this.bgSprite,
      0.85,
      0.5,
    );
    this.guessesText.x = guessesPos.x;
    this.guessesText.y = guessesPos.y;
    this.guessesText.anchor.set(0.5);

    this.background.addChild(this.instructionsText, this.guessesText);
  }

  public updateGuessesDisplay() {
    let displayText = "";

    displayText += `\n${3 - this.currentGuesses.length} MORE ROTATIONS`;

    this.guessesText.text = displayText;
  }
  public checkCombination() {
    let isCorrect = true;

    for (let i = 0; i < 3; i++) {
      if (
        this.currentGuesses[i].value !== this.secretCombination[i].value ||
        this.currentGuesses[i].rotatingDirection !==
        this.secretCombination[i].rotatingDirection
      ) {
        isCorrect = false;
        break;
      }
    }

    if (isCorrect) {
      this.openDoor();
      this.guessesText.visible = false;
      this.sceneManager.startBlinking();

      new Promise((resolve) => setTimeout(resolve, 5000)).then(() => {
        this.closeDoor();
        this.sceneManager.stopBlinking();
        //   this.playResetDoorHandleSound();

        const targetRadians = 700 * (Math.PI / 180);
        gsap.to(this.vaultHandle, {
          rotation: targetRadians,
          duration: 2.4,
          ease: "back.out(1.2)",
        });

        gsap.to(this.handleShadow, {
          rotation: targetRadians,
          duration: 2.4,
          ease: "back.out(1.2)",
        });

        this.currentGuesses = [];

        new Promise((resolve) => setTimeout(resolve, 1000)).then(() => {
          this.updateGuessesDisplay();
          this.guessesText.visible = true;

          this.guessesText.style.fill = "#ffffff";
          console.log("Generated new combination");
          const randomCombination =
            this.gameLogicManager.generateRandomCombination();
          this.secretCombination = randomCombination;
          randomCombination.forEach((p: Pair) => console.log(p));
        });
      });
    } else {
      this.soundManager.playLockedSound();
      this.currentGuesses = [];
      this.resetHandle();
      this.updateGuessesDisplay();
      console.log("Generated new combination");
      const randomCombination =
        this.gameLogicManager.generateRandomCombination();
      this.secretCombination = randomCombination;
      randomCombination.forEach((p: Pair) => console.log(p));
      setTimeout(() => {
        this.guessesText.style.fill = "#ffffff";
        this.updateGuessesDisplay();
      }, 2000);
    }
  }

  private setupArrowInteraction() {
    this.arrowLeft.eventMode = "static";
    this.arrowLeft.cursor = "pointer";
    this.arrowRight.eventMode = "static";
    this.arrowRight.cursor = "pointer";

    this.arrowRight.on("pointerdown", () => {
      this.currentHandleDeg += 60;
      this.currentHandleSecretNumber += 1;

      this.soundManager.playHandleRotatingSound();

      this.animateHandleRotation(this.currentHandleDeg);
    });

    this.arrowLeft.on("pointerdown", () => {
      this.currentHandleDeg -= 60;
      this.currentHandleSecretNumber -= 1;

      this.soundManager.playHandleRotatingSound();
      this.animateHandleRotation(this.currentHandleDeg);
    });
  }

  public resetHandle() {
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
      ease: "back.out(1.2)",
    });
  }

  private openDoor() {
    this.isDoorOpen = true;
    this.vaultDoor.texture = Texture.from("doorOpen");

    const openPos = this.sceneManager.positionRelativeToBg(
      this.bgSprite,
      0.845,
      0.79,
    );
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

    this.soundManager.playDoorOpenSound();
  }

  private closeDoor() {
    this.isDoorOpen = false;
    this.vaultDoor.texture = Texture.from("door");

    const closedPos = this.sceneManager.positionRelativeToBg(
      this.bgSprite,
      0.68,
      0.79,
    );
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
        (this.bgSprite.width * 0.43) / this.vaultDoor.texture.width,
      );

      if (this.vaultDoor) {
        const doorPos = this.isDoorOpen
          ? this.sceneManager.positionRelativeToBg(this.bgSprite, 0.845, 0.79)
          : this.sceneManager.positionRelativeToBg(this.bgSprite, 0.68, 0.79);
        this.vaultDoor.x = doorPos.x;
        this.vaultDoor.y = doorPos.y;
        this.vaultDoor.scale.set(doorScale);
      }

      if (this.doorShadow) {
        const doorShadowPos = this.sceneManager.positionRelativeToBg(
          this.bgSprite,
          0.867,
          0.806,
        );
        this.doorShadow.x = doorShadowPos.x;
        this.doorShadow.y = doorShadowPos.y;
        this.doorShadow.scale.set(doorScale);
      }

      if (this.vaultHandle) {
        const handlePos = this.sceneManager.positionRelativeToBg(
          this.bgSprite,
          0.498,
          0.484,
        );
        this.vaultHandle.x = handlePos.x;
        this.vaultHandle.y = handlePos.y;
        this.vaultHandle.scale.set(doorScale);
      }

      if (this.handleShadow) {
        const handleShadowPos = this.sceneManager.positionRelativeToBg(
          this.bgSprite,
          0.5,
          0.493,
        );
        this.handleShadow.x = handleShadowPos.x;
        this.handleShadow.y = handleShadowPos.y;
        this.handleShadow.scale.set(doorScale);
      }

      if (this.vaultBlink1) {
        const blinkPos1 = this.sceneManager.positionRelativeToBg(
          this.bgSprite,
          0.41,
          0.5,
        );
        this.vaultBlink1.x = blinkPos1.x;
        this.vaultBlink1.y = blinkPos1.y;
        this.vaultBlink1.scale.set(doorScale * 0.5);
      }

      if (this.vaultBlink2) {
        const blinkPos2 = this.sceneManager.positionRelativeToBg(
          this.bgSprite,
          0.52,
          0.61,
        );
        this.vaultBlink2.x = blinkPos2.x;
        this.vaultBlink2.y = blinkPos2.y;
        this.vaultBlink2.scale.set(doorScale * 0.5);
      }

      if (this.vaultBlink3) {
        const blinkPos3 = this.sceneManager.positionRelativeToBg(
          this.bgSprite,
          0.48,
          0.5,
        );
        this.vaultBlink3.x = blinkPos3.x;
        this.vaultBlink3.y = blinkPos3.y;
        this.vaultBlink3.scale.set(doorScale * 0.5);
      }

      if (this.arrowRight) {
        const arrowRightPos = this.sceneManager.positionRelativeToBg(
          this.bgSprite,
          0.583,
          0.49,
        );
        this.arrowRight.x = arrowRightPos.x;
        this.arrowRight.y = arrowRightPos.y;
        this.arrowRight.scale.set(doorScale * 0.55);
      }

      if (this.arrowLeft) {
        const arrowLeftPos = this.sceneManager.positionRelativeToBg(
          this.bgSprite,
          0.41,
          0.49,
        );
        this.arrowLeft.x = arrowLeftPos.x;
        this.arrowLeft.y = arrowLeftPos.y;
        this.arrowLeft.scale.set(doorScale * 0.55);
        this.arrowLeft.scale.x = -doorScale * 0.55;
      }

      if (this.saveCurrentGuessContainer) {
        const saveCurrentGuessContainerPos =
          this.sceneManager.positionRelativeToBg(this.bgSprite, 0.304, 0.492);
        this.saveCurrentGuessContainer.x = saveCurrentGuessContainerPos.x;
        this.saveCurrentGuessContainer.y = saveCurrentGuessContainerPos.y;
        this.saveCurrentGuessContainer.scale.set(doorScale);
      }

      if (this.instructionsText) {
        const instructionsPos = this.sceneManager.positionRelativeToBg(
          this.bgSprite,
          0.15,
          0.5,
        );
        this.instructionsText.x = instructionsPos.x;
        this.instructionsText.y = instructionsPos.y;

        const textScale = Math.min(width / 1920, height / 1080) * 1.2;
        this.instructionsText.style.fontSize = Math.max(16, 24 * textScale);
        this.instructionsText.style.wordWrapWidth = Math.max(
          200,
          300 * textScale,
        );
      }

      if (this.guessesText) {
        const guessesPos = this.sceneManager.positionRelativeToBg(
          this.bgSprite,
          0.85,
          0.5,
        );
        this.guessesText.x = guessesPos.x;
        this.guessesText.y = guessesPos.y;

        const textScale = Math.min(width / 1920, height / 1080) * 1.2;
        this.guessesText.style.fontSize = Math.max(14, 22 * textScale);
        this.guessesText.style.wordWrapWidth = Math.max(180, 280 * textScale);
      }
    }
  }
}
