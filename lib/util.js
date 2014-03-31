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
var edp = require( 'edp-core' );
var fs = require( 'fs' );

/**
 * @return {Array.<string>}
 */
exports.getIgnorePatterns = function( file ) {
    if ( !fs.existsSync( file ) ) {
        return [];
    }

    var patterns = fs.readFileSync( file, 'utf-8' ).split( /\r?\n/g );
    return patterns.filter(function( item ){
        return item.trim().length > 0 && item[ 0 ] !== '#';
    });
};

var _IGNORE_CACHE = {};
/**
 * 判断一下是否应该忽略这个文件.
 * @param {string} file
 * @return {boolean}
 */
exports.isIgnored = function( file ) {
    var ignorePatterns = null;

    file = edp.path.resolve( file );
    var key = '.jshintignore@'  + edp.path.dirname( file );
    if ( _IGNORE_CACHE[ key ] ) {
        ignorePatterns = _IGNORE_CACHE[ key ];
    }
    else {
        var options = {
            name: '.jshintignore',
            factory: function( item ){
                var config = {};
                exports.getIgnorePatterns( item ).forEach(function( line ){
                    config[ line ] = true;
                });
                return config;
            }
        };
        var ignorePatterns = edp.util.getConfig(
            edp.path.dirname( file ),
            options
        );

        _IGNORE_CACHE[ key ] = ignorePatterns;
    }

    var bizOrPkgRoot = process.cwd();
    try {
        bizOrPkgRoot = edp.path.getRootDirectory();
    }
    catch( ex ) {
    }

    var dirname = edp.path.relative( bizOrPkgRoot, file );
    var isMatch = edp.glob.match( dirname, Object.keys( ignorePatterns ) );

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
exports.getConfig = function( configName, file, defaultConfig ) {
    var dir = edp.path.dirname( edp.path.resolve( file ) );
    var key = configName + '@' + dir;

    if ( _CONFIG_CACHE[ key ] ) {
        return _CONFIG_CACHE[ key ];
    }

    var options = {
        name: configName,
        defaultConfig: defaultConfig,
        factory: function( item ){
            if ( !fs.existsSync( item ) ) {
                console.log( item );
                return null;
            }

            return JSON.parse( fs.readFileSync( item, 'utf-8' ) );
        }
    };

    var value = edp.util.getConfig( dir, options );

    _CONFIG_CACHE[ key ] = value;

    return value;
};




















/* vim: set ts=4 sw=4 sts=4 tw=100: */
