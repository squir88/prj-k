require([], function () {
  Q.Sprite.extend('Player', {
    init: function (p) {
      this._super(p, {
        sheet: 'player'
      });

      Q.input.on("fire", this, "shoot");

      this.add('2d, platformerControls, animation');
    },
    step: function (dt) {
      if (Q.inputs['up']) {
        this.p.vy = -200;
      } else if (Q.inputs['down']) {
        this.p.vy = 200;
      } else if (!Q.inputs['down'] && !Q.inputs['up']) {
        this.p.vy = 0;
      }
      this.p.socket.emit('update', { playerId: this.p.playerId, x: this.p.x, y: this.p.y, sheet: this.p.sheet });
    },
    shoot: function() {
      var p = this.p;
      this.stage.insert(new Q.Bullet({
        x: p.x,
        y: p.y - p.w / 2,
        vy: -200
      }))
    }
  });

  Q.Sprite.extend('Actor', {
    init: function (p) {
      this._super(p, {
        update: true
      });

      var temp = this;
      setInterval(function () {
        if (!temp.p.update) {
          temp.destroy();
        }
        temp.p.update = false;
      }, 3000);
    }
  });
});