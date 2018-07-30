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
        scene_set: {
            default: [],
            type: cc.Node,
        },
    },
    
    preload_sound: function() {
        var sound_list = [
            "resources/sounds/button.mp3",
            "resources/sounds/end.mp3",
            
            "resources/sounds/1.mp3",
            "resources/sounds/2.mp3",
            "resources/sounds/3.mp3",
            "resources/sounds/4.mp3",
            "resources/sounds/5.mp3",
        ];
        
        for(var i = 0; i < sound_list.length; i ++) {
            var url = cc.url.raw(sound_list[i]);
            cc.loader.loadRes(url, function() {});    
        }
    }, 
    
    play_sound: function(name) {
        cc.audioEngine.stopMusic(false);
        var url = cc.url.raw(name);
        cc.audioEngine.playMusic(url, false);
    },
    
    // use this for initialization
    onLoad: function () {
        this.preload_sound();
        this.game_started = false;
        this.map_root = cc.find("UI_ROOT/map_root");
        this.checkout_root = cc.find("UI_ROOT/checkout_root");
        this.checkout_root.active = false;
        this.invalid_click = false;
        this.invalid_next_click = false;
        
        this.main_root = cc.find("UI_ROOT/map_root/main1");
        this.main_kim = cc.find("UI_ROOT/map_root/main1/main_kim");
    },
    
    start: function() {
        this.on_game_start();
    },
    
    on_enter_show_scene: function() {
        var kim = this.scene_set[this.game_mode - 1].getChildByName("kim");
        kim.opacity = 0;
        kim.runAction(cc.fadeIn(2));
        
        switch(this.game_mode) {
            case 1: {
                
            }
            break;
            case 2: { // 
                this.main_root.x = 1920;
                this.main_root.y = 0;
                this.scene_set[0].active = false;
            }
            break;
            case 3: {
                
            }
            break;
        }
    }, 
    
    game_enter_scene: function() {
        // console.log("game_enter_scene", this.game_started, this.invalid_click);
        if(this.game_started === false) {
            return;
        }
        
        if(this.invalid_click) {
            return;
        }
        
        this.invalid_click = true;
        
        if (this.game_mode !== 2) {
            for(var i = 0; i < this.scene_set.length; i ++) {
                this.scene_set[i].active = false;
            }
            this.scene_set[this.game_mode - 1].active = true;
            this.scene_set[this.game_mode - 1].x = (this.main_root.x + 1920);
            this.scene_set[this.game_mode - 1].y = 0;
        }
        else {
            this.scene_set[this.game_mode - 1].active = true;
            this.scene_set[this.game_mode - 1].x = 1920 * 2;
            this.scene_set[this.game_mode - 1].y = 0;
        }
        this.click_mask = [0, 0, 0];
        
        var kim = this.scene_set[this.game_mode - 1].getChildByName("kim");
        kim.opacity = 0;
        
        if(this.game_mode !== 3) {
            var ske_com = this.scene_set[this.game_mode - 1].getChildByName("anim").getComponent(sp.Skeleton);
            ske_com.clearTracks();
            ske_com.setAnimation(0, "daiji", true);
            
            ske_com = this.scene_set[this.game_mode - 1].getChildByName("anim2").getComponent(sp.Skeleton);
            ske_com.clearTracks();
            ske_com.setAnimation(0, "daiji", true);
            
            ske_com = this.scene_set[this.game_mode - 1].getChildByName("anim3").getComponent(sp.Skeleton);
            ske_com.clearTracks();
            ske_com.setAnimation(0, "daiji", true);
        }
        else {
            this.click_mask[0] = 1;
            this.click_mask[1] = 1;
            
            var tree = this.scene_set[this.game_mode - 1].getChildByName("anim3").getChildByName("tree");
            var frame_com = tree.getComponent("frame_anim");
            frame_com.reset_anim();
        }
        
        var func = cc.callFunc(this.on_enter_show_scene.bind(this), this);
        var seq = cc.sequence([cc.moveBy(1, -1920, 0), func]);
        this.map_root.runAction(seq);
        
    },
    
    game_enter_main_scene: function() {
        var func = cc.callFunc(function() {
            this.game_mode ++;
            this.invalid_click = false;
            this.invalid_next_click = false;
            this.play_sound("resources/sounds/5.mp3");
            
            if(this.game_mode > 3) { // 结算
                this.game_mode = 1;
                this.game_started = false;
                    
                this.scheduleOnce(function(){
                    this.checkout_root.active = true;
                    this.play_sound("resources/sounds/end.mp3");
                }.bind(this), 4);
            }
        }.bind(this), this);
        
        this.main_kim.opacity = 0;
        var func2 = cc.callFunc(function(){
            if(this.game_mode === 3) {
                var tree = this.scene_set[this.game_mode - 1].getChildByName("anim3").getChildByName("tree");
                var frame_com = tree.getComponent("frame_anim");
                frame_com.reset_anim();
            }
            
            this.main_kim.runAction(cc.fadeIn(2));
        }.bind(this), this);
        var seq = cc.sequence([cc.moveBy(1, 1920, 0), func2, cc.delayTime(2), func]);
        this.map_root.runAction(seq);
    }, 
    
    on_game_start: function() {
        this.checkout_root.active = false;
        this.map_root.x = 0;
        this.main_root.x = 0;
        this.main_root.y = 0;
        
        this.invalid_click = false;
        this.invalid_next_click = false;        
        
        this.main_kim.opacity = 0;
        var f = cc.fadeIn(2);
        var func = cc.callFunc(function(){
            this.game_started = true;
            this.game_mode = 1; // 显示第一个场景
            this.play_sound("resources/sounds/1.mp3");    
        }.bind(this));
        var seq = cc.sequence([f, func]);
        this.main_kim.runAction(seq);
    },
    
    
    on_next_part: function(ske_com) {
        if(this.invalid_next_click === true) {
            return;
        }
        
        ske_com.clearTracks();
        ske_com.setAnimation(0, "jiao", true);
        // ske_com.runAction(cc.scaleTo(0.5, 1.2));
        
        if(this.click_mask[0] === 0 || this.click_mask[1] === 0 || this.click_mask[2] === 0) {
            return;
        }
        
        this.invalid_next_click = true;
        
        this.scheduleOnce(function(){
            var sound_list = [
                "resources/sounds/2.mp3",
                "resources/sounds/3.mp3",
                "resources/sounds/4.mp3",
            ];
            
            this.play_sound(sound_list[this.game_mode - 1]);    
        }.bind(this), 2);
        
        console.log(this.game_mode);
        
        if (this.game_mode === 1) {
            this.scheduleOnce(function(){
                this.game_mode ++;
                this.invalid_click = false;
                this.invalid_next_click = false;
                this.game_enter_scene();
            }.bind(this), 8);
        }
        else {
            this.scheduleOnce(this.game_enter_main_scene.bind(this), 8); 
        }
    }, 
    
    on_show_checkout: function() {
        this.game_mode = 1;
        this.game_started = false;
        this.checkout_root.active = true;
        this.play_sound("resources/sounds/end.mp3");
    },
    
    on_next_part_tree: function(tree) {
        if(this.invalid_next_click === true) {
            return;
        }
        
        var frame_com = tree.getComponent("frame_anim");
        frame_com.play();
        
        if(this.click_mask[0] === 0 || this.click_mask[1] === 0 || this.click_mask[2] === 0) {
            return;
        }
        
        this.invalid_next_click = true;
        
        this.scheduleOnce(function(){
            var sound_list = [
                "resources/sounds/2.mp3",
                "resources/sounds/3.mp3",
                "resources/sounds/4.mp3",
            ];
            this.play_sound(sound_list[this.game_mode - 1]);    
        }.bind(this), 2);
        
        // this.scheduleOnce(this.game_enter_main_scene.bind(this), 8);    
        this.scheduleOnce(this.on_show_checkout.bind(this), 8);
    }, 
    
    on_anim_click1: function() {
        if(this.click_mask[0] === 1) {
            return;
        }
        this.click_mask[0] = 1;
        var ske_com = this.scene_set[this.game_mode - 1].getChildByName("anim").getComponent(sp.Skeleton);
        var sound_list = [
            "resources/sounds/niu.mp3",
            "resources/sounds/ji.mp3",
        ];
        this.play_sound(sound_list[this.game_mode - 1]);   
        this.on_next_part(ske_com);
    },
    
    on_anim_click2: function() {
        if(this.click_mask[1] === 1) {
            return;
        }
        this.click_mask[1] = 1;
        var ske_com = this.scene_set[this.game_mode - 1].getChildByName("anim2").getComponent(sp.Skeleton);;
        var sound_list = [
            "resources/sounds/niu.mp3",
            "resources/sounds/ji.mp3",
        ];
        this.play_sound(sound_list[this.game_mode - 1]);   
        this.on_next_part(ske_com);
    },
    
    on_anim_click3: function() {
        if(this.click_mask[2] === 1) {
            return;
        }
        this.click_mask[2] = 1;
        var ske_com = this.scene_set[this.game_mode - 1].getChildByName("anim3").getComponent(sp.Skeleton);
        var sound_list = [
            "resources/sounds/niu.mp3",
            "resources/sounds/ji.mp3",
        ];
        this.play_sound(sound_list[this.game_mode - 1]);
        this.on_next_part(ske_com);
    },
    
     on_tree_anim_click1: function() {
        if(this.click_mask[0] === 1) {
            return;
        }
        this.click_mask[0] = 1;
        var ske_com = this.scene_set[this.game_mode - 1].getChildByName("anim").getChildByName("tree");
        this.on_next_part_tree(ske_com);
    },
    
    on_tree_anim_click2: function() {
        if(this.click_mask[1] === 1) {
            return;
        }
        this.click_mask[1] = 1;
        var ske_com = this.scene_set[this.game_mode - 1].getChildByName("anim2").getChildByName("tree");
        this.on_next_part_tree(ske_com);
    },
    
    on_tree_anim_click3: function() {
        if(this.click_mask[2] === 1) {
            return;
        }
        this.click_mask[2] = 1;
        var ske_com = this.scene_set[this.game_mode - 1].getChildByName("anim3").getChildByName("tree");
        this.on_next_part_tree(ske_com);
    },
    
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});