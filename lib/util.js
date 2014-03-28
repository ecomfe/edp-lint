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




















/* vim: set ts=4 sw=4 sts=4 tw=100: */
