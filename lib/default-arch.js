var INHERIT = require('inherit'),
    n = require('./index').nodes,
    Node = n.Node,
    createBundlesLevelNode = n.createBundlesLevelNode,
    LibraryNode = n.LibraryNode;

exports.Arch = INHERIT({
    __constructor: function(arch) {
        this.arch = arch;
    },

    alterArch: function() {
        var common = this.createCommonNodes(),
            libs = this.createBlockLibrariesNodes(common);
        this.createBundlesLevelsNodes(common, libs);

        return this.arch;
    },

    createCommonNodes: function() {

        return this.arch.setNode(
            new Node('build'),
            this.arch.setNode(new Node('all')));
    },

    createBlockLibrariesNodes: function(parent) {
        return [
            this.arch.setNode(new LibraryNode('bem-bl', 'git://github.com/bem/bem-bl.git'), parent)
        ];
    },

    createBundlesLevelsNodes: function(parent, children) {
        return [
            this.arch.setNode(createBundlesLevelNode('pages'), parent, children)
        ];
    }
});