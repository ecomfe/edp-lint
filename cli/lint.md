lint
---------

### Usage

    edp lint [path] [--type=js|css|less|html]

    edp lint --type=js
    edp lint --type=css,less
    edp lint src/css --type=less
    edp lint *.js
    edp jshint *.js
    edp lint *.css
    edp csslint *.css
    edp lint *.less
    edp lesslint *.less
    edp lint *.html
    edp htmlhint *.html
    edp lint --lookup false

### Options

+ --type - 指定校验器类型，可以指定一个或多个，以半角逗号隔开。目前可用的校验器类型有 `js`|`css`|`less`|`html`。
+ --lookup - 是否向上级目录下查找配置文件并按就近优先原则合并，默认为 true，向上查找。
