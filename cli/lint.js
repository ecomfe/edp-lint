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
    'type:'
];

/**
 * 模块命令行运行入口
 */
cli.main = function (args, opts) {

    var checkers = [];
    var types = (opts.type || 'js,less,css,html').split(/\s*,\s*/);
    var extensions = [];

    types.forEach(function (type) {
        var target = '../lib/' + type + '/checker.js';
        if (fs.existsSync(path.join(__dirname, target))) {
            var checker = require(target);
            extensions = extensions.concat(checker.extensions);
            
            checkers.push(checker);
        }
        else {
            edp.log.warn('Invalid checker %s from %s', type, target);
        }
    });

    var validPattern = '**/*.' + (extensions.length > 1 ? '{' + extensions.join(',') + '}' : extensions[0]);
    var patterns = [
        validPattern,
        '!**/{output,asset,dist,release,doc,dep,report}/**',
        '!**/test/**',
        '!**/node_modules/**'
    ];

    var candidates = require('../lib/util').getCandidates(args, patterns);

    if (candidates.length) {
        var lint = require('../lib/lint');
        lint.check(candidates, checkers);
    }
    
};

/**
 * 命令行配置项
 *
 * @type {Object}
 */
exports.cli = cli;




















/* vim: set ts=4 sw=4 sts=4 tw=100: */
