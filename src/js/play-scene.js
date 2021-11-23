class PlayScene extends Phaser.Scene {
    constructor() {
        super('PlayScene');
    }

    create() {
        this.spiked = 0;
        this.velocity = 0;
        this.stridePower = 250;
        this.groundFriction = 0.7;
        this.maxSpeed = 200;
        this.fortitude = 5;
        this.coldLevelFactor = 1;
        this.coldLevel = 100;
        this.maxColdLevel = 100;
        this.jumpPower = 400;
        this.tapAllowed = true;
        this.inColdZone = false;
        this.reset = false;
        this.deathtimer = 2;
        this.allowDeath = true;
        this.zeunertsAmmountBank = 0;
        this.zeunertsAmmountGain = 0;


        setInterval(() => {
            this.velocity = this.groundFriction * this.velocity;
            
            if (this.coldLevel <= 0) {
                this.deathtimer -= 0.1;
                console.log("Cold level critical");
                if (this.allowDeath) {
                    console.log("Play DeathAnimation");
                    this.player.play('death');
                    this.allowDeath = false;
                }
                if (this.deathtimer <= 0) {
                    console.log("Resetting deathtimer");
                    this.deathtimer = 2;
                    this.reset = true;
                }
            }
            if (this.reset) {
            this.coldLevel = this.maxColdLevel;
            console.log("Reseting...");
                if (this.player.x > 500 && this.reset) {
                    this.player.x -= 100;
                }
                else {
                    this.inColdZone = false;
                    this.reset = false;
                    this.coldLevel = this.maxColdLevel;
                    this.allowDeath = true;
                    this.zeunertsAmmountBank += this.zeunertsAmmountGain;
                    console.log("Gained " + this.zeunertsAmmountGain + " flasks of zeunerts this round. Your total Zeunerts is now " + this.zeunertsAmmountBank);
                    this.zeunertsAmmountGain = 0;
                    this.updateText();
                }
            }
            else if (this.inColdZone && this.deathtimer >= 2) {
                this.zeunertsAmmountGain += 1;
                this.coldLevel -= this.fortitude;
                console.log(this.coldLevel + " zeunerts = " + this.zeunertsAmmountGain );
            }
            else if (!this.inColdZone) {
                console.log("In warm zone");
            }
            this.coldLevelFactor = this.coldLevel/100;
        }, 100);

        
        // skapa en tilemap från JSON filen vi preloadade
        const map = this.make.tilemap({ key: 'map' });
        // ladda in tilesetbilden till vår tilemap
        const tileset = map.addTilesetImage('jefrens_tilesheet', 'tiles');

        // initiera animationer, detta är flyttat till en egen metod
        // för att göra create metoden mindre rörig
        this.initAnims();

        // keyboard cursors
        this.cursors = this.input.keyboard.createCursorKeys();

        // Ladda lagret Platforms från tilemappen
        // och skapa dessa
        // sätt collisionen
        this.platforms = map.createLayer('platform', tileset);
        this.platforms.setCollisionByExclusion(-1, true);
        
        this.middleBackground = map.createLayer('middle', tileset).setDepth(-8);
        this.deepMiddleBackground = map.createLayer('deepmiddle', tileset).setDepth(-9);
        this.background = map.createLayer('background', tileset).setDepth(-10);

        
        // platforms.setCollisionByProperty({ collides: true });
        // this.platforms.setCollisionFromCollisionGroup(
        //     true,
        //     true,
        //     this.platforms
        // );
        // platforms.setCollision(1, true, true);

        // skapa en spelare och ge den 0 studs
        this.player = this.physics.add.sprite(600, 300, 'dude');
        this.player.setBounce(0).setScale(1.75);
        this.player.setCollideWorldBounds(true);
        this.player.setSize(32, 36, 50, 100);
        this.cameras.main.x = -this.player.x + 700;

        this.menu = this.add.rectangle(0, 640, window.innerWidth, 80, 0x000000);
        this.menu.setOrigin(0,0);
        this.healthbarContainer = this.add.rectangle(10, 695, 300, 20, 0xfffffff);
        this.healthbarContainer.setStrokeStyle(2, 0xfffffff)
        this.healthbarContainer.setOrigin(0,0.5);
        this.healthbar = this.add.rectangle(11, 695, 298, 18, 0x4dafff);
        this.healthbar.setOrigin(0,0.5);
        
        this.dangerBorder = this.add.rectangle(1000, 526, 10, 50, 0x166df7);
        this.dangerBorder.setOrigin(0,0);
        // skapa en fysik-grupp
        /*this.spikes = this.physics.add.group({
            allowGravity: false,
            immovable: true
        });

        // från platforms som skapats från tilemappen
        // kan vi ladda in andra lager
        // i tilemappen finns det ett lager Spikes
        // som innehåller spikarnas position
        console.log(this.platforms);
        map.getObjectLayer('Spikes').objects.forEach((spike) => {
            // iterera över spikarna, skapa spelobjekt
            const spikeSprite = this.spikes
                .create(spike.x, spike.y - spike.height, 'spike')
                .setOrigin(0);
            spikeSprite.body
                .setSize(spike.width, spike.height - 20)
                .setOffset(0, 20);
        });
        // lägg till en collider mellan spelare och spik
        // om en kollision sker, kör callback metoden playerHit
        this.physics.add.collider(
            this.player,
            this.spikes, 
            this.playerHit,
            null,
            this
        ); */

        // krocka med platforms lagret
        this.physics.add.collider(this.player, this.platforms);

        // skapa text på spelet, texten är tom
        // textens innehåll sätts med updateText() metoden
        this.text = this.add.text(16, 16, '', {
            fontSize: '20px',
            fill: '#ffffff'
        });
        this.text.setScrollFactor(0);
        this.updateText();

        // lägg till en keyboard input för W
        this.keyObj = this.input.keyboard.addKey('W', true, false);

        // exempel för att lyssna på events
        this.events.on('pause', function () {
            console.log('Play scene paused');
        });
        this.events.on('resume', function () {
            console.log('Play scene resumed');
        });
    }

    // play scenens update metod
    update() {
        if (this.player.x > 700 && this.player.x < 9800) {
            this.cameras.main.x = -this.player.x + 700;
            this.middleBackground.x = this.player.x * 0.9 - 630;
            this.deepMiddleBackground.x = this.player.x * 0.95 - 665;
            this.healthbarContainer.x = this.player.x - 491;
            this.healthbar.x = this.player.x - 490;
            this.menu.x = this.player.x - 700;
        }
        else if (this.player.x < 696) {
            this.cameras.main.x = 0;
            this.middleBackground.x = 0;
            this.deepMiddleBackground.x = 0;
            this.healthbarContainer.x = 209;
            this.healthbar.x = 210;
            this.menu.x = 0;
        }
        

        this.healthbar.width = this.coldLevelFactor * 298;

        // för pause
        if (this.keyObj.isDown) {
            // pausa nuvarande scen
            this.scene.pause();
            // starta menyscenene
            this.scene.launch('MenuScene');
        }

        // följande kod är från det tutorial ni gjort tidigare
        // Control the player with left or right keys
        if (this.cursors.left.isDown && this.tapAllowed && (this.coldLevel >= 1)) {
            this.velocity -= this.stridePower;
            this.tapAllowed = false;
            if (this.player.body.onFloor()) {
                this.player.play('walk', true);
            }
        } 
        if (this.cursors.right.isDown && this.tapAllowed && (this.coldLevel >= 1)) {
            this.velocity += this.stridePower;
            this.tapAllowed = false;
            if (this.player.body.onFloor()) {
                this.player.play('walk', true);
            }
        } else if (!this.cursors.right.isDown && !this.cursors.left.isDown) {
            this.tapAllowed = true;
            // Only show the idle animation if the player is footed
            // If this is not included, the player would look idle while jumping

            if (this.player.body.onFloor() && this.deathtimer == 2) {
                this.player.play('idle', true);
            }
        }

        // Player can jump while walking any direction by pressing the space bar
        // or the 'UP' arrow
        if (
            (this.cursors.space.isDown || this.cursors.up.isDown) &&
            this.player.body.onFloor() && this.deathtimer >= 2
        ) {
            this.player.setVelocityY(-550);
            this.player.play('jumpingUp');
        }

        if (this.player.body.velocity.y > 100) {
            this.player.play('jumpingDown');
        }

        if (this.player.body.velocity.x > 0) {
            this.player.setFlipX(false);
        } else if (this.player.body.velocity.x < 0) {
            // otherwise, make them face the other side
            this.player.setFlipX(true);
        }
        if (this.player.x > 1000) {
            this.inColdZone = true
        }
        
        this.player.setVelocityX(this.velocity);
    }


    // metoden updateText för att uppdatera overlaytexten i spelet
    updateText() {
        this.text.setText(
            `Spam Right-Arrow to reach the Zeunerts factory. Space to jump. W to pause. Zeunerts: ${this.zeunertsAmmountBank}`
        );
        
    }

    // när spelaren landar på en spik, då körs följande metod
    playerHit(player, spike) {
        this.spiked++;
        player.setVelocity(0, 0);
        player.setX(50);
        player.setY(300);
        player.play('idle', true);
        let tw = this.tweens.add({
            targets: player,
            alpha: { start: 0, to: 1 },
            tint: { start: 0xff0000, to: 0xffffff },
            duration: 100,
            ease: 'Linear',
            repeat: 5
        });
        this.updateText();
    }

    // när vi skapar scenen så körs initAnims för att ladda spelarens animationer
    initAnims() {           
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNames('dude', {
                start: 0,
                end: 2,
                zeroPad: 2,
                prefix: 'adventurer-idle-2-'
            }),
            frameRate: 8,
            repeat: -1
        });
        
        this.anims.create({
            key: 'jumpingUp',
            frames: this.anims.generateFrameNames('dude', {
                start: 0,
                end: 3,
                zeroPad: 2,
                prefix: 'adventurer-jump-'
            }),
            frameRate: 30
        });

        this.anims.create({
            key: 'jumpingDown',
            frames: this.anims.generateFrameNames('dude', {
                start: 0,
                end: 1,
                zeroPad: 2,
                prefix: 'adventurer-fall-'
            }),
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNames('dude', {
                start: 0,
                end: 5,
                zeroPad: 2,
                prefix: 'adventurer-run-'
            }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'death',
            frames: this.anims.generateFrameNames('dude', {
                start: 0,
                end: 6,
                zeroPad: 2,
                prefix: 'adventurer-die-'
            }),
            frameRate: 40,
            repeat: 1
        });
    }
    
}

function returnToBase() {
var interval = setInterval(() => {
        if (player.x > 300) {
            player.x -= 10;
        }
        else clearInterval(interval);
    }, 1);
}

export default PlayScene;
