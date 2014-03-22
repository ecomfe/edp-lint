/**
 * @file 检测模块
 * @author Firede[firede@firede.us]
 *         errorrik[errorrik@gmail.com]
 */


var path = require( 'path' );
var fs = require( 'fs' );
var edp = require( 'edp-core' );

/**
 * 检测CSS文件
 *
 * @param {string} file 文件路径
 * @param {string=} startDir 开始目录路径
 * @param {Object=} conf 验证配置
 * @param {Array} result 结果保存数组
 */
function detectCSS( file, startDir, conf, result ) {
    conf = conf || require( './conf' );

    var data = {};
    result.push( data );
    data.file = path.relative( startDir, file );

    var csslint = require( 'csslint' ).CSSLint;
    var source = fs.readFileSync( file, 'UTF-8' );
    
    var defaultConf = csslint.getRuleset();
    conf = edp.util.extend( defaultConf, conf );

    if ( source.trim() === '' ) {
        data.success = {
            messages: [
                {
                    type: 'error',
                    message: 'File is empty.'
                }
            ]
        };
    } 
    else {
        data.success = csslint.verify( source, conf );
    }
}


module.exports = exports = detectCSS;

