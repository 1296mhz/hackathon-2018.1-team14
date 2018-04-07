import throttle from 'lodash.throttle';
import Tank from '../objects/Tank';

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
    this.land = this.game.add.tileSprite(-5000, -5000, 10000, 10000, 'earth');
    this.land.fixedToCamera = true;

    
    this.initBulletGroups();

    // Add a player to the game.
    this.player = new Tank({
      game: this.game,
      x: this.game.world.centerX - 100,
      y: this.game.world.centerY - 100,
      key: 'tanks',
      frame: 'tank1',
    });

    this.oponent = new Tank({
      game: this.game,
      x: this.game.world.centerX + 100,
      y: this.game.world.centerY + 100,
      key: 'enemy-tanks',
      frame: 'tank1',
    });

    const server = this.game.server;
    server.on('update_player_driver', (data)=>{
      this.player.setDriverUpdate(data);
    });
    server.on('update_player_gunner', (data)=>{
      this.player.setGunnerUpdate(data);
    });

    server.on('update_op_driver', (data)=>{
      this.oponent.setDriverUpdate(data);
    });
    server.on('update_op_gunner', (data)=>{
      this.oponent.setGunnerUpdate(data);
    });

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
    this.player.work_update();
  }


  initBulletGroups() {
    this.playerBullets = game.add.group();
    this.playerBullets.enableBody = true;
    this.playerBullets.physicsBodyType = Phaser.Physics.ARCADE;
    this.playerBullets.createMultiple(30, 'bullet', 0, false);
    this.playerBullets.setAll('anchor.x', 0.5);
    this.playerBullets.setAll('anchor.y', 0.5);
    this.playerBullets.setAll('outOfBoundsKill', true);
    this.playerBullets.setAll('checkWorldBounds', true);


  }


}
