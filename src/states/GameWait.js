
import throttle from 'lodash.throttle';

export default class GameWait extends Phaser.State {

    create() {
        const width = window.innerWidth * window.devicePixelRatio;
        const height = window.innerHeight * window.devicePixelRatio;
        this.bg = game.add.tileSprite(0, 0, width, height, 'scorched_earth');

        this.title = this.game.add.text(0, 64, "Wait all players", {
            font: "bold 32px Arial", 
            fill: "#222", 
            boundsAlignH: "center", 
            boundsAlignV: "middle"
        });

        this.title.setTextBounds(0, 0, window.innerWidth, 32);

        server.on('onServerState', ()=>{
            console.log("onServerState");
            
            
        });
    }

    resize() {
        const width = window.innerWidth * window.devicePixelRatio;
        const height = window.innerHeight * window.devicePixelRatio;

        this.scale.setGameSize(width, height);
    }

    update() {}
}