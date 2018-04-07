
import throttle from 'lodash.throttle';

export default class GameWait extends Phaser.State {

    create() {

        const width = window.innerWidth * window.devicePixelRatio;
        const height = window.innerHeight * window.devicePixelRatio;

        this.bg = game.add.tileSprite(0, 0, width, height, 'scorched_earth');

    }

    resize() {}

    update() {}

}