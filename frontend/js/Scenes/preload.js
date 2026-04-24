"use strict";

class Preload extends Phaser.Scene {

  constructor()
  {
    super({ key: "preload" });
  }

  init()
  {
    this.cX = this.game.config.width * 0.5;
    this.cY = this.game.config.height * 0.5;
    this.gW = this.game.config.width;
    this.gH = this.game.config.height;

     var style = {
        fontSize:"48px",
        fontFamily: "Roboto-Bold",
        align: "left",
        color: "#ffffff",
        stroke: "#ffffff",
        strokeThickness:2,
      };

      this.loadingTxt = this.add.text(this.cX - 411*0.5, this.cY, "Loading...", style);
      this.loadingTxt.setOrigin(0,0.5);

      var loadingbar_bg = this.add.image(this.cX - 411*0.5, this.cY + 100, "loadingbar_bg");
      loadingbar_bg.setOrigin(0,0.5);

      this.loadingbar = this.add.sprite(this.cX - 411*0.5, this.cY + 100, "loadingbar");
      this.loadingbar.setOrigin(0,0.5);

      this.loadingbar.scaleX = 0;

  }

  preload()
  {
    var t = '?v=' + new Date().getTime();

    this.load.setBaseURL('assets');

    this.load.image('bg', 'bg2.png' + t);
    this.load.image('blackbg', 'blackbg.png' + t);
    this.load.image('hudbar', 'hudbar.png' + t);


    this.load.image('player', 'player.png' + t);
    this.load.image('bullet', 'bullet.png' + t);
    this.load.image('enemy_bullet', 'enemy_bullet.png' + t);

    this.load.image('health_powerup', 'health_powerup.png' + t);
    this.load.image('shield_powerup', 'shield_powerup.png' + t);
    this.load.image('flash_bg', 'flash_bg2.png' + t);

    this.load.image('particle1', 'particle1.png' + t);
    this.load.image('particle2', 'particle2.png' + t);

    this.load.image('enemy1', 'enemy1.png' + t);
    this.load.image('enemy2', 'enemy2.png' + t);
    this.load.image('enemy3', 'enemy3.png' + t);
    this.load.image('enemy4', 'enemy4.png' + t);
    this.load.image('enemy5', 'enemy5.png' + t);
    this.load.image('enemy6', 'enemy6.png' + t);

    this.load.image('boss_enemy', 'boss_enemy.png' + t);

    this.load.image('horizontal', 'horizontal.png' + t);
    this.load.image('vertical', 'vertical.png' + t);

    this.load.image('game_title', 'ui/game_title.png' + t);

    this.load.image('play_btn', 'ui/play_button.png' + t);
    this.load.image('unlock_btn', 'ui/unlock_btn.png' + t);
    this.load.image('again_btn', 'ui/again_btn.png' + t);
    this.load.image('game_over', 'ui/game_over.png' + t);

    this.load.image('drag-border', 'ui/drag-border.png' + t);
    this.load.image('knob', 'ui/knob.png' + t);

    this.load.image('timer_plate', 'ui/timer_plate.png' + t);

    this.load.image('health_bar', 'ui/health_bar.png' + t);
    this.load.image('health_plate', 'ui/health_plate.png' + t);


    this.load.spritesheet('explosion','spriteSheet/explosion4.png?v='+t, {frameWidth: 192/6, frameHeight:32/1});

    this.load.on('progress', this.loadUpdate,this);


  }
  loadUpdate(per)
  {
    this.loadingTxt.text = "Loading..." + Math.ceil(per*100) +'%';
    this.loadingbar.scaleX = per;
  }

  create()
  {
    this.scene.start('menu'); //menu game result
  }

}/*class*/
