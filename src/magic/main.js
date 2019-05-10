var prefix = 'sd',
    Directives = require('./directives'),
    Filters = require('./filters'),
    selector = Object.keys(Directives).map(function(d) {
        return '[' + prefix + '-' + d + ']';
    }).join();
function Seed(opt) {
    var root = document.getElementById('test');
    var self = this;
    // selector 是一个由选择器组成，由 , 分割的字符串，querySelectorAll 的返回值是一个静态 nodeList 
    var els = root.querySelectorAll(selector);
    var bindings = {}; // internal real data
    self.scope = {}; // external interface
    [].forEach.call(els, processNode);
    // 父节点也需要判断
    processNode(root);

    // initialize all variables by invoking setters
    for (var key in bindings) {
        self.scope[key] = opt.scope[key];
    }

    function processNode(el) {
        [].forEach.call(el.attributes, function(attr) {
            // 获取所有含有指令的节点
            var directive = parseDirective(attr);
            if (directive) {
                bindDirective(self, el, bindings, directive);
            }
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
        return def ? {
            attr: attr,
            key: key,
            filters: filters,
            definition: def,
            argument: arg,
            update: typeof def === 'function' ? def : def.update
        } : null;
    }
    function bindDirective (seed, el, bindings, directive) {
        // 移除临时的节点选择器
        el.removeAttribute(directive.attr.name);
        var key = directive.key,
        binding = bindings[key]; // undefined
        if (!binding) {
            bindings[key] = binding = {
                value: undefined,
                directives: []
            };
        }
        directive.el = el;
        binding.directives.push(directive);
        if (!seed.scope.hasOwnProperty(key)) {
            bindAccessors(seed, key, binding);
        }
    }
    function bindAccessors (seed, key, binding) {
        Object.defineProperty(seed.scope, key, {
            get: function () {
                return binding.value;
            },
            set: function (value) {
                binding.value = value;
                binding.directives.forEach(function (directive) {
                    if (value && directive.filters) {
                        value = applyFilters(value, directive);
                    }
                    // 执行指令方法
                    directive.update(
                        directive.el,
                        value,
                        directive.argument,
                        directive,
                        seed
                    );
                });
            }
        });
    }
    function applyFilters (value, directive) {
        if (directive.definition.customFilter) {
            return directive.definition.customFilter(value, directive.filters);
        } else {
            directive.filters.forEach(function (filter) {
                if (Filters[filter]) {
                    value = Filters[filter](value);
                }
            });
            return value;
        }
    }
}

module.exports = {
    create: function(opt) {
        return new Seed(opt);
    },
    directives: Directives
};