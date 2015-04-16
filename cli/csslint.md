csslint
---------

### Usage

    edp csslint [path] [optons]

    edp csslint *.css

### Options
+ --color - 是否使用颜色高亮
+ --debug - 是否允许直接抛出 `FECS` 的运行时错误
+ --format - 指定 `check` 命令的结果输出格式，支持 JSON，XML 与 HTML，打开 `silient` 时也不影响输出
+ --ignore - 指定需要忽略的文件模式，多个模式可以使用多个 `--ignore` 指定
+ --lookup - 是否向上级目录下查找配置文件并按就近优先原则合并，默认为 true，向上查找。
+ --maxerr - 每个文件的最大错误数，默认为 0 表示不限制
+ --maxsize - 每个文件的最大字节数，默认为 900K， 0 表示不限制
+ --reporter - 指定 `reporter`，内置可选值只有 `baidu`，当包含 `/` 字符时从当前工作目录查找自定义的 `reporter`实现，其它值按默认处理
+ --rule - 是否在错误信息最后显示对应的校验规则名称
+ --silent - 是否隐藏所有通过 `console.log` 输出的信息
+ --sort - 是否对信息按行列作升序排序
+ --stream - 是否使用 `process.stdin` 作为输入


### Notes

- edp csslint 等同于 edp lint --type=css

`edp-lint@2.0.0` 后使用 `fecs` 实现全部的前端代码检查，访问 [fecs.wiki](https://github.com/ecomfe/fecs/wiki) 获取更多信息。
