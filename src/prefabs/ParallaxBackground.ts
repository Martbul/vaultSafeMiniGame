import { Container, TilingSprite, Texture } from "pixi.js";
import { centerObjects } from "../utils/misc";

export type BgConfig = {
  layers: string[];
  panSpeed: number;
};

export default class ParallaxBackground extends Container {
  label = "Background";
  layers: string[] = [];
  tilingSprites: TilingSprite[] = [];
  private initialized = false;

  constructor(
    protected config: BgConfig = {
      panSpeed: 1,
      layers: [],
    }
  ) {
    super();
  }

  async init() {
    if (this.initialized) return;

    for (const layer of this.config.layers) {
      try {
        const texture = Texture.from(layer);

        if (!texture || texture.width === 0 || texture.height === 0) {
          console.error(`Texture not loaded or invalid: ${layer}`);
          continue;
        }

        const scaleFactor = window.innerHeight / texture.height;

        const tilingSprite = new TilingSprite({
          texture,
          width: window.innerWidth / scaleFactor,
          height: texture.height
        });

        tilingSprite.scale.set(scaleFactor);
        tilingSprite.label = layer;
        tilingSprite.anchor.set(0.5);
        this.tilingSprites.push(tilingSprite);
        this.addChild(tilingSprite);
      } catch (error) {
        console.error(`Failed to create tiling sprite for: ${layer}`, error);
        continue;
      }
    }

    centerObjects(this);
    this.initialized = true;
  }


  updatePosition(x: number, y: number) {
    if (!this.initialized) return;

    for (const [index, child] of this.children.entries()) {
      if (child instanceof TilingSprite) {
        child.tilePosition.x -= x * index * this.config.panSpeed;
        child.tilePosition.y -= y * index * this.config.panSpeed;
      } else {
        child.x -= x * index * this.config.panSpeed;
        child.y -= y * index * this.config.panSpeed;
      }
    }
  }

  resize(width: number, height: number) {
    if (!this.initialized) return;

    for (const layer of this.tilingSprites) {
      const scaleFactor = height / layer.texture.height;
      layer.width = width / scaleFactor;
      layer.scale.set(scaleFactor);
    }
    centerObjects(this);
  }
}
