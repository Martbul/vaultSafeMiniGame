import { Container, Text, Graphics, Sprite, Texture } from "pixi.js";
import { centerObjects } from "../utils/misc";
import { SceneUtils } from "../core/App";

export default class Game extends Container {
  name = "Game";

  private background!: Container;
  private bgSprite!: Sprite;
  private vaultDoor!: Sprite;
  private vaultHandle!: Sprite;
  private vaultBlink1!: Sprite;
  private vaultBlink2!: Sprite;
  private vaultBlink3!: Sprite;
  private doorShadow!: Sprite;
  private handleShadow!: Sprite;
  private isDoorOpen = false;

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
    this.removeChildren();

    this.setupVaultBackground();

    // this.player = new Player();
    //this.player.x = window.innerWidth / 4; // Position player to the left
    //this.player.y = window.innerHeight - this.player.height / 2;

    this.addChild(this.background);

    this.setupVaultInteraction();
  }

  private setupVaultBackground() {
    this.background = new Container();

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

    this.background.addChild(
      this.doorShadow,
      this.vaultDoor,
      this.handleShadow,
      this.vaultHandle,
      this.vaultBlink1,
      this.vaultBlink2,
      this.vaultBlink3,
    );

    this.startBlinking();
  }

  private positionRelativeToBg(bg: Sprite, offsetX: number, offsetY: number): { x: number; y: number } {
    return {
      x: bg.x + (offsetX - 0.5) * bg.width,
      y: bg.y + (offsetY - 0.5) * bg.height
    };
  }
  private startBlinking() {
    const blink = () => {
      this.vaultBlink1.alpha = this.vaultBlink1.alpha === 1 ? 0.3 : 1;
      setTimeout(blink, 800 + Math.random() * 400); // Random blink interval
    };
    blink();
  }

  private setupVaultInteraction() {
    this.vaultDoor.eventMode = 'static';
    this.vaultDoor.cursor = 'pointer';

    this.vaultDoor.on('pointerdown', () => {
      this.toggleVaultDoor();
    });

    //document.addEventListener('keydown', (e) => {
    // if (e.code === 'KeyE' && this.isPlayerNearVault()) {
    // this.toggleVaultDoor();
    //}
    //});
  }


  private toggleVaultDoor() {
    if (this.isDoorOpen) {
      this.closeDoor();
    } else {
      this.openDoor();
    }
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
  }


  //update(delta: number) {
  // const x = this.player.state.velocity.x * delta * 0.1;
  // const y = this.player.state.velocity.y * delta * 0.1;

  // if (this.background) {
  // this.background.x -= x;
  //this.background.y -= y;
  // }
  //}

  onResize(width: number, height: number) {
    // if (this.player) {
    // this.player.x = width / 4;
    //this.player.y = height - this.player.height / 2;
    //}

    if (this.vaultDoor) {
      this.vaultDoor.x = width * 0.7;
      this.vaultDoor.y = height * 0.5;

      this.doorShadow.x = this.vaultDoor.x;
      this.doorShadow.y = this.vaultDoor.y;

      this.vaultHandle.x = this.vaultDoor.x - this.vaultDoor.width * 0.2;
      this.vaultHandle.y = this.vaultDoor.y;

      this.handleShadow.x = this.vaultHandle.x;
      this.handleShadow.y = this.vaultHandle.y;

      this.vaultBlink1.x = this.vaultDoor.x;
      this.vaultBlink1.y = this.vaultDoor.y - this.vaultDoor.height * 0.4;
    }

    if (this.background && this.background.children[0]) {
      const bgSprite = this.background.children[0] as Sprite;
      bgSprite.width = width;
      bgSprite.height = height;
    }
  }
}
