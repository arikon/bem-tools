var INHERIT = require('inherit'),
    PATH = require('path'),
    createLevel = require('../level').createLevel,

    MagicNode = require('./magic').MagicNode,
    FileNode = require('./file').FileNode,
    BundleNode = require('./bundle').BundleNode,
    BlockNode = require('./block').BlockNode

var LevelNode = exports.LevelNode = INHERIT(MagicNode, {

    __constructor: function(level) {
        this.level = typeof level == 'string'? createLevel(level) : level;
        // TODO: path relative to the project root must be passed
        this.__base(PATH.basename(this.level.dir));
    },

    itemNodeClass: BlockNode,

    make: function(ctx) {
        if (ctx.arch.hasNode(this.path)) return;

        ctx.arch.withLock(function() {

            // create real node for level
            var parents = ctx.arch.parents[this.getId()],
                levelNode = ctx.arch.setNode(new FileNode(this.path), parents),

                // scan level for items
                decl = this.level.getDeclByIntrospection();

            // generate targets for items
            var _this = this;
            decl.forEach(function(block) {
                var itemNode = ctx.arch.setNode(_this.itemNodeClass.createInstance(_this.level, block.name), levelNode);

                // generate targets for subitems
                if (block.elems) block.elems.forEach(function(elem) {
                    ctx.arch.setNode(_this.itemNodeClass.createInstance(_this.level, block.name, elem.name), itemNode);
                });
            });

        }, this);
    }
});

exports.LevelNode.createInstance = function(level) {
    var nodeClass = LevelNode,
        level = typeof level == 'string'? createLevel(level) : level,
        makePath = PATH.join(level.bemDir, 'make.js');

    if (PATH.existsSync(makePath)) nodeClass = INHERIT(nodeClass, require(makePath));

    return new nodeClass(level);

};


var BundlesLevelNode = exports.BundlesLevelNode = INHERIT(LevelNode, {

    itemNodeClass: BundleNode


    //    make: function(ctx) {
    //        if (ctx.arch.hasNode(this.path)) return;
    //
    //        ctx.arch.withLock(function() {
    //
    //            // create real node for pages level
    //            var parents = ctx.arch.parents[this.getId()],
    //                pageLevelNode = ctx.arch.setNode(new FileNode(this.path), parents),
    //
    //                // scan level for pages
    //                decl = this.level.getDeclByIntrospection();
    //
    //            // generate targets for pages
    //            var _this = this;
    //            decl.forEach(function(block) {
    //                var pageNode = ctx.arch.setNode(createBundleNode(_this.level, block.name), pageLevelNode);
    //
    //                // generate targets for subpages
    //                if (block.elems) block.elems.forEach(function(elem) {
    //                    ctx.arch.setNode(createBundleNode(_this.level, block.name, elem.name), pageNode);
    //                });
    //            });
    //
    //        }, this);
    //    }
});

exports.BundlesLevelNode.createInstance = function(level) {
    var nodeClass = BundlesLevelNode,
        level = typeof level == 'string'? createLevel(level) : level,
        makePath = PATH.join(level.bemDir, 'make.js');

    if (PATH.existsSync(makePath)) nodeClass = INHERIT(nodeClass, require(makePath));

    return new nodeClass(level);

};