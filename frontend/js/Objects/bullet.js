"use strict";

class Bullet extends Phaser.Physics.Arcade.Sprite
{

    constructor(scene, x, y, key='bullet')
    {
      super(scene, x, y, key);

      this.game = scene;
      this.initialize();

    }

    initialize()
    {
      this.game.add.existing(this);
      this.game.physics.add.existing(this);
      this.power = 1;

    }

}
