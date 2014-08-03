/**
 * @file lint 校验统筹管理
 * @author chris[wfsr@foxmail.com]
 */

var fs       = require('fs');
var path     = require('path');
var edp      = require('edp-core');

var reporter = require('./reporter');

/**
 * 校验结果报告
 * 
 * @inner
 * @param {Object} errors 按文件类型为 key，值为对应的校验错误信息列表的对象
 */
function report(errors) {
    var t12 = true;

    for (var type in errors) {
        if (errors.hasOwnProperty(type) && errors[type].length) {
            reporter.report(errors[type]);
            t12 = false;
        }
    }

    if (t12) {
        edp.log.info('Congratulations! Everything gone well, you are T12!');
    }
}

/**
 * 开始校验
 * 
 * @param {Array.<string>} candidates 候选校验文件集合
 * @param {Array} checkers 本次使用的校验器列表
 */
exports.check = function (candidates, checkers) {
    var errors = {};
    checkers.forEach(function (checker) {
        errors[checker.type] = [];
    });

    var count = candidates.length;

    /**
     * 每个文件的校验结果回调，主要用于统计校验完成情况
     * 
     * @inner
     */
    function callback() {
        count--;
        if (!count) {
            report(errors);
        }
    }

    /**
     * 处理每个文件的校验
     * 
     * @inner
     * @param {string} candidate 候选校验文件路径
     */
    function deal(candidate) {
        var file = {
            content: fs.readFileSync(candidate, 'utf-8'),
            path: candidate
        };

        checkers.forEach(function (checker) {
            var extname = path.extname(candidate).slice(1);
            if (~checker.extensions.indexOf(extname)) {
                checker.check(file, errors[checker.type], callback);
            }
        });
    }

    candidates.forEach(deal);
};
