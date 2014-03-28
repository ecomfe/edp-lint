/**
 * @file Javascript检测模块
 * @author errorrik[errorrik@gmail.com]
 */

var edp = require( 'edp-core' );

var fs = require( 'fs' );
var path = require( 'path' );

/**
 * 读取目录
 * 
 * @inner
 * @param {string} dir 目录路径
 * @param {string=} startDir 开始目录路径
 * @param {Object=} conf 验证配置
 * @param {Array} result 结果保存数组
 */
function readDir( dir, startDir, conf, result ) {
    startDir = startDir || dir;
    var files = fs.readdirSync( dir );

    // 读取当前目录下的'.jshintrc'配置文件
    var jshintRcFile = dir + '/.jshintrc';
    if ( fs.existsSync( jshintRcFile ) ) {
        var rcBuffer = fs.readFileSync( jshintRcFile );
        conf = JSON.parse( rcBuffer.toString( 'UTF-8' ) );
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
            && path.extname( file ).toLowerCase() == '.js'
        ) {
            detectJS( filename, startDir, conf, result );
        }
    }
}

/**
 * 只考虑项目或者package根目录下面的东东.
 * @const
 */
var IGNORE_PATTERNS = require( '../lib/util' ).getIgnorePatterns(
    path.resolve( process.cwd(), '.jshintignore' )
);

/**
 * 检测Javascript文件
 * 
 * @inner
 * @param {string} file 文件路径
 * @param {string=} startDir 开始目录路径
 * @param {Object=} conf 验证配置
 * @param {Array} result 结果保存数组
 */
function detectJS( file, startDir, conf, result ) {
    var isIgnored = edp.glob.match(
        path.relative( process.cwd(), file ),
        IGNORE_PATTERNS
    );

    if ( isIgnored ) {
        return;
    }

    conf = edp.util.extend(
        require( '../lib/js/config' ), conf);

    var data = {};
    result.push( data );
    data.file = path.relative( startDir, file );

    var jshint = require( 'jshint' ).JSHINT;
    var source = fs.readFileSync( file );

    data.success = jshint( source.toString( 'UTF-8' ), conf );
    if ( !data.success ) {
        data.errors = jshint.errors;
        data.data = jshint.data();
    }
}

/**
 * 显示检测结果报告
 * 
 * @inner
 * @param {Array.<Object>} result 检测结果数组
 */
function report( result ) {
    var count = result.length;
    var errorFileCount = 0;
    var errorCount = 0;

    result.forEach( function ( data ) {
        if ( !data.success ) {
            errorFileCount++;
            errorCount += data.errors.length;
            consoleTitle( data.file );

            data.errors.forEach( function ( err, idx ) {
                if ( !err ) {
                    return;
                }

                console.log( (idx + 1) + '. line ' + err.line + ', col ' +
                    err.character + ': ' + err.reason );
            } );
            console.log( '\n' );
        }
    } );

    consoleTitle( 'Total' );
    console.log( 'Detect ' + count + ' files, find ' 
        + errorCount + ' errors in ' + errorFileCount + ' files.\n' );
    result.forEach( function ( data ) {
        if ( !data.success ) {
            console.log( '- ' + data.file );
        }
    } );
    console.log( '\n' );
}

/**
 * console.log标题
 * 
 * @inner
 * @param {string} title 标题描述
 */
function consoleTitle( title ) {
    console.log( title );
    console.log( '---------------\n' );
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
cli.main = function (args) {
    var result = [];

    if ( args.length ) {
        var globalConfig = null;
        if (fs.existsSync(path.resolve(process.cwd(), '.jshintrc'))) {
            globalConfig = JSON.parse(fs.readFileSync(
                path.resolve(process.cwd(), '.jshintrc'), 'UTF-8'));
        }

        for (var i = 0; i < args.length; i ++) {
            var target = args[i];
            if (target) {
                if (!fs.existsSync(target)) {
                    console.error('No such file or directory = [' +
                        target + ']');
                    process.exit(1);
                }
                else {
                    var fsStat = fs.statSync(target);
                    if (fsStat.isDirectory()) {
                        readDir(target, null, null, result);
                    }
                    else {
                        detectJS(target, path.dirname(target),
                            globalConfig, result);
                    }
                }
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
