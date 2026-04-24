"use strict";

class Result extends Phaser.Scene {

  constructor()
  {
    super({ key: "result" });
  }

  init()
  {
    this.cX = this.game.config.width*0.5;
    this.cY = this.game.config.height*0.5;
    this.gW = this.game.config.width;
    this.gH = this.game.config.height;

  }

  create()
  {
    this.time.delayedCall(1000,this.setScreen,[],this);
  }

//   setScreen()
//   {
//     var style  = {
//       fontSize:"64px",
//       fontFamily: "Roboto-Bold",
//       align: "center",
//       color: "#0df3fc",
//       stroke: "#fff",
//       strokeThickness:2,
//     };

//     var bg = this.add.sprite(this.cX, this.cY,'blackbg');

//     var gameOver = this.add.sprite(this.cX, 400,'game_over');

//     var scoreTxt = this.add.text(this.cX, this.cY-300,'',style);
//     scoreTxt.setOrigin(0.5, 0.5);

//     var rankTxt = this.add.text(this.cX, this.cY-150,'',style);
//     rankTxt.setOrigin(0.5, 0.5);

//     scoreTxt.text = 'SCORE : ' + Global.score.toString();
//     rankTxt.text = 'RANK : ' + Global.rank.toString();

//     // Send score to backend
//     submitScore(Global.score.toString());

//     this.againButton = new Button(this, this.cX, this.cY+300, 'again_btn');
//     this.againButton.setScale(0.8);
//     this.againButton.on('pointerdown', this.onAgainDown,this);

//   }

setScreen()
{
    var style  = {
        fontSize:"64px",
        fontFamily: "Roboto-Bold",
        align: "center",
        color: "#0df3fc",
        stroke: "#fff",
        strokeThickness:2,
    };

    var bg = this.add.sprite(this.cX, this.cY,'blackbg');
    var gameOver = this.add.sprite(this.cX, 400,'game_over');

    var scoreTxt = this.add.text(this.cX, this.cY-300,'LOADING...',style);
    scoreTxt.setOrigin(0.5, 0.5);

    var rankTxt = this.add.text(this.cX, this.cY-150,'RANK: ...',style);
    rankTxt.setOrigin(0.5, 0.5);

    // show score immediately
    scoreTxt.setText('SCORE : ' + Global.score.toString());

    // send score to backend
    submitScore(Global.score.toString());

    // =========================
    // 🔥 FETCH REAL RANK FROM API
    // =========================
    let user = null;

try {
    const params = new URLSearchParams(Global.initData);
    user = JSON.parse(params.get("user"));
} catch (e) {
    console.error("Failed to parse user", e);
}

setTimeout(() => {
    if (user && user.id) {
    fetch(Global.api_url + `/api/rank`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            initData: Global.initData
        })
    })
    .then(res => res.json())
    .then(data => {
        Global.rank = data.rank || 0;

        rankTxt.setText(
            'RANK : ' + (data.rank || 'N/A') +
            '\nBEST : ' + (data.best_score || 0)
        );
    })
    .catch(err => {
        console.error("Rank API error:", err);
        rankTxt.setText('RANK : N/A');
    });
} else {
    rankTxt.setText('RANK : N/A');
}
}, 3000);

    // =========================
    // BUTTON
    // =========================
    this.againButton = new Button(this, this.cX, this.cY + 300, 'again_btn');
    this.againButton.setScale(0.8);
    this.againButton.setAlpha(1); // default visible

    this.againButton.on('pointerdown', this.onAgainDown, this);
}

  // onAgainDown()
  // {
  //   this.scene.start('game');
  // }

//   onAgainDown() {
//     // Disable button while checking
//     this.againButton.setInteractive(false);

//     // Call backend to start a session
//     fetch(API_URL+`/api/start-session`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ initData: Global.initData }) // pass Telegram initData
//     })
//     .then(res => res.json())
//     .then(data => {
//         if (data.success) {
//             // allowed to play
//             Global.sessionToken = data.sessionToken;
//             this.scene.start('game');
//         } else {
//             // not allowed → show alert or retry button disabled
//             this.showPaymentRequired();
//         }
//     })
//     .catch(err => {
//         console.error(err);
//         this.showPaymentRequired();
//     });
// }

onAgainDown() {
    // prevent double click
    this.againButton.disableInteractive();

    fetch(API_URL + `/api/start-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData: Global.initData })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            Global.sessionToken = data.sessionToken;
            this.scene.start('game');
        } else {
            this.showPaymentRequired();
        }
    })
    .catch(err => {
        console.error(err);
        this.showPaymentRequired();
    });
}

// showPaymentRequired() {
//     const style = {
//         fontSize: "48px",
//         fontFamily: "Roboto-Bold",
//         color: "#ff4444",
//         align: "center"
//     };

//     const msg = this.add.text(
//         this.cX,
//         this.cY + 150,
//         "🚫 Payment required!\nUnlock to play.",
//         style
//     );
//     msg.setOrigin(0.5);

//     this.againButton.disableInteractive();

//     // ✅ CREATE UNLOCK BUTTON
//     const unlockBtn = new Button(this, this.cX, this.cY + 300, 'again_btn');
//     unlockBtn.setScale(0.8);

//     unlockBtn.on('pointerdown', async () => {
//         try {
//             const res = await fetch(API_URL+"/api/create-invoice", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({ initData: Global.initData })
//             });

//             const data = await res.json();

//             if (!data.invoice_link) {
//                 alert("Failed to create invoice");
//                 return;
//             }

//             // 🚀 OPEN TELEGRAM PAYMENT
//             tg.openInvoice(data.invoice_link);

//         } catch (err) {
//             console.error(err);
//         }
//     });
// }

showPaymentRequired() {

    // prevent duplicate UI
    if (this.paymentUIShown) return;
    this.paymentUIShown = true;

    const style = {
        fontSize: "48px",
        fontFamily: "Roboto-Bold",
        color: "#ff4444",
        align: "center"
    };

    // message
    const msg = this.add.text(
        this.cX,
        this.cY + 120,
        "🚫 Payment required!\nPlease unlock to continue.",
        style
    ).setOrigin(0.5);

    // =========================
    // 👇 DIM TRY AGAIN BUTTON
    // =========================
    if (this.againButton) {
        this.againButton.setAlpha(0.4);   // fade out
        this.againButton.disableInteractive();
    }

    // =========================
    // 👉 UNLOCK BUTTON (BELOW TRY AGAIN)
    // =========================
    const unlockY = this.cY + 540; // BELOW try again

    this.unlockBtn = new Button(this, this.cX, unlockY, 'unlock_btn');
    this.unlockBtn.setScale(0.8);

    this.unlockText = this.add.text(
        this.cX,
        unlockY,
        "",
        {
            fontSize: "28px",
            fontFamily: "Roboto-Bold",
            color: "#ffffff"
        }
    ).setOrigin(0.5);

    this.unlockBtn.on('pointerdown', async () => {
        try {
            const res = await fetch(API_URL + "/api/create-invoice", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ initData: Global.initData })
            });

            const data = await res.json();

            if (!data.invoice_link) {
                alert("Failed to create invoice");
                return;
            }

            tg.openInvoice(data.invoice_link);

        } catch (err) {
            console.error(err);
        }
    });
}
} /* result */
