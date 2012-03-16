var INHERIT = require('inherit'),
    PATH = require('./path'),
    util = require('./util'),
    Q = require('q'),
    n = require('./index').nodes,
    Node = n.Node,
    createBundlesLevelNode = n.createBundlesLevelNode,
    LibraryNode = n.LibraryNode;

exports.Arch = INHERIT({
    __constructor: function(arch, root) {
        this.arch = arch;
        this.root = root;
    },

    bundlesLevelsRegexp: /^(pages.*|bundles.*)/i,

    alterArch: function() {
        var d = Q.defer(),
            _this = this;

        Q.when(_this.createCommonNodes(),
            function(common) {
                Q.when(_this.createBlockLibrariesNodes(common),
                    function(libs) {
                        Q.when(_this.createBundlesLevelsNodes(common, libs),
                            function(res) {
                                d.resolve(_this.arch);
                            })
                    }
                )
            });

        return d.promise;
    },

    createCommonNodes: function() {
        var d = Q.defer();
        Q.when(this.arch.setNode(
            new Node('build'), this.arch.setNode(new Node('all'))),
            function(res) {
                d.resolve(res);
            });

        return d.promise;
    },

    createBlockLibrariesNodes: function(parent) {
        return [
            this.arch.setNode(
                new LibraryNode(this.absolutePath('bem-bl'), 'git://github.com/bem/bem-bl.git'),
                parent)
        ];
    },

    createBundlesLevelsNodes: function(parent, children) {
        var _this = this;

        return this.getBundlesLevels().then(function(levels) {
            return levels.map(function(level) {
                return _this.arch.setNode(createBundlesLevelNode(_this.absolutePath(level)), parent, children);
            });
        });
    },

    getBundlesLevels: function() {
        var _this = this;
        return util.getDirsAsync(this.root)
            .then(function(dirs) {
                return dirs.filter(function(dir) {
                    return dir.match(_this.bundlesLevelsRegexp);
                });
            });
    },

    absolutePath: function(path) {
        return PATH.join(this.root, path);
    }
})
;