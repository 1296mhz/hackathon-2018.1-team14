
import throttle from 'lodash.throttle';

export default class GameEnd extends Phaser.State {

    create() {
        const width = window.innerWidth * window.devicePixelRatio;
        const height = window.innerHeight * window.devicePixelRatio;
        this.bg = game.add.tileSprite(0, 0, width, height, 'scorched_earth');

        const server = this.game.server;

        this.title = this.game.add.text(0, 64, "Game end. Win: " + server.state.win , {
            font: "bold 32px Arial", 
            fill: "#222", 
            boundsAlignH: "center", 
            boundsAlignV: "middle"
        });

        this.title.setTextBounds(0, 0, window.innerWidth, 32);
    }

    resize() {
        const width = window.innerWidth * window.devicePixelRatio;
        const height = window.innerHeight * window.devicePixelRatio;

        this.scale.setGameSize(width, height);
    }

    update() {}
}