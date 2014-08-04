/**
 * @file checker 针对 CSS 文件的校验器
 * @author chris[wfsr@foxmail.com]
 */

var edp     = require('edp-core');
var csslint = require('csslint').CSSLint;
var util    = require('../util');

/**
 * 校验器分类
 * 
 * @type {string}
 */
exports.type = 'style';

/**
 * 校验器接受的文件扩展名数组
 * 
 * @type {Array}
 */
exports.extensions = ['css'];

/**
 * 默认配置项
 * 
 * @type {Object}
 */
var defaultConfig = csslint.getRuleset();

/**
 * 校验文件
 * 
 * @param {Object} file 包含 path 和 content 键的对象
 * @param {Array} errors 本分类的错误信息数组
 * @param {Function} done 校验完成的通知回调
 */
exports.check = function (file, errors, done) {
    if (util.isIgnored(file.path, '.csslintignore')) {
        done();
        return;
    }

    // ../lib/css/config只包含了edp的一些和默认参数不同的参数设置
    // 所以，需要获取csslint的默认规则参数，然后和edp的设置混合起来
    edp.util.extend(defaultConfig, require('./config'));

    var csslintConfig = util.getConfig('.csslintrc', file.path, defaultConfig);

    var success = csslint.verify(file.content, csslintConfig);
    if (success
        && success.messages
        && success.messages.length > 0) {
        errors.push({
            path: file.path,
            messages: success.messages
        });
    }
    done();

};
