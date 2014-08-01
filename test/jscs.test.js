/**
 * @file jscs.test.js ~ 2014/07/31 21:31:11
 * @author leeight(liyubei@baidu.com)
 **/
var Checker = require('jscs/lib/checker');

var config = require('jscs/lib/cli-config').load('.jscsrc');
console.log(config);

var checker = new Checker();
checker.registerDefaultRules();
checker.configure(config || {});

checker.checkPath('../cli/jshint.js').then(function( errors ) {
    var error = errors[0];
    console.log(error._errorList);
});











/* vim: set ts=4 sw=4 sts=4 tw=120: */
