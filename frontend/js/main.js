"use strict";

var Global = {
  score:0,
  initData:null,
  rank:0,
  enemySpeed:300,
  api_url: "https://vegan-talisman-mystified.ngrok-free.dev"
};

var config = {

    type:Phaser.WEBGL,
    parent: "gameDiv",
    scale:{
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    fps:{ target:60, },
    dom: { createContainer: true },
    audio: { disableWebAudio: true },
    render:{
    	imageSmoothingEnabled:false,
    	transparent: false,
    },
    physics:{
      default:'arcade',
      arcade:
      {
        debug: false,
        gravity: { y: 0 },
      },

    },
    backgroundColor:"#000000",
    autoFocus:true,
    width:1080,
    height:1920,
    scene:[Boot, Preload, Menu, Game, Result],

};

var game = null;

function init()
{
  game = new Phaser.Game(config);
}
