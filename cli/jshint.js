/**
 * @file Javascript检测模块
 * @author errorrik[errorrik@gmail.com]
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
cli.description = '使用jshint检测当前目录下所有JavaScript文件。';

/**
 * 命令选项信息
 *
 * @type {Array}
 */
cli.options = [
    'lookup:'
];

/**
 * 模块命令行运行入口
 *
 * @param {Array.<string>} args 命令行参数列表
 * @param {Object} opts 命令行配置项对象
 */
cli.main = function (args, opts) {
    var fecs = require('fecs');
    var options = fecs.getOptions(process.argv.slice(3));
    options.command = 'check';
    options.type = 'js';
    if (!options._.length) {
        options._.push('./');
    }

    options._.push('!**/{output,test,node_modules,asset,dist,release,doc,dep}/**');

    fecs.check(options);
};

/**
 * 命令行配置项
 *
 * @type {Object}
 */
exports.cli = cli;
