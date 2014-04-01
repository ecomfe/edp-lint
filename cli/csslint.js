/**
 * @file CSS检测模块
 * @author Firede[firede@firede.us]
 */

var edp = require( 'edp-core' );
var fs = require( 'fs' );
var path = require( 'path' );

// 目前 csslint 项目正在考虑配置文件格式改 json 的问题：
// https://github.com/stubbornella/csslint/issues/359
// 
// 考虑到可读性，用扁平化的 JSON 格式配置，不支持 csslint 官方的 CLI Arguments 式配置。
// 
// 示例：
//  {
//      "box-model": false,
//      "import": false,
//      "outline-none": false,
//      "duplicate-background-images": false
//  }

/**
 * 输出单条检测信息
 * 
 * @inner
 * @param {Object} message 检测信息对象
 */
function outputMessage( message ) {
    var msg = '→ ';
    // 全局性的错误可能没有位置信息
    if ( message.line && message.col ) {
        msg += require( 'util' ).format( 'line %s, col %s: ',
            message.line, message.col );
    }
    msg += message.message;
    edp.log.warn( msg );
}

function detect( candidates ) {
    var invalidFiles = [];

    var util = require( '../lib/util' );
    candidates.forEach(function( item ){
        if ( util.isIgnored( item, '.csslintignore' ) ) {
            return;
        }

        var defaultConfig = require( '../lib/css/config' );

        var csslint = require( 'csslint' ).CSSLint;
        var source = fs.readFileSync( item, 'UTF-8' );

        // TODO 这个defaultConfig跟 lib/css/config 的区别是啥?
        // var defaultConf = csslint.getRuleset();
        // conf = edp.util.extend( defaultConf, conf );

        var csslintConfig = util.getConfig( '.csslintrc', item, defaultConfig );

        var success = csslint.verify( source, csslintConfig );
        if ( success
             && success.messages
             && success.messages.length > 0 ) {
            edp.log.info( item );
            invalidFiles.push( item );
            success.messages.forEach( outputMessage );
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
cli.description = '使用csslint检测当前目录下所有CSS文件。';

/**
 * 模块命令行运行入口
 *
 * @param {Array.<string>} args
 * @param {Object} opts
 */
cli.main = function ( args, opts ) {
    var candidates = [];

    if ( !args.length ) {
        candidates = edp.glob.sync([
            '**/*.css', '!**/output/**',
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
                    candidates, edp.glob.sync( target + '/**/*.css' ) );
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
