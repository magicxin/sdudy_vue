(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Seed = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports = {
    text: function (el, value) {
        el.textContent = value || '';
    },
    show: function (el, value) {
        el.style.display = value ? '' : 'none';
    },
    class: function (el, value, classname) {
        el.classList[value ? 'add' : 'remove'](classname);
    },
    on: {
        update: function (el, handler, event, directive) {
            if (!directive.handlers) {
                directive.handlers = {};
            }
            var handlers = directive.handlers;
            if (handlers[event]) {
                el.removeEventListener(event, handlers[event]);
            }
            if (handler) {
                handler = handler.bind(el);
                el.addEventListener(event, handler);
                handlers[event] = handler;
            }
        },
        unbind: function (el, event, directive) {
            if (directive.handlers) {
                el.removeEventListener(event, directive.handlers[event]);
            }
        },
        customFilter: function (handler, selectors) {
            return function (e) {
                var match = selectors.every(function (selector) {
                    return e.target.webkitMatchesSelector(selector);
                });
                if (match) handler.apply(this, arguments);
            };
        }
    }
};
},{}],2:[function(require,module,exports){
module.exports = {
    capitalize: function (value) {
        value = value.toString();
        return value.charAt(0).toUpperCase() + value.slice(1);
    }
};
},{}],3:[function(require,module,exports){
var prefix      = 'sd',
    Filters     = require('./filters'),
    Directives  = require('./directives'),
    selector    = Object.keys(Directives).map(function (d) {
        return '[' + prefix + '-' + d + ']';
    }).join();

function Seed (opts) {

    var self = this,
        root = this.el = document.getElementById(opts.id),
        els  = root.querySelectorAll(selector),
        bindings = {}; // internal real data

    self.scope = {}; // external interface

    // process nodes for directives
    ;[].forEach.call(els, processNode);
    processNode(root);

    // initialize all variables by invoking setters
    for (var key in bindings) {
        self.scope[key] = opts.scope[key];
    }

    function processNode (el) {
        cloneAttributes(el.attributes).forEach(function (attr) {
            var directive = parseDirective(attr);
            if (directive) {
                bindDirective(self, el, bindings, directive);
            }
        });
    }
}

// clone attributes so they don't change
function cloneAttributes (attributes) {
    return [].map.call(attributes, function (attr) {
        return {
            name: attr.name,
            value: attr.value
        };
    });
}

function bindDirective (seed, el, bindings, directive) {
    el.removeAttribute(directive.attr.name);
    var key = directive.key,
        binding = bindings[key];
    if (!binding) {
        bindings[key] = binding = {
            value: undefined,
            directives: []
        };
    }
    directive.el = el;
    binding.directives.push(directive);
    // invoke bind hook if exists
    if (directive.bind) {
        directive.bind(el, binding.value);
    }
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

function parseDirective (attr) {

    if (attr.name.indexOf(prefix) === -1) return;

    // parse directive name and argument
    var noprefix = attr.name.slice(prefix.length + 1),
        argIndex = noprefix.indexOf('-'),
        dirname  = argIndex === -1 ? noprefix : noprefix.slice(0, argIndex),
        def = Directives[dirname],
        arg = argIndex === -1 ? null : noprefix.slice(argIndex + 1);

    // parse scope variable key and pipe filters
    var exp = attr.value,
        pipeIndex = exp.indexOf('|'),
        key = pipeIndex === -1 ? exp.trim() : exp.slice(0, pipeIndex).trim(),
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

module.exports = {
    create: function (opts) {
        return new Seed(opts);
    },
    filters: Filters,
    directives: Directives
};
},{"./directives":1,"./filters":2}]},{},[3])(3)
});
