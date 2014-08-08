exports.html = {
    lint: require('./lib/html/htmlhint').lint,
    config: require('./lib/html/config')
};

exports.css = {
    config: require('./lib/css/config')
};

exports.js = {
    config: require('./lib/js/config'),
    jscsConfig: require('./lib/js/jscsrc.json')
};
