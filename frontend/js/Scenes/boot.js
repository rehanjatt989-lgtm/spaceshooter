"use strict";

class Boot extends Phaser.Scene {

  constructor()
  {
    super({ key: "boot" });
  }

  init()
  {
    this.cX = this.game.config.width*0.5;
    this.cY = this.game.config.height*0.5;
    this.gW = this.game.config.width;
    this.gH = this.game.config.height;



  }

  preload()
  {
    var t = new Date().getTime();

    this.load.baseURL = 'assets/';
    this.load.image('loadingbar','ui/loadingbar.png?v='+t);
    this.load.image('loadingbar_bg','ui/loadingbar_bg.png?v='+t);
  }

  create()
  {
    this.scene.start('preload');
  }

}/*class*/
