/**
 * @file LESS 检测模块
 * @author chris[wfsr@foxmail.com]
 */

var util = require('../lib/util');

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
 * 命令选项信息
 *
 * @type {Array}
 */
cli.options = util.getFecsCheckOptions();

/**
 * 模块命令行运行入口
 *
 * @param {Array.<string>} args 命令行参数列表
 * @param {Object} opts 命令行配置项对象
 */
cli.main = function (args, opts) {
    util.fecsAdapter('less');
};

/**
 * 命令行配置项
 *
 * @type {Object}
 */
exports.cli = cli;
