/**
 * @file  工具方法
 * @author chris<wfsr@foxmail.com>
 **/


/**
 * 获取当前运行的主命令名
 *
 * @return {string} 根据 process.args 第二个参数获取到的文件名
 */
exports.getCommandName = function () {
    return process.argv[1].replace(/^.*\/([^\/]+)$/, '$1');
};

/**
 * fecs check 的适配器
 *
 * @param {string} type 要检查的文件类型
 */
exports.fecsAdapter = function (type) {
    var fecs = require('fecs');
    var options = fecs.getOptions(process.argv.slice(3));
    options.command = 'check';
    options.type = type || 'css,js,html,less';
    if (!options._.length) {
        options._.push('./');
    }

    options._.push('!**/{output,test,node_modules,asset,dist,release,doc,dep}/**');

    fecs.leadName = require('../lib/util').getCommandName();
    fecs.check(options);
};

/**
 * 获取 fecs check 命令的参数
 *
 * @param {boolean} hasType 是否有 type 参数
 * @return {Array.<string>} 命令参数
 */
exports.getFecsCheckOptions = function (hasType) {
    var options = [
        'color',
        'debug',
        'format:',
        'ignore:',
        'lookup',
        'maxerr:',
        'maxsize:',
        'reporter:',
        'rule',
        'silent',
        'sort',
        'stream'
    ];

    if (hasType) {
        options.push('type:');
    }

    return options;
};
