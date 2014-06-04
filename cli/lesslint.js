/**
 * @file less检测模块
 *
 * @author ielgnaw(wuji0223@gmail.com)
 */

var edp = require( 'edp-core' );
var fs = require( 'fs' );
var less = require( 'less-edp' ) ;
var LessLintVisitor = require( '../lib/less/LessLintVisitor' );

/**
 * less parser参数
 *
 * @type {Object}
 */
var options = {
    paths: [ '.' ],
    relativeUrls: true
};

/**
 * @param {Array.<string>} candidates 所有需要检查的文件.
 * @return {Object} 检查的结果.
 */
function detect( candidates ) {
    var invalidList = [];

    candidates.forEach(
        function ( item ) {
            var lessData = fs.readFileSync( item, 'utf-8' );

            var lessLintVisitor = new LessLintVisitor( {
                fileData: lessData
            } );

            var relativePath = edp.path.relative( process.cwd(), item );
            // options.paths.push( relativePath );

            var parser = new ( less.Parser )( options );
            // options.paths.push(
            //      edp.path.join( process.cwd(), relativePath ).slice(
            //          0,
            //          edp.path.join(
            //              process.cwd(), relativePath
            //          ).lastIndexOf('/')
            //      )
            // );

            // relativePath = edp.path.join( process.cwd(), relativePath );
            var curPath = relativePath.slice(
                0, relativePath.lastIndexOf( '/' )
            );

            if ( options.paths.indexOf( curPath ) === -1 ) {
                options.paths.push( curPath );
            }

            parser.parse(
                lessData,
                function ( err, tree ) {
                    if ( err ) {
                        throw err;
                    }

                    lessLintVisitor.run( tree );

                    invalidList = lessLintVisitor.invalidList;

                    edp.log.info( relativePath );

                    if ( invalidList.length ) {
                        invalidList.forEach( dump );
                    }
                    if ( !invalidList.length ) {
                        edp.log.info( 'File `%s` is well :-)', item );
                    }

                    try {
                        tree.toCSS();
                    }
                    catch ( e ) {
                        edp.log.error( e.toString() );
                    }
                }
            );

            function dump( invalidMsg ) {
                edp.log.warn(
                    'lesslint: → %s: %s',
                    invalidMsg.type,
                    invalidMsg.content
                );
            }
        }
    );


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
cli.description = '使用lesslint检测当前目录下所有LESS文件。';

/**
 * 模块命令行运行入口
 *
 * @param {Array.<string>} args
 */
cli.main = function ( args ) {
    var patterns = [
        '**/*.less', '!**/output/**',
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
