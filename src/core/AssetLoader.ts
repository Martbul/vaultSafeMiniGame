import { Assets } from "pixi.js";
import { Debug } from "../utils/debug";

type Asset = {
  name: string;
  url: string;
  ext: string;
  category: string;
};

export default class AssetLoader {
  private assetFileUrls = this.importAssetFiles();

  manifest: Asset[];

  constructor() {
    this.manifest = this.generateManifest();
  }

  importAssetFiles() {
    const assetFiles = import.meta.glob("../assets/**/*.*", {
      eager: true,
    });

    return Object.keys(assetFiles);
  }
  async loadAssets() {
    for (const asset of this.manifest) {
      Assets.add({ alias: asset.name, src: asset.url });
    }

    const resources = await Assets.load(this.manifest.map((asset) => asset.name));

    Debug.log("Loaded assets", resources);

    return resources;
  }

  generateManifest() {
    const assetsManifest: Asset[] = [];
    const assetPathRegexp =
      /public\/(?<category>[\w.-]+)\/(?<name>[\w.-]+)\.(?<ext>\w+)$/;

    this.assetFileUrls.forEach((assetPath) => {
      const match = assetPathRegexp.exec(assetPath);

      if (!match || !match.groups) {
        return console.error(
          `Invalid asset path: ${assetPath}, should match ${assetPathRegexp}`
        );
      }

      const { category, name, ext } = match.groups;

      if (category === "spritesheets" && ext !== "json") {
        return;
      }

      assetsManifest.push({
        category,
        name,
        ext,
        url: assetPath.replace(/.*public/, ""),
      });
    });

    return assetsManifest;
  }
}
