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
  properties: {
    barriersPrefab: {
      default: null,
      type: cc.Prefab
    }
  },
  instantiateBarriers (parent = null, gap = 0, distance = 0) {
    let barRoot = cc.instantiate(this.barriersPrefab);
    return new Barriers(barRoot, parent, gap, distance);
    // return barriers obj
  }
});

const Barriers = cc.Class({

  __ctor__: function (prefab, parent = null, gap = 0, distance = 0) {
    if (prefab) {
      this._gap = gap;
      this._distance = distance;
      this.root = prefab;
      this.root.parent = parent;
      this.pair = this.root.children[0];
      this.left = this.pair.children[1];
      this.right = this.pair.children[0];
      this.pair.y = distance;
      this.gap = gap;
      this.distance = distance;
    }
  },

  properties: {
    gap: {
      get: function () {
        return this._gap;
      },
      set: function (gap) {
        this._gap = gap;
        this.left.x = -gap / 2;
        this.right.x = gap / 2;
      }
    },
    distance: {
      get: function () {
        return this._distance;
      },
      set: function (distance) {
        this._distance = distance;
        this.pair.y = distance;
      }
    },
    scale: {
      get: function () {
        return this.root.scale;
      },
      set: function (scale) {
        this.root.setScale(scale);
      }
    }
  },

  runAction (act) {
    this.pair.runAction(act);
  }
})
