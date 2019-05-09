(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Seed = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports = {
    text: function(el, value) {
        el.textContent = value || '';
    },
    show: function(el, value) {
        el.style.display = value ? '' : 'none';
    }
};
},{}],2:[function(require,module,exports){
var prefix = 'sd',
    Directives = require('./directives'),
    selector = Object.keys(Directives).map(function(d) {
        return '[' + prefix + '-' + d + ']';
    }).join();
function Seed(opt) {
    console.log(opt);
    var root = document.getElementById('test');
    // selector 是一个由选择器组成，由 , 分割的字符串，querySelectorAll 的返回值是一个静态 nodeList 
    var els = root.querySelectorAll(selector);
    var bindings = {}; // internal real data
    this.scope = {}; // external interface
    [].forEach.call(els, processNode);
    // 父节点也需要判断
    processNode(root);
    
    function processNode(el) {
        [].forEach.call(el.attributes, function(attr) {
            // 获取所有含有指令的节点
            parseDirective(attr);
        });
    }
    function parseDirective(attr) {
        // 筛选指令
        if(attr.name.indexOf(prefix) === -1) {
            return;
        }
        // 获取实际的指令以及可能的形参 arguments，去掉前缀
        var noprefix = attr.name.slice(prefix.length + 1),
            argIndex = noprefix.indexOf('-'), // 对于 on 指令，会有一个子值
            dirname = argIndex === -1 ? noprefix : noprefix.slice(0, argIndex), // 实际指令
            def = Directives[dirname], // 函数
            arg = argIndex === -1 ? null : noprefix.slice(argIndex + 1);// 形参

        // 获取实际的变量以及可能的拦截器。
        var exp = attr.value,
            pipeIndex = exp.indexOf('|'),
            key = pipeIndex === -1 ? exp.trim() : exp.slice(0, pipeIndex).trim(), // 实际变量
            filters = pipeIndex === -1 ? null : exp.slice(pipeIndex + 1).split('|').map(function (filter) {
                return filter.trim();
            });
        console.log(filters);
        return def ? {} : null;
    }
}

module.exports = {
    create: function(opt) {
        return new Seed(opt);
    },
    directives: Directives
};
},{"./directives":1}]},{},[2])(2)
});
