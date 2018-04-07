// https://github.com/goldfire/phaser-webpack-loader/blob/master/README.md

const AssetManifest = {
  spritesheets: [
    'textures',
    'tanks',
    'enemy-tanks'
  ],
  images: [
    'bg',
    'dark_grass',
    'earth',
    'light_grass',
    'light_sand',
    'sand',
    'scorched_earth',
    'button_default',
    'moon'
  ],
  audio: [
    'blip'
  ],
  tilemaps: [
    'battlefield',
    'grass',
    'sheet'
  ],
  fonts: {
    google: {
      families: [
        'Open Sans:300,700',
      ],
    },
  },
};

export default AssetManifest;
