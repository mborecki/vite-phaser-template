import Phaser from "phaser";
import spritesheetConfig from './sprites-index.json';
import getAudioPlayer from "./audio";

class Example extends Phaser.Scene {
    private audio = getAudioPlayer();
    preload() {

        console.log(spritesheetConfig);

        spritesheetConfig.forEach((files) => {
            console.log(files[0], import.meta.env.BASE_URL + 'generated/' + files[1], import.meta.env.BASE_URL + 'generated/' + files[2])
            this.load.atlas(files[0], import.meta.env.BASE_URL + 'generated/' + files[1], import.meta.env.BASE_URL + 'generated/' + files[2]);
        });
    }

    create() {

        const particles = this.add.particles(0, 0, 'sprites', {
            frame: 'dot',
            speed: 100,
            scale: { start: 1, end: 0 },
            blendMode: 'ADD'
        });

        const logo = this.physics.add.image(400, 100, 'sprites', 'test');

        logo.setVelocity(100, 200);
        logo.setBounce(1, 1);
        logo.setCollideWorldBounds(true);


        logo.setInteractive();
        logo.on('pointerdown', async () => {
            const audio = await this.audio;
            audio.play('blip');
        })

        particles.startFollow(logo);
    }
}

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: Example,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 200, x: 0 }
        }
    }
};

new Phaser.Game(config);
