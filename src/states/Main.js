import throttle from 'lodash.throttle';
import Tank from '../objects/Tank';
import Crystal from '../objects/Crystal';

/**
 * Setup and display the main game state.
 */
export default class Main extends Phaser.State {
  preload() {
    this.game.load.tilemap('tilemap', 'dist/assets/battlefield2.json', null, Phaser.Tilemap.TILED_JSON);
    this.game.load.image('grass', 'dist/assets/grass.png');
    this.game.load.image('base', 'dist/assets/tile256_1.png');
    this.game.load.image('buildings', 'dist/assets/tile256_2.png');
    this.game.load.image('lake', 'dist/assets/tile512_1.png');
    this.game.load.image('lake2', 'dist/assets/tile512_2.png');
    this.game.load.image('railways', 'dist/assets/tilelong.png');
    this.game.load.image('tilels', 'dist/assets/tilels.png');
    this.game.load.image('bullet', 'dist/assets/bullet.png');
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
    this.land = this.game.add.tilemap('tilemap', 32,32, 800, 600);
    this.land.addTilesetImage('grass', 'grass');
    this.land.addTilesetImage('base', 'base');
    this.land.addTilesetImage('buildings', 'buildings');
    this.land.addTilesetImage('lake', 'lake');
    this.land.addTilesetImage('lake2', 'lake2');
    this.land.addTilesetImage('railways', 'railways');
    this.land.addTilesetImage('tilels', 'tilels');
    this.ground = this.land.createLayer('ground');
    this.buildings = this.land.createLayer('buildings');
    this.obstacles = this.land.createLayer('obstacles');
    this.base = this.land.createLayer('base');
    this.railways = this.land.createLayer('railways');

    this.crystals = [];

    const server = this.game.server;

    this.land.setCollisionByExclusion([], true, this.obstacles);
    this.land.setCollisionByExclusion([], true, this.buildings);
    

    this.objects = this.game.add.physicsGroup();
    this.land.createFromObjects('objects', '', 'fill', 1, true, false, this.objects, Phaser.Sprite, false);
    this.objects.forEach((object) => {
      object.body.immovable = true;
      object.alpha = 0;
    });

    // Add a player to the game.
    this.player = new Tank({
      game: this.game,
      x: this.game.world.centerX - 800,
      y: this.game.world.centerY - 800,
      key: 'textures',
      frame: server.getMyCommand() == "red" ? 'tank_1.png' : 'tank_2.png'
    });

    this.oponent = new Tank({
      game: this.game,
      x: this.game.world.centerX + 800,
      y: this.game.world.centerY + 800,
      key: 'textures',
      frame: server.getMyCommand() == "red" ? 'tank_2.png' : 'tank_1.png'
    });
  
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

    server.on('player_fire', (data)=>{
      this.player.fire(data);
    });

    server.on('op_fire', (data)=>{
      this.oponent.fire(data);
    });

    server.on('gameEnd', (data)=>{
      this.game.state.start('GameEnd');
    });

    server.on('damageFromServer', (data)=>{
      if(server.getMyCommand() == "red") {
        this.player.health = server.state.red_data.hp;
        this.oponent.health = server.state.blue_data.hp;
      } else {
        this.player.health = server.state.blue_data.hp;
        this.oponent.health = server.state.red_data.hp;
      }
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
    this.game.physics.arcade.collide(this.player, this.buildings);
    this.game.physics.arcade.collide(this.player, this.obstacles);
    const server = this.game.server;

    this.game.physics.arcade.overlap(this.oponent.bullets, this.player, (tank, bullet)=>{
      bullet.kill();
      if(server.isMasterClient()) {
        server.damage(server.getMyCommand());
      }
    }, null, this);

    this.game.physics.arcade.overlap(this.player.bullets, this.oponent, (tank, bullet)=>{
      bullet.kill();
      if(server.isMasterClient()) {
        server.damage(server.getMyCommand() === "red" ? "blue" : "red");
      }
    }, null, this);



    this.player.work_update();
  }
}
