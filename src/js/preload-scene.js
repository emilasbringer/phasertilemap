class PreloadScene extends Phaser.Scene {
    constructor() {
        super('PreloadScene');
    }

    preload() {
        // säg åt phaser att lägga till /assets i alla paths
        this.load.setBaseURL('/assets');
        this.load.image('background', '/images/background.png');
        this.load.image('spike', '/images/spike.png');
        this.load.image('mountain', '/images/mountain.png');
        this.load.image('zeunerts', '/images/zeunerts.png');
        this.load.spritesheet('button', '/images/upgradeButton.png',{
            frameWidth: 252,
            frameHeight: 247
            });
        this.load.atlas(
            'player',
            '/images/jefrens_hero.png',
            '/images/jefrens_hero.json'
        );
        this.load.atlas(
            'foe',
            '/images/jefrens_foe.png',
            '/images/jefrens_foe.json'
        );
        this.load.atlas(
            'dude',
            '/images/texture.png',
            '/images/texture.json'
        );
        this.load.image('tiles', '/tilesets/jefrens_tilesheet.png');
        // här laddar vi in en tilemap med spelets "karta"
        this.load.tilemapTiledJSON('map', '/tilemaps/megamap.json');
    }

    create() {
        this.scene.start('PlayScene');
    }
}

export default PreloadScene;