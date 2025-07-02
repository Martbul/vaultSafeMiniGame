import { Rectangle, Sprite, Texture } from "pixi.js";
import Game from "../Game";
import gsap from "gsap";
import { wait } from "../../../utils/misc";

export default class SceneManager {
  private bgSprite!: Sprite;
  private doorScale!: number;

  constructor(private game: Game) { }

  public positionRelativeToBg(
    bg: Sprite,
    offsetX: number,
    offsetY: number,
  ): { x: number; y: number } {
    return {
      x: bg.x + (offsetX - 0.5) * bg.width,
      y: bg.y + (offsetY - 0.5) * bg.height,
    };
  }

  public getBackgroundSprite(): Sprite {
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
    return bgSprite;
  }

  public getVaultDoor(): Sprite {
    const vaultDoorTex = Texture.from("door");
    const tempDoor = new Sprite(vaultDoorTex);
    const doorScale = Math.min(
      (this.bgSprite.height * 0.61) / tempDoor.height,
      (this.bgSprite.width * 0.43) / tempDoor.width,
    );
    this.doorScale = doorScale;

    const doorPos = this.positionRelativeToBg(this.bgSprite, 0.68, 0.79);
    const vaultDoor = new Sprite(vaultDoorTex);
    vaultDoor.anchor.set(1);
    vaultDoor.x = doorPos.x;
    vaultDoor.y = doorPos.y;
    vaultDoor.scale.set(doorScale);
    return vaultDoor;
  }

  public setUpSaveCurrGuessContainer() {
    const saveCurrentGuessContainerPos = this.positionRelativeToBg(
      this.bgSprite,
      0.304,
      0.492,
    );
    this.game.saveCurrentGuessContainer.eventMode = "static";
    this.game.saveCurrentGuessContainer.cursor = "pointer";
    this.game.saveCurrentGuessContainer.x = saveCurrentGuessContainerPos.x;
    this.game.saveCurrentGuessContainer.y = saveCurrentGuessContainerPos.y;
    this.game.saveCurrentGuessContainer.scale.set(this.doorScale);

    const width = 270;
    const height = 420;
    this.game.saveCurrentGuessContainer.hitArea = new Rectangle(
      -width / 2,
      -height / 2,
      width,
      height,
    );
    this.game.saveCurrentGuessContainer.interactive = true;
  }

  public getDoorShadow(): Sprite {
    const doorShadowPos = this.positionRelativeToBg(
      this.bgSprite,
      0.867,
      0.806,
    );
    const doorShadow = new Sprite(Texture.from("doorOpenShadow"));
    doorShadow.anchor.set(1);
    doorShadow.x = doorShadowPos.x;
    doorShadow.y = doorShadowPos.y;
    doorShadow.scale.set(this.doorScale);
    doorShadow.visible = false;
    return doorShadow;
  }

  public getVaultHandle(): Sprite {
    const handlePos = this.positionRelativeToBg(this.bgSprite, 0.498, 0.484);
    const vaultHandle = new Sprite(Texture.from("handle"));
    vaultHandle.anchor.set(0.5);
    vaultHandle.x = handlePos.x;
    vaultHandle.y = handlePos.y;
    vaultHandle.scale.set(this.doorScale);
    return vaultHandle;
  }

  public getHandleShadow(): Sprite {
    const handleShadowPos = this.positionRelativeToBg(
      this.bgSprite,
      0.5,
      0.493,
    );
    const handleShadow = new Sprite(Texture.from("handleShadow"));
    handleShadow.anchor.set(0.5);
    handleShadow.x = handleShadowPos.x;
    handleShadow.y = handleShadowPos.y;
    handleShadow.scale.set(this.doorScale);
    handleShadow.visible = true;
    return handleShadow;
  }

  public getVaultBlinks(): { blink1: Sprite; blink2: Sprite; blink3: Sprite } {
    const createBlink = (offsetX: number, offsetY: number): Sprite => {
      const blinkPos = this.positionRelativeToBg(
        this.bgSprite,
        offsetX,
        offsetY,
      );
      const blink = new Sprite(Texture.from("blink"));
      blink.anchor.set(0.5);
      blink.x = blinkPos.x;
      blink.y = blinkPos.y;
      blink.scale.set(this.doorScale * 0.5);
      blink.visible = false;
      return blink;
    };

    const blink1 = createBlink(0.41, 0.5);
    const blink2 = createBlink(0.52, 0.61);
    const blink3 = createBlink(0.48, 0.5);

    return { blink1, blink2, blink3 };
  }

  public getArrowRight(): Sprite {
    return this.createRotationArrow(0.583, 0.482, 105);
  }

  public getArrowLeft(): Sprite {
    return this.createRotationArrow(0.41, 0.49, 240, true);
  }

