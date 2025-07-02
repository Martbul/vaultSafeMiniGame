import { Container, Text, Graphics, Sprite } from "pixi.js";
import gsap from "gsap";
import { SceneUtils } from "../../core/App";
import SoundManager from "./managers/SoundManager";
import { centerObjects } from "../../utils/misc";
import GameLogicManager from "./managers/GameLogicManager";
import SceneManager from "./managers/SceneManager";
import TextUIManager from "./managers/TextUIManager";

export default class Game extends Container {
  name = "Game";

  public soundManager: SoundManager;
  public gameLogicManager: GameLogicManager;
  public sceneManager: SceneManager;
  public textUIManager: TextUIManager;

  public uiContainer!: Container;
  public background!: Container;
  public saveCurrentGuessContainer!: Container;
  public bgSprite!: Sprite;
  public vaultDoor!: Sprite;
  public vaultHandle!: Sprite;
  public vaultBlink1!: Sprite;
  public vaultBlink2!: Sprite;
  public vaultBlink3!: Sprite;
  public doorShadow!: Sprite;
  public instructionsText!: Text;
  public guessesText!: Text;
  public handleShadow!: Sprite;
  public arrowRight!: Sprite;
  public arrowLeft!: Sprite;
  public isDoorOpen = false;
  public currentHandleDeg = 0;
  public currentHandleSecretNumber = 0;
  public currentGuesses: Pair[] = [];
  public secretCombination!: Pair[];
  public blinkTimeouts: Promise<void>[] = [];
  public areBlinking = false;

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
    this.textUIManager.setupTextDisplays();

    this.addChild(this.background);

    this.sceneManager.setupArrowInteraction();
    this.textUIManager.updateGuessesDisplay();

    this.uiContainer.addChild(this.background);
    this.addChild(this.uiContainer);
  }

  private setupVaultBackground() {
    this.uiContainer = new Container();
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

  public animateHandleRotation(targetDegrees: number) {
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

  public onResize(width: number, height: number) {
    const baseWidth = 1920;
    const baseHeight = 1080;

    const scale = Math.min(width / baseWidth, height / baseHeight);
    this.uiContainer.scale.set(scale);

    this.uiContainer.x = width / 2;
    this.uiContainer.y = height / 2;

    this.uiContainer.pivot.set(baseWidth / 2, baseHeight / 2);
  }
}
