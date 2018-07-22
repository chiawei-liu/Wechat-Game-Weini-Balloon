// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

const Barriers = cc.Class({
  extends: cc.Component,

  ctor: function (gap = 0, distance = 0) {
    this._gap = gap;
    this._distance = distance;
  },

  properties: {
    gap: {
      get: function () {
        return this._gap;
      },
      set: function (gap) {
        this._gap = gap;
        this.node.children[0].x = -gap / 2;
        this.node.children[1].x = gap / 2;
      }
    },
    distance: {
      get: function () {
        return this._distance;
      },
      set: function (distance) {
        this._distance = distance;
        this.node.children[0].y = distance;
        this.node.children[1].y = distance;
      }
    }
  },
  // LIFE-CYCLE CALLBACKS:

  // onLoad () {},

  start () {

  }

  // update (dt) {},

});

module.exports = Barriers;
