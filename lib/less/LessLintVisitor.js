/**
 * @file LessLintVisitor 类
 *
 * @author ielgnaw(wuji0223@gmail.com)
 */

var tree = require( 'less-edp/lib/less/tree' );

/**
 * LessLintVisitor类
 *
 * @param {Object} options 配置项
 * @param {string} options.fileData 当前检测的less文件内容
 * @param {string} options.env 环境信息
 *
 * @constructor
 */
function LessLintVisitor( options ) {
    this.fileData = options.fileData;
    this._visitor = new tree.visitor( this );
    this._env = options.env;

    /**
     * 不合法的信息集合
     *
     * @type {Array<Object>}
     *
     * {
     *     type: 错误类型，IMPORTFILE/COMMENT/VARIABLE/ZEROVALUE/COLORVALUE/NUMBERVALUE
     *     content: 信息内容
     * }
     *
     */
    this.invalidList = [];
}

/**
 * LessLintVisitor run
 *
 * @param  {Object} root astRoot
 */
LessLintVisitor.prototype.run = function ( root ) {
    var me = this;
    me._visitor.visit( root );

    // 检测选择器
    checkSelector.call( me );
};

/**
 * 检测import
 *
 * @import 语句引用的文件必须（MUST）写在一对引号内，.less 后缀不得（MUST NOT）省略（与引入 CSS 文件时的路径格式一致）。
 * 引号使用 ' 和 " 均可，但在同一项目内必须（MUST）统一。
 */
LessLintVisitor.prototype.visitImport = function ( node, visitArgs ) {
    var me = this;

    var meImportQuote = me.importQuote;

    var path = node.path;
    var importFilePath = path.value;
    var importQuote = path.quote;
    // var realImportFile = node.importedFilename;

    if ( !/\.less$/.test(importFilePath) ) {
        me.invalidList.push( {
            type: 'IMPORTFILE',
            content: 'Invalid import: `@import '
                        + importQuote
                        + importFilePath
                        + importQuote      // 以上这三行是为了拼出less中import的源语句
                        + '` .less后缀不得省略'
        } );
    }

    if (
        meImportQuote
        &&
        meImportQuote !== importQuote
    ) {
        me.invalidList.push( {
            type: 'IMPORTFILE',
            content: 'Invalid quote: 同一项目内，import时，\'和\"必须统一'
        } );
    }
    else {
        meImportQuote = me.importQuote = importQuote;
    }
};

/**
 * 注释接口
 * 单行注释尽量（SHOULD）使用 // 方式。
 *
 * @param {Object} node AST node
 *
 * @see https://github.com/ecomfe/spec/blob/master/less-code-style.md#%E6%B3%A8%E9%87%8A
 */
LessLintVisitor.prototype.visitComment = function ( node, visitArgs ) {
    var me = this;
    var pattern = /^\/\*.*[\n]*.*\*\//;
    var value = node.value;
    if ( pattern.test( value ) ) {
        me.invalidList.push( {
            type: 'COMMENT',
            content: 'Invalid comment: `'
                        + value.replace(/\n*/g, '')   // replace是为了提示信息在一行
                        + '`, 单行注释尽量使用 // 方式。'
        } );
    }
};

/**
 * 规则接口，在此接口中实现如下规则的检测：
 * 变量命名必须（MUST）采用 @foo-bar 形式，不得（MUST NOT）使用 @fooBar 形式。
 *
 * 这里没有使用visitVariable接口，是因为visitVariable接口不会检测到没有使用的变量
 *
 * @see https://github.com/ecomfe/spec/blob/master/less-code-style.md#%E5%8F%98%E9%87%8F
 */
LessLintVisitor.prototype.visitRule = function ( node, visitArgs ) {
    var me = this;
    // var util = require('util');
    // console.log(util.inspect(node, { showHidden: true, depth: null }), 1111);

    // 说明是变量
    // 检测变量命名是否是 @foo-bar 形式
    if ( node.variable ) {
        var name = node.name;
        var pattern = /^@([a-z0-9\-]+)$/;
        if ( !pattern.test( name ) ) {
            me.invalidList.push( {
                type: 'VARIABLE',
                content: 'Invalid variable declaration: `'
                            + name
                            + '`, 变量命名必须采用 @foo-bar 形式，'
                            + '不得使用 @fooBar 形式。'
            } );
        }
    }
    // console.log(node);
};

