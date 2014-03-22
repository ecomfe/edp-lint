/**
 * @file CSS检测模块
 * @author Firede[firede@firede.us]
 *         errorrik[errorrik@gmail.com]
 */


// 目前 csslint 项目正在考虑配置文件格式改 json 的问题：
// https://github.com/stubbornella/csslint/issues/359
//
// 考虑到可读性，用扁平化的 JSON 格式配置，不支持 csslint 官方的 CLI Arguments 式配置。
//
// 示例：
// {
//     "box-model": false,
//     "import": false,
//     "outline-none": false,
//     "duplicate-background-images": false
// }




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
cli.description = '使用csslint检测当前目录下所有CSS文件';

/**
 * 模块命令行运行入口
 *
 * @param {Array.<string>} args
 * @param {Object} opts
 */
cli.main = function ( args, opts ) {
    var fs = require( 'fs' );
    var path = require( 'path' );
    var report = require( '../lib/css/report' );
    var readDir = require( '../lib/css/read-dir' );
    var detectCSS = require( '../lib/css/detect-css' );

    var result = [];

    var target = args[ 0 ];
    if ( target ) {
        if ( !fs.existsSync( target ) ) {
            console.error( 'No such file or directory = [' + target + ']' );
            process.exit( 1 );
        } else {
            var fsStat = fs.statSync( target );
            if ( fsStat.isDirectory() ) {
                readDir( target, null, null, result );
            } else {
                detectCSS(
                    target,
                    path.dirname( target ),
                    null,
                    result
                );
            }
        }
    } 
    else {
        readDir( process.cwd(), null, null, result );
    }

    report( result );
};

/**
 * 命令行配置项
 *
 * @type {Object}
 */
exports.cli = cli;

