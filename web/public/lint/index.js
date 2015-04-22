/**
 * @file  代码检查专属模块
 * @author chris[wfsr@foxmail.com]
 * @author errorrik[errorrik@gmail.com]
 */

define(function (require) {
    function getSpecialForm() {
        return document.getElementById('special-form');
    }

    function getStartButton() {
        return document.getElementById('lint-start');
    }

    function getResultPanel() {
        return document.getElementById('lint-result');
    }

    var resultTpl = ''
        + '<!-- for: ${data} as ${info}, ${index} -->'
        + '<article>'
        +   '<header>'
        +       '<i data-cmd="switch-view" data-index="${index}" class="fa fa-code"></i>${info.relative}'
        +   '</header>'
        +   '<ul class="info-list">'
        +   '<!-- for: ${info.errors} as ${msg} -->'
        +     '<!-- var: type = ${msg.severity} === 1 ? "warning" : "error" -->'
        +     '<li><span class="label label-${type}">${type}</span>'
        +     '<i class="label">'
        +     '<!-- if: ${msg.line} -->line: ${msg.line} col: ${msg.column}<!-- else -->common<!-- /if -->'
        +     '</i>'
        +     '${msg.message} (<b>${msg.rule}</b>)</li>'
        +   '<!-- /for -->'
        +   '</ul>'
        +   '<div class="code-panel" style="display:none">'
        +     '<ul class="info-tip" id="code-info-tip-${index}"></ul>'
        +     '<pre id="code-info-content-${index}">loading...</pre>'
        +   '</div></article>'
        + '<!-- /for -->';

    var resultRender = require('etpl').compile(resultTpl);

    function getOptions() {
        var form = getSpecialForm();
        var cwd = require('partial/cwd').get();
        var options = {cwd: cwd};

        var name;
        var value;

        $.each($(form).serializeArray(), function (i, pair) {
            name = pair.name;
            value = pair.value;

            options[name] = name in options ? options[name] + ',' + value : value;
        });

        return options;
    }

    var cached;
    function startLint() {
        var btn = getStartButton();
        btn.disabled = true;


        $.ajax({
            method: 'POST',
            url: '/edp-lint/check',
            data: getOptions(),
            dataType: 'json',
            success: function (data) {
                btn.disabled = false;

                var panel = getResultPanel();
                if (!panel) {
                    return;
                }

                panel.innerHTML = resultRender({data: data});

                cached = data;
            }
        });

        return false;
    }

    function renderCode(code, index) {

        $('#code-info-content-' + index).text(code);

        var tipLis = document.getElementById('code-info-tip-' + index);
        var messages = cached[index].errors;

        var lis = '';
        var lines = code.split(/\n/).length;
        for (var i = 1; i <= lines; i++) {
            lis += '<li>' + i + '</li>';
        }

        tipLis.innerHTML = lis;

        tipLis = tipLis.getElementsByTagName('li');

        var tipRendered = {};
        for (var j = 0, info, line; info = messages[j++];) {
            line = info.line;
            if (line) {
                if (!tipRendered[line]) {
                    var lineNum = line - 1;
                    var tipLi = tipLis[lineNum];
                    tipLi.className = 'tip-' + (info.severity === 1 ? 'warning' : 'error');
                    tipLi.innerHTML = line + '<i>' + info.message + '</i>';
                }

                tipRendered[line] = 1;
            }
        }

    }

    function switchView(e) {
        e = e || window.event;
        var target = e.target || e.srcElement;

        if (target.getAttribute('data-cmd') === 'switch-view') {
            var wrap = target.parentNode.parentNode;
            var listWrap = wrap.getElementsByTagName('ul')[0];
            var codeWrap = wrap.getElementsByTagName('div')[0];
            if (target.className.indexOf('fa-code') > 0) {
                target.className = 'fa fa-list';
                listWrap.style.display = 'none';
                codeWrap.style.display = '';

                var index = target.getAttribute('data-index') | 0;

                if (index < 0) {
                    return;
                }

                $.post(
                    '/edp-lint/read',
                    {
                        path: cached[index].path
                    }
                ).done(function (text) {
                    target.setAttribute('data-index', -1);
                    renderCode(text, index);
                });
            }
            else {
                target.className = 'fa fa-code';
                listWrap.style.display = '';
                codeWrap.style.display = 'none';
            }
        }
    }

    return {
        load: function () {
            getSpecialForm().onsubmit = startLint;
            getResultPanel().onclick  = switchView;
        },

        unload: function () {
            cached = null;
            getSpecialForm().onsubmit = null;
            getResultPanel().onclick = null;
        }
    };
});
