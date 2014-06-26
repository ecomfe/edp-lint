/**
 * @file CSS检测模块
 * @author Firede[firede@firede.us]
 */

var edp = require( 'edp-core' );
var fs = require( 'fs' );

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

        var csslint = require( 'csslint' ).CSSLint;
        var source = fs.readFileSync( item, 'UTF-8' );

        // ../lib/css/config只包含了edp的一些和默认参数不同的参数设置
        // 所以，需要获取csslint的默认规则参数，然后和edp的设置混合起来
        var defaultConfig = csslint.getRuleset();
        edp.util.extend( defaultConfig, require( '../lib/css/config' ) );

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
    else {
        process.exit( 1 );
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
    var patterns = [
        '**/*.css', '!**/output/**',
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
