var fs = require('fs');
var path = require('path');

var patterns = [
    '**/*.css',
    '!**/{output,test,node_modules,asset,dist,release,doc,dep}/**'
];

var cssChecker = require('../../lib/css/checker');

exports = module.exports = function (app) {
    app.post('/edp-lint/css', function (request, response) {
        var cwd = request.body.cwd;
        var candidates = require('edp-core').glob.sync(patterns, {cwd: cwd});

        var msgs = [];
        var len = candidates.length;
        var i = -1;

        var file;
        next();

        function next() {
            i++;

            if (i >= len) {
                done();
                return;
            }

            var candidate = path.resolve(cwd, candidates[i]);
            file = {
                path: candidate,
                content: fs.readFileSync(candidate, 'UTF-8')
            };

            // checker 健壮性不行啊，完全没做容错
            cssChecker.check(file, msgs, {}, next);
        }

        function done() {
            msgs.forEach(function (msg) {
                msg.code = fs.readFileSync(msg.path, 'UTF-8');
            });
            response.setHeader('Content-Type', 'text/javascript; charset=UTF-8');
            response.end(JSON.stringify(msgs));
        }
    });
};