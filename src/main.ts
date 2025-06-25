import PixiApp from "./core/App";
const pixiApp = new PixiApp();
await pixiApp.begin();

window.__PIXI_APP__ = pixiApp;
