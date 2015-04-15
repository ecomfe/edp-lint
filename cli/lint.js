/***************************************************************************
 *
 * Copyright (c) 2014 Baidu.com, Inc. All Rights Reserved
 * $Id$
 *
 **************************************************************************/



/**
 * cli/lint.js ~ 2014/04/14 15:12:48
 * @author leeight(liyubei@baidu.com)
 * @version $Revision$
 * @description
 *
 **/

var edp = require('edp-core');
var fs = require('fs');
var path = require('path');

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
cli.description = 'edp代码规范检查';

/**
 * 命令选项信息
 *
 * @type {Array}
 */
cli.options = [
    'type:',
    'lookup'
];


/**
 * 模块命令行运行入口
 * @param {Array.<string>} args 命令行参数列表
 * @param {Object} opts 命令行配置项对象
 */
cli.main = function (args, opts) {
    require('../lib/util').fecsAdapter();
};

/**
 * 命令行配置项
 *
 * @type {Object}
 */
exports.cli = cli;




















/* vim: set ts=4 sw=4 sts=4 tw=100: */
