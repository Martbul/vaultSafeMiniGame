///i////mport type { BgConfig } from "./prefabs/ParallaxBackground";

//type Config = {
// backgrounds: Record<string, BgConfig>;
//};

//export default {
//backgrounds: {
//forest: {
//layers: [
//"sky",
//"clouds_1",
///"rocks",
// "clouds_2",
//"ground_1",
//"ground_2",
// "ground_3",
//  "plant",
// ],
//  panSpeed: 0.2,
// },
/// },
//} as Config;


import type { BgConfig } from "./prefabs/ParallaxBackground";

type Config = {
  backgrounds: Record<string, BgConfig>;
};

export default {
  backgrounds: {
    vault: {
      layers: [
        "bg",           // Background layer
        "door",         // Vault door (closed)
        "handle",       // Door handle
        "blink",        // Blinking lights/indicators
      ],
      panSpeed: 0.1,    // Slower pan speed for vault scene
    },
  },
} as Config;
