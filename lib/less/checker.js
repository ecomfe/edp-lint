/**
 * @file checker 针对 LESS 文件的校验器
 * @author chris[wfsr@foxmail.com]
 */

var recess = require('recess');
var edp    = require('edp-core');
var util   = require('../util');

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
exports.extensions = ['less'];

/**
 * 从校验结果对象中解释出所需的错误信息
 * 
 * @param {Array.<Object>} obj recess 校验结果对象
 * @return {Array.<Object>} 错误信息列表
 */
function parseError(obj) {
    var messages = [];

    obj[0].definitions.forEach(function (def) {

        def.errors && def.errors.forEach(function (err) {

            messages.push({
                line: err.line,
                col: 'N/A',   // LESS 通常按行报错，列信息基本没用
                message: err.message + '\n' + err.extract
            });

        });

    });

    return messages;
}

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
 * @param {Function} done 校验完成的通知回调
 */
exports.check = function (file, errors, done) {
    if (util.isIgnored(file.path, '.recessignore')) {
        done();
        return;
    }

    var recessConfig = util.getConfig('.recessrc', file.path, defaultConfig);
    
    // 精简模式的报表
    recessConfig.format = 'compact';

    recess(file.path, recessConfig, function (err, obj) {
        if (err && err[0]) {
            err = err[0];
            errors.push({
                path: file.path,
                messages: [
                    {
                        line: err.line,
                        col: err.column,
                        message: err.message + err.extract.join('\n')
                    }
                ]
            });
            return done();
        }

        var messages = parseError(obj);

        messages.length && errors.push({
            path: file.path,
            messages: messages
        });
        done();
    });
};
