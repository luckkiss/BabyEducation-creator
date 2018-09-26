"use strict";
cc._RFpush(module, 'e26e2QowXVCa6/oiGiwUDyk', 'random_ske');
// scripts\random_ske.js

cc.Class({
    "extends": cc.Component,

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
        anim_name: {
            "default": "",
            type: String
        },

        click_anim: {
            "default": "",
            type: String
        },
        click_anim_time: 0.5
    },

    // use this for initialization
    onLoad: function onLoad() {},

    call_latter: function call_latter(callfunc, delay) {
        var delay_action = cc.delayTime(delay);
        var call_action = cc.callFunc(callfunc, this);
        var seq = cc.sequence([delay_action, call_action]);
        this.node.runAction(seq);
    },

    start: function start() {
        this.ske_com = this.node.getComponent(sp.Skeleton);

        var time = 0.1 + Math.random() * 0.5;
        this.call_latter((function () {
            this.ske_com.clearTracks();
            this.ske_com.setAnimation(0, this.anim_name, true);
        }).bind(this), time);
    },

    on_flow_click: function on_flow_click() {
        this.ske_com.clearTracks();
        this.ske_com.setAnimation(0, this.click_anim, false);
        this.call_latter((function () {
            this.ske_com.clearTracks();
            this.ske_com.setAnimation(0, this.anim_name, true);
        }).bind(this), this.click_anim_time);
    }
});
// called every frame, uncomment this function to activate update callback
// update: function (dt) {

// },

cc._RFpop();