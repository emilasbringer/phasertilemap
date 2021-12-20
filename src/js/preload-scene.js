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
        this.load.image('sign', '/images/sign.png');
        this.load.spritesheet('speedbutton', '/images/speedicon.png',{
            frameWidth: 40,
            frameHeight: 35
        });
        this.load.spritesheet('maxspeedbutton', '/images/maxspeedicon.png',{
            frameWidth: 40,
            frameHeight: 35
        });
        this.load.spritesheet('frictionbutton', '/images/frictionicon.png',{
            frameWidth: 40,
            frameHeight: 35
        });
        this.load.spritesheet('fortitudebutton', '/images/coldresistanceicon.png',{
            frameWidth: 40,
            frameHeight: 35
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
        this.load.image('layer-1', '/tilesets/layer-1.png');
        this.load.image('layer-2', '/tilesets/layer-2.png');
        this.load.image('layer-3', '/tilesets/layer-3.png');
        this.load.image('layer-4', '/tilesets/layer-4.png');
        // här laddar vi in en tilemap med spelets "karta"
        this.load.tilemapTiledJSON('map', '/tilemaps/wintertilemap.json');
        this.load.audio('sickoMusic', ['/audio/theme.mp3']);
        this.load.audio('skiDash', ['/audio/dash.mp3'])
    }

    create() {
        this.scene.start('PlayScene');
    }
}

export default PreloadScene;
