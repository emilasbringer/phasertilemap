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
        this.allowShop = false;
        this.distanceTraveled = 0;
        this.zeunertsAmmountBank = parseInt(localStorage.getItem('ZeunertsBank')) || 0;
        this.zeunertsAmmountBank = 99999999;
        this.zeunertsAmmountGain = 0;
        this.zeunertsTotalGainHigh = parseInt(localStorage.getItem('ZeunertsBank')) || 0;

        this.stridePowerCost = 10;
        this.groundFrictionCost = 10;
        this.maxSpeedCost = 10;
        this.fortitudeCost = 50;
        this.upgradeLevels = [0,0,0,0];
        this.gameLoop = this.time.addEvent({ delay: 100, callback: this.gameLoopUpdate, callbackScope: this, loop: true });
        this.speedOmeterLoop = this.time.addEvent({ delay: 200, callback: this.speedOMeterUpdate, callbackScope: this, loop: true });
        this.themeMusic = this.sound.add("sickoMusic");
        this.themeMusic.play();
        this.dashEffect = this.sound.add('skiDash', {volume: 0.6});
        this.completedLaps = 0;
        
        // skapa en tilemap från JSON filen vi preloadade
        const map = this.make.tilemap({ key: 'map' });
        // ladda in tilesetbilden till vår tilemap
        const tileset = map.addTilesetImage('wintertileset64x64', 'tiles');

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
        this.buildings = map.createLayer('buildings', tileset).setDepth(-2);
        this.middleBackground = map.createLayer('middle', tileset).setDepth(-8);
        this.deepMiddleBackground = map.createLayer('deepmiddle', tileset).setDepth(-9);
        this.background = map.createLayer('background', tileset).setDepth(-3);

        this.mountain = this.add.sprite(6500, 494, 'mountain');
        
        // platforms.setCollisionByProperty({ collides: true });
        // this.platforms.setCollisionFromCollisionGroup(
        //     true,
        //     true,
        //     this.platforms
        // );
        // platforms.setCollision(1, true, true);

        console.log(map);

        this.player = this.physics.add.sprite(600, 300, 'dude');
        this.player.setBounce(0).setScale(1.75);
        this.player.setCollideWorldBounds(true);
        this.player.setSize(70, 63);
        this.cameras.main.x = -this.player.x + 700; 
        this.cameras.main.y = -256; 

        this.vendor = this.add.sprite(160, 608, 'vendor').setDepth(-2);

        this.startFlag = this.add.sprite(0, 0, 'startflag');

        this.endBorder = this.add.rectangle(15000, 526, 10, 50, 0x166df7);
        //Rectangles
        this.menu = this.add.rectangle(0, 256, window.innerWidth, 80, 0x000000);
        this.menu.setOrigin(0,0);
        this.healthbarContainer = this.add.rectangle(10, (this.menu.y+45), 300, 20, 0xfffffff);
        this.healthbarContainer.setStrokeStyle(2, 0xfffffff)
        this.healthbarContainer.setOrigin(0,0.5);
        this.healthbar = this.add.rectangle(11, (this.menu.y+45), 298, 18, 0x4dafff);
        this.healthbar.setOrigin(0,0.5);
        this.shopScreenBorder = this.add.rectangle(750, 600, 716, 516, 0x000000);
        this.shopScreen = this.add.rectangle(750, 600, 700, 500, 0x303060);

        //Texts
        this.coldLevelText = this.add.text(0, this.menu.y, 'Cold level', {font: '32px CustomFont', fontWeight: '1000', fontSize: '32px'});
        this.zeunertsAmmountText = this.add.text(0, this.menu.y, 'Zeunerts wealth', {font: '32px CustomFont'});
        this.zeunertsIcon = this.add.sprite(0, (this.menu.y + 57), 'zeunerts').setScale(0.05,0.05);
        this.zeunertsAmmountTextValue = this.add.text(0, (this.menu.y+40), `Flasks: ${ this.zeunertsAmmountBank }`, {font: '32px CustomFont', fontWeight: '1000', fontSize: '32px'});
        this.stridePowerText = this.add.text(0, (this.shopScreen.y-200), 'Stride Power',{font: '20px CustomFont'});
        this.stridePowerTextCost = this.add.text(0, (this.shopScreen.y), this.stridePowerCost,{font: '20px CustomFont'});
        this.groundFrictionText = this.add.text(0, (this.shopScreen.y-200), 'Friction',{font: '20px CustomFont'}); 
        this.groundFrictionTextCost = this.add.text(0, (this.shopScreen.y), this.groundFrictionCost,{font: '20px CustomFont'});
        this.maxSpeedText = this.add.text(0, (this.shopScreen.y-200), 'Max Speed',{font: '20px CustomFont'}); 
        this.maxSpeedTextCost = this.add.text(0, (this.shopScreen.y), this.maxSpeedCost,{font: '20px CustomFont'});
        this.fortitudeText = this.add.text(0, (this.shopScreen.y-200), 'Cold Fortitude',{font: '20px CustomFont'}); 
        this.fortitudeTextCost = this.add.text(0, (this.shopScreen.y), this.fortitudeCost,{font: '20px CustomFont'});

        this.speedText = this.add.text(0, (this.menu.y), 'km/h', {font: '30px CustomFont'});
        this.speedTextValue = this.add.text(0, (this.menu.y+30), '0', {font: '40px CustomFont'});

        //Buttons
        this.stridePowerButton = this.add.sprite(525, (this.shopScreen.y-100),'button').setScale(0.4,0.4).setInteractive().setFrame(2);
        this.groundFrictionButton = this.add.sprite(this.stridePowerButton.x+150, (this.shopScreen.y-100),'button').setScale(0.4,0.4).setInteractive().setFrame(2);
        this.maxSpeedButton = this.add.sprite(this.stridePowerButton.x+300, (this.shopScreen.y-100),'button').setScale(0.4,0.4).setInteractive().setFrame(2);
        this.fortitudeButton = this.add.sprite(this.stridePowerButton.x+450, (this.shopScreen.y-100),'button').setScale(0.4,0.4).setInteractive().setFrame(2);

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
        this.physics.add.collider(this.vendor, this.platforms);
        this.physics.add.collider(this.player, this.platforms);

        // skapa text på spelet, texten är tom
        // textens innehåll sätts med updateText() metoden
        this.text = this.add.text(16, 16, '', {
            fontSize: '20px',
            fill: '#ffffff'
        });
        this.text.setScrollFactor(0);
        this.updateText();
        console.log("Cant refresh buttons because i am trash programmer. Updating buttons with ZeunertsBank = " + this.zeunertsAmmountBank);
        this.updateButtons();

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
        // UI //
        {
        
        if (this.player.x > 700 && this.player.x < 19800) {
            this.cameras.main.x = -this.player.x + 700;
            this.middleBackground.x = this.player.x * 0.5 - 350;
            this.deepMiddleBackground.x = this.player.x * 0.05 - 490;
            this.menu.x = this.player.x - 700;
            this.healthbarContainer.x = this.player.x - 491;
            this.healthbar.x = this.player.x - 490;
            this.coldLevelText.x = this.player.x - 490;
            this.zeunertsAmmountText.x = this.player.x + 300;
            this.zeunertsAmmountTextValue.x = this.player.x + 300;
            this.zeunertsIcon.x = this.player.x + 410; 
           

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
            this.zeunertsIcon.x = 1110;
            //Texts
            this.stridePowerText.x = 540; 
            this.groundFrictionText.x = 660;
            this.maxSpeedText.x = 748;
            this.fortitudeText.x = 845; 
            this.stridePowerTextCost.x = 582;
            this.groundFrictionTextCost.x = 682;
            this.maxSpeedTextCost.x = 782;
            this.fortitudeTextCost.x = 882;
            

            this.speedText.x = 1350;
            this.speedTextValue.x = 1364;
            
        }
        this.healthbar.width = this.coldLevelFactor * 298;
        this.vendor.play('vendoridle', true);
        this.startFlag.play('flagwave', true);
    }
        // Upgrades //
        {
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
    }    
            
        if (this.allowShop) {
            this.setUpgradeButtonsVisability(true);
        }
        else {
            this.setUpgradeButtonsVisability(false);
        }
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
            this.dashEffect.play();
            if (this.player.body.onFloor() && this.player.x > 1000) {
                this.player.play('walk', true);
            }
        } 
        if (this.cursors.right.isDown && this.tapAllowed && (this.coldLevel >= 1)) {
            this.velocity += this.stridePower;
            this.tapAllowed = false;
            this.dashEffect.play();
            if (this.player.body.onFloor() && this.player.x > 1000) {
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
        
        }

        if (this.player.body.velocity.y > 100) {
           
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

        if (this.player.x < 300) {
            this.allowShop = true;
        }
        else {
            this.allowShop = false;
        }

        if (this.player.x > 12288 && this.completedLaps < 10) {
            this.player.x = 2048
            this.completedLaps++;
        }
        
        if (this.velocity > 10 && this.player.x > 1000) {
            this.player.play('walk', true);
        }

        this.player.setVelocityX(this.velocity);
        this.speedTextValue.setText(this.averageSpeed); 
    }

    //--- Game Loop ---
    gameLoopUpdate() {
        this.velocity = this.groundFriction * this.velocity;
            
            if (this.coldLevel <= 0) {
                this.deathtimer -= 0.1;
                console.log("Cold level critical");
                if (this.allowDeath) {
                    console.log("Play DeathAnimation");
                    
                    this.allowDeath = false;
                }
                if (this.deathtimer <= 0) {
                    console.log("Resetting deathtimer");
                    this.deathtimer = 2;
                    this.reset = true;
                }
            }
            if (this.reset) {
                this.reset = false;
                this.completedLaps = 0;
                this.coldLevel = this.maxColdLevel;
                console.log("Reseting...");
                this.player.x = 450;
                this.player.y = 500;
                this.inColdZone = false;
                this.coldLevel = this.maxColdLevel;
                this.allowDeath = true;
                this.zeunertsAmmountBank += this.zeunertsAmmountGain;
                this.zeunertsTotalGainHigh += this.zeunertsAmmountGain
                localStorage.setItem("ZeunertsBank", this.zeunertsTotalGainHigh);
                console.log("Gained " + this.zeunertsAmmountGain + " flasks of zeunerts this round. Your total Zeunerts is now " + this.zeunertsAmmountBank);
                this.zeunertsAmmountGain = 0;
                if (this.zeunertsAmmountBank >= this.stridePowerCost) {this.stridePowerButton.setFrame(0);}
                if (this.zeunertsAmmountBank >= this.groundFrictionCost) {this.groundFrictionButton.setFrame(0);}
                if (this.zeunertsAmmountBank >= this.maxSpeedCost) {this.maxSpeedButton.setFrame(0);}
                if (this.zeunertsAmmountBank >= this.fortitudeCost) {this.fortitudeButton.setFrame(0);}
                this.updateText();
            }
            else if (this.inColdZone && this.deathtimer >= 2) {
                this.distanceTraveled = this.player.x - 1000;
                this.zeunertsAmmountGain = Math.floor(this.distanceTraveled/100);
                this.coldLevel -= this.fortitude;
                console.log("Traveled " + (Math.floor( this.distanceTraveled/50)) + " Meters");
            }
            this.coldLevelFactor = this.coldLevel/100;
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
        this.groundFriction = (Math.pow(this.groundFriction, 0.9) );
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

    setUpgradeButtonsVisability(boolean) {
        this.maxSpeedButton.setVisible(boolean);
        this.maxSpeedText.setVisible(boolean);
        this.maxSpeedTextCost.setVisible(boolean);
        this.groundFrictionButton.setVisible(boolean);
        this.groundFrictionText.setVisible(boolean);
        this.groundFrictionTextCost.setVisible(boolean);
        this.stridePowerButton.setVisible(boolean);
        this.stridePowerText.setVisible(boolean);
        this.stridePowerTextCost.setVisible(boolean);
        this.fortitudeButton.setVisible(boolean);
        this.fortitudeText.setVisible(boolean);
        this.fortitudeTextCost.setVisible(boolean);
        this.shopScreen.setVisible(boolean);
        this.shopScreenBorder.setVisible(boolean);
    }

    // metoden updateText för att uppdatera overlaytexten i spelet
    updateText() {
        this.zeunertsAmmountTextValue.setText(
            `Flasks:     ${this.zeunertsAmmountBank}`
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

    speedOMeterUpdate() {
        this.averageSpeed = Math.abs(Math.round(this.velocity/100));
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
                prefix: 'idle'
            }),
            frameRate: 8,
            repeat: -1
        });
        
    

        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNames('dude', {
                start: 1,
                end: 30,
                zeroPad: 2,
                prefix: 'slide'
            }),
            frameRate: 20,
            repeat: 1
        });

        // Death //


        this.anims.create({
            key: 'vendoridle',
            frames: this.anims.generateFrameNames('vendor', {
                start: 1,
                end: 6,
                zeroPad: 2,
                prefix: 'vendor'
            }),
            frameRate: 10,
            repeat: 1
        });
        this.anims.create({
            key: 'flagwave',
            frames: this.anims.generateFrameNames('startflag', {
                start: 0,
                end: 4,
                zeroPad: 3,
                prefix: 'tile'
            }),
            frameRate: 5,
            repeat: -1
        });
    }
}

export default PlayScene;