export default class Crysalis extends Phaser.Sprite {
    constructor({game, x, y, key, frame}) {
        super(game, x, y, key, frame);

        this.game.add.existing(this);
        this.anchor.setTo(0.5);

        this.game.physics.enable(this, Phaser.Physics.ARCADE);
        
        this.body.immovable = true;
        this.body.collideWorldBounds = false;
    }

    update() {

    }
}