/***************************************************************************
 *
 * Copyright (c) 2014 Baidu.com, Inc. All Rights Reserved
 * $Id$
 *
 **************************************************************************/



/**
 * lib/util.js ~ 2014/03/28 15:50:34
 * @author leeight(liyubei@baidu.com)
 * @version $Revision$
 * @description
 *
 **/
var edp = require('edp-core');
var fs = require('fs');

/**
 * @return {Array.<string>}
 */
exports.getIgnorePatterns = function(file) {
    if (!fs.existsSync(file)) {
        return [];
    }

    var patterns = fs.readFileSync(file, 'utf-8').split(/\r?\n/g);
    return patterns.filter(function(item) {
        return item.trim().length > 0 && item[0] !== '#';
    });
};

var _IGNORE_CACHE = {};
/**
 * 判断一下是否应该忽略这个文件.
 * @param {string} file 需要检查的文件路径.
 * @param {string=} name ignore文件的名称.
 * @return {boolean}
 */
exports.isIgnored = function(file, name) {
    var ignorePatterns = null;

    name = name || '.jshintignore';
    file = edp.path.resolve(file);

    var key = name + '@'  + edp.path.dirname(file);
    if (_IGNORE_CACHE[key]) {
        ignorePatterns = _IGNORE_CACHE[key];
    }
    else {
        var options = {
            name: name,
            factory: function(item) {
                var config = {};
                exports.getIgnorePatterns(item).forEach(function(line) {
                    config[line] = true;
                });
                return config;
            }
        };
        var ignorePatterns = edp.util.getConfig(
            edp.path.dirname(file),
            options
        );

        _IGNORE_CACHE[key] = ignorePatterns;
    }

    var bizOrPkgRoot = process.cwd();
    try {
        bizOrPkgRoot = edp.path.getRootDirectory();
    }
    catch (ex) {
    }

    var dirname = edp.path.relative(bizOrPkgRoot, file);
    var isMatch = edp.glob.match(dirname, Object.keys(ignorePatterns));

    return isMatch;
};

/**
 * 目录配置信息的缓存数据
 * @ignore
 */
var _CONFIG_CACHE = {};

/**
 * 读取默认的配置信息，可以缓存一下.
 * @param {string} configName 配置文件的名称.
 * @param {string} file 文件名称.
 * @param {Object=} defaultConfig 默认的配置信息.
 */
exports.getConfig = function(configName, file, defaultConfig) {
    var dir = edp.path.dirname(edp.path.resolve(file));
    var key = configName + '@' + dir;

    if (_CONFIG_CACHE[key]) {
        return _CONFIG_CACHE[key];
    }

    var options = {
        name: configName,
        defaultConfig: defaultConfig,
        factory: function(item) {
            if (!fs.existsSync(item)) {
                console.log(item);
                return null;
            }

            return JSON.parse(fs.readFileSync(item, 'utf-8'));
        }
    };

    var value = edp.util.getConfig(dir, options);

    _CONFIG_CACHE[key] = value;

    return value;
};


/**
 * @return {Array.<string>}
 */
exports.getCandidates = function(args, patterns) {
    var candidates = [];

    args = args.filter(function(item) {
        return item !== '.';
    });

    if (!args.length) {
        candidates = edp.glob.sync(patterns);
    }
    else {
        for (var i = 0; i < args.length; i++) {
            var target = args[i];
            if (!fs.existsSync(target)) {
                edp.log.warn('No such file or directory %s', target);
                continue;
            }

            var stat = fs.statSync(target);
            if (stat.isDirectory()) {
                target = target.replace(/[\/|\\]+$/, '');
                candidates.push.apply(
                    candidates,
                    edp.glob.sync(target + '/' + patterns[0]));
            }
            else if (stat.isFile()) {
                candidates.push(target);
            }
        }
    }

    return candidates;
};

/**
 * 转换命令行参数值为 boolean
 *
 * @param {?string} value 命令行传的值
 * @param {boolean} defaultValue 默认值
 * @return {boolean} 转换后的布尔值
 */
exports.toBoolean = function (value, defaultValue) {
    if (typeof value === 'undefined') {
        return defaultValue;
    }
    else {
        return !(value === 'false' || value === '0');
    }
}

/**
 * 获取当前运行的主命令名
 *
 * @return {string} 根据 process.args 第二个参数获取到的文件名
 */
exports.getCommandName = function () {
    return process.argv[1].replace(/^.*\/([^\/]+)$/, '$1');
};

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















/* vim: set ts=4 sw=4 sts=4 tw=100: */
