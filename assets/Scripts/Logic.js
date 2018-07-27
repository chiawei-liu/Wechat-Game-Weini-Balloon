// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

cc.Class({
  extends: cc.Component,

  ctor: function () {
    this.barriers = null;
    this.currentDistance = 0.5; // 0~1 from the balloon to the barrier.
    this.balloonScore = 1; // 1m
    this.barriersNode = null;
    this.listeningTouch = false;
    this.score = 1; // 1m originally
    this.shownScore = 1;
  },
  properties: {
    // foo: {
    //     // ATTRIBUTES:
    //     default: null,        // The default value will be used only when the component attaching
    //                           // to a node for the first time
    //     type: cc.SpriteFrame, // optional, default is typeof default
    //     serializable: true,   // optional, default is true
    // },
    // bar: {
    //     get () {
    //         return this._bar;
    //     },
    //     set (value) {
    //         this._bar = value;
    //     }
    // },
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
    }
  },

  // LIFE-CYCLE CALLBACKS:

  // onLoad () {},

  start () {
    this.configs = this.node.getComponent('LogicConfigs');
    this.barriers = this.createBarriers(this.front, 200, this.currentDistance * this.configs.barrierInterval);
    this.previousBarriers = {
      root: new cc.Node()
    };
    this.scoreLabel = this.scoreRoot.children[0].getComponent('cc.Label');
    this.startStage();

    cc.director.getCollisionManager().enabled = true;
    // this.barriers.node.setPosition(0, Configs.barrierInterval * this.currentDistance);
  },

  // update (dt) {},

  createBarriers (parent = null, gap = 0, distance = 0) {
    let barriers = this.node.getComponent('Barriers').instantiateBarriers(parent, gap, distance);
    // let barriers = new Barriers(parent, gap, distance);
    barriers.root.scale = this.balloon.scale;

    /* let barriers = {
      node: cc.instantiate(this.barriersPrefab)
    }
    barriers.script = barriers.node.getComponent('Barriers');
    barriers.script.gap = gap;
    barriers.script.distance = distance;
    barriers.node.parent = this.front;
    barriers.node.setScale(this.balloon.scale); */
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
    this.nextBarriers = this.createBarriers(this.front, this.configs.getGap(), (this.currentDistance + 1) * this.configs.barrierInterval);
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
    }, this);
    // this.barriers.pair.runAction(this.forwardAct);
    this.nextBarriers.pair.runAction(cc.sequence(this.forwardAct, forwardActCallback));
    this.barriers.pair.runAction(cc.moveBy(this.configs.forwardDuration, cc.p(0, -forwardDistance * this.configs.barrierInterval)));

    this.score = this.shownScore;
  },

  update (dt) {
    if (this.listeningTouch) {
      this.balloon.scale = this.configs.expandRate(this.timer);
      this.shownScore = Math.round(this.score * this.configs.radiusToScoreScale(this.balloon.scale));
      this.scoreRoot.scale = this.balloon.scale;
      this.scoreLabel.string = this.shownScore + ' m';
      this.timer += dt;
      this.timer %= this.configs.cycle;
    }
  }
});
