/**
 * @file Javascript检测模块
 * @author errorrik[errorrik@gmail.com]
 */

var edp = require( 'edp-core' );
var fs = require( 'fs' );

/**
 * @param {Array.<string>} candidates 所有需要检查的文件.
 * @return {Object} 检查的结果.
 */
function detect( candidates ){
    var invalidFiles = [];

    var util = require( '../lib/util' );
    candidates.forEach(function( item ){
        if ( util.isIgnored( item ) ) {
            return;
        }

        var defaultConfig = require( '../lib/js/config' );
        var jshintConfig = util.getConfig( '.jshintrc', item, defaultConfig );

        var jshint = require( 'jshint' ).JSHINT;
        var source = fs.readFileSync( item, 'utf-8' );
        var success = jshint( source, jshintConfig );

        function dump( err, idx ) {
            if ( !err ){ return; }
            edp.log.warn( '→ line %s, col %s: %s',
                err.line, err.character, err.reason );
        }

        if ( !success ) {
            invalidFiles.push( item );
            edp.log.info( item );
            jshint.errors.forEach( dump );
            console.log();
            ok = false;
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
cli.description = '使用jshint检测当前目录下所有Javascript文件。';

/**
 * 模块命令行运行入口
 *
 * @param {Array.<string>} args
 */
cli.main = function ( args ) {
    var candidates = [];

    if ( !args.length ) {
        candidates = edp.glob.sync([
            '**/*.js', '!**/output/**',
            '!**/test/**', '!**/node_modules/**'
        ]);
    }
    else {
        for( var i = 0; i < args.length; i ++ ) {
            var target = args[ i ];
            if ( !fs.existsSync( target ) ) {
                edp.log.warn( 'No such file or directory %s', target );
                continue;
            }

            var stat = fs.statSync( target );
            if ( stat.isDirectory() ) {
                target = target.replace( /[\/|\\]+$/, '' );
                candidates.push.apply(
                    candidates, edp.glob.sync( target + '/**/*.js' ) );
            }
            else if ( stat.isFile() ) {
                candidates.push( target );
            }
        }
    }

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
