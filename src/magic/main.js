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