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
        anim_set: {
            default: [],
            type: cc.Node
        },
    },
    
    play_sound: function(name) {
        cc.audioEngine.stopMusic(false);
        var url = cc.url.raw(name);
        cc.audioEngine.playMusic(url, false);
    },
    
    call_latter: function(callfunc, delay) {
        var delay_action = cc.delayTime(delay);
        var call_action = cc.callFunc(callfunc, this);
        var seq = cc.sequence([delay_action, call_action]);
        this.node.runAction(seq);
    },
    
    // use this for initialization
    onLoad: function () {
        this.game_started = false;
        for(var i = 0; i < this.anim_set.length; i ++) {
            this.anim_set[i].active = false;
        }
        this.checkout = cc.find("UI_ROOT/check_out");
        this.checkout.active = false;
    },
    
    play_idle: function(node) {
        var comp = node.getComponent(sp.Skeleton);
        comp.clearTracks();
        comp.setAnimation(0, "daiji", true);    
    }, 
    
    play_walk: function(node) {
        var comp = node.getComponent(sp.Skeleton);
        comp.clearTracks();
        comp.setAnimation(0, "zou", false);
    }, 
    
    play_jiao: function(node) {
        var comp = node.getComponent(sp.Skeleton);
        comp.clearTracks();
        comp.setAnimation(0, "jiao", true);
        var yinfu = node.getChildByName("yinfu");
        yinfu.active = true;
        yinfu.getComponent(sp.Skeleton).clearTracks();
        yinfu.getComponent(sp.Skeleton).setAnimation(0, "animation", false);
        yinfu.getComponent(sp.Skeleton).addAnimation(0, "animation", false);
        yinfu.getComponent(sp.Skeleton).addAnimation(0, "animation", false);
        
        var sound_name = "resources/sounds/" + (this.game_map[this.now_type] + 1) + ".mp3";
        this.play_sound(sound_name);
        this.scheduleOnce(function(){
            this.play_idle(node);
        }.bind(this), 4);
    }, 
    
    play_game_sound: function() {
        this.node.stopAllActions();
        this.game_judge_mode = false;
        var sound_name = "resources/sounds/" + (this.game_map[this.now_type] + 1) + ".mp3";
        this.play_sound(sound_name);
        this.call_latter(function(){
            this.game_judge_mode = true;
        }.bind(this), 3.5);
        this.call_latter(this.play_game_sound.bind(this), 8);
    }, 
    
    stop_play_game_sound: function() {
        this.game_judge_mode = false;
        this.node.stopAllActions();
    }, 
    
    on_replay_game: function() {
        this.play_sound("resources/sounds/click.mp3");
        this.checkout.active = false;
        this.on_start_game();
    }, 
    
    on_start_game: function() {
        if(this.game_started === true) {
           return; 
        }
        
        this.game_started = true;
        
        this.game_map = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        // 随机打乱动物
        this.game_map.sort(function() {
            return Math.random() - 0.5;
        });
        // end
        
        for(var i = 0; i < 5; i ++) {
            var index = this.game_map[i];
            this.anim_set[index].active = true;
            this.play_idle(this.anim_set[index]);
        }
        
        for(var i = 5; i < this.anim_set.length; i ++) {
            var index = this.game_map[i];
            this.anim_set[index].active = false;
        }
        
        this.now_type = 0;
        this.game_judge_mode = false;
        
        this.play_sound("resources/sounds/tip.mp3");
        this.scheduleOnce(function() {
            this.play_game_sound();    
        }.bind(this), 5);
    },
    
    on_checkout: function() {
        this.game_started = false;
        this.checkout.active = true;
        this.play_sound("resources/sounds/checkout.mp3");
    }, 
    
    on_anim_click: function(index) {
        var anim = this.anim_set[index - 1];
        if (anim.active === false || this.game_started === false) {
            return;
        }
        
        if (this.game_judge_mode === false) {
            return;
        }
        
        // end
        var type = this.game_map[this.now_type];
        if(type == index - 1) {
            this.stop_play_game_sound();
            this.play_jiao(anim);
            this.scheduleOnce(function(){
                this.now_type ++;
                if(this.now_type === 5) {
                    this.on_checkout();
                }
                else {
                    this.play_game_sound();    
                }
            }.bind(this), 5);
        }
        else {
            this.play_sound("resources/sounds/error.mp3");
        }
        // end 
    },
    
    on_gou1_anim_click: function() {
        this.on_anim_click(1);
    },
    
    on_j2_anim_click: function() {
        this.on_anim_click(2);
    },
    
    on_h3_anim_click: function() {
        this.on_anim_click(3);
    },
    
    on_m4_anim_click: function() {
        this.on_anim_click(4);
    },
    
    on_mao5_anim_click: function() {
        this.on_anim_click(5);
    },
    
    on_niu6_anim_click: function() {
        this.on_anim_click(6);
    },
    
    on_niu7_anim_click: function() {
        this.on_anim_click(7);
    },
    on_ya8_anim_click: function() {
        this.on_anim_click(8);
    },
    on_yang9_anim_click: function() {
        this.on_anim_click(9);
    },
    
    on_zhu_anim_click: function() {
        this.on_anim_click(10);
    },
    
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
