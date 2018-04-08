import throttle from 'lodash.throttle';
import Tank from '../objects/Tank';
import Crystal from '../objects/Crystal';
import Crysalis from '../objects/Crysalis';

/**
 * Setup and display the main game state.
 */
export default class Main extends Phaser.State {
  preload() {
    this.game.load.tilemap('tilemap', 'dist/assets/battlefield4.json', null, Phaser.Tilemap.TILED_JSON);
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

    this.game.world.setBounds(0, 0, 1920, 1920);

    const dpr = Math.round(window.devicePixelRatio);

    // Add background tile.
    this.land = this.game.add.tilemap('tilemap');
    this.land.addTilesetImage('grass', 'grass');
    this.land.addTilesetImage('base', 'base');
    this.land.addTilesetImage('building', 'buildings');
    this.land.addTilesetImage('lake', 'lake');
    this.land.addTilesetImage('tilels', 'tilels');
    this.ground = this.land.createLayer('ground');
    this.buildings = this.land.createLayer('buildings');
    this.obstacles = this.land.createLayer('obstacles');
    this.base = this.land.createLayer('bases');
    this.railways = this.land.createLayer('lakes');

    const server = this.game.server;

    //console.log(this.base)

    this.land.setCollisionByExclusion([], true, this.obstacles);
    this.land.setCollisionByExclusion([], true, this.buildings);

    this.maxCrystals = 10;
    this.crystals = [];
    this.crysalis = [];

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

    server.on('spawnCrystalFromServer', (data)=>{
      const crystal = new Crystal({
        game: this.game,
        x: data.x,
        y: data.y,
        key: 'textures',
        frame: 'crystal_1.png'
      });
      this.crystals.push(crystal);
    });
  
    server.on('damageCrystalFromServer', (data)=>{
      let exI = -1;
      const pos = {};
      for(let i = 0; i < this.crystals.length; i++) {
        if(this.crystals[i].x == data.pos.x && this.crystals[i].y == data.pos.y) {
          this.crystals[i].kill();
          pos.x = data.pos.x;
          pos.y = data.pos.y;
          exI = i;
          break;
        }
      }
      if(exI !== -1) {
        this.crystals.splice(exI, 1);
        const crysal = new Crysalis({
          game: this.game,
          x: pos.x,
          y: pos.y,
          key: 'tilel16',
          frame: 'tilel16.png'
        });
        this.crysalis.push(crysal);
      }
    });


    server.on('takeCrysalisFromServer', (data)=>{
      let exI = -1;
      for(let i = 0; i < this.crysalis.length; i++) {
        if(this.crysalis[i].x == data.pos.x && this.crysalis[i].y == data.pos.y) {
          this.crysalis[i].kill();
          exI = i;
          break;
        }
      }
      if(exI !== -1) {
        this.crysalis.splice(exI, 1);
      }
      
      if(server.getMyCommand() == "red") {
        this.player.crysalis = server.state.red_data.crystal;
        this.oponent.crysalis = server.state.blue_data.crystal;
      } else {
        this.player.crysalis = server.state.blue_data.crystal;
        this.oponent.crysalis = server.state.red_data.crystal;
      }

    });

    this.game.camera.follow(this.player);

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
    const server = this.game.server;

    this.crystals.forEach((c)=>{
      this.game.physics.arcade.collide(this.player, c);

      this.game.physics.arcade.overlap(this.oponent.bullets, c, (tank, bullet)=>{
        bullet.kill();
        if(server.isMasterClient()) {
           server.damageCrystal(server.getMyCommand(), {
             x : c.x,
             y : c.y
           });
        }
      }, null, this);

      this.game.physics.arcade.overlap(this.player.bullets, c, (tank, bullet)=>{
        bullet.kill();
        if(server.isMasterClient()) {
          server.damageCrystal(server.getMyCommand() === "red" ? "blue" : "red",{
            x : c.x,
            y : c.y
          });
        }
      }, null, this);

    });

    this.crysalis.forEach((c)=>{

      this.game.physics.arcade.overlap(this.oponent, c, (tank, bullet)=>{
        bullet.kill();
        if(server.isMasterClient()) {
           server.takeCrysalis(server.getMyCommand() === "red" ? "blue" : "red", {
             x : c.x,
             y : c.y
           });
        }
      }, null, this);

      this.game.physics.arcade.overlap(this.player, c, (tank, bullet)=>{
        bullet.kill();
        if(server.isMasterClient()) {
          server.takeCrysalis(server.getMyCommand(),{
            x : c.x,
            y : c.y
          });
        }
      }, null, this);

    });

    this.game.physics.arcade.collide(this.player, this.buildings);
    this.game.physics.arcade.collide(this.player, this.obstacles);


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



    if(server.isMasterClient()) {
    

      if(this.crystals.length < this.maxCrystals) {
        const crTile = this.land.objects.crystals[Math.floor(Math.random() * this.land.objects.crystals.length)];
        if(this.crystals.length > 0) {
          for(let i = 0; i < this.crystals.length; i++) {
            if(this.crystals[i].x !== crTile.x || this.crystals[i].y !== crTile.y) {
              server.spawnCrystal(Math.floor(crTile.x), Math.floor(crTile.y));
            }
          }
        } else {
          server.spawnCrystal(Math.floor(crTile.x), Math.floor(crTile.y));
        }
      }
    }

    this.player.work_update();
  }
}
