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
    },

    // use this for initialization
    onLoad: function () {
        var f = cc.repeatForever(cc.rotateBy(1, 360));
        this.node.runAction(f);
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
