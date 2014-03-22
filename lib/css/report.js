/**
 * @file 显示检测结果报告模块
 * @author Firede[firede@firede.us]
 *         errorrik[errorrik@gmail.com]
 */

var edp = require( 'edp-core' );

/**
 * 显示检测结果报告
 *
 * @param {Array.<Object>} result 检测结果数组
 */
function report( result ) {
    var fileCount = result.length;
    var errorCount = 0;
    var warningCount = 0;
    var failFileCount = 0;

    console.log( edp.util.colorize( 'CSS Lint Result', 'title' ) );
    console.log( edp.util.colorize( '===', 'info' ) );

    result.forEach( function( item ) {
        if (item.success) {
            var messages = item.success.messages || [];
            if ( messages.length > 0 ) {
                failFileCount++;

                outputTitle( item.file );
                messages.forEach(function( message ) {
                    ( message.type === 'warning' ) && warningCount++;
                    ( message.type === 'error' ) && errorCount++;

                    outputMessage( message );
                });
            }
        }
    });

    outputTitle( 'Total' );
    console.log(
        'Detect ' + fileCount + ' files.',
        'find ' + errorCount + ' errors',
        'and ' + warningCount + ' warnings',
        'in ' + failFileCount + ' files.\n'
    );
}

/**
 * 输出单条检测信息
 *
 * @inner
 * @param {Object} message 检测信息对象
 */
function outputMessage( message ) {
    var position = '';
    var failInfo = message.type.toUpperCase();

    // 全局性的错误可能没有位置信息
    if ( message.line && message.col ) {
        position = edp.util.colorize(
            '[L' + message.line + ',C' + message.col + '] ',
            'info'
        );
    }

    // 如果有符合的规则，加入失败信息中
    if ( message.rule && message.rule.name ) {
        failInfo += ': ' + message.rule.name;
    }

    console.log( position + edp.util.colorize( failInfo, message.type ) );
    console.log( 'Message:', message.message );
    if ( message.evidence ) {
        if ( message.evidence.length > 160 ) {
            console.log(
                'Evidence:',
                edp.util.colorize( 'Compressed CSS, ignore evidence.', 'info' )
            );
        } else {
            console.log( 'Evidence:', message.evidence );
        }
    }
    console.log();
}

function outputTitle( title ) {
    console.log();
    console.log( edp.util.colorize( title, 'title' ) );
    console.log( edp.util.colorize( '---\n', 'info' ) );
}

module.exports = exports = report;
