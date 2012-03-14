var n = require('bem').nodes,
    INHERIT = require('inherit'),
    Node = n.Node,
    createBundlesLevelNode = n.createBundlesLevelNode,
    LibraryNode = n.LibraryNode;

exports.Arch = INHERIT({
    __constructor: function(){
    },

    getArch: function() {
        var all = this.setNode(new Node('all')),
            build = this.setNode(new Node('build'), all),
            libs = createBlockLibrariesNodes(this, build);
        createBundlesLevelsNodes(this, build, libs);
    }
});

function createBlockLibrariesNodes(arch, parent) {
    return [
        arch.setNode(new LibraryNode('bem-bl', 'git://github.com/bem/bem-bl.git'), parent)
    ];
}

function createBundlesLevelsNodes(arch, parent, children) {
    return [
        arch.setNode(createBundlesLevelNode('pages'), parent, children)
    ];
}
