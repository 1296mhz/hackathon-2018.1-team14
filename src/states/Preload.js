// import WebpackLoader from 'phaser-webpack-loader';
import ManifestLoader from 'phaser-manifest-loader';
import AssetManifest from '../AssetManifest';

const req = require.context('../assets', true, /.*\.png|json|ttf|woff|woff2|xml|mp3|jpg|ogg$/);

/**
 * Preload the game and display the loading screen.
 */
export default class Preload extends Phaser.State {
  /**
   * Once loading is complete, switch to the main state.
   */
  create() {
    // Determine which postfix to use on the assets based on the DPI.
    let postfix = '';
    /*
    if (window.devicePixelRatio >= 3) {
      postfix = '@3x';
    } else if (window.devicePixelRatio > 1) {
      postfix = '@2x';
    }
    */
    // Fix CORS issues with the loader and allow for unlimited parallel downloads.
    this.game.load.crossOrigin = 'anonymous';
    this.game.load.maxParallelDownloads = Infinity;
    this.game.sound.usingWebAudio = true;
    
    
    const server = this.game.server;
/*
    // Begin loading all of the assets.
    this.game.plugins.add(ManifestLoader, AssetManifest, postfix)
      .load()
      .then(() => {
        if(server.getMyCommand()) {
          this.game.state.start('GameWait');
        } else {
          this.game.state.start('Menu');
        }
      });
*/    

  this.game.plugins.add(ManifestLoader, req).loadManifest(AssetManifest).then(()=>{
    if(server.getMyCommand()) {
      this.game.state.start('GameWait');
    } else {
      this.game.state.start('Menu');
    }
  })

  }

  /**
   * Update the loading display with the progress.
   */
  update() {

  }
}
