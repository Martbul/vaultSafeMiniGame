import { sound } from "@pixi/sound";
import { AnimatedSprite, Assets, Container } from "pixi.js";

export default class SpritesheetAnimation extends Container {
  animationTextures: Record<string, AnimatedSprite["textures"]> = {};
  sprite?: AnimatedSprite;
  speed = 1;
  animations = new Map<string, AnimatedSprite>();
  currentAnimation: string | null = null;
  private assetName: string;
  private initialized = false;

  constructor(name: string, speed = 1) {
    super();
    this.label = name;
    this.assetName = name;
    this.speed = speed;
  }

  async init() {
    if (this.initialized) return;

    try {
      const asset = Assets.get(this.assetName);

      if (!asset) {
        console.error(`Asset not found: ${this.assetName}`);
        return;
      }

      if (!asset.animations) {
        console.error(`Asset ${this.assetName} has no animations`);
        return;
      }

      this.animationTextures = asset.animations;
      this.initialized = true;
    } catch (error) {
      console.error(`Failed to initialize SpritesheetAnimation for ${this.assetName}:`, error);
    }
  }

  private initAnimation(anim: string) {
    if (!this.initialized) {
      console.error(`SpritesheetAnimation not initialized. Call init() first.`);
      return;
    }

    const textures = this.animationTextures[anim];
    if (!textures) {
      console.error(`Animation ${anim} not found in ${this.assetName}`);
      return;
    }

    const sprite = new AnimatedSprite(textures);
    sprite.label = anim;
    sprite.anchor.set(0.5);
    sprite.animationSpeed = this.speed;
    return sprite;
  }

  play({
    anim,
    soundName,
    loop = false,
    speed = this.speed,
  }: {
    anim: string;
    soundName?: string;
    loop?: boolean;
    speed?: number;
  }) {
    if (!this.initialized) {
      console.error(`SpritesheetAnimation not initialized. Call init() first.`);
      return Promise.resolve();
    }

    if (this.sprite) {
      this.sprite.stop();
      this.removeChild(this.sprite);
    }

    this.sprite = this.animations.get(anim);
    if (!this.sprite) {
      this.sprite = this.initAnimation(anim);
      if (!this.sprite) return Promise.resolve();
      this.animations.set(anim, this.sprite);
    }

    this.currentAnimation = anim;
    this.sprite.loop = loop;
    this.sprite.animationSpeed = speed;
    this.sprite.gotoAndPlay(0);

    if (soundName) {
      try {
        sound.play(soundName);
      } catch (error) {
        console.warn(`Failed to play sound: ${soundName}`, error);
      }
    }

    this.addChild(this.sprite);

    return new Promise<void>((resolve) => {
      if (!this.sprite) return resolve();
      this.sprite.onComplete = () => {
        this.currentAnimation = null;
        resolve();
      };
    });
  }

  get isReady() {
    return this.initialized;
  }
}
