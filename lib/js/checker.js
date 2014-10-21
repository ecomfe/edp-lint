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
 * jscs默认配置项
 *
 * @type {Object}
 */
var kDefaultJSCSConfig = require('./jscsrc.json');

/**
 * jshint默认配置项
 *
 * @type {Object}
 */
var kDefaultJSHINTConfig = require('./config');

/**
 * 使用 jshint 的校验任务
 *
 * @inner
 * @param {Object} file 包含 path 与 content 为键的对象
 * @param {Object} options 命令行配置参数对象
 * @return {Function} 校验任务
 */
function jshintTask(file, options) {
    return function(callback) {
        // jshintConfig是跟每个文件相关的
        var jshintConfig = options.lookup
            ? util.getConfig('.jshintrc', file.path, kDefaultJSHINTConfig)
            : kDefaultJSHINTConfig;

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
 * @param {Object} config jscs的配置信息.
 * @return {Function} 校验任务
 */
function jscsTask(file, config) {
    return function(callback) {
        var checker = new Checker();
        checker.registerDefaultRules();

        // 屏蔽暂不支持的配置项报错
        try {
            // config是项目相关的，不是每个文件相关的
            checker.configure(config || {});
        }
        catch(e) {
        }

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
 * 获取项目里面.jscsrc的配置信息.
 * @return {?Object}
 */
function getProjectJSCSConfig() {
    var filename = '.jscsrc';
    var bizConfig = null;
    var bizConfigPath = process.cwd();
    if (!fs.existsSync(path.join(bizConfigPath, filename))) {
        // 首先看看当前目录下面是否存在.jscsrc，如果存在的话，就用了
        // 如果不存在的话，去定位一下bizRoot，如果bizRoot下面存在
        // 也就用了
        try {
            bizConfigPath = edp.path.getRootDirectory();
            if (!fs.existsSync(path.join(bizConfigPath, filename))) {
                bizConfigPath = null;
            }
        }
        catch (ex) {
            bizConfigPath = null;
        }
    }

    if (bizConfigPath) {
        bizConfig = JSON.parse(
            fs.readFileSync(
                path.join(bizConfigPath, filename),
                'utf-8'
            )
        );
    }

    return bizConfig;
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
 * @param {Object} options 命令行配置参数对象
 * @param {Function} done 校验完成的通知回调
 */
exports.check = function (file, errors, options, done) {
    if (util.isIgnored(file.path)) {
        done();
        return;
    }

    var bizConfig = getProjectJSCSConfig();
    var config = options.lookup
        ? edp.util.extend(kDefaultJSCSConfig, bizConfig)
        : kDefaultJSCSConfig;

    var tasks = [
        jshintTask(file, options),
        jscsTask(file, config)
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
