lint
---------

### Usage

    edp lint [path] [--type=js|css|less|html]

    edp lint --type=js
    edp lint --type=css,less
    edp lint src/css --type=less
    edp lint *.js
    edp lint *.css
    edp lint *.html

### Options

+ --type - 指定校验器类型，可以指定一个或多个，以半角逗号隔开。目前可用的校验器类型有 `js`|`css`|`less`|`html`。