/**
 * 0值
 *
 * 当属性值为 0 时，必须（MUST）省略可省的单位（长度单位如 px、em，不包括时间、角度等如 s、deg）。
 *
 * @see https://github.com/ecomfe/spec/blob/master/less-code-style.md#0-%E5%80%BC
 */
LessLintVisitor.prototype.visitValue = function ( node, visitArgs ) {
    var me = this;
    // var util = require( 'util' );
    // console.log(util.inspect(node, {showHidden: true, depth: null}));

    var value = node.value[ 0 ].value;

    checkNumberVal.call( me, value );

    /**
     * 这里没有用visitUnit来判断unit，
     * 是因为visitUnit接口仅仅只是获取unit，不能获取到value
     */

    // 匹配value是直接写入的值的情况，eg:
    // height: 0px;
    // border: 0px solid #fff;
    if ( typeof value === 'string' ) {
        var pattern = /^\b0(\w+)\b/g; // 匹配0值后带单位的情况
        var match;
        while ( !!( match = pattern.exec( value ) ) ) {
            var zeroVal = match[ 0 ];
            var zeroUnit = match[ 1 ];
            me.invalidList.push( {
                type: 'ZEROVALUE',
                content: 'Invalid unit: `'
                            + zeroUnit
                            + '` on property value: `'
                            + zeroVal
                            + '`, 当属性值为 0 时，必须省略可省的单位'
            } );
        }
    }
    // 匹配value是变量的情况
    // 主要检测变量定义的时候，使用的时候不需要检测
    else if ( typeof value === 'object' ) {

        // 颜色的value只能是object
        checkColor.call( me, value );

        // 定义时的值
        var defineVal = value[ 0 ].value;

        // defineVal不存在情况说明是使用变量或者是颜色值的时候，这时候不考虑
        if ( typeof defineVal !== 'undefined' ) {
            if ( defineVal === 0 ) {

                // unit对象
                var unit = value[ 0 ].unit;

                // 获取Unit实例
                var unitObj = new tree.Unit(
                    unit.numerator,
                    unit.denominator,
                    unit.backupUnit
                );

                // unit值
                var unitStr = unit.numerator[ 0 ];

                // 判断是否是长度单位
                var isLengthUnit = unitObj.isLength();

                if ( isLengthUnit ) {
                    me.invalidList.push( {
                        type: 'ZEROVALUE',
                        content: 'Invalid unit: `'
                                    + unitStr
                                    + '` on variable declaration'
                                    + ', 当属性值为 0 时，必须省略可省的单位'
                    } );
                }
            }
        }
    }
};

/**
 * 检测selector
 *
 * 当多个选择器共享一个声明块时，每个选择器声明必须（MUST）独占一行。
 */
