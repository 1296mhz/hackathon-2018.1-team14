import throttle from 'lodash.throttle';
import Tank from '../objects/Tank';

/**
 * Setup and display the main game state.
 */
export default class Main extends Phaser.State {
  preload() {
    this.game.load.tilemap('tilemap', 'assets/battlefield.json', null, Phaser.Tilemap.TILED_JSON);
    this.game.load.image('grass', 'assets/grass.png');
    this.game.load.image('items', 'assets/sheet.png');
  }
  /**
   * Setup all objects, etc needed for the main game state.
   */
  create() {
    // Enable arcade physics.
    this.game.physics.startSystem(Phaser.Physics.ARCADE);

    this.game.world.setBounds(-1000, -1000, 2000, 2000);

    const dpr = Math.round(window.devicePixelRatio);

    // Add background tile.
    this.land = this.game.add.tilemap('tilemap');
    this.land.addTilesetImage('grassembed', 'grass');
    this.land.addTilesetImage('itemsembed', 'items');
    this.layer = this.land.createLayer('layer');
    this.layer2 = this.land.createLayer('items');
    this.layer.resizeWorld();
    this.layer2.resizeWorld();


    this.initBulletGroups();

    // Add a player to the game.
    this.player = new Tank({
      game: this.game,
      x: this.game.world.centerX - 100,
      y: this.game.world.centerY - 100,
      key: 'textures',
      frame: 'tank_1.png',
    });

    this.oponent = new Tank({
      game: this.game,
      x: this.game.world.centerX + 100,
      y: this.game.world.centerY + 100,
      key: 'textures',
      frame: 'tank_2.png',
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

    this.game.camera.follow(this.player);
    this.game.camera.deadzone = new Phaser.Rectangle(150, 150, 500, 300);
    this.game.camera.focusOnXY(0, 0);

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
