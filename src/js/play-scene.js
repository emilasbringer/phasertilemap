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
        this.stridePower = 200;
        this.groundFriction = 0.7;
        this.maxSpeed = 1;
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
        this.zeunertsAmmountBank = 0;
        this.zeunertsAmmountGain = 0;
        this.zeunertsTotalGainHigh = parseInt(localStorage.getItem('ZeunertsBank')) || 0;

        this.stridePowerCost = 10;
        this.groundFrictionCost = 10;
        this.maxSpeedCost = 10;
        this.fortitudeCost = 50;
        this.upgradeLevels = [0,0,0,0];
        this.gameLoop = this.time.addEvent({ delay: 100, callback: this.gameLoopUpdate, callbackScope: this, loop: true });
        this.speedOmeterLoop = this.time.addEvent({ delay: 200, callback: this.speedOMeterUpdate, callbackScope: this, loop: true });
        this.displayZeunertsGainerTimer = this.time.addEvent({ delay: 10, callback: this.displayZeunertsGain, callbackScope: this, loop: true });
        this.themeMusic = this.sound.add("sickoMusic");
        this.themeMusic.play();
        this.dashEffect = this.sound.add('skiDash', {volume: 0.6});
        this.completedLaps = 0;
        this.displayStartScreen = true;
        
        // skapa en tilemap från JSON filen vi preloadade
        const map = this.make.tilemap({ key: 'map' });
        // ladda in tilesetbilden till vår tilemap
        const tileset = map.addTilesetImage('wintertileset64x64', 'tiles');
        const layer1 = map.addTilesetImage('layer-1', 'layer-1');
        const layer2 = map.addTilesetImage('layer-2', 'layer-2');
        const layer3 = map.addTilesetImage('layer-3', 'layer-3');
        const layer4 = map.addTilesetImage('layer-4', 'layer-4');

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
        this.background = map.createLayer('background', tileset).setDepth(-3);
        this.middleBackground = map.createLayer('middle', tileset).setDepth(-8);
        this.deepMiddleBackground = map.createLayer('deepmiddle', tileset).setDepth(-9);
        this.deepDeepBackground = map.createLayer('deepDeepBackground', layer1).setDepth(-10);
        this.deepDeepDeepBackground = map.createLayer('deepDeepDeepBackground', layer2).setDepth(-11);
        this.deepDeepDeepDeepBackground = map.createLayer('deepDeepDeepDeepBackground', layer3).setDepth(-12);
        this.deepDeepDeepDeepDeepBackground = map.createLayer('deepDeepDeepDeepDeepBackground', layer4).setDepth(-13);
        

        
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
        this.player.setSize(70, 63);
        this.cameras.main.x = -this.player.x + 700; 
        this.cameras.main.y = -256; 

        this.vendor = this.add.sprite(160, 608, 'vendor').setDepth(-2);
        this.sign = this.add.sprite(1200, 400, 'sign').setScale(4.5,3).setDepth(-2);

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
        this.zeunertsGainerDisplay = this.add.rectangle(0, 285, 600, 80, 0x010101).setDepth(-1);
        this.zeunertsGainerDisplay.setStrokeStyle(5, 0x4dafff)
        this.distanceDisplay = this.add.rectangle(innerWidth-11, 900, 70, 500, 0x999999).setOrigin(1,1).setStrokeStyle(5,0x000000);
        this.startScreen = this.add.rectangle(innerWidth/2,innerHeight-105,innerWidth,innerHeight*2, 0x363636).setDepth(100);
        
        

        //Texts
        this.startScreenText =  this.add.text(400, 300, 'Welcome brave penguin!',{font: '80px CustomFont', fontWeight: '1000', fontSize: '32px'}).setDepth(110);
        this.startScreenText2 =  this.add.text(460, 400, 'To the Zunerts Chronicles',{font: '60px CustomFont', fontWeight: '1000', fontSize: '32px'}).setDepth(110);
        this.startScreenText3 =  this.add.text(630, 460, '(For copyright reasons)',{font: '20px CustomFont', fontWeight: '1000', fontSize: '32px'}).setDepth(110);
        this.startScreenText4 =  this.add.text(630, 800, '(SPAM < ^ > arrow keys to move)',{font: '20px CustomFont', fontWeight: '1000', fontSize: '32px'}).setDepth(110);
        this.startScreenText5 =  this.add.text(700, 860, '(Space to jump)',{font: '20px CustomFont', fontWeight: '1000', fontSize: '32px'}).setDepth(110);
        this.menuPenguin = this.add.sprite(750,600, 'dude').setDepth(200).setScale(3,3);
        this.creatorText = this.add.text(200, (900), 'Created by Emil Åsbringer TE19', {font: '96px CustomFont'}).setDepth(110);
        this.smallCreatorText = this.add.text(20, (950), 'Created by Emil Åsbringer TE19', {font: '32px CustomFont'}).setDepth(90);

        this.zeunertsAmmountText =      this.add.text(0, this.menu.y, 'Zeunerts wealth', {font: '32px CustomFont'});
        this.zeunertsIcon =             this.add.sprite(0, (this.menu.y + 57), 'zeunerts').setScale(0.05,0.05);
        this.coldLevelText =            this.add.text(0, this.menu.y, 'Cold level', {font: '32px CustomFont', fontWeight: '1000', fontSize: '32px'});
        this.zeunertsAmmountTextValue = this.add.text(0, (this.menu.y+40), `Flasks: ${ this.zeunertsAmmountBank }`, {font: '32px CustomFont', fontWeight: '1000', fontSize: '32px'});
        this.stridePowerText =          this.add.text(450, (this.shopScreen.y-200), 'Stride Power',{font: '30px CustomFont'});
        this.groundFrictionText =       this.add.text(620, (this.shopScreen.y-200), 'Friction',{font: '30px CustomFont'}); 
        this.maxSpeedText =             this.add.text(750, (this.shopScreen.y-200), 'Max Speed',{font: '30px CustomFont'}); 
        this.fortitudeText =            this.add.text(900, (this.shopScreen.y-200), 'Cold Fortitude',{font: '30px CustomFont'}); 
        this.stridePowerTextCost =      this.add.text(510, (this.shopScreen.y), this.stridePowerCost,{font: '30px CustomFont'});
        this.groundFrictionTextCost =   this.add.text(655, (this.shopScreen.y), this.groundFrictionCost,{font: '30px CustomFont'});
        this.maxSpeedTextCost =         this.add.text(810, (this.shopScreen.y), this.maxSpeedCost,{font: '30px CustomFont'});
        this.fortitudeTextCost =        this.add.text(955, (this.shopScreen.y), this.fortitudeCost,{font: '30px CustomFont'});
        this.shopZeunertsWealth =       this.add.text(655, (this.shopScreen.y+100), 'Zunerts wealth', {font: '32px CustomFont'});
        this.shopZeunertsIcon =         this.add.sprite(765, (this.shopScreen.y + 168), 'zeunerts').setScale(0.05,0.05);
        this.shopZeunertsAmmountTextValue = this.add.text(655, (this.shopScreen.y + 150), `Flasks:     ${this.zeunertsAmmountBank}`, {font: '32px CustomFont', fontWeight: '1000', fontSize: '32px'});

        this.speedText = this.add.text(0, (this.menu.y), 'km/h', {font: '30px CustomFont'});
        this.speedTextValue = this.add.text(0, (this.menu.y+30), '0', {font: '40px CustomFont'});
        this.shopText =this.add.text(40, (450), 'Joes Skishop & Café', {font: '32px CustomFont'});
        this.shopTextSlogan = this.add.text(20, (500), 'Get more jacked, more slippery, and more fat right here!', {font: '16px CustomFont'});

        this.zeunertsGainerText = this.add.text(this.zeunertsGainerDisplay.x-150,this.zeunertsGainerDisplay.y,  `Flasks gained:   ${this.zeunertsAmmountGain}`, {font: '48px CustomFont', fontWeight: '1000', fontSize: '32px'}).setDepth(-1);

        //Buttons
        this.stridePowerButton = this.add.sprite(525, (this.shopScreen.y-100),'speedbutton').setScale(3,3).setInteractive().setFrame(2);
        this.groundFrictionButton = this.add.sprite(this.stridePowerButton.x+150, (this.shopScreen.y-100),'frictionbutton').setScale(3,3).setInteractive().setFrame(2);
        this.maxSpeedButton = this.add.sprite(this.stridePowerButton.x+300, (this.shopScreen.y-100),'maxspeedbutton').setScale(3,3).setInteractive().setFrame(2);
        this.fortitudeButton = this.add.sprite(this.stridePowerButton.x+450, (this.shopScreen.y-100),'fortitudebutton').setScale(3,3).setInteractive().setFrame(2);

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
            this.deepMiddleBackground.x = this.player.x * 0.05 - 480;
            this.deepDeepBackground.x = this.player.x * 0.05 -              1180;
            this.deepDeepDeepBackground.x = this.player.x * 0.04 -          1180;
            this.deepDeepDeepDeepBackground.x = this.player.x * 0.03 -      1180;
            this.deepDeepDeepDeepDeepBackground.x = this.player.x * 0.02 -  1180;
            this.menu.x = this.player.x - 700;
            this.healthbarContainer.x = this.player.x - 491;
            this.healthbar.x = this.player.x - 490;
            this.coldLevelText.x = this.player.x - 490;
            this.zeunertsAmmountText.x = this.player.x + 300;
            this.zeunertsAmmountTextValue.x = this.player.x + 300;
            this.zeunertsIcon.x = this.player.x + 410; 
            this.speedText.x = this.player.x + 650;
            this.speedTextValue.x = this.player.x + 664;
            this.zeunertsGainerDisplay.x = this.player.x+50;
            this.zeunertsGainerText.x =  this.zeunertsGainerDisplay.x - 220;
            this.zeunertsGainerText.y = this.zeunertsGainerDisplay.y - 25;
            this.distanceDisplay.x = this.player.x + 825
        }
        else if (this.player.x < 696) {
            this.cameras.main.x = 0;
            this.middleBackground.x = 0;
            this.deepMiddleBackground.x = 0;
            this.deepDeepBackground.x =            700 * 0.05 -1180;
            this.deepDeepDeepBackground.x =        700 * 0.04 -1180;
            this.deepDeepDeepDeepBackground.x =    700 * 0.03 -1180;
            this.deepDeepDeepDeepDeepBackground.x =700 * 0.02 -1180;
            this.menu.x = 0;
            this.healthbarContainer.x = 209;
            this.healthbar.x = 210;
            this.coldLevelText.x = 210;
            this.zeunertsAmmountText.x = 1000;
            this.zeunertsAmmountTextValue.x = 1000;
            this.zeunertsIcon.x = 1110;
            this.zeunertsGainerDisplay.x = 750;
            this.distanceDisplay.x = 1525;
            //Texts           
            this.speedText.x = 1350;
            this.speedTextValue.x = 1364;
            
        }
        if (!this.displayStartScreen) {
            this.startScreen.setVisible(false);
            this.startScreenText.setVisible(false);
            this.startScreenText2.setVisible(false);
            this.startScreenText3.setVisible(false);
            this.startScreenText4.setVisible(false);
            this.startScreenText5.setVisible(false);
            this.menuPenguin.setVisible(false);
            this.creatorText.setVisible(false);
        }

        this.healthbar.width = this.coldLevelFactor * 298;
        this.vendor.play('vendoridle', true);
        this.menuPenguin.play('idle', true);
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
            this.displayStartScreen = false;
            this.velocity -= this.stridePower;
            this.tapAllowed = false;
            this.dashEffect.play();
            if (this.player.body.onFloor() && this.player.x > 1000) {
                this.player.play('walk', true);
            }
        } 
        if (this.cursors.right.isDown && this.tapAllowed && (this.coldLevel >= 1)) {
            this.displayStartScreen = false;
           
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
            this.displayStartScreen = false;
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
        this.zeunertsGainerText.setText(`Flasks gained:    ${this.zeunertsAmmountGain}`);
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
            if (this.player.y > 900) {
                this.reset = true;
                this.deathtimer = 2;
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
                this.zeunertsAmmountGain = Math.floor(this.distanceTraveled/100) + this.completedLaps * 120;
                this.coldLevel -= this.fortitude;
                console.log("Traveled " + (Math.floor( this.distanceTraveled/50)) + " Meters");
            }
            this.coldLevelFactor = this.coldLevel/100;
    }

    upgradeStridePower() {
        this.stridePowerButton.setFrame(2);
        this.zeunertsAmmountBank -= this.stridePowerCost;
        this.stridePowerCost = Math.floor(this.stridePowerCost + 10);
        this.stridePower = Math.floor(this.stridePower * 1.15);
        this.updateButtons();
    }

    upgradeFriction() {
        this.groundFrictionButton.setFrame(2);
        this.zeunertsAmmountBank -= this.groundFrictionCost;
        this.groundFrictionCost = Math.floor(this.groundFrictionCost + 10);
        this.groundFriction = (Math.pow(this.groundFriction, 0.9) );
        this.updateButtons();
    }

    upgradeMaxSpeed() {
        this.maxSpeedButton.setFrame(2);
        this.zeunertsAmmountBank -= this.maxSpeedCost;
        this.maxSpeedCost = Math.floor(this.maxSpeedCost + 10);
        this.maxSpeed = Math.floor(this.maxSpeed * 1.25);
        this.updateButtons();
    }

    upgradeFortitude() {
        this.fortitudeButton.setFrame(2);
        this.zeunertsAmmountBank -= this.fortitudeCost;
        this.fortitudeCost = Math.floor(this.fortitudeCost + 10);
        this.fortitude = (this.fortitude * 0.9);
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
        this.shopZeunertsWealth.setVisible(boolean);
        this.shopZeunertsIcon.setVisible(boolean);
        this.shopZeunertsAmmountTextValue.setVisible(boolean);
    }

    // metoden updateText för att uppdatera overlaytexten i spelet
    updateText() {
        this.zeunertsAmmountTextValue.setText(
            `Flasks:     ${this.zeunertsAmmountBank}`
        );
        this.shopZeunertsAmmountTextValue.setText(
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

    displayZeunertsGain() {
        console.log("tick displayZeunertsGainMethod")
        if (this.player.x > 800 && this.zeunertsGainerDisplay.y < 378) {
            this.zeunertsGainerDisplay.y += 2;
        }
        if (this.player.x < 800 && this.zeunertsGainerDisplay.y > 285) {
            this.zeunertsGainerDisplay.y -= 2;
        }
        if (this.player.x < 800 && this.zeunertsGainerDisplay.y > 285 && this.zeunertsGainerDisplay.y < 290) {
            this.zeunertsGainerText.y = this.zeunertsGainerDisplay - 100
        }
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
                start: 1,
                end: 7,
                zeroPad: 2,
                prefix: 'idle'
            }),
            frameRate: 12,
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