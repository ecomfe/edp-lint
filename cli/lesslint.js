/**
 * @file LESS 检测模块
 * @author chris[wfsr@foxmail.com]
 */


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
cli.description = '使用recess检测当前目录下所有LESS文件。';

/**
 * 模块命令行运行入口
 *
 * @param {Array.<string>} args
 * @param {Object} opts
 */
cli.main = function (args, opts) {
    var patterns = [
        '**/*.less',
        '!**/{output,test,node_modules,asset,dist,release,doc,dep,report}/**'
    ];

    var candidates = require('../lib/util').getCandidates(args, patterns);

    if (candidates.length) {
        var lint = require('../lib/lint');
        lint.check(candidates, [require('../lib/less/checker')]);
    }
};

/**
 * 命令行配置项
 *
 * @type {Object}
 */
exports.cli = cli;
