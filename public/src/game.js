var Q = Quintus({audioSupported: [ 'wav','mp3' ]})
    .include('Sprites, Scenes, Input, 2D, Anim, Touch, UI, Audio')
    .setup({ maximize: true })
    .enableSound()
    //.controls().touch();
    .controls(true);// 4 ipad

var players = [];
var socket = io('http://192.168.0.107:8080');
var UiPlayers = document.getElementById("players");

Q.gravityY = 0;

var SPRITE_PLAYER = 1;
var SPRITE_BULLET = 2;
var SPRITE_ENEMY  = 3;

var objectFiles = [
    './src/player'
];

require(objectFiles, function () {
    function setUp (stage) {
        socket.on('count', function (data) {
            UiPlayers.innerHTML = 'Players: ' + data['playerCount'];
        });

        socket.on('connected', function (data) {
            selfId = data['playerId'];
            player = new Q.Player({ playerId: selfId, x: 100, y: 100, socket: socket });
            stage.insert(player);
            stage.add('viewport').follow(player);
        });

        socket.on('updated', function (data) {
            var actor = players.filter(function (obj) {
                return obj.playerId == data['playerId'];
            })[0];
            if (actor) {
                actor.player.p.x = data['x'];
                actor.player.p.y = data['y'];
                actor.player.p.sheet = data['sheet'];
                actor.player.p.update = true;
            } else {
                var temp = new Q.Actor({ playerId: data['playerId'], x: data['x'], y: data['y'], sheet: data['sheet'] });
                players.push({ player: temp, playerId: data['playerId'] });
                stage.insert(temp);
            }
        });
    }

    Q.scene('arena', function (stage) {
        stage.collisionLayer(new Q.TileLayer({ dataAsset: '/maps/arena.json', sheet: 'tiles' }));

       // var player = stage.insert(new Q.Player({ x: 100, y: 100 }));
       // stage.add('viewport').follow(player);
        setUp(stage);
    });

    var files = [
        '/images/tiles.png',
        '/maps/arena.json',
        '/images/sprites.png',
        '/images/sprites.json',
        '/images/bullsprites.png',
        '/images/bullsprites.json'
    ];

    Q.MovingSprite.extend("Bullet", {
        init: function(p) {
            this._super(p, {
                sheet: "bullet",
                sprite: "bullet",
                type: SPRITE_BULLET,
                collisionMask: SPRITE_ENEMY,
                sensor: true
            });

            /**
             * Adding 2d component to activate collisions detection and movement.
             */
            this.add("2d");
        },

        /**
         * I'm overriding step method to destroy bullets.
         * Every bullet outside the canvas should be destroyed. If I don't destroy
         * them, the bullet is still alive and can kill enemies outside canvas where
         * the player cannot see anything.
         */
        step: function(dt) {
            if (this.p.y < 0) {
                this.destroy();
            }
        }
    });

    Q.load(files.join(','), function () {
        Q.sheet('tiles', '/images/tiles.png', { tilew: 32, tileh: 32 });
        Q.compileSheets('/images/sprites.png', '/images/sprites.json');
        Q.compileSheets('/images/bullsprites.png', '/images/bullsprites.json');
        Q.stageScene('arena', 0);
    });
});