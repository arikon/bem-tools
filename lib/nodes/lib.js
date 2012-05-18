var Q = require('q'),
    QFS = require('q-fs'),
    INHERIT = require('inherit'),
    CP = require('child_process'),
    PATH = require('path'),
    UTIL = require('util'),

    Node = require('./node').Node;

var LibraryNode = exports.LibraryNode = INHERIT(Node, {

    __constructor: function(dest, repo, paths, treeish) {
        this.dest = dest;
        this.repo = repo;
        this.treeish = treeish || 'master';
        this.paths = paths || [''];

        // FIXME: path relative to the project root must be passed
        this.__base(PATH.basename(this.dest));
    },

    getInitialCheckoutCmd: function() {},

    getUpdateCmd: function() {},

    isValid: function() {
        return this.lastRunTime && (Date.now() - this.lastRunTime <= 60000);
    },

    make: function() {
        var _this = this;

        return Q.all(this.paths.map(function(p) {
            var dest = PATH.join(_this.dest, p),
                repo = _this.repo + p;

            return QFS.exists(dest)
                .then(function(exists){
                    var cmd = exists? _this.getUpdateCmd(repo, dest) : _this.getInitialCheckoutCmd(repo, dest),
                        d = Q.defer();

                    _this.log(cmd);

                    CP.exec(cmd, function(err, stdout, stderr) {
                        stdout && _this.log(stdout);
                        stderr && _this.log(stderr);

                        if (err) return d.reject(err);

                        _this.lastRunTime = Date.now();
                        d.resolve();
                    });

                    return d.promise;
                });
        }));
    }
});

exports.GitLibraryNode = INHERIT(LibraryNode, {

    getInitialCheckoutCmd: function(repo, dest) {
        return UTIL.format('git clone --progress %s %s && cd %s && git checkout %s', repo, dest, dest, this.treeish);
    },

    getUpdateCmd: function(repo, dest) {
        return UTIL.format('cd %s && git checkout HEAD~ && git branch -D %s ; git fetch origin && git checkout --track -b %s origin/%s', dest, this.treeish, this.treeish, this.treeish);
    }

});

exports.SvnLibraryNode = INHERIT(LibraryNode, {

    getInitialCheckoutCmd: function(repo, dest) {
        return UTIL.format('svn co -r %s %s %s', this.treeish, repo, dest);
    },

    getUpdateCmd: function(repo, dest) {
        return UTIL.format('svn up -r %s %s', this.treeish, dest);
    }

});