  public setupArrowInteraction() {
    this.game.arrowLeft.eventMode = "static";
    this.game.arrowLeft.cursor = "pointer";
    this.game.arrowRight.eventMode = "static";
    this.game.arrowRight.cursor = "pointer";

    this.game.arrowRight.on("pointerdown", () => {
      this.game.currentHandleDeg += 60;
      this.game.currentHandleSecretNumber += 1;

      this.game.soundManager.playHandleRotatingSound();

      this.game.animateHandleRotation(this.game.currentHandleDeg);
    });

    this.game.arrowLeft.on("pointerdown", () => {
      this.game.currentHandleDeg -= 60;
      this.game.currentHandleSecretNumber -= 1;

      this.game.soundManager.playHandleRotatingSound();
      this.game.animateHandleRotation(this.game.currentHandleDeg);
    });
  }

  public startBlinking() {
    this.game.areBlinking = true;
    const blink = async (sprite: Sprite, min: number, max: number) => {
      while (this.game.areBlinking) {
        if (sprite.alpha === 1) {
          sprite.alpha = 0.3;
        } else {
          sprite.alpha = 1;
        }
        await wait(min + Math.random() * max);
      }
      sprite.alpha = 1;
    };

    blink(this.game.vaultBlink1, 600, 400);
    blink(this.game.vaultBlink2, 500, 300);
    blink(this.game.vaultBlink3, 600, 500);
  }

  public stopBlinking() {
    this.game.areBlinking = false;

    this.game.vaultBlink1.alpha = 1;
    this.game.vaultBlink2.alpha = 1;
    this.game.vaultBlink3.alpha = 1;
  }

  //TODO: Fix it,this does not work
  private openDoorAnimation() {
    gsap.to(this.game.vaultDoor, {
      duration: 2,
      rotateY: -Math.PI / 2,
      ease: "power2.inOut",
    });
  }

  public openDoor() {
    this.openDoorAnimation();
    this.game.isDoorOpen = true;
    this.game.vaultDoor.texture = Texture.from("doorOpen");

    const openPos = this.game.sceneManager.positionRelativeToBg(
      this.bgSprite,
      0.845,
      0.79,
    );
    this.game.vaultDoor.x = openPos.x;
    this.game.vaultDoor.y = openPos.y;

    this.game.doorShadow.visible = true;
    this.game.handleShadow.visible = false;
    this.game.vaultHandle.visible = false;
    this.game.vaultBlink1.visible = true;
    this.game.vaultBlink2.visible = true;
    this.game.vaultBlink3.visible = true;
    this.game.arrowLeft.visible = false;
    this.game.arrowRight.visible = false;

    this.game.soundManager.playDoorOpenSound();
  }

  public closeDoor() {
    this.game.isDoorOpen = false;
    this.game.vaultDoor.texture = Texture.from("door");

    const closedPos = this.game.sceneManager.positionRelativeToBg(
      this.bgSprite,
      0.68,
      0.79,
    );
    this.game.vaultDoor.x = closedPos.x;
    this.game.vaultDoor.y = closedPos.y;

    this.game.doorShadow.visible = false;
    this.game.handleShadow.visible = true;
    this.game.vaultHandle.visible = true;
    this.game.vaultBlink1.visible = false;
    this.game.vaultBlink2.visible = false;
    this.game.vaultBlink3.visible = false;
    this.game.arrowRight.visible = true;
    this.game.arrowLeft.visible = true;
  }

  private createRotationArrow(
    offsetX: number,
    offsetY: number,
    rotation: number,
    flipX: boolean = false,
  ): Sprite {
    const arrowPos = this.positionRelativeToBg(this.bgSprite, offsetX, offsetY);
    const arrow = new Sprite(Texture.from("rightrotatearrow"));
    arrow.anchor.set(0.5);
    arrow.x = arrowPos.x;
    arrow.y = arrowPos.y;
    arrow.scale.set(this.doorScale * 0.55);
    if (flipX) {
      arrow.scale.x *= -1;
    }
    arrow.rotation = rotation * (Math.PI / 180);
    arrow.eventMode = "static";
    arrow.cursor = "pointer";

    const initialScaleX = arrow.scale.x;

    arrow.on("pointerover", () => {
      gsap.to(arrow.scale, {
        x: flipX ? -(this.doorScale * 0.65) : this.doorScale * 0.65,
        y: this.doorScale * 0.65,
        duration: 0.2,
        ease: "power2.out",
      });
    });

    arrow.on("pointerout", () => {
      gsap.to(arrow.scale, {
        x: initialScaleX,
        y: this.doorScale * 0.55,
        duration: 0.2,
        ease: "power2.out",
      });
    });

    return arrow;
  }
}
