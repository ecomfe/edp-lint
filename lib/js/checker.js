/**
 * @file checker 针对 JS 文件的校验器
 * @author chris[wfsr@foxmail.com]
 */

var fs      = require('fs');
var path    = require('path');
var async   = require('async');
var edp     = require('edp-core');
var Checker = require('jscs/lib/checker');

var util    = require('../util');

/**
 * 默认配置项
 * 
 * @type {Object}
 */
var defaultConfig = JSON.parse(
    fs.readFileSync(
        path.join(__dirname, '.jscsrc'),
        'utf-8'
    )
);

/**
 * jscs 的默认配置
 * @type {Object}
 */
var kConfig = null;

/**
 * 使用 jshint 的校验任务
 * 
 * @inner
 * @param {Object} file 包含 path 与 content 为键的对象
 * @return {Function} 校验任务
 */
function jshintTask(file) {
    return function(callback) {
        var defaultConfig = require('./config');
        var jshintConfig = util.getConfig('.jshintrc', file.path, defaultConfig);

        var jshint = require('edp-jshint').JSHINT;
        var success = jshint(file.content, jshintConfig);
        if (success) {
            callback(null, []);
        }
        else {
            var errors = [];
            jshint.errors.forEach(function(error) {
                if (!error) {
                    return;
                }
                errors.push({
                    line: error.line,
                    col: error.character,
                    message: error.reason
                });
            });
            callback(null, errors);
        }
    };
}

/**
 * 使用 jscs 的校验任务
 * 
 * @inner
 * @param {Object} file 包含 path 与 content 为键的对象
 * @return {Function} 校验任务
 */
function jscsTask(file) {
    return function(callback) {
        var checker = new Checker();
        checker.registerDefaultRules();
        checker.configure(kConfig || {});

        checker.checkPath(file.path)
            .then(function(results) {
                var errors = [];
                var errorList = results && results[0] && results[0]._errorList || [];

                errorList.forEach(function(line) {
                    errors.push({
                        line: line.line,
                        col: line.column,
                        message: line.message
                    });
                });
                callback(null, errors);
            })
            .fail(function (err) {
                edp.log.warn(err);
                callback(null, []);
            });
    };
}

/**
 * 校验器分类
 * 
 * @type {string}
 */
exports.type = 'script';

/**
 * 校验器接受的文件扩展名数组
 * 
 * @type {Array}
 */
exports.extensions = ['js'];

/**
 * 校验文件
 * 
 * @param {Object} file 包含 path 和 content 键的对象
 * @param {Array} errors 本分类的错误信息数组
 * @param {Function} done 校验完成的通知回调
 */
exports.check = function (file, errors, done) {
    if (util.isIgnored(file.path)) {
        done();
        return;
    }

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

    var tasks = [
        jshintTask(file),
        jscsTask(file)
    ];
    async.series(tasks, function(error, results) {
        var a = results[0];
        var b = results[1];
        if (a.length + b.length) {
            errors.push({
                path: file.path,
                messages: a.concat(b)
            });
        }
        done();
    });
};
