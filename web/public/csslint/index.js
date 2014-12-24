define(function (require) {
    function getStartButton() {
        return document.getElementById('lint-start');
    }

    function getResultPanel() {
        return document.getElementById('lint-result');
    }

    var resultTpl = ''
        + '<!-- for: ${data} as ${info}, ${index} -->'
        +   '<article><header><i data-cmd="switch-view" class="fa fa-code"></i>${info.path}</header><ul class="info-list">'
        +   '<!-- for: ${info.messages} as ${msg} -->'
        +     '<li><span class="label label-${msg.type}">${msg.type}</span>'
        +     '<i class="label"><!-- if: ${msg.line} -->line: ${msg.line} col: ${msg.col}<!-- else -->common<!-- /if --></i>'
        +     '${msg.message}</li>'
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


    function startLint() {
        var btn = this;
        btn.disabled = true;

        var cwd = require('partial/cwd').get();

        $.ajax({
            method: 'POST',
            url: '/edp-lint/css',
            data: {
                cwd: cwd
            },
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
                    var messages = data[i].messages;

                    for (var j = 0, ml = messages.length; j < ml; j++) {
                        var info = messages[j];
                        var line = info.line;
                        if (line) {
                            if (!tipRendered[line]) {
                                var lineNum = line - 1;
                                var tipLi = tipLis[lineNum];
                                tipLi.className = 'tip-' + info.type;
                                tipLi.innerHTML = line + '<i>' + info.message + '</i>';
                            }

                            tipRendered[line] = 1;
                        }
                    }
                }
            }
        });
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
            getStartButton().onclick = startLint;
            getResultPanel().onclick = switchView;
        },

        unload: function () {
            getStartButton().onclick = null;
            getResultPanel().onclick = null;
        }
    };
});
