/**
 * Setup and control base tank.
 */
export default class Tank extends Phaser.Sprite {
  constructor({game, x, y, key, frame}) {
    super(game, x, y, key, frame);

    this.cursors = game.input.keyboard.createCursorKeys();
    this.currentSpeed = 0;

    // Add the sprite to the game.
    this.game.add.existing(this);
    this.anchor.setTo(0.5);

    this.game.physics.enable(this, Phaser.Physics.ARCADE);
    
    this.body.drag.set(0.2);
    this.body.maxVelocity.setTo(400, 400);
    this.body.collideWorldBounds = true;

    // this.animations.add('move', ['tank1', 'tank2', 'tank3', 'tank4', 'tank5', 'tank6'], 20, true);

    //this.shadow = this.game.add.sprite(x, y, 'tanks', 'shadow');
    this.turret = this.game.add.sprite(x, y, 'textures', 'head.png');

    
   // this.shadow.anchor.set(0.5);
    this.turret.anchor.set(0.5, 0.5);

    this.bringToTop();
    this.turret.bringToTop();
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
    
    if (this.currentSpeed > 0)
    {
      this.game.physics.arcade.velocityFromRotation(
        this.rotation, 
        this.currentSpeed, 
        this.body.velocity);
    }

    this.turret.x = this.x;
    this.turret.y = this.y;

    server.updateDriver(this.x, this.y, this.rotation);
  }

  _updateGunner() {
    const server = this.game.server;
    this.turret.rotation = game.physics.arcade.angleToPointer(this.turret);
    server.updateGunner(this.turret.rotation);
  }

  setDriverUpdate(data) {
    this.angle = data.angle;
    this.rotation = data.angle;
    this.x = data.x;
    this.y = data.y;

    this.turret.x = this.x;
    this.turret.y = this.y;
  }

  setGunnerUpdate(data) {
    this.turret.rotation = data.angle;
  }
}
