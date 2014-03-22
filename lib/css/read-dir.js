/**
 * @file 读取目录模块
 * @author Firede[firede@firede.us]
 *         errorrik[errorrik@gmail.com]
 */


var path = require( 'path' );
var fs = require( 'fs' );
var edp = require( 'edp-core' );
var detectCSS = require( './detect-css' );

/**
 * 读取目录
 *
 * @param {string} dir 目录路径
 * @param {string=} startDir 开始目录路径
 * @param {Object=} conf 验证配置
 * @param {Array} result 结果保存数组
 */
function readDir( dir, startDir, conf, result ) {
    startDir = startDir || dir;
    var files = fs.readdirSync( dir );

    // 读取当前目录下的'.csslintrc'配置文件
    var csslintRcFile = path.resolve( dir, '.csslintrc' );
    if ( fs.existsSync( csslintRcFile ) ) {
        var rcText = fs.readFileSync( csslintRcFile, 'UTF-8' );
        try {
            var conf = JSON.parse( rcText );
        }
        catch (e) {
            edp.log.error(
                '`.csslintrc` syntax error, see `edp help csslint`.'
            );
            process.exit( 1 );
        }
    }

    // 扫瞄文件与文件夹
    for ( var i = 0, len = files.length; i < len; i++ ) {
        var file = files[ i ];
        var filename = dir + '/' + file;

        // 忽略隐藏文件
        if ( /^\./.test( file ) ) {
            continue;
        }

        var fsStat = fs.statSync( filename );
        if ( fsStat.isDirectory() && file != 'node_modules' ) {
            readDir( filename, startDir, conf, result );
        }
        else if (
            fsStat.isFile()
            && path.extname( file ).toLowerCase() == '.css'
        ) {
            detectCSS( filename, startDir, conf, result );
        }
    }
}

module.exports = exports = readDir;
