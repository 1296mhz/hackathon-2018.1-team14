import throttle from 'lodash.throttle';

export default class StarHolder extends Phaser.State {

    create() {
      //  this.showLuke();
      //  this.showLogo();
        this.showInfo();
    }

    resize() {
        const width = window.innerWidth * window.devicePixelRatio;
        const height = window.innerHeight * window.devicePixelRatio;

        this.scale.setGameSize(width, height);
    }

    update() {}

    showLuke() {
        this.luke = this.game.add.sprite(-500, 55, 'logo');
        this.game.add.tween(this.luke).to({ x: 30 }, 1000, Phaser.Easing.Quadratic.InOut, true);
    }

    showLogo() {
        this.logoText = this.game.add.text(410, 60, 'Louis\' 5th\nBirthday', {
          font: '75px sf_distant_galaxyregular',
          fill: 'rgb(0,0,0)',
          stroke: '#ff6',
          strokeThickness: 6,
          align: 'center'
        });
    
        this.logoTween = this.game.add.tween(this.logoText).from({ alpha: 0 }, 3000,  Phaser.Easing.Quadratic.Out, true );
    }

    showInfo() {
        // Type in the invite details
        this.infoText = this.game.add.text(410, 250, '22 Aug 2015, 12.30pm - 2pm.\nThe Monkey Tree,\nUnit 10, 11 Silverfield\nWairau Valley, Auckland.\n\nChildren are encouraged to dress up as their favourite Hero/Villan. Food, drink and entertainment provided.', {
          font: `20px Arial`,
          fill: '#fff',
          wordWrap: true,
          wordWrapWidth: 510,
          align: 'center'
        });
    
        this.infoTextTween = this.game.add.tween(this.infoText).from({ alpha: 0 }, 3000,  Phaser.Easing.Quadratic.Out, true );
    }
}