function checkSelector() {
    var me = this;

    var commentPattern = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg;

    // 去掉注释内容
    var fileData = me.fileData.replace( commentPattern, '' );

    // var pattern = /(.*(?={))/mg;
    var pattern = /([^(@)\n]*(?={))/mg;

    var matchRet = fileData.match( pattern );

    if ( matchRet && matchRet.length ) {
        matchRet.forEach(
            function ( item ) {
                if ( item ) {
                    item = item.replace( /\s*/g, '' );
                    if ( item.indexOf( ',' ) !== -1 ) {
                        me.invalidList.push( {
                            type: 'SELECTOR',
                            content: 'Invalid selector: `'
                                        + item
                                        + '`, 当多个选择器共享一个声明块时，'
                                        + '每个选择器声明必须独占一行'
                        } );
                    }
                }
            }
        );
    }
}

/**
 * 检测颜色值
 * 颜色定义必须（MUST）使用 #RRGGBB 格式定义，并在可能时尽量（SHOULD）缩写为 #RGB 形式，且避免直接使用颜色名称与 rgb() 表达式。
 *
 * @param  {Array} value AST上的value
 */
function checkColor( value ) {
    var me = this; // LessLintVisitor

    value = value[ 0 ];

    var callFuncName = value.name;

    // 说明是rgb、rgba、hsl、hsla表达式
    // 并且排除变量以及less function的情况
    // if (
    //     callFuncName
    //     &&
    //     callFuncName.indexOf('@') === -1
    //     &&
    //     !tree.functions[callFuncName]
    // ) {
    //     me.invalidList.push( {
    //         type: 'COLORVALUE',
    //         content: 'Invalid color, '
    //                     + '颜色值应该避免直接使用 '
    //                     + callFuncName
    //                     + ' 表达式'
    //     } );
    //     return;
    // }

    if ( callFuncName ) {
        // rgb、rgba、hsl、hsla表达式
        // 这里要注意排除掉 变量定义、filter 以及 less functions 的情况，
        // 所以这里写死仅仅检测 rgb、rgba、hsl、hsla这四种情况
        if (
            callFuncName === 'rgb'
            ||
            callFuncName === 'rgba'
            ||
            callFuncName === 'hsl'
            ||
            callFuncName === 'hsla'
        ) {
            me.invalidList.push( {
                type: 'COLORVALUE',
                content: 'Invalid color, '
                            + '颜色值应该避免直接使用 '
                            + callFuncName
                            + ' 表达式'
            } );
            return;
        }
    }
    else {
        var originalValue = value.originalValue;

        // 说明是直接使用的颜色名称
        if ( tree.colors[ originalValue ] ) {
            me.invalidList.push( {
                type: 'COLORVALUE',
                content: 'Invalid color: `'
                            + originalValue
                            + '`, 颜色值应该避免直接使用颜色名称'
            } );
            return;
        }
        else {
            var pattern = /^([\da-f])\1([\da-f])\2([\da-f])\3$/;
            if ( pattern.test(originalValue) ) {
                me.invalidList.push( {
                    type: 'COLORVALUE',
                    content: 'Invalid color: `'
                                + originalValue
                                + '`, 颜色值应该尽可能缩写为 #RGB 格式 '
                } );
                return;
            }
        }
    }
}

/**
 * 检测数值
 * 对于处于 (0, 1) 范围内的数值，小数点前的 0 可以（MAY）省略，同一项目中必须（MUST）保持一致。
 *
 * 以当前检测到的第一个数值为准
 * 如果第一个数值是省略小数点前面的0，那么当前项目所有数值小数点前面的0都应该省略
 * 如果第一个数值没有省略小数点前面的0，那么当前项目所有数值小数点前面的0都不应该省略
 *
 * @param  {Array|string} value AST上的value
 */
function checkNumberVal( value ) {
    var me = this; // LessLintVisitor

    var curCheckVal;

    // 匹配value是变量的情况
    // 主要检测变量定义的时候，使用的时候不需要检测
    if ( typeof value === 'object' ) {
        value = value[ 0 ];
        curCheckVal = value.originalValue;
    }

    // 匹配value是直接写入的值的情况，eg:
    // height: .2px;
    // width: 0.3px;
    else if ( typeof value === 'string' ) {
        curCheckVal = value;
    }

    if ( curCheckVal ) {
        var pattern = /(\d*)\.\d+/g;
        var match;
        while ( !!( match = pattern.exec( curCheckVal ) ) ) {
            if ( !match[ 1 ] ) {
                if (
                    me.numberType
                    &&
                    me.numberType !== 'noZeroBeforeDot'
                ) {
                    me.invalidList.push( {
                        type: 'NUMBERVALUE',
                        content: 'Invalid number: `'
                                    + curCheckVal
                                    + '`, 当前项目小数点前的 0 不能省略'
                    } );
                }
                else {
                    me.numberType = 'noZeroBeforeDot'; // 省略小数点前面的0
                }
            }
            else {
                if ( match[ 1 ] == '0' ) {
                    if (
                        me.numberType
                        &&
                        me.numberType === 'noZeroBeforeDot'
                    ) {
                        me.invalidList.push( {
                            type: 'NUMBERVALUE',
                            content: 'Invalid number: `'
                                        + curCheckVal
                                        + '`, 当前项目小数点前的 0 应该省略'
                        } );
                    }
                    else {
                        me.numberType = 'hasZeroBeforeDot';
                    }
                }
            }
        }
    }
}

module.exports = LessLintVisitor;
