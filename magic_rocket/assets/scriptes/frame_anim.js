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
        
        name_prefix: {
            default:"resources/texture/game_scene/out",
            type: String,
        },
        name_begin_index: 1,
        frame_count: 2, 
        frame_duration: 0.3,
        loop: true,
        play_on_load: false,
    },

    // use this for initialization
    onLoad: function () {
        this.frames_sp=[]
        
        var url = cc.url.raw("resources/texture/game_scene/factory_ok.png");
        this.normal_sp = new cc.SpriteFrame(url);
        
        for(var i = 0; i < this.frame_count; i ++) {
            var url = cc.url.raw(this.name_prefix + (this.name_begin_index + i) + ".png");
            var sp = new cc.SpriteFrame(url);
            this.frames_sp.push(sp);
        }
        
        this.sp_comp = this.node.getComponent(cc.Sprite);
        if(!this.sp_comp) {
            this.sp_comp = this.node.addComponent(cc.Sprite);    
        }
        this.sp_comp.spriteFrame = this.normal_sp.clone();
        
        this.now_index = 0;
        this.pass_time = 0;
        this.anim_ended = false;
        this.anim_ended = (!this.play_on_load);
        
        this.anim_end_func = null;
    },
    
    start: function() {
        this.pass_time = 0;    
    },
    
    play: function(func) {
        this.pass_time = 0;
        this.anim_ended = false;
        this.anim_end_func = func;
    },
    
    stop: function() {
        this.anim_ended = true;
        this.sp_comp.spriteFrame = this.normal_sp.clone();
    }, 
    
    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if(this.anim_ended) {
            return;
        }
        this.pass_time += dt;
        var index = Math.floor(this.pass_time / this.frame_duration);
        
        if(this.loop) {
            if(this.now_index != index) {
                if(index >= this.frame_count) {
                    this.pass_time = 0;
                    this.sp_comp.spriteFrame = this.frames_sp[0].clone();
                    this.now_index = 0;
                }
                else {
                    this.sp_comp.spriteFrame = this.frames_sp[index].clone();
                    this.now_index = index;
                }
            }
        }
        else {
            if(this.now_index != index) {
                if(index >= this.frame_count) {
                    this.anim_ended = true;
                    if(this.anim_end_func) {
                        this.anim_end_func();
                    }
                }
                else {
                    this.now_index = index;
                    this.sp_comp.spriteFrame = this.frames_sp[index].clone();
                }
            }
        }
    },
});