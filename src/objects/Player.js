/**
 * Setup and control base player.
 */
export default class Player extends Phaser.Sprite {
  constructor({game, x, y, key, frame}) {
    super(game, x, y, key, frame);

    // Add the sprite to the game.
    this.game.add.existing(this);
    this.anchor.setTo(0.5);

    this.game.physics.enable(this, Phaser.Physics.ARCADE);
    
    this.body.drag.set(0.2);
    this.body.maxVelocity.setTo(400, 400);
    this.body.collideWorldBounds = true;

    this.animations.add('move', ['tank1', 'tank2', 'tank3', 'tank4', 'tank5', 'tank6'], 20, true);

    this.shadow = this.game.add.sprite(x, y, 'tanks', 'shadow');
    this.turret = this.game.add.sprite(x, y, 'tanks', 'turret');

    this.shadow.anchor.set(0.5);
    this.turret.anchor.set(0.3, 0.5);
  }

}
