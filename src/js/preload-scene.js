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
            '/images/penguinAnimation.png',
            '/images/penguinAnimation.json'
        );
        this.load.atlas(
            'vendor',
            '/images/shopAnimation.png',
            '/images/shopAnimation.json'
        );
        this.load.atlas(
            'startflag',
            '/images/flagsprites.png',
            '/images/flag.json'
        );
        this.load.image('tiles', '/tilesets/wintertileset64x64.png');
        // här laddar vi in en tilemap med spelets "karta"
        this.load.tilemapTiledJSON('map', '/tilemaps/wintertilemap.json');
        //this.load.audio('sickoMusic', ['/audio/Panama.mp3']);
        //this.load.audio('skiDash', ['/audio/EffectSkiDash.mp3'])
    }

    create() {
        this.scene.start('PlayScene');
    }
}

export default PreloadScene;
