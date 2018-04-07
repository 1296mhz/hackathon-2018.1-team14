import throttle from 'lodash.throttle';
import Player from '../objects/Player';

/**
 * Setup and display the main game state.
 */
export default class Main extends Phaser.State {
  /**
   * Setup all objects, etc needed for the main game state.
   */
  create() {
    // Enable arcade physics.
    this.game.physics.startSystem(Phaser.Physics.ARCADE);

    // Add background tile.
    this.game.add.tileSprite(-5000, -5000, 10000, 10000, 'earth');

    this.cursors = game.input.keyboard.createCursorKeys();

    // Add a player to the game.
    this.player = new Player({
      game: this.game,
      x: this.game.world.centerX,
      y: this.game.world.centerY,
      key: 'tanks',
      frame: 'tank1',
    });

    this.currentSpeed = 0;

    // Setup listener for window resize.
    window.addEventListener('resize', throttle(this.resize.bind(this), 50), false);
  }

  /**
   * Resize the game to fit the window.
   */
  resize() {
    const width = window.innerWidth * window.devicePixelRatio;
    const height = window.innerHeight * window.devicePixelRatio;

    this.scale.setGameSize(width, height);
  }

  /**
   * Handle actions in the main game loop.
   */
  update() {

    
    if (this.cursors.left.isDown){
      this.player.angle -= 4;
    }
    else if (this.cursors.right.isDown){
      this.player.angle += 4;
    }

    if (this.cursors.up.isDown) {
      this.currentSpeed = 300;
    } else {
      if (this.currentSpeed > 0) {
        this.currentSpeed -= 4;
      }
    }
    
    if (this.currentSpeed > 0)
    {
      this.game.physics.arcade.velocityFromRotation(
        this.player.rotation, 
        this.currentSpeed, 
        this.player.body.velocity);
    }

    //  Position all the parts and align rotations
    this.player.shadow.x = this.player.x;
    this.player.shadow.y = this.player.y;
    this.player.shadow.rotation = this.player.rotation;

    this.player.turret.x = this.player.x;
    this.player.turret.y = this.player.y;

    this.player.turret.rotation = game.physics.arcade.angleToPointer(this.player.turret);

  }
}
