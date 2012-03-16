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

    libraries: [
        {
            name: 'bem-bl',
            type: 'git',
            url: 'git://github.com/bem/bem-bl.git',
            treeish: 'master'
        }
    ],

    alterArch: function() {
        var d = Q.defer(),
            _this = this;

        Q.when(_this.createCommonNodes(),
            function(common) {
                Q.when(_this.createBlockLibrariesNodes(common),
                    function(libs) {
                        _this.createBundlesLevelsNodes(common, libs).then(function(res) {
                            d.resolve(_this.arch);
                        });
                    }
                )
            });

        return d.promise;
    },

    createCommonNodes: function() {
        return this.arch.setNode(
            new Node('build'),
            this.arch.setNode(new Node('all')));
    },

    createBlockLibrariesNodes: function(parent) {
        var _this = this;

        return this.libraries.map(function(lib) {
            return _this.arch.setNode(
                new LibraryNode(
                    _this.absolutePath(lib.name),
                    lib.url,
                    lib.treeish),
                parent)
        });
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
            .invoke('filter', function(dir) {
                return dir.match(_this.bundlesLevelsRegexp);
            });
    },

    absolutePath: function(path) {
        return PATH.join(this.root, path);
    }
});
