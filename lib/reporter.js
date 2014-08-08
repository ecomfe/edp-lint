/**
 * @file reporter 校验错误信息输出
 * @author chris[wfsr@foxmail.com]
 */

/**
 * 校验错误信息输出报告
 *
 * @param {Array.<{path, error}>} errors 校验错误数据信息
 * @param {Function} info 自定义信息的输出方法
 * @param {Function} warn 自定义警告输出方法
 */
exports.report = function (errors, info, warn) {
    errors.forEach(function (error) {
        info(error.path);
        error.messages.forEach(function (message) {
            var msg = '→ ';
            // 全局性的错误可能没有位置信息
            if (typeof message.line === 'number') {
                msg += ('line ' + message.line);
                if (typeof message.col === 'number') {
                    msg += (', col ' + message.col);
                }
                msg += ': ';
            }

            msg += message.message;
            warn(msg);
        });
        console.log();
    });
};
