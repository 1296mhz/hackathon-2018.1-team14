/**
 * Setup and control base tank.
 */
//test
export default class Tank extends Phaser.Sprite {
  constructor({game, x, y, key, frame}) {
    super(game, x, y, key, frame);

    this.cursors = game.input.keyboard.createCursorKeys();
    this.currentSpeed = 0;
    this.velocity = 0;

    // Add the sprite to the game.
    this.game.add.existing(this);
    this.anchor.setTo(0.5);

    this.game.physics.enable(this, Phaser.Physics.ARCADE);
    
    this.body.immovable = false;
    this.body.collideWorldBounds = true;
    this.body.bounce.setTo(1, 1);

    this.body.drag.set(0.2);
    this.body.maxVelocity.setTo(400, 400);
    this.body.collideWorldBounds = true;

    // this.animations.add('move', ['tank1', 'tank2', 'tank3', 'tank4', 'tank5', 'tank6'], 20, true);

    //this.shadow = this.game.add.sprite(x, y, 'tanks', 'shadow')
    this.turret = this.game.add.sprite(x, y, 'textures', 'head.png');
    console.log(this);
    this.body.width = 64;
    this.body.height = 64;
    this.body.sourceWidth = 64;
    this.body.sourceHeight = 64;
    this.body.offset.x = 32;
    this.body.offset.y = 32;

    this.fireRate = 500;
    this.nextFire = 0;

    this.health = 100;
    this.maxHealth = 100;

    this.crysalis = 0;
    this.crysalisMax = 20;

    this.hud = Phaser.Plugin.HUDManager.create(this.game, this, 'enemyhud');

    this.healthHUD = this.hud.addBar(0, -64, 64, 6, this.maxHealth, 'health', this, Phaser.Plugin.HUDManager.HEALTHBAR, false);
    this.healthHUD.bar.anchor.setTo(0.5, 0.5);

    this.crysHUD = this.hud.addBar(0, -72, 64, 6, this.crysalisMax, 'crysalis', this, (percent)=> {
      if (percent <= 0.25) {
        return '#ff7474'; //red
      }
      if (percent <= 0.75) {
        return '#eaff74'; //yellow
      }
      return '#74ff74'; //green
    }, false);
    
    this.crysHUD.bar.anchor.setTo(0.5, 0.5);


   // this.crHUD = this.hud.addText()

    this.addChild(this.healthHUD.bar);
    this.addChild(this.crysHUD.bar);

   // this.shadow.anchor.set(0.5);
    this.turret.anchor.set(0.5, 0.5);

    this.bringToTop();
    this.turret.bringToTop();

    this.bullets = game.add.group();
    this.bullets.enableBody = true;
    this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
    this.bullets.createMultiple(30, 'shot', 0, false);
    this.bullets.setAll('anchor.x', 0.5);
    this.bullets.setAll('anchor.y', 0.5);
    this.bullets.setAll('outOfBoundsKill', true);
    this.bullets.setAll('checkWorldBounds', true);
  }


  work_update() {
    const server = this.game.server;
    const role = server.getMyRole();
    switch(role) {
      case "driver": {
        this._updateDriver();
        break;
      }
      case "gunner": {
        this._updateGunner();
        break;
      }
      case "сommander": {
        break;
      }
    }
  }

  _updateDriver() {
    const server = this.game.server;

    if (this.cursors.left.isDown){
      this.angle -= 4;
    }
    else if (this.cursors.right.isDown){
      this.angle += 4;
    }

    if (this.cursors.up.isDown) {
      this.currentSpeed = 300;
    } else {
      if (this.currentSpeed > 0) {
        this.currentSpeed -= 4;
      }
    }
    
    if (this.currentSpeed > 0) {
      this.game.physics.arcade.velocityFromRotation(
        this.rotation, 
        this.currentSpeed, 
        this.body.velocity);
    }

    this.turret.x = this.x;
    this.turret.y = this.y;

    server.updateDriver(this.x, this.y, this.rotation, this.currentSpeed);

   // console.log("Tank", this.x, this.y)
  }

  _updateGunner() {
    const server = this.game.server;
    this.turret.rotation = game.physics.arcade.angleToPointer(this.turret);
    server.updateGunner(this.turret.rotation);
    if (this.game.input.activePointer.isDown) {
      if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0) {
        this.nextFire = this.game.time.now + this.fireRate;
        server.fire({
          x : this.game.input.activePointer.worldX,
          y : this.game.input.activePointer.worldY
        });
      }
    }
  }

  setDriverUpdate(data) {
    this.angle = data.angle;
    this.rotation = data.angle;
    this.x = data.x;
    this.y = data.y;
    this.velocity = data.velocity;
    this.turret.x = this.x;
    this.turret.y = this.y;
  }

  setGunnerUpdate(data) {
    this.turret.rotation = data.angle;
  }

  fire(data) {
    if(!data.target) return; // FIXME
    const bullet = this.bullets.getFirstExists(false);
    if(bullet) {

      this.fire_music = game.add.audio('blip');
      this.fire_music.play();

      bullet.reset(this.turret.x, this.turret.y);
      bullet.rotation = this.game.physics.arcade.moveToXY(
        bullet, 
        data.target.x, data.target.y,
        1000, 
        500);
    }   
  }
}
