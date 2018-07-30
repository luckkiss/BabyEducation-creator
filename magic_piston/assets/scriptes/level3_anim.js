cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
        time: 3,
        daqi_time: 0.5,
        start_scale: 0.4,
    },

    // use this for initialization
    onLoad: function () {
        var qiu2 = this.node.getChildByName("qiqiu2");
        qiu2.scale = this.start_scale;
    },
    
    move_qiqiu: function() {
        var qiu1 = this.node.getChildByName("qiqiu1");
        var qiu2 = this.node.getChildByName("qiqiu2");
        var man = this.node.getChildByName("machine_man");
        
        var m = cc.moveBy(5, 0, 900);
        qiu1.runAction(m);
        qiu2.runAction(m.clone());
        man.runAction(m.clone());
    }, 
    
    play_daqi_anim: function() {
        // (198， -1)， (-2， -1)
        // 3秒
        var qiu = this.node.getChildByName("qiqiu4");
        qiu.active = true;
        
        qiu.x = 198;
        qiu.y = -1;
        
        var huosai = this.node.getChildByName("huosai1");
        huosai.active = true;
        
        this.hit_set[3][3].active = false;
        this.hit_set[4][3].active = false;
        this.hit_set[5][3].active = false;
        
        var qiu2 = this.node.getChildByName("qiqiu2");
        var m1 = cc.moveTo(this.daqi_time, -2, -1);
        var func = cc.callFunc(function() {
            qiu.x = 198;
            qiu.y = -1;
            qiu2.scale += 0.1;
        }, this);
        
        var seq = cc.sequence([m1, func]);
        var f = cc.repeatForever(seq);
        qiu.runAction(f);
        this.scheduleOnce(function() {
            qiu.stopAllActions();
            qiu.active = false;
            huosai.getComponent(sp.Skeleton).clearTracks();
            this.node.getChildByName("qiqiu3").active = false;
            this.move_qiqiu();
        }.bind(this), this.time);
    }, 
    
    play_anim: function(hit_set) {
        this.hit_set = hit_set;
        var m1 = cc.moveBy(2, 110, 0);
        var m2 = cc.moveBy(1, 77, 58);
        var m3 = cc.moveBy(3, 340, 0);
        var m4 = cc.moveBy(0.2, 0, 10);
        var func = cc.callFunc(this.play_daqi_anim.bind(this), this);
        var seq = cc.sequence([m1, m2, m3, m4, func]);
        var man = this.node.getChildByName("machine_man");
        man.active = true;
        man.runAction(seq);
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
