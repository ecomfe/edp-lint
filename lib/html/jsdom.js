/**
 * @file simple dom simulation
 * @author chris[wfsr@foxmail.com]
 */
var nwmatcher = require('./selector');

var NodeType = {
    ELEMENT_NODE: 1,
    ATTRIBUTE_NODE: 2,
    TEXT_NODE: 3,
    CDATA_SECTION_NODE: 4,
    COMMENT_NODE: 8,
    DOCUMENT_NODE: 9
};

function appendChild(child) {
    child.parentNode = this;
    this.childNodes.push(child);
}

function createTextNode(text) {
    return {
        ownerDocument: this,
        nodeName: '#text',
        nodeValue: text || '',
        nodeType: NodeType.TEXT_NODE
    };
}

function createComment(text) {
    return {
        ownerDocument: this,
        nodeName: '#comment',
        nodeValue: text || '',
        nodeType: NodeType.COMMENT_NODE
    };
}

function addEventListener(){}
function createElement(tag) {
    tag = tag.toUpperCase();
    return {
        form: {'INPUT': 1, 'BUTTON': 1, 'SELECT': 1, 'TEXTAREA': 1}[tag],
        ownerDocument: this,
        tagName: tag,
        nodeName: tag,
        nodeType: NodeType.ELEMENT_NODE,
        nodeValue: '',
        childNodes: [],
        addEventListener: addEventListener,
        getElementsByTagName: getElementsByTagName,
        querySelectorAll: querySelectorAll,
        appendChild: appendChild,
        hasAttribute: hasAttribute,
        getAttribute: getAttribute,
        setAttribute: setAttribute,
        getAttributeNode: getAttributeNode,
        attributes: {}
    };
}

function hasAttribute(name) {
    return name in this.attributes;
}

function getAttribute(name) {
    return this.attributes[name];
}

function getAttributeNode(name) {
    return this.attributes[name] || {};
}

var INDEXS = {};
function setAttribute(name, value) {
    if (name === 'id') {
        INDEXS[value] = this;
    }
    this[{'class': 'className', 'for': 'htmlFor'}[name] || name] = value;
    return this.attributes[name] = {
        name: name,
        value: value,
        toString: function () {
            return this.value;
        }
    };
}

function getNodes(nodes, result, filter) {
    for (var i = 0, node; node = nodes[i++];) {
        if (node.nodeType === NodeType.ELEMENT_NODE) {
            if (!filter || filter(node)) {
                result.push(node);
            }
            if (node.childNodes.length) {
                getNodes(node.childNodes, result, filter);
            }
        }
    }
    return result;
}

function getElementsByTagName(tag) {
    return getNodes(
        this.childNodes,
        [],
        tag !== '*'
            && function (el) {
                return el.tagName === tag.toUpperCase();
            }
    );
}

function addNwmatcher(document) {
  if (!document._nwmatcher) {
    var dom = nwmatcher({ document: document });
    dom.saveResults = function (original, from, doc, elements) {
        from.__cached = from.__cached || {};
        from.__cached[original] = elements;
    };
    dom.loadResults = function (original, from, doc, root) {
        return from.__cached && from.__cached[original];
    };
    dom.configure({ UNIQUE_ID: true, CACHING: true });
    document._nwmatcher = dom;
  }
  return document._nwmatcher;
}

function querySelectorAll(selector) {
    return addNwmatcher(this.ownerDocument).select(selector, this)
}

function extend(src, target) {
    for (var key in target) {
        if (target.hasOwnProperty(key)) {
            src[key] = target[key];
        }
    }
    return src;
}

exports.jsdom = function () {
    var doc = createElement('html');
    doc.documentElement = doc,
    doc.ownerDocument = doc,
    extend(doc, {
        nodeType: NodeType.DOCUMENT_NODE,
        createElement: createElement,
        createTextNode: createTextNode,
        createComment: createComment
    });

    extend(doc, NodeType);

    return doc;
};