/**
 * @file checker 针对 HTML 文件的校验器
 * @author chris[wfsr@foxmail.com]
 */

var edp      = require('edp-core');
var htmlhint = require('./htmlhint');
var util     = require('../util');

/**
 * 校验器分类
 *
 * @type {string}
 */
exports.type = 'html';

/**
 * 校验器接受的文件扩展名数组
 *
 * @type {Array}
 */
exports.extensions = ['html', 'htm'];

/**
 * 默认配置项
 *
 * @type {Object}
 */
var defaultConfig = require('./config');

/**
 * 校验文件
 *
 * @param {Object} file 包含 path 和 content 键的对象
 * @param {Array} errors 本分类的错误信息数组
 * @param {Object} options 命令行配置参数对象
 * @param {Function} done 校验完成的通知回调
 */
exports.check = function (file, errors, options, done) {
    if (util.isIgnored(file.path, '.htmlhintignore')) {
        done();
        return;
    }

    var htmlhintConfig = options.lookup
        ? util.getConfig('.htmlhintrc', file.path, defaultConfig)
        : defaultConfig;

    var success = htmlhint.lint(file.content, defaultConfig);
    if (success
        && success.length > 0) {
        errors.push({
            path: file.path,
            messages: success
        });
    }
    done();
};
