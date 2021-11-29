var gameObject;
class PlayScene extends Phaser.Scene {
    constructor() {
        super('PlayScene');
    }
    
    create() {
        gameObject = this;
        this.velocity = 0;
        this.averageSpeed = 0;
        this.travelBackSpeed = 0;
        this.stridePower = 250;
        this.groundFriction = 0.7;
        this.maxSpeed = 200;
        this.fortitude = 5;
        
        this.coldLevelFactor = 1
        this.coldLevel = 100;
        this.maxColdLevel = 100;
        this.jumpPower = 400;
        this.tapAllowed = true;
        this.inColdZone = false;
        this.reset = false;
        this.deathtimer = 2;
        this.allowDeath = true;
        this.distanceTraveled = 0;
        this.zeunertsAmmountBank = 101;
        this.zeunertsAmmountGain = 0;

        this.stridePowerCost = 10;
        this.groundFrictionCost = 10;
        this.maxSpeedCost = 10;
        this.fortitudeCost = 50;

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
                    if (this.zeunertsAmmountBank >= this.stridePowerCost) {this.stridePowerButton.setFrame(0);}
                    if (this.zeunertsAmmountBank >= this.groundFrictionCost) {this.groundFrictionButton.setFrame(0);}
                    if (this.zeunertsAmmountBank >= this.maxSpeedCost) {this.maxSpeedButton.setFrame(0);}
                    if (this.zeunertsAmmountBank >= this.fortitudeCost) {this.fortitudeButton.setFrame(0);}
                    this.updateText();
                }
            }
            else if (this.inColdZone && this.deathtimer >= 2) {
                this.distanceTraveled = this.player.x - 1000;
                this.zeunertsAmmountGain = Math.floor(this.distanceTraveled/100);
                this.coldLevel -= this.fortitude;
                this.player.tint = this.coldLevelFactor*1000 * 0x0000ff;
                console.log(this.coldLevel + " zeunerts = " + this.zeunertsAmmountGain );
            }
            else if (!this.inColdZone) {
                console.log("In warm zone");
            }
            this.coldLevelFactor = this.coldLevel/100;
        }, 100);

        setInterval(() => {
            this.averageSpeed = Math.abs(Math.round(this.velocity/100));
        }, 200);

        setInterval(() => {
            if (this.travelBackSpeed > 0) {
                this.player.x -= this.travelBackSpeed;
            }
        }, 10);

        
        // skapa en tilemap från JSON filen vi preloadade
        const map = this.make.tilemap({ key: 'map' });
        // ladda in tilesetbilden till vår tilemap
        const tileset = map.addTilesetImage('jefrens_tilesheet', 'tiles');

        // initiera animationer
        this.initAnims();

        // keyboard cursors
        this.cursors = this.input.keyboard.createCursorKeys();

        this.isClicking = false;

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

        this.player = this.physics.add.sprite(600, 300, 'dude');
        this.player.setBounce(0).setScale(1.75);
        this.player.setCollideWorldBounds(true);
        this.player.setSize(32, 36, 50, 100);
        this.cameras.main.x = -this.player.x + 700;

        //Rectangles
        this.dangerBorder = this.add.rectangle(1000, 526, 10, 50, 0x166df7);
        this.dangerBorder.setOrigin(0,0);
        this.menu = this.add.rectangle(0, 640, window.innerWidth, 80, 0x000000);
        this.menu.setOrigin(0,0);
        this.healthbarContainer = this.add.rectangle(10, 695, 300, 20, 0xfffffff);
        this.healthbarContainer.setStrokeStyle(2, 0xfffffff)
        this.healthbarContainer.setOrigin(0,0.5);
        this.healthbar = this.add.rectangle(11, 695, 298, 18, 0x4dafff);
        this.healthbar.setOrigin(0,0.5);

        //Texts
        this.coldLevelText = this.add.text(0, 645, 'Cold level', {font: '32px CustomFont', fontWeight: '1000', fontSize: '32px'});
        this.zeunertsAmmountText = this.add.text(0, 645, 'Zeunerts wealth', {font: '32px CustomFont'});
        this.zeunertsIcon = this.add.sprite(0, 697, 'zeunerts').setScale(0.05,0.05);
        this.zeunertsAmmountTextValue = this.add.text(0, 680, `Flasks: ${ this.zeunertsAmmountBank }`, {font: '32px CustomFont', fontWeight: '1000', fontSize: '32px'});
        this.stridePowerText = this.add.text(0, 645, 'Stride Power',{font: '20px CustomFont'});
        this.stridePowerTextCost = this.add.text(0, 700, this.stridePowerCost,{font: '20px CustomFont'});
        this.groundFrictionText = this.add.text(0, 645, 'Friction',{font: '20px CustomFont'}); 
        this.groundFrictionTextCost = this.add.text(0, 700, this.groundFrictionCost,{font: '20px CustomFont'});
        this.maxSpeedText = this.add.text(0, 645, 'Max Speed',{font: '20px CustomFont'}); 
        this.maxSpeedTextCost = this.add.text(0, 700, this.maxSpeedCost,{font: '20px CustomFont'});
        this.fortitudeText = this.add.text(0, 645, 'Cold Fortitude',{font: '20px CustomFont'}); 
        this.fortitudeTextCost = this.add.text(0, 700, this.fortitudeCost,{font: '20px CustomFont'});

        this.speedText = this.add.text(0, 645, 'km/h', {font: '30px CustomFont'});
        this.speedTextValue = this.add.text(0, 670, '0', {font: '40px CustomFont'});

        //Buttons
        this.stridePowerButton = this.add.sprite(590, 682,'button').setScale(0.15,0.15).setInteractive().setFrame(2);
        this.groundFrictionButton = this.add.sprite(this.stridePowerButton.x+100, 682,'button').setScale(0.15,0.15).setInteractive().setFrame(2);
        this.maxSpeedButton = this.add.sprite(this.stridePowerButton.x+200, 682,'button').setScale(0.15,0.15).setInteractive().setFrame(2);
        this.fortitudeButton = this.add.sprite(this.stridePowerButton.x+300, 682,'button').setScale(0.15,0.15).setInteractive().setFrame(2);

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
        if (this.player.x > 700 && this.player.x < 19800) {
            this.cameras.main.x = -this.player.x + 700;
            this.middleBackground.x = this.player.x * 0.9 - 630;
            this.deepMiddleBackground.x = this.player.x * 0.95 - 665;
            this.menu.x = this.player.x - 700;
            this.healthbarContainer.x = this.player.x - 491;
            this.healthbar.x = this.player.x - 490;
            this.coldLevelText.x = this.player.x - 490;
            this.zeunertsAmmountText.x = this.player.x + 300;
            this.zeunertsAmmountTextValue.x = this.player.x + 300;
            this.zeunertsIcon.x = this.player.x + 450; 
            //Texts
            this.stridePowerText.x = this.player.x - 160;
            this.groundFrictionText.x = this.player.x - 40;
            this.maxSpeedText.x = this.player.x + 48;
            this.fortitudeText.x = this.player.x + 145;

            this.stridePowerTextCost.x = this.player.x - 118;
            this.groundFrictionTextCost.x = this.stridePowerTextCost.x + 100;
            this.maxSpeedTextCost.x = this.stridePowerTextCost.x + 200;
            this.fortitudeTextCost.x = this.stridePowerTextCost.x + 300;

            //Buttons
            this.stridePowerButton.x = this.player.x - 110;
            this.groundFrictionButton.x = this.stridePowerButton.x + 100;
            this.maxSpeedButton.x = this.stridePowerButton.x + 200;
            this.fortitudeButton.x = this.stridePowerButton.x + 300;

            this.speedText.x = this.player.x + 650;
            this.speedTextValue.x = this.player.x + 664;

        }
        else if (this.player.x < 696) {
            this.cameras.main.x = 0;
            this.middleBackground.x = 0;
            this.deepMiddleBackground.x = 0;
            this.menu.x = 0;
            this.healthbarContainer.x = 209;
            this.healthbar.x = 210;
            this.coldLevelText.x = 210;
            this.zeunertsAmmountText.x = 1000;
            this.zeunertsAmmountTextValue.x = 1000;
            this.zeunertsIcon.x = 1150;
            //Texts
            this.stridePowerText.x = 540; 
            this.groundFrictionText.x = 660;
            this.maxSpeedText.x = 748;
            this.fortitudeText.x = 845; 

            this.stridePowerTextCost.x = 582;
            this.groundFrictionTextCost.x = 682;
            this.maxSpeedTextCost.x = 782;
            this.fortitudeTextCost.x = 882;
            //Buttons
            this.stridePowerButton.x = 590;
            this.groundFrictionButton.x = this.stridePowerButton.x + 100;
            this.maxSpeedButton.x = this.stridePowerButton.x + 200;
            this.fortitudeButton.x = this.stridePowerButton.x + 300;

            this.speedText.x = 1350;
            this.speedTextValue.x = 1364;
            
        }
        this.healthbar.width = this.coldLevelFactor * 298;

        // StridePower //
        //On Pointer Out
        this.stridePowerButton.on('pointerout',function(){
            if(gameObject.zeunertsAmmountBank >= gameObject.stridePowerCost){
                this.setFrame(0);
            }
        });
        //On Hover
        this.stridePowerButton.on('pointerover',function(){
            if(gameObject.zeunertsAmmountBank >= gameObject.stridePowerCost){
                this.setFrame(1);
            }
        });
        //On Click
        this.stridePowerButton.on('pointerdown',function(){
            if(gameObject.zeunertsAmmountBank >= gameObject.stridePowerCost && !(gameObject.isClicking)){
                gameObject.isClicking = true;
                gameObject.upgradeStridePower();
                gameObject.updateText();
            }
        });
        //Pointer Up
        this.stridePowerButton.on('pointerup',function() {
                gameObject.isClicking = false;
        });

        // Friction //
        //On Pointer Out
        this.groundFrictionButton.on('pointerout',function(){
            if(gameObject.zeunertsAmmountBank >= gameObject.groundFrictionCost){
                this.setFrame(0);
            }
        });
        //On Hover
        this.groundFrictionButton.on('pointerover',function(){
            if(gameObject.zeunertsAmmountBank >= gameObject.groundFrictionCost){
                this.setFrame(1);
            }
        });
        //On Click
        this.groundFrictionButton.on('pointerdown',function(){
            if(gameObject.zeunertsAmmountBank >= gameObject.groundFrictionCost && !(gameObject.isClicking)){
                gameObject.isClicking = true;
                gameObject.upgradeFriction();
                gameObject.updateText();
            }
        });
        //Pointer Up
        this.groundFrictionButton.on('pointerup',function() {
                gameObject.isClicking = false;
        });

        //Max Speed
        //On Pointer Out
        this.maxSpeedButton.on('pointerout',function(){
            if(gameObject.zeunertsAmmountBank >= gameObject.maxSpeedCost){
                this.setFrame(0);
            }
        });
        //On Hover
        this.maxSpeedButton.on('pointerover',function(){
            if(gameObject.zeunertsAmmountBank >= gameObject.maxSpeedCost){
                this.setFrame(1);
            }
        });
        //On Click
        this.maxSpeedButton.on('pointerdown',function(){
            if(gameObject.zeunertsAmmountBank >= gameObject.maxSpeedCost && !(gameObject.isClicking)){
                gameObject.isClicking = true;
                gameObject.upgradeMaxSpeed();
                gameObject.updateText();
            }
        });
        //Pointer Up
        this.maxSpeedButton.on('pointerup',function() {
                gameObject.isClicking = false;
        });

        //Fortitude
        //On Pointer Out
        this.fortitudeButton.on('pointerout',function(){
            if(gameObject.zeunertsAmmountBank >= gameObject.fortitudeCost){
                this.setFrame(0);
            }
        });
        //On Hover
        this.fortitudeButton.on('pointerover',function(){
            if(gameObject.zeunertsAmmountBank >= gameObject.fortitudeCost){
                this.setFrame(1);
            }
        });
        //On Click
        this.fortitudeButton.on('pointerdown',function(){
            if(gameObject.zeunertsAmmountBank >= gameObject.fortitudeCost && !(gameObject.isClicking)){
                gameObject.isClicking = true;
                gameObject.upgradeFortitude();
                gameObject.updateText();
            }
        });
        //Pointer Up
        this.fortitudeButton.on('pointerup',function() {
                gameObject.isClicking = false;
        });
        
            
        

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
        this.speedTextValue.setText(this.averageSpeed); 
    }


    upgradeStridePower() {
        this.stridePowerButton.setFrame(2);
        this.zeunertsAmmountBank -= this.stridePowerCost;
        this.stridePowerCost = Math.floor(this.stridePowerCost * 1.5);
        this.stridePower = Math.floor(this.stridePower * 1.15);
        this.updateButtons();
    }

    upgradeFriction() {
        this.groundFrictionButton.setFrame(2);
        this.zeunertsAmmountBank -= this.groundFrictionCost;
        this.groundFrictionCost = Math.floor(this.groundFrictionCost * 1.5);
        this.groundFriction = (this.groundFriction * 1.05);
        this.updateButtons();
    }

    upgradeMaxSpeed() {
        this.maxSpeedButton.setFrame(2);
        this.zeunertsAmmountBank -= this.maxSpeedCost;
        this.maxSpeedCost = Math.floor(this.maxSpeedCost * 1.5);
        this.maxSpeed = Math.floor(this.maxSpeed * 1.25);
        this.updateButtons();
    }

    upgradeFortitude() {
        this.fortitudeButton.setFrame(2);
        this.zeunertsAmmountBank -= this.fortitudeCost;
        this.fortitudeCost = Math.floor(this.fortitudeCost * 1.5);
        this.fortitude = Math.floor(this.fortitude * 0.9);
        this.updateButtons();
    }

    updateButtons() {
        if (this.stridePowerCost > this.zeunertsAmmountBank) {this.stridePowerButton.setFrame(2);}
        if (this.groundFrictionCost > this.zeunertsAmmountBank) {this.groundFrictionButton.setFrame(2);}
        if (this.maxSpeedCost > this.zeunertsAmmountBank) {this.maxSpeedButton.setFrame(2);}
        if (this.fortitudeCost > this.zeunertsAmmountBank) {this.fortitudeButton.setFrame(2);}
    }

    // metoden updateText för att uppdatera overlaytexten i spelet
    updateText() {
        this.zeunertsAmmountTextValue.setText(
            `Flasks: ${this.zeunertsAmmountBank}`
        );
        this.stridePowerTextCost.setText(
            `${this.stridePowerCost}`
        )
        this.groundFrictionTextCost.setText(
            `${this.groundFrictionCost}`
        )
        this.maxSpeedTextCost.setText(
            `${this.maxSpeedCost}`
        )
        this.fortitudeTextCost.setText(
            `${this.fortitudeCost}`
        )
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

export default PlayScene;