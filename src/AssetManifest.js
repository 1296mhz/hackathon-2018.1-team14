// https://github.com/goldfire/phaser-webpack-loader/blob/master/README.md

const AssetManifest = {
  spritesheets: [
    'textures',
    'tanks',
    'enemy-tanks',
    'tilel16'
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
    'moon',
    'fire',
    'shot',
    'logo'
  ],
  audio: [
    'acidbomb',
    'base',
    'blip',
    'electro-bomb',
    'heal',
    'pigsqueal',
    'robotkill',
    'rosketlaunch',
    'shrooms',
    'simple-bomb',
    'simple-bomb2',
    'spider-steps',
    'tank-begin',
    'tank-moves',
    'tank-stand',
    'train-horn',
    'water',
    'zeppelin'
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
    custom: {
      families: [
        'sf_distant_galaxy-webfont'
      ]
    }
  },
};

export default AssetManifest;
