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
    barrierInterval: 1100 // pixel
  },

  // LIFE-CYCLE CALLBACKS:

  // onLoad () {},

  start () {
    this.barriers = this.createBarriers(200, this.currentDistance * this.barrierInterval);
    // this.barriers.node.setPosition(0, this.barrierInterval * this.currentDistance);
  },

  // update (dt) {},

  createBarriers (gap = 0, distance = 0) {
    let barriers = {
      node: cc.instantiate(this.barriersPrefab)
    }
    barriers.script = barriers.node.getComponent('Barriers');
    barriers.script.gap = gap;
    barriers.script.distance = distance;
    barriers.node.parent = this.front;
    barriers.node.setScale(this.balloon.scale);
    return barriers;
  }
});
