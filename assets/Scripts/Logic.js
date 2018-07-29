// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html
const user = require('User');

cc.Class({
  extends: cc.Component,

  ctor: function () {
    this.barriers = null;
    this.currentDistance = 0.7; // 0~1 from the balloon to the barrier.
    this.balloonScore = 1; // 1m
    this.barriersNode = null;
    this.listeningTouch = false;
    this.score = 1; // 1m originally
    this.shownScore = 1;
  },

  properties: {
    balloon: {
      default: null,
      type: cc.Node
    },
    barriersPrefab: {
      default: null,
      type: cc.Prefab
    },
    front: {
      default: null,
      type: cc.Node
    },
    touchArea: {
      default: null,
      type: cc.Node
    },
    scoreRoot: {
      default: null,
      type: cc.Node
    },
    pooh: {
      default: null,
      type: cc.Node
    },
    UI: {
      default: null,
      type: cc.Node
    },
    moneyLabel: {
      default: null,
      type: cc.Node
    },
    thisBalloonLabel: {
      default: null,
      type: cc.Node
    },
    biggestLabel: {
      default: null,
      type: cc.Node
    },
    gameOverSound: {
      default: null,
      type: cc.Node
    },
    windBlowSound: {
      default: null,
      type: cc.Node
    },
    blowBalloonSound: {
      default: null,
      type: cc.Node
    }
  },

  start () {
    this.configs = this.node.getComponent('LogicConfigs');
    this.barriers = this.createBarriers(this.front, 177 * 1.7, this.currentDistance * this.configs.barrierInterval);
    this.previousBarriers = {
      root: new cc.Node()
    };
    this.scoreLabel = this.scoreRoot.children[0].getComponent('cc.Label');
    this.startStage();

    cc.director.getCollisionManager().enabled = true;
    this.UI.active = false;
    // this.barriers.node.setPosition(0, Configs.barrierInterval * this.currentDistance);
  },

  // update (dt) {},

  createBarriers (parent = null, gap = 0, distance = 0) {
    let barriers = this.node.getComponent('Barriers').instantiateBarriers(parent, gap, distance);
    // let barriers = new Barriers(parent, gap, distance);
    barriers.root.scale = this.balloon.scale;
    barriers.root.opacity = 0;
    barriers.root.runAction(cc.fadeTo(1, 255));
    return barriers;
  },

  startStage () {
    this.listeningTouch = true;
    this.timer = 0;
    this.touchArea.once(cc.Node.EventType.TOUCH_START, this.onTouch, this);
  },

  onTouch () {
    console.log('touch');
    this.listeningTouch = false;
    let radius = this.balloon.scale;
    let forwardDistance = this.configs.getForwardDistance(radius, this.currentDistance);
    this.forwardAct = cc.moveBy(this.configs.forwardDuration, cc.p(0, -forwardDistance * this.configs.barrierInterval));
    // this.forwardAct.easing(cc.easeIn(3.0));
    this.nextBarriers = this.createBarriers(this.front, this.configs.getGap(this.currentDistance) * this.configs.gapBase, (this.currentDistance + 1) * this.configs.barrierInterval);
    this.scaleAct = cc.scaleBy(this.configs.scaleDuration, 1 / this.balloon.scale);
    let scaleActCallback = cc.callFunc(function (target) {
      this.previousBarriers.root.destroy();
      this.previousBarriers = this.barriers;
      this.barriers = this.nextBarriers;
      this.startStage();
    }, this);
    let forwardActCallback = cc.callFunc(function (target) {
      this.barriers.root.runAction(cc.sequence(cc.scaleBy(this.configs.scaleDuration, 1 / this.balloon.scale), scaleActCallback));
      this.nextBarriers.root.runAction(cc.scaleBy(this.configs.scaleDuration, 1 / this.balloon.scale));
      this.balloon.runAction(cc.scaleBy(this.configs.scaleDuration, 1 / this.balloon.scale));
      this.scoreRoot.runAction(cc.scaleBy(this.configs.scaleDuration, 1 / this.balloon.scale));
      this.pooh.scale *= this.configs.radiusToPoohScale(this.balloon.scale);
    }, this);
    // this.barriers.pair.runAction(this.forwardAct);
    this.nextBarriers.pair.runAction(cc.sequence(this.forwardAct, cc.delayTime(0.1), forwardActCallback));
    this.barriers.pair.runAction(cc.moveBy(this.configs.forwardDuration, cc.p(0, -forwardDistance * this.configs.barrierInterval)));

    this.score = this.shownScore;

    this.windBlowSound.getComponent('cc.AudioSource').play();
  },

  update (dt) {
    if (this.listeningTouch) {
      if (this.timer < 0.016) {
        this.blowBalloonSound.getComponent('cc.AudioSource').play();
      }
      this.balloon.scale = this.configs.expandRate(this.timer, this.currentDistance);
      this.shownScore = Math.round(this.score * this.configs.radiusToScoreScale(this.balloon.scale));
      this.scoreRoot.scale = this.balloon.scale;
      this.scoreLabel.string = this.shownScore + ' m';
      this.timer += dt;
      this.timer %= this.configs.cycle;
    }
  },

  gameOver () {
    this.gameOverSound.getComponent('cc.AudioSource').play();
    this.windBlowSound.getComponent('cc.AudioSource').pause();
    this.listeningTouch = false;
    this.front.stopAllActions();
    this.nextBarriers.pair.stopAllActions();
    this.barriers.pair.stopAllActions();
    let that = this;
    let moveCallBack = cc.callFunc(function (target) {
      that.UI.active = true;
      that.moneyLabel.getComponent('cc.Label').string = user.money;
      that.thisBalloonLabel.getComponent('cc.Label').string = that.score + ' m';
      that.biggestLabel.getComponent('cc.Label').string = user.biggest_balloon + ' m';
    });
    // this.UI.runAction(cc.sequence(cc.delayTime(2), moveCallBack));
    this.front.runAction(cc.sequence(cc.delayTime(0.5), cc.moveBy(1.5, 0, 500), moveCallBack));
    if (this.score > user.biggest_balloon) {
      user.biggest_balloon = this.score;
    }
    if (user.login) {
      user.moneyPlus(0); // record the new highest
    }
    console.log('game over.');
  },

  backToMenu () {
    console.log('back to menu');
    cc.director.loadScene('Menu');
  },

  continue () {
    // not a complete function yet
    if (user.money > 0) {
      user.money -= 1;
      if (user.login) {
        user.buyUp(1);
      }
    }
  }
});
