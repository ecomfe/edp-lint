/**
 * @file HTML检测模块
 * @author chris[wfsr@foxmail.com]
 */

var edp = require( 'edp-core' );
var fs = require( 'fs' );

function detect( candidates ) {
    var invalidFiles = [];

    var util = require( '../lib/util' );
    candidates.forEach(function( item ){
        if ( util.isIgnored( item, '.htmlhintignore' ) ) {
            return;
        }

        var defaultConfig = require( '../lib/html/config' );
        var htmlhintConfig = defaultConfig;

        var htmlhint = require( '../lib/html/htmlhint');
        var source = fs.readFileSync( item, 'utf-8' );
        var errors = htmlhint.lint( source, htmlhintConfig );

        function dump( err, idx ) {
            edp.log.warn( '→ line %s, col %s: %s',
                err.line, err.column, err.warning );
        }

        if ( errors && errors.length ) {
            edp.log.info( item );
            invalidFiles.push( item );
            errors.forEach( dump );
            console.log();
        }
    });

    if ( !invalidFiles.length ) {
        edp.log.info( 'All is well :-)' );
    }
}

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
cli.description = '使用htmlhint检测当前目录下所有HTML文件';

/**
 * 模块命令行运行入口
 *
 * @param {Array.<string>} args
 */
cli.main = function (args) {
    var patterns = [
        '**/*.{html,htm}', '!**/output/**',
        '!**/test/**', '!**/node_modules/**'
    ];
    var candidates = require( '../lib/util' ).getCandidates(
        args, patterns );

    if ( candidates.length ) {
        detect( candidates );
    }
};

/**
 * 命令行配置项
 *
 * @type {Object}
 */
exports.cli = cli;
