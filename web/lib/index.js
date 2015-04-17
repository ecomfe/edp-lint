var fs = require('fs');
var path = require('path');

var fecs = require('fecs');

exports = module.exports = function (app) {
    app.post('/edp-lint/check', function (request, response) {
        var form = request.body;
        var cwd = form.cwd;

        var options = {
            color: false,
            stream: false,
            type: form.type,
            ignore: form.ignore,
            reporter: form.reporter
        };
        options.code = true;
        options._ = ['./'];
        process.chdir(cwd);
        console.log = function () {};
        fecs.check(options, done);

        function done(success, json) {
            response.setHeader('Content-Type', 'text/javascript; charset=UTF-8');
            response.end(JSON.stringify(json));
        }
    });
};
