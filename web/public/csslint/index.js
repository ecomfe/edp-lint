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
        +   '<article><header><i data-cmd="switch-view" class="fa fa-code"></i>${info.path}</header><ul class="info-list">'
        +   '<!-- for: ${info.errors} as ${msg} -->'
        +     '<!-- var: type = ${msg.severity} === 1 ? "warning" : "error" -->'
        +     '<li><span class="label label-${type}">${type}</span>'
        +     '<i class="label"><!-- if: ${msg.line} -->line: ${msg.line} col: ${msg.column}<!-- else -->common<!-- /if --></i>'
        +     '${msg.message}<b>${msg.rule}</b></li>'
        +   '<!-- /for -->'
        +   '</ul>'
        +   '<div class="code-panel" style="display:none">'
        +     '<ul class="info-tip" id="code-info-tip-${index}">'
        +     '<!-- var: lenArr = new Array(${info.code}.replace(/\\n$/,"").split("\\n").length) -->'
        +     '<!-- for: ${lenArr} as ${nomean}, ${i} -->'
        +       '<!-- var: index = ${i} - 0 + 1 -->'
        +       '<li>${index}</li>'
        +     '<!-- /for -->'
        +     '</ul>'
        +     '<pre>${info.code}</pre>'
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

                for (var i = 0, l = data.length; i < l; i++) {
                    var tipRendered = {};
                    var tipLis = document.getElementById('code-info-tip-' + i)
                        .getElementsByTagName('li');
                    var messages = data[i].errors;

                    for (var j = 0, ml = messages.length; j < ml; j++) {
                        var info = messages[j];
                        var line = info.line;
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
            }
        });

        return false;
    }

    function switchView(e) {
        e = e || window.event;
        var target = e.target || e.srcElement;

        if (target.getAttribute('data-cmd') === 'switch-view') {
            var wrap = target.parentNode.parentNode;
            var listWrap = wrap.getElementsByTagName('ul')[0];
            var codeWrap = wrap.getElementsByTagName('div')[0];;
            if (target.className.indexOf('fa-code') > 0) {
                target.className = 'fa fa-list';
                listWrap.style.display = 'none';
                codeWrap.style.display = '';
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
            getSpecialForm().onclick = null;
            getResultPanel().onclick = null;
        }
    };
});
