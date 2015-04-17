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

var path = require('path');

var util = require('../lib/util');

describe('util', function(){
    it('getCommandName', function() {
        var name = util.getCommandName();

        expect(name).toEqual('jasmine-node');
    });

    it('getFecsCheckOptions: no-type', function(){
        var options = util.getFecsCheckOptions();
        expect(options.indexOf('type:') > -1).toBe(false);
    });

    it('getFecsCheckOptions: hasType', function(){
        var options = util.getFecsCheckOptions(true);
        expect(options.indexOf('type:') > -1).toBe(true);
    });
});

















/* vim: set ts=4 sw=4 sts=4 tw=100: */
