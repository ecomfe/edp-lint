/***************************************************************************
 * 
 * Copyright (c) 2014 Baidu.com, Inc. All Rights Reserved
 * $Id$ 
 * 
 **************************************************************************/
 
 
 
/**
 * util.spec.js ~ 2014/03/28 15:57:24
 * @author leeight(liyubei@baidu.com)
 * @version $Revision$ 
 * @description 
 *  
 **/

var path = require( 'path' );

var util = require( '../lib/util' );

describe( 'util', function(){
    it( 'getIgnorePatterns', function(){
        var file = path.join( __dirname, 'data', '.jshintignore' );
        var patterns = util.getIgnorePatterns( file );

        expect( patterns ).toEqual( [ 'a/**', 'b', 'c/**', 'd' ] );
    });
});

















/* vim: set ts=4 sw=4 sts=4 tw=100: */
