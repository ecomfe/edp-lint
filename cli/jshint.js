/**
 * @file Javascript检测模块
 * @author errorrik[errorrik@gmail.com]
 */
var edp = require('edp-core');
var fs = require('fs');
var path = require('path');
var async = require('async');

var util = require('../lib/util');
var Checker = require('jscs/lib/checker');

/**
 * jscs的默认配置
 * @type {Object}
 */
var kConfig = null;

function jshintTask(item) {
    return function(callback) {
        var defaultConfig = require('../lib/js/config');
        var jshintConfig = util.getConfig('.jshintrc', item, defaultConfig);

        var jshint = require('edp-jshint').JSHINT;
        var source = fs.readFileSync(item, 'utf-8');
        var success = jshint(source, jshintConfig);
        if (success) {
            callback(null, []);
        }
        else {
            var errors = [];
            jshint.errors.forEach(function(error) {
                if (!error) {
                    return;
                }
                errors.push([
                    item,
                    require('util').format(
                        '→ line %s, col %s: %s',
                        error.line, error.character, error.reason
                    )
                ]);
            });
            callback(null, errors);
        }
    };
}

function jscsTask(item) {
    return function(callback) {
        var checker = new Checker();
        checker.registerDefaultRules();
        checker.configure(kConfig || {});

        checker.checkPath(item).then(function(results) {
            var errors = [];

            var errorList = results[0]._errorList || [];
            errorList.forEach(function(line) {
                errors.push([
                    item,
                    require('util').format(
                        '→ line %s, col %s: %s',
                        line.line, line.column, line.message
                    )
                ]);
            });
            callback(null, errors);
        });
    };
}

/**
 * @param {string} item 需要检查的文件.
 * @param {function} callback 检查完毕之后的回调函数.
 */
function detectSingleFile(item, callback) {
    if (util.isIgnored(item)) {
        callback(false);
        return;
    }

    var tasks = [
        jshintTask(item),
        jscsTask(item)
    ];
    async.series(tasks, function(error, results) {
        var a = results[0];
        var b = results[1];
        if (a.length + b.length) {
            var c = a.concat(b);
            edp.log.info(c[0][0]);
            c.forEach(function(line) {
                edp.log.warn(line[1]);
            });
            console.log();
            callback(true);
        }
        else {
            callback(false);
        }
    });
}

/**
 * @param {Array.<string>} candidates 所有需要检查的文件.
 */
function detect(candidates) {
    async.filterSeries(candidates, detectSingleFile, function(invalidFiles) {
        if (!invalidFiles.length) {
            edp.log.info('All is well :-)');
        }
        else {
            process.exit(1);
        }
    });
}

/**
 * 命令行配置项
 *
 * @inner
 * @type {Object}
 */
var cli = {};

/**
 * 命令描述信息
 *
 * @type {string}
 */
cli.description = '使用jshint检测当前目录下所有Javascript文件。';

/**
 * 模块命令行运行入口
 *
 * @param {Array.<string>} args
 */
cli.main = function(args) {
    var patterns = [
        '**/*.js', '!**/output/**',
        '!**/test/**', '!**/node_modules/**',
        '!**/dep/**', '!**/example/**', '!**/doc/**'
    ];

    var candidates = util.getCandidates(
        args, patterns);

    if (candidates.length) {
        var defaultConfig = JSON.parse(
            fs.readFileSync(
                path.join(__dirname, '..', 'lib', 'js', '.jscsrc'),
                'utf-8'
            )
        );

        // process.cwd()一般来说都是项目的目录
        // 这里可以使用项目目录里面的配置覆盖默认的配置
        var bizConfig = null;
        if (fs.existsSync(path.join(process.cwd(), '.jscsrc'))) {
            bizConfig = JSON.parse(
                fs.readFileSync(
                    path.join(process.cwd(), '.jscsrc'),
                    'utf-8'
                )
            );
        }
        kConfig = edp.util.extend(defaultConfig, bizConfig);
        detect(candidates);
    }
};

/**
 * 命令行配置项
 *
 * @type {Object}
 */
exports.cli = cli;
