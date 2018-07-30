var decro_prefab_set = cc.Class({
    name: 'decro_prefab_set',
    properties: {
        sub_set: {
            default: [],
            type: cc.Prefab    
        }
    }
});

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
        bones_prefab: cc.Prefab,
        bonus_move_time: 2,
        
        main_car_prefabs: {
            default: [],
            type: cc.Prefab,
        },
        
        front_car_prefabs: {
            default: [],
            type: cc.Prefab,
        },
        
        back_car_prefabs: {
            default: [],
            type: cc.Prefab,
        },
        
        wheel_car_prefabs: {
            default: [],
            type: cc.Prefab,
        },
        
        decro_prfabs: {
            default:[],
            type: decro_prefab_set
        }
    },
    
    // use this for initialization
    preload_sound: function() {
        var sound_list = [
            "resources/sounds/bones_in.mp3",
            "resources/sounds/go_auto.mp3",
            "resources/sounds/move_parts.mp3",
            "resources/sounds/ping_ok.mp3",
            "resources/sounds/play.mp3",
            "resources/sounds/kim_clk2.mp3",
            "resources/sounds/kim_clk1.mp3",
            "resources/sounds/end.mp3",
        ];
        
        for(var i = 0; i < sound_list.length; i ++) {
            var url = cc.url.raw(sound_list[i]);
            cc.loader.loadRes(url, function() {});    
        }
    }, 
    
    // use this for initialization
    onLoad: function () {
        this.game_start = false;
        
        
        this.magic_car = cc.find("UI_ROOT/anchor-center/car_root");
        this.magic_car_body = cc.find("UI_ROOT/anchor-center/car_root/car_body");
        this.magic_car_wheel = cc.find("UI_ROOT/anchor-center/car_root/car_wheel");
        
        this.magic_car_start_pos = this.magic_car.getPosition(); 
        this.car_parts = cc.find("UI_ROOT/anchor-center/car_parts");
        this.car_parts_start_pos = this.car_parts.getPosition();
        this.ske_kim_com = cc.find("UI_ROOT/anchor-center/kim").getComponent(sp.Skeleton);
        this.game_mode = 0;
        this.car_part = null;
        this.main_car_part = null;
        this.front_car_part = null;
        this.back_car_part = null;
        
        this.level_1_1_ok = false;
        this.level_1_2_ok = false;
        
        this.level_2_1_ok = false;
        this.level_2_2_ok = false;
        
        this.now_tip_main_type = -1;
        this.tip_type_root = cc.find("UI_ROOT/anchor-center/tip_type_root");
        // this.man3 = cc.find("UI_ROOT/anchor-center/man3");
        
        this.preload_sound();
    },
    
    play_kim_click_anim_with_random:function() {
        var v = Math.random();
        var anim_name = "clk_1";
        var sound_name = "resources/sounds/kim_clk1.mp3";
        if (v < 0.5) {
            anim_name = "clk_2";
            sound_name = "resources/sounds/kim_clk2.mp3";
        }
        this.lock_kim_click = true;
        this.play_sound(sound_name);
        this.ske_kim_com.clearTracks();
        this.ske_kim_com.setAnimation(0, anim_name, false);
        
        this.call_latter(function() {
            this.ske_kim_com.clearTracks();
            this.ske_kim_com.setAnimation(0, "idle_1", true);
            this.lock_kim_click = false;
        }.bind(this), 2);
    }, 
    
    start: function() {
        this.lock_kim_click = true;
        this.call_latter(function() {
            this.ske_kim_com.clearTracks();
            this.ske_kim_com.setAnimation(0, "idle_1", true);
            this.lock_kim_click = false;
        }.bind(this), 0.9);
        this.on_start_game();
    }, 
    
    play_sound: function(name) {
        var url_data = cc.url.raw(name);
        cc.audioEngine.stopMusic();
        cc.audioEngine.playMusic(url_data);
    },
    
    call_latter: function(callfunc, delay) {
        var delay_action = cc.delayTime(delay);
        var call_action = cc.callFunc(callfunc, this);
        var seq = cc.sequence([delay_action, call_action]);
        this.node.runAction(seq);
    },
    
    play_kim_anim_with_right:function() {
        this.ske_kim_com.clearTracks();
        this.ske_kim_com.setAnimation(0, "ok_1", false);
        this.call_latter(function() {
            this.ske_kim_com.clearTracks();
            this.ske_kim_com.setAnimation(0, "idle_1", true);
        }.bind(this), 2);
        this.play_sound("resources/sounds/goto_end.mp3");
    }, 
    
    play_kim_anim_with_error:function() {
        this.ske_kim_com.clearTracks();
        this.ske_kim_com.setAnimation(0, "err_1", false);
        this.call_latter(function() {
            this.ske_kim_com.clearTracks();
            this.ske_kim_com.setAnimation(0, "idle_1", true);
        }.bind(this), 1.5);
        // this.play_sound("resources/sounds/ck_error.mp3");
    }, 
    
    on_start_game: function() {
        if(this.game_start === true) {
            return;
        }
        
        
        // this.man3.active = false;
        this.now_tip_main_type = -1;
        this.level_1_1_ok = false;
        this.level_1_2_ok = false;
        this.level_2_1_ok = false;
        this.level_2_2_ok = false;
        this.level_3_1_ok = false;
        this.level_3_2_ok = false;
        
        this.play_sound("resources/sounds/bones_in.mp3");
        this.game_start = true;
        // this.factory_ok.active = false;
        this.magic_car_body.removeAllChildren();
        this.magic_car_wheel.removeAllChildren();
        this.car_parts.removeAllChildren();
        this.tip_type_root.removeAllChildren();
        
        
        var main_car = cc.instantiate(this.main_car_prefabs[0]);
        var main_car_com = main_car.getComponent("car_part");
        this.magic_car_body.addChild(main_car);
        main_car.active = true;
        this.main_car_part = main_car;
        
        if(this.back_car_part !== null){
            this.change_part_anim(this.back_car_part, this.main_car_part);
            this.back_car_part = null;
        }
        
        
        this.car_part = null;
        this.lock_enter_next_mode = true;  
        main_car_com.invalid_hit_move();
        // this.call_latter(this.enter_main_car_model.bind(this), this.bonus_move_time);
        this.enter_main_car_model();
        // this.enter_car_front_mode();
        // this.enter_car_back_mode();
    },
    
    remove_decor_from_hit_set: function(decorative_com) {
        // 计算是否已经在hit_set表里面
        var index;
        for(index = 0; index < this.hit_set.length; index ++) {
            if (this.hit_set[index][3] == decorative_com.node) { // 这个零件已经在这个表里面了
                this.hit_set[index][3] = null;
                return;
            }
        }
        // end 
    }, 
    
    hide_game_tip_object: function(main_type, sub_type) {
        if (this.game_mode < 1) {
            return;
        } 
        
        if (this.game_mode === 2) {
            
            if(this.level_2_1_ok === false) {
                if(this.hit_set[1][3]) {
                    this.hit_set[1][3].active = true;
                }
                if(this.hit_set[2][3]) {
                    this.hit_set[2][3].active = true;
                }
            }
            
            if(this.level_2_2_ok === false) {
                if(this.hit_set[3][3]) {
                    this.hit_set[3][3].active = true;
                }
                if(this.hit_set[4][3]) {
                    this.hit_set[4][3].active = true;
                }
            }
        }
        else {
            var index;
            for(index = 0; index < this.hit_set.length; index++) {
                if(this.hit_set[index][0] == main_type && this.hit_set[index][3] !== null) { // 这里绘制提示
                    this.hit_set[index][3].active = true;
                }
            }    
        }
        
        
        this.tip_type_root.removeAllChildren();
        this.now_tip_main_type = -1;
    }, 
    
    hide_game_tip_car_part: function() {
        this.tip_type_root.removeAllChildren();
        this.now_tip_main_type = -1;
    },
    
    show_game_tip_car_part: function(sub_type, w_pos) {
        if(this.car_part) {
            this.car_part.active = false;
        }
        
        if(this.game_mode == 1) { // 车体
            if(sub_type != this.now_tip_main_type) {
                var main_car = cc.instantiate(this.main_car_prefabs[sub_type - 1]);
                this.tip_type_root.addChild(main_car);
                var pos = this.tip_type_root.convertToNodeSpace(w_pos);
                this.now_tip_main_type = sub_type;
                main_car.active = true;
                main_car.x = pos.x;
                main_car.y = pos.y;
                main_car.scale = 1.0;
                main_car.opacity = 128;
            }
        }
        else if(this.game_mode == 2) { // 车头
            if(sub_type != this.now_tip_main_type) {
                var front_car = cc.instantiate(this.front_car_prefabs[sub_type - 1]);
                this.tip_type_root.addChild(front_car);
                var pos = this.tip_type_root.convertToNodeSpace(w_pos);
                this.now_tip_main_type = sub_type;
                front_car.active = true;
                front_car.x = pos.x;
                front_car.y = pos.y;
                front_car.scale = 1.0;
                front_car.opacity = 128;
            }
        }
        else if(this.game_mode == 3) { // 车尾
            if(sub_type != this.now_tip_main_type) {
                var back_car = cc.instantiate(this.back_car_prefabs[sub_type - 1]);
                this.tip_type_root.addChild(back_car);
                var pos = this.tip_type_root.convertToNodeSpace(w_pos);
                this.now_tip_main_type = sub_type;
                back_car.active = true;
                back_car.x = pos.x;
                back_car.y = pos.y;
                back_car.scale = 1.0;
                back_car.opacity = 128;
            }
        }
    }, 
    
    change_lever1: function() {
        if(this.main_car_part === null) {
            return;
        }
        
        if(this.level_1_1_ok === false && this.hit_set[0][3] !== null && this.hit_set[1][3] !== null && this.hit_set[2][3] !== null) { // 改变第一根杠杆
            /*var com_left = this.hit_set[0][3].getChildByName("move_diandi").getComponent("evl_move");
            com_left.move_by(1, 300);
            var shenzi = this.main_car_part.getChildByName("shenzi")
            shenzi.active = true;
            
            var com_right = this.hit_set[1][3].getChildByName("move_diandi").getComponent("evl_move");
            com_right.add_by(300);
            com_right.move_by(1, -300);*/
            
            this.level_1_1_ok = true;
            
        }
        
        if (this.level_1_2_ok === false && this.hit_set[3][3] !== null && this.hit_set[4][3] !== null) { // 改变第二根杠杆
            this.level_1_2_ok = true;
             var gang2 = this.main_car_part.getChildByName("gang_1");
            gang2.runAction(cc.rotateTo(0.2, 23));
            
            this.hit_set[3][3].runAction(cc.moveBy(0.2, -11, -56));
            this.hit_set[4][3].runAction(cc.moveBy(0.2, -11, -56));
        }
    }, 
    
    change_lever2: function() {
        if(this.front_car_part === null) {
            return;
        }
        
        if(this.level_2_1_ok === false && this.hit_set[1][3] !== null && this.hit_set[2][3] !== null) { // 改变第一根杠杆
            this.level_2_1_ok = true;
            
            var com_left = this.hit_set[2][3].getChildByName("move_diandi").getComponent("evl_move");
            // com_left.move_by(1, 420);
            com_left.add_by(439);
            com_left.move_by(1, -439);
            
            var shenzi = this.front_car_part.getChildByName("shenzi")
            shenzi.active = true;
            
            var com_right = this.hit_set[1][3].getChildByName("move_diandi").getComponent("evl_move");
            com_right.move_by(1, 439);
        }
        
        if (this.level_2_2_ok === false && this.hit_set[3][3] !== null && this.hit_set[4][3] !== null) { // 改变第二根杠杆
            this.level_2_2_ok = true;
            
            // this.hit_set[3][3].runAction(cc.rotateBy(2, 360));
            // this.hit_set[4][3].runAction(cc.rotateBy(2, 360));
            
            // var up1 = this.front_car_part.getChildByName("up1").getComponent("up_and_down_move");
            // up1.move_by(2, 258);
        }
    }, 
    
    change_lever3: function() {
        if(this.back_car_part === null) {
            return;
        }
        
        if(this.level_3_1_ok === false && this.hit_set[1][3] !== null && this.hit_set[2][3] !== null && this.hit_set[3][3] !== null) { // 改变第一根杠杆
            this.level_3_1_ok = true;
            var huo_sai1 = this.back_car_part.getChildByName("huosai2");
            huo_sai1.active = true;

            this.tip_type_root.removeAllChildren();
            this.hit_set[1][3].active = false;
            this.hit_set[2][3].active = false;
            this.hit_set[3][3].active = false;
            
            var move_time = 2;
            var down2_com = this.back_car_part.getChildByName("up1").getComponent("up_and_down_move");
            down2_com.move_by(move_time, 140);
            
            this.call_latter(function(){
                huo_sai1.getComponent(sp.Skeleton).clearTracks();
            }.bind(this), move_time);
        }
        
        if (this.level_3_2_ok === false && this.hit_set[4][3] !== null && this.hit_set[5][3] !== null) { // 改变第二根杠杆
            this.level_3_2_ok = true;
            
            var com_left = this.hit_set[5][3].getChildByName("move_diandi").getComponent("evl_move");
            com_left.move_by(1, 157);
            var shenzi = this.back_car_part.getChildByName("shenzi")
            shenzi.active = true;
            
            var com_right = this.hit_set[4][3].getChildByName("move_diandi").getComponent("evl_move");
            com_right.add_by(157);
            com_right.move_by(1, -157);
        }
    }, 
    
    check_lever_change: function() {
        if(this.game_mode === 1) {
            this.change_lever1();
        }
        else if (this.game_mode === 2) {
            this.change_lever2();
        }
        else if (this.game_mode === 3) {
            this.change_lever3();
        }
    }, 
    
    hit_car_part: function(decorative_com, w_pos, main_type, sub_type) {
        var time = 0.01;
        var index;
        var enter_next_mode = true;
        var hit_test = false;
        
        // 计算是否已经在hit_set表里面
        for(index = 0; index < this.hit_set.length; index ++) {
            if (this.hit_set[index][3] == decorative_com.node) { // 这个零件已经在这个表里面了
                return;
            }
        }
        // end 
        
        // 绘制提示
        if (this.game_mode >= 1 && this.now_tip_main_type != main_type) {
            this.tip_type_root.removeAllChildren();
            this.now_tip_main_type = main_type;
            for(index = 0; index < this.hit_set.length; index++) {
                if(this.hit_set[index][0] == main_type) { // 这里绘制提示
                    if(this.hit_set[index][3] !== null) {
                        // this.hit_set[index][3].active = false;
                        continue;
                    }
                    var world_pos = this.hit_set[index][2];
                    var new_node = cc.instantiate(this.decro_prfabs[main_type - 1].sub_set[sub_type - 1]);
                    this.tip_type_root.addChild(new_node);
                    var pos = this.tip_type_root.convertToNodeSpace(world_pos);
                    new_node.x = pos.x;
                    new_node.y = pos.y;
                    new_node.opacity = 128;
                    new_node.active = true;
                    new_node.scale = 1.0;
                }
            }
        }
        // end 
        
        for(index = 0; index < this.hit_set.length; index ++) {
            // [main_type, sub_type, w_pos, now_object];
            // var main_type = this.hit_set[index][0];
            // var sub_type = this.hit_set[index][1];
            var world_pos = this.hit_set[index][2];
            var now_obj = this.hit_set[index][3];
            
            if (now_obj === null && hit_test === false && this.hit_set[index][0] == main_type && cc.pDistance(w_pos, world_pos) < 30) { // hit
                if(now_obj) {
                    var comp = now_obj.getComponent("decorative_part");
                    now_obj.active = true;
                    time = comp.move_back();
                }
                this.play_sound("resources/sounds/ping_ok.mp3");
                decorative_com.on_hit_item(time, world_pos);
                this.hit_set[index][3] = decorative_com.node;
                this.hit_set[index][1] = decorative_com.sub_type;
                hit_test = true;
            }
            else {
                if(now_obj === null) {
                    enter_next_mode = false;
                }
            }
        }
        
        
        if(enter_next_mode) { // 进入下一个关卡
            this.on_next_game_mode();
        }
    }, 
    
    change_car_part: function(car_main, sub_type, main_type) {
        var time = 0.01;
        if(this.car_part) {
            var comp = this.car_part.getComponent("car_part");
            comp.node.active = true;
            time = comp.move_back();
            this.car_part = null;
        }
        this.play_sound("resources/sounds/ping_ok.mp3");
        this.lock_enter_next_mode = false; // 可以进入下一个环节
        this.next_button.active = true;
        this.car_part = car_main;
        this.car_part_type = sub_type;
        return time;
    }, 
    // 进入组装主提模式
    enter_main_car_model: function() {
        this.game_mode = 1;
        this.lock_enter_next_mode = true;
        this.car_parts.removeAllChildren();
        
        var start_x = (this.game_mode - 1) * 1920; 
        var num = 5 + 1;
        var delta = 1560 / num;
        var ypos = 60;
        var xpos = start_x + delta * 5;
        
        var huo_sai = this.main_car_part.getChildByName("huosai");
        huo_sai.active =false;
        
        // comput hit pos
        this.front_car_part = null
        this.back_car_part = null
        this.computer_hit_pos_more_type(1);
        // end
        
        var main_car = cc.instantiate(this.decro_prfabs[3].sub_set[0]);
        this.car_parts.addChild(main_car);
        var main_car_com = main_car.getComponent("decorative_part");
        main_car_com.set_start_pos(xpos, ypos);
        xpos = xpos - delta;
        main_car.active = true;
        
        var main_car = cc.instantiate(this.decro_prfabs[2].sub_set[0]);
        this.car_parts.addChild(main_car);
        var main_car_com = main_car.getComponent("decorative_part");
        main_car_com.set_start_pos(xpos, ypos);
        xpos = xpos - delta;
        main_car.active = true;
        
        var main_car = cc.instantiate(this.decro_prfabs[4].sub_set[0]);
        this.car_parts.addChild(main_car);
        var main_car_com = main_car.getComponent("decorative_part");
        main_car_com.set_start_pos(xpos, ypos);
        xpos = xpos - delta;
        main_car.active = true;
        
        var main_car = cc.instantiate(this.decro_prfabs[8].sub_set[0]);
        this.car_parts.addChild(main_car);
        var main_car_com = main_car.getComponent("decorative_part");
        main_car_com.set_start_pos(xpos, ypos);
        xpos = xpos - delta;
        main_car.active = true;
        
        var main_car = cc.instantiate(this.decro_prfabs[7].sub_set[0]);
        this.car_parts.addChild(main_car);
        var main_car_com = main_car.getComponent("decorative_part");
        main_car_com.set_start_pos(xpos, ypos);
        xpos = xpos - delta;
        main_car.active = true;
    },
    
    get_front_car_pos_set: function(main_car) {
        this.front_pos_set = [];
        
        for(var i = 0; i < this.front_car_prefabs.length; i++ ) {
            var name = "front" + (i + 1);
            var node = main_car.getChildByName(name);
            var w_pos = node.convertToWorldSpaceAR(cc.p(0, 0));
            var pos = this.magic_car.convertToNodeSpace(w_pos);
            this.front_pos_set.push(pos);
        }
    }, 
    
    get_back_car_pos_set: function(main_car) {
        this.back_pos_set = [];
        for(var i = 0; i < this.back_car_prefabs.length; i++ ) {
            var name = "back" + (i + 1);
            var node = main_car.getChildByName(name);
            var w_pos = node.convertToWorldSpaceAR(cc.p(0, 0));
            var pos = this.magic_car.convertToNodeSpace(w_pos);
            this.back_pos_set.push(pos);
        }
    }, 
    
    // [main_type, sub_type, w_pos, now_object]
    computer_hit_pos: function(now_main_type) {
        this.hit_set = [];
        var index;
        
        // front, this.front_car_part decorative_item
        var front_car_com = this.front_car_part.getComponent("car_part");
        for(index = 0; index < front_car_com.decorative_item.length; index ++) {
            var main_type = front_car_com.decorative_item[index].main_type;
            if (main_type !== now_main_type) {
                continue;
            }
            var sub_type = 0;
            var w_pos = this.front_car_part.convertToWorldSpaceAR(cc.p(front_car_com.decorative_item[index].xpos, front_car_com.decorative_item[index].ypos));
            var a_set = [main_type, sub_type, w_pos, null];
            this.hit_set.push(a_set);
        }
        // end
        
        // back, this.back_car_part
        var back_car_com = this.back_car_part.getComponent("car_part");
        for(index = 0; index < back_car_com.decorative_item.length; index ++) {
            var main_type = back_car_com.decorative_item[index].main_type;
            if (main_type !== now_main_type) {
                continue;
            }
            var sub_type = 0;
            var w_pos = this.back_car_part.convertToWorldSpaceAR(cc.p(back_car_com.decorative_item[index].xpos, back_car_com.decorative_item[index].ypos));
            var a_set = [main_type, sub_type, w_pos, null];
            this.hit_set.push(a_set);
        }
        // end 
        
        // main, this.main_car_part
        var main_car_com = this.main_car_part.getComponent("car_part");
        for(index = 0; index < main_car_com.decorative_item.length; index ++) {
            var main_type = main_car_com.decorative_item[index].main_type;
            if (main_type !== now_main_type) {
                continue;
            }
            var sub_type = 0;
            var w_pos = this.main_car_part.convertToWorldSpaceAR(cc.p(main_car_com.decorative_item[index].xpos, main_car_com.decorative_item[index].ypos));
            var a_set = [main_type, sub_type, w_pos, null];
            this.hit_set.push(a_set);
        }
        // end 
        
    },
    
    computer_hit_pos_more_type: function(now_main_type) {
        this.hit_set = [];
        var index;
        
        // front, this.front_car_part decorative_item
        if (this.front_car_part) {
            var front_car_com = this.front_car_part.getComponent("car_part");
            for(index = 0; index < front_car_com.decorative_item.length; index ++) {
                var main_type = front_car_com.decorative_item[index].main_type;
                if (main_type < now_main_type) {
                    continue;
                }
                var sub_type = 0;
                var w_pos = this.front_car_part.convertToWorldSpaceAR(cc.p(front_car_com.decorative_item[index].xpos, front_car_com.decorative_item[index].ypos));
                var a_set = [main_type, sub_type, w_pos, null];
                this.hit_set.push(a_set);
            }    
        }
        // end
        
        // back, this.back_car_part
        if (this.back_car_part) {
            var back_car_com = this.back_car_part.getComponent("car_part");
            for(index = 0; index < back_car_com.decorative_item.length; index ++) {
                var main_type = back_car_com.decorative_item[index].main_type;
                if (main_type < now_main_type) {
                    continue;
                }
                var sub_type = 0;
                var w_pos = this.back_car_part.convertToWorldSpaceAR(cc.p(back_car_com.decorative_item[index].xpos, back_car_com.decorative_item[index].ypos));
                var a_set = [main_type, sub_type, w_pos, null];
                this.hit_set.push(a_set);
            }    
        }
        
        // end 
        // main, this.main_car_part
        if(this.main_car_part) {
            var main_car_com = this.main_car_part.getComponent("car_part");
            for(index = 0; index < main_car_com.decorative_item.length; index ++) {
                var main_type = main_car_com.decorative_item[index].main_type;
                if (main_type < now_main_type) {
                    continue;
                }
                var sub_type = 0;
                var w_pos = this.main_car_part.convertToWorldSpaceAR(cc.p(main_car_com.decorative_item[index].xpos, main_car_com.decorative_item[index].ypos));
                var a_set = [main_type, sub_type, w_pos, null];
                this.hit_set.push(a_set);
            }    
        }
        // end 
        
    },
    
    get_all_decor_parts_num: function() {
        var index, j;
        var num = 0;
        for(index = 0; index < this.decro_prfabs.length; index ++) {
            num = num + this.decro_prfabs[index].sub_set.length;
        }
        return num;
    }, 
    

    on_out_factory_click: function() {
        if(this.output_mode) {
            return;
        }
        this.output_mode = true;
        // 改变装饰的父亲节点
        for(var index = 0; index < this.hit_set.length; index ++) {
            var main_type = this.hit_set[index][0];
            var sub_type = this.hit_set[index][1];
            var node = this.hit_set[index][3];
            if (!node) {
                continue;
            }
            
            var w_pos = node.convertToWorldSpaceAR(cc.p(0, 0));
            this.hit_set[index][3] = null;
            
            var new_node = cc.instantiate(this.decro_prfabs[main_type - 2].sub_set[sub_type - 1]);
            new_node.active = true;
            this.magic_car_body.addChild(new_node);
            var pos = this.magic_car_body.convertToNodeSpace(w_pos);
            new_node.x = pos.x;
            new_node.y = pos.y;
            new_node.scale = 1;
            
            node.removeFromParent();
        }
        // end 
        
        // 车子开出去
        // var mby = cc.moveBy(3, 1920, 0);
        // this.magic_car.runAction(mby);
        var m1 = cc.moveTo(0.1, 0, -4);
        var m2 = cc.moveTo(0.1, 0, 4);
        var body_actions = [];
        for(var i = 0; i < 8; i ++) {
            body_actions.push(m1.clone());
            body_actions.push(m2.clone());
        }
        body_actions.push(cc.moveTo(0.05, 0, 0));
        var c1 = cc.callFunc(function() {
            var mby = cc.moveBy(3, 1920, 0);
            this.magic_car.runAction(mby);
        }.bind(this), this);
        body_actions.push(c1);
        
        var seq = cc.sequence(body_actions);
        this.magic_car_body.runAction(seq);
        for(var i = 0; i < this.wheel_set.length; i ++) {
            var wheel = this.wheel_set[i];
            var rot = cc.rotateBy(0.5, 360);
            var f = cc.repeatForever(rot);
            wheel.runAction(f);
        }
        // end 
        
        // 零件拖走
        var move = cc.moveBy(1.6, -1920, 0);
        this.car_parts.runAction(move);
        // end 
        this.play_sound("resources/sounds/go_auto.mp3");
        // 游戏开始
        this.call_latter(function() {
            this.magic_car_body.removeAllChildren();
            this.magic_car_wheel.removeAllChildren();
            this.car_parts.removeAllChildren();
            
            this.magic_car.x = this.magic_car_start_pos.x;
            this.magic_car.y = this.magic_car_start_pos.y;
            
            this.car_parts.x = this.car_parts_start_pos.x;
            this.car_parts.y = this.car_parts_start_pos.y;
            
            this.factory_ok.x = this.factory_ok_start_pos.x;
            this.factory_ok.y = this.factory_ok_start_pos.y;
            
            this.output_mode = false;
            this.game_start = false;
            this.on_start_game();
            
        }.bind(this), 5);
        // end 
    }, 
    
    // 进入装饰组装模式
    enter_decor_mode: function() {
        var index;
        this.wheel_set = [];
        
        for(index = 0; index < this.hit_set.length; index ++) {
            var sub_type = this.hit_set[index][1];
            var node = this.hit_set[index][3];
            var w_pos = node.convertToWorldSpaceAR(cc.p(0, 0));
            this.hit_set[index][3] = null;
            
            var new_node = cc.instantiate(this.wheel_car_prefabs[sub_type - 1]);
            new_node.active = true;
            this.magic_car_wheel.addChild(new_node);
            var comp = new_node.getComponent("decorative_part");
            comp.invalid_hit_move();
            
            var pos = this.magic_car_wheel.convertToNodeSpace(w_pos);
            new_node.x = pos.x;
            new_node.y = pos.y;
            new_node.scale = 1;
            node.removeFromParent();
            
            // 保存轮胎
            this.wheel_set.push(new_node);
            // end 
        }
        
        // 遍历所有的轮胎位置
        this.computer_hit_pos_more_type(2);
        // end
        
        this.game_mode = 5;
        this.lock_enter_next_mode = true;
        
        var num = this.get_all_decor_parts_num();
        console.log("" + num);
        
        var start_x = (this.game_mode) * 1920; 
        var delta = 1920 / (num + 1);
        var ypos = 40;
        var xpos = start_x + delta;
        
        for (var j = 0; j < this.decro_prfabs.length; j ++) {
            for(var i = 0; i < this.decro_prfabs[j].sub_set.length; i ++) {
                var prefab = this.decro_prfabs[j].sub_set[i];
                var decor = cc.instantiate(prefab);
                decor.active = true;
                this.car_parts.addChild(decor);
                var decor_com = decor.getComponent("decorative_part");
                var size = decor.getContentSize();
                var w = size.width * 0.5 * decor.scale;
                var h = size.height * 0.5 * decor.scale;
                var dx = (decor.anchorX - 0.5) * w;
                var dy = (decor.anchorY - 0.5) * h;
                decor_com.set_start_pos(xpos + dx, ypos + dy - 20);
                xpos = xpos + delta;
            }
        }
        
        var move = cc.moveBy(1.6, -1920, 0);
        this.car_parts.runAction(move);
        
        // 显示开出汽车的按钮
        this.factory_ok.active = true;
        move = cc.moveBy(0.5, 335, 0);
        this.factory_ok.runAction(move);
        // end 
    },
    
    // 进入车轮组装模式
    enter_whell_mode: function() {
        // 更换父亲节点
        var w_pos = this.car_parts.convertToWorldSpace(this.car_part.getPosition());
        var comp = this.car_part.getComponent("car_part");
        var back_car = cc.instantiate(this.back_car_prefabs[this.car_part_type - 1]);
        this.magic_car_body.addChild(back_car);
        var pos = this.magic_car_body.convertToNodeSpace(w_pos);
        back_car.active = true;
        back_car.x = pos.x;
        back_car.y = pos.y;
        back_car.scale = 1.0;
        comp = back_car.getComponent("car_part");
        comp.invalid_hit_move();
        this.back_car_part = back_car;
        this.car_part.removeFromParent();
        this.car_part = null;
        // this.get_back_car_pos_set(this.main_car_part);
        // end    
        
        // 遍历所有的轮胎位置
        this.computer_hit_pos(1);
        // end 
        
        this.game_mode = 4;
        this.lock_enter_next_mode = true;
        
        var start_x = (this.game_mode) * 1920; 
        // var num = this.wheel_car_prefabs.length + 1;
        var num = 6 + 1;
        
        var delta = 1920 / num;
        var ypos = 40;
        var xpos = start_x + delta;
        
        for(var j = 0; j < 3; j ++) {
            for(var i = 0; i < this.wheel_car_prefabs.length; i ++) {
                var wheel = cc.instantiate(this.wheel_car_prefabs[i]);
                wheel.active = true;
                this.car_parts.addChild(wheel);
                var wheel_com = wheel.getComponent("decorative_part");
                wheel_com.set_start_pos(xpos, ypos);
                wheel_com.dst_pos = 0;
                xpos = xpos + delta;
            }
        }
        
        var move = cc.moveBy(1.6, -1920, 0);
        this.car_parts.runAction(move);
    },
    
    change_part_anim: function(prev, next) {
        /*var fout = cc.fadeOut(0.3);
        var func = cc.callFunc(function() {
            prev.removeFromParent();
        }.bind(this), this);
        var seq = cc.sequence([fout, func]);*/
        // prev.runAction(seq);
        // prev.opacity = 0;
        if(prev) {
            prev.removeFromParent();    
        } 
        
        next.opacity = 100;
        var fin = cc.fadeIn(0.3);
        next.runAction(fin);
        this.call_latter(function() {
            next.opacity = 255; 
        }.bind(this), 0.3);
        return 0.3
    }, 
     // 进入组装车头模式
    enter_car_front_mode: function() {
        this.car_parts.removeAllChildren();
        this.game_mode = 2;
        
        // 放出第二关
        // this.main_car_part.removeFromParent();
        // this.main_car_part = null;
        this.front_car_part = cc.instantiate(this.front_car_prefabs[0]);
        this.front_car_part.active = true;
        this.magic_car_body.addChild(this.front_car_part);
        this.front_car_part.getComponent("car_part").invalid_hit_move();
       
        this.change_part_anim(this.main_car_part, this.front_car_part);
        this.main_car_part = null;
        
        this.computer_hit_pos_more_type(1);
       
        var start_x = 0; 
        var num = 5 + 1;
        var delta = 1560 / num;
        var ypos = 60;
        var xpos = start_x + delta * 5;
        
        
        var main_car = cc.instantiate(this.decro_prfabs[8].sub_set[0]);
        this.car_parts.addChild(main_car);
        var main_car_com = main_car.getComponent("decorative_part");
        main_car_com.set_start_pos(xpos, ypos);
        xpos = xpos - delta;
        main_car.active = true;
        
        main_car = cc.instantiate(this.decro_prfabs[11].sub_set[0]);
        this.car_parts.addChild(main_car);
        var main_car_com = main_car.getComponent("decorative_part");
        main_car_com.set_start_pos(xpos, ypos + 40);
        xpos = xpos - delta;
        main_car.active = true;
        
        var main_car = cc.instantiate(this.decro_prfabs[12].sub_set[0]);
        this.car_parts.addChild(main_car);
        var main_car_com = main_car.getComponent("decorative_part");
        main_car_com.set_start_pos(xpos, ypos + 40);
        xpos = xpos - delta;
        main_car.active = true;
        
        var main_car = cc.instantiate(this.decro_prfabs[9].sub_set[0]);
        this.car_parts.addChild(main_car);
        var main_car_com = main_car.getComponent("decorative_part");
        main_car_com.set_start_pos(xpos, ypos);
        xpos = xpos - delta;
        main_car.active = true;
        
        main_car = cc.instantiate(this.decro_prfabs[10].sub_set[0]);
        this.car_parts.addChild(main_car);
        var main_car_com = main_car.getComponent("decorative_part");
        main_car_com.set_start_pos(xpos, ypos);
        xpos = xpos - delta;
        main_car.active = true;
    },
    // end 
    
    // 进入车尾组装模式
    enter_car_back_mode: function() {
        this.game_mode = 3;
        // 放出第二关
        // this.front_car_part.removeFromParent();
        // this.front_car_part = null;
        this.back_car_part = cc.instantiate(this.back_car_prefabs[0]);
        this.back_car_part.active = true;
        this.magic_car_body.addChild(this.back_car_part);
        this.back_car_part.getComponent("car_part").invalid_hit_move();
        this.change_part_anim(this.front_car_part, this.back_car_part);
        this.front_car_part = null;
        this.main_car_part = null;
        // end 
        

        var huo_sai2 = this.back_car_part.getChildByName("huosai2");
        huo_sai2.active =false;
        
        var shenzi = this.back_car_part.getChildByName("shenzi");
        shenzi.active =false;
        
        this.computer_hit_pos_more_type(1);
        this.car_parts.removeAllChildren();
        // this.man3.active = true;
         var start_x = 0; 
        var num = 6 + 1;
        var delta = 1560 / num;
        var ypos = 60;
        var xpos = start_x + delta * 6;
        
        var main_car = cc.instantiate(this.decro_prfabs[13].sub_set[0]);
        this.car_parts.addChild(main_car);
        var main_car_com = main_car.getComponent("decorative_part");
        main_car_com.set_start_pos(xpos, ypos);
        xpos = xpos - delta;
        
        main_car.active = true;
        main_car = cc.instantiate(this.decro_prfabs[2].sub_set[0]);
        this.car_parts.addChild(main_car);
        var main_car_com = main_car.getComponent("decorative_part");
        main_car_com.set_start_pos(xpos, ypos + 10);
        xpos = xpos - delta;
        
        main_car.active = true;
        var main_car = cc.instantiate(this.decro_prfabs[3].sub_set[0]);
        this.car_parts.addChild(main_car);
        var main_car_com = main_car.getComponent("decorative_part");
        main_car_com.set_start_pos(xpos, ypos);
        xpos = xpos - delta;
        
        main_car = cc.instantiate(this.decro_prfabs[4].sub_set[0]);
        this.car_parts.addChild(main_car);
        var main_car_com = main_car.getComponent("decorative_part");
        main_car_com.set_start_pos(xpos, ypos);
        xpos = xpos - delta;
        
        var main_car = cc.instantiate(this.decro_prfabs[11].sub_set[0]);
        this.car_parts.addChild(main_car);
        var main_car_com = main_car.getComponent("decorative_part");
        main_car_com.set_start_pos(xpos, ypos + 40);
        xpos = xpos - delta;
        
        main_car = cc.instantiate(this.decro_prfabs[12].sub_set[0]);
        this.car_parts.addChild(main_car);
        var main_car_com = main_car.getComponent("decorative_part");
        main_car_com.set_start_pos(xpos, ypos + 40);
        xpos = xpos - delta;
    }, 
    // end
    
    checkout_game: function() {
        this.play_sound("resources/sounds/end.mp3");
        var check_root = cc.find("UI_ROOT/check_out_root");
        check_root.active = true;
        this.game_start = false;
    },
    
    play_pass_level1: function() {
        var machine_man = this.main_car_part.getChildByName("machine_man");
        machine_man.active = true;
        var huo_sai = this.main_car_part.getChildByName("huosai");
        var huo_sai_com = huo_sai.getComponent(sp.Skeleton); 
        var up_down = this.main_car_part.getChildByName("up1").getComponent("up_and_down_move");        
        
        
        var m1 = cc.moveBy(1.5, 360, 0)
        var f1 = cc.callFunc(function(){
            for(var i = 0; i < 3; i ++) {
                this.hit_set[i][3].active = false;   
            }
            huo_sai.active = true;
            up_down.move_by(2, 190);
            
        }.bind(this), this)
        var m_up = cc.moveBy(2, 0, 190);
        var f2 = cc.callFunc(function(){
            huo_sai_com.clearTracks();
        }.bind(this), this);
        var m2 = cc.moveBy(1, 226, 0);
        var m3 = cc.moveBy(1, 304, -124);
        var m4 = cc.moveBy(1, 208, 0);
        
        var seq = cc.sequence([m1, f1, m_up, f2, m2, m3, m4]);
        machine_man.runAction(seq);
        
        this.call_latter(function() {
            var part = this.main_car_part.getChildByName("machine_star");
            part.active = true;
            var part_com = part.getComponent(cc.ParticleSystem);
            part_com.stopSystem();
            part_com.resetSystem();    
            this.play_kim_anim_with_right()
        }.bind(this), 7);
        return 9;
    },
    
    play_pass_level2: function() {
        var machine_man = this.front_car_part.getChildByName("machine_man");
        machine_man.active = true;
        machine_man.scaleX = -1;
        //
        var men1 = this.front_car_part.getChildByName("men1");
        var men2 = this.front_car_part.getChildByName("men2");
        // 622, -246
        var m1 = cc.moveTo(3, -4, -246);
        var m2 = cc.moveTo(1.5, -293, -94);
        var m3 = cc.moveTo(0.5, -388, -94);
        var func1 = cc.callFunc(function(){
            var up1 = this.front_car_part.getChildByName("up1").getComponent("up_and_down_move");
            up1.move_by(2, 260);
            this.hit_set[3][3].runAction(cc.rotateBy(2, 360));
            this.hit_set[4][3].runAction(cc.rotateBy(2, 360));
            machine_man.scaleX = 1;
        }.bind(this), this);
        var m4 = cc.moveTo(2, -388, 172);
        var func2 = cc.callFunc(function() {
            men1.runAction(cc.rotateBy(0.1, 90));
            men2.runAction(cc.rotateBy(0.1, -90));
            
            var yoffset = -266;
            this.hit_set[0][3].runAction(cc.moveBy(1, 0, yoffset));
            var com_left = this.hit_set[2][3].getChildByName("move_diandi").getComponent("evl_move");
            com_left.move_by(1, -yoffset);

            var com_right = this.hit_set[1][3].getChildByName("move_diandi").getComponent("evl_move");
            com_right.move_by(1, yoffset);
            
        }.bind(this), this);
        var m5 = cc.moveTo(0.5, -290, 172);
        var m6 = cc.moveTo(1.5, -1, 20);
        var m7 = cc.moveTo(3, 616, 20);
        var seq = cc.sequence([m1, m2, m3, func1, m4, func2, m5, m6, m7]);
        machine_man.runAction(seq);
        
        
        /*var func1 = cc.callFunc(function() {
            this.hit_set[0][3].runAction(cc.moveBy(1, 0, -100));
            var com_left = this.hit_set[2][3].getChildByName("move_diandi").getComponent("evl_move");
            com_left.move_by(1, -100);

            var com_right = this.hit_set[1][3].getChildByName("move_diandi").getComponent("evl_move");
            
            // com_right.add_by(174);
            // com_right.add_by(74);
            com_right.move_by(1, 100);
        }.bind(this), this);
        // 
        
        
        var f2 = cc.callFunc(function(){
            machine_man.runAction(cc.moveTo(2, -390, -94));
            var up1 = this.front_car_part.getChildByName("up1").getComponent("up_and_down_move");
            up1.move_by(2, -266);
            this.hit_set[3][3].runAction(cc.rotateBy(2, 360));
            this.hit_set[4][3].runAction(cc.rotateBy(2, 360));
            
            machine_man.scaleX = 1;
            
            // 滑轮掉
            var yoffset = -266;
            this.hit_set[0][3].runAction(cc.moveBy(1, 0, yoffset));
            var com_left = this.hit_set[2][3].getChildByName("move_diandi").getComponent("evl_move");
            com_left.move_by(1, yoffset);

            var com_right = this.hit_set[1][3].getChildByName("move_diandi").getComponent("evl_move");
            com_right.move_by(1, -yoffset);
            
            men1.runAction(cc.rotateBy(0.1, 90));
            men2.runAction(cc.rotateBy(0.1, -90));
            // end 
        }.bind(this), this);
        
        var m4 = cc.moveTo(0.5, -299, -94);
        var m5 = cc.moveTo(1, -6, -246);
        var m6 = cc.moveTo(2, 625, -246);
        */
        
        this.call_latter(function() {
            var part = this.front_car_part.getChildByName("machine_star");
            part.active = true;
            var part_com = part.getComponent(cc.ParticleSystem);
            part_com.stopSystem();
            part_com.resetSystem();    
            this.play_kim_anim_with_right()
        }.bind(this), 12);
        return 13;
    },
    
    play_pass_level3: function() {
       var machine_man = this.back_car_part.getChildByName("machine_man");
        machine_man.active = true;
        
        var huo_sai = this.back_car_part.getChildByName("huosai2");
        var huo_sai_com = huo_sai.getComponent(sp.Skeleton); 
        var up_down = this.back_car_part.getChildByName("up1").getComponent("up_and_down_move"); 
        var men1 = this.back_car_part.getChildByName("men1");
        var men2 = this.back_car_part.getChildByName("men2");
        // walk man
        var m2 = cc.moveTo(1, -517, 158);
        var m3 = cc.moveTo(1, -397, 272);
        var m4 = cc.moveTo(1, -248, 272);
        var m5 = cc.moveTo(1, -133, 160);
        
        var func1 = cc.callFunc(function(){
            
            var com_left = this.hit_set[5][3].getChildByName("move_diandi").getComponent("evl_move");
            com_left.move_by(1, -157);
            
            var com_right = this.hit_set[4][3].getChildByName("move_diandi").getComponent("evl_move");
            com_right.move_by(1, 157);
            
            this.hit_set[0][3].runAction(cc.moveBy(1, 0, -157));
            
        }.bind(this), this);
        
        var func0 = cc.callFunc(function(){
            men1.runAction(cc.rotateBy(0.1, 90));
            men2.runAction(cc.rotateBy(0.1, -90));
            var seq = cc.sequence([cc.moveBy(0.5, 0, -207), func1]);
            this.hit_set[0][3].runAction(seq);
        }.bind(this), this);
        
        
        
        var m6 = cc.moveTo(0.4, -95, 160);
        var m7 = cc.moveTo(1.5, 139, 47);
        var m8 = cc.moveTo(1.5, 450, 47); // 活塞摇动下来
        var func3 = cc.callFunc(function(){
            var move_time = 2;
            var down2_com = this.back_car_part.getChildByName("up1").getComponent("up_and_down_move");
            down2_com.move_by(move_time, -122);
            huo_sai_com.setAnimation(0, "animation", true);
            machine_man.scaleX = -1;
            
        }.bind(this), this);
        var m9 = cc.moveTo(2, 450, -75);
        var func4 = cc.callFunc(function() {
            huo_sai_com.clearTracks();
        }.bind(this), this);
        var m10 = cc.moveTo(1, 357, -75);
        var m11 = cc.moveTo(1, 240, -181);
        var m12 = cc.moveTo(1, 116, -182);
        var m13 = cc.moveTo(1.5, -103, -91);
        var m14 = cc.moveTo(2, -551, -91);
        
        var seq = cc.sequence([m2, m3, m4, m5, func0, m6, m7, m8, func3, m9, func4, m10, m11, m12, m13, m14]);
        machine_man.runAction(seq);
        // end        
        
        this.call_latter(function() {
            var part = this.back_car_part.getChildByName("machine_star");
            part.active = true;
            var part_com = part.getComponent(cc.ParticleSystem);
            part_com.stopSystem();
            part_com.resetSystem();    
            this.play_kim_anim_with_right()
        }.bind(this), 16);
 
        
        return 17;
    },
    
    play_pass_anim: function() {
        var next_part_time = 2;
        if (this.game_mode === 1)  {
            next_part_time = this.play_pass_level1();   
            return next_part_time;
        }
        else if (this.game_mode === 2) {
            next_part_time = this.play_pass_level2();   
            return next_part_time;
        }
        else if(this.game_mode === 3) {
            // var machine_man = this.back_car_part.getChildByName("machine_man");
            next_part_time = this.play_pass_level3();
            return next_part_time;
        }
        return next_part_time;
    }, 
    
    on_next_game_mode: function() {
        this.tip_type_root.removeAllChildren();
        for(var index = 0; index < this.hit_set.length; index ++) {
            // [main_type, sub_type, w_pos, now_object];
            // var main_type = this.hit_set[index][0];
            // var sub_type = this.hit_set[index][1];
            var now_obj = this.hit_set[index][3];
            // now_obj.active = true;
            var com = now_obj.getComponent("decorative_part");
            com.invalid_hit_move();
        }
        
        this.call_latter(function(){
            var next_part_time = this.play_pass_anim();
            this.play_sound("resources/sounds/move_parts.mp3");
            
            
            if(this.game_mode >= 3) { // 最后一关,播放结算画面,重新开始
                this.call_latter(function(){
                    this.checkout_game();
                }.bind(this), next_part_time);
                return;
            }
            
            this.call_latter(function(){
                this.game_mode ++;
                if(this.game_mode == 2) { // 进入车头模式
                    this.enter_car_front_mode();
                }
                else if(this.game_mode == 3) { // 进入车尾巴模式
                    this.enter_car_back_mode();
                }    
            }.bind(this), next_part_time);
            
        }.bind(this), 0.4);
        
        
    },
    
    on_replay_game: function() {
        var check_root = cc.find("UI_ROOT/check_out_root");
        check_root.active = false;
        this.on_start_game();
    }, 
    
    on_kim_click: function() {
        if(this.lock_kim_click === true) {
            return;
        }
        this.play_kim_click_anim_with_random();
    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    
    // },
});
