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
 * 模块命令行运行入口
 */
cli.main = function () {
    console.log( 'See `edp lint --help`' );
};

/**
 * 命令行配置项
 *
 * @type {Object}
 */
exports.cli = cli;




















/* vim: set ts=4 sw=4 sts=4 tw=100: */
