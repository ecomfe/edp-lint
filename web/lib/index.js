/**
 * @file  代码检查专属后端模块
 * @author chris[wfsr@foxmail.com]
 * @author errorrik[errorrik@gmail.com]
 */

var fs = require('fs');

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

        options._ = ['./'];
        process.chdir(cwd);

        function done(success, json) {
            response.setHeader('Content-Type', 'text/javascript; charset=UTF-8');
            response.end(JSON.stringify(json));
        }

        /* eslint-disable no-console */
        console.log = function () {};

        fecs.check(options, done);
    });

    app.post('/edp-lint/read', function (request, response) {
        var filepath = request.body.path;

        response.setHeader('Content-Type', 'text/plain; charset=UTF-8');
        response.end(fs.readFileSync(filepath));
    });
};
