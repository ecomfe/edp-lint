/**
 * @file reporter.spec.js
 * @author chris(wfsr@foxmail.com)
 **/

var reporter = require('../lib/reporter');
var util = require('util');


describe('reporter', function(){
    it('report', function() {
        var errors = [{
            path: 'path/to/foo',
            messages: [
                { line: 1, col: 2, message: 'foo'}
            ]
        }];

        var info = jasmine.createSpy('info');
        var warn = jasmine.createSpy('warn');

        reporter.report(errors, info, warn);

        expect(info).toHaveBeenCalled();
        expect(info).toHaveBeenCalledWith(errors[0].path);

        expect(warn).toHaveBeenCalled();

        var messages = errors[0].messages[0];
        var text = util.format('→ line %s, col %s: %s', messages.line, messages.col, messages.message);
        expect(warn).toHaveBeenCalledWith(text);

    });
});
