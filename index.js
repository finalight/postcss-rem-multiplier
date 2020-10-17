'use strict';

const postcss = require('postcss');
const remRegex = require('./lib/rem-unit-regex');
const filterPropList = require('./lib/filter-prop-list');

module.exports = postcss.plugin('postcss-rem-multiplier', (options) => {

    const defaults = {
        rootValue: 16,
        unitPrecision: 5,
        selectorBlackList: [],
        propList: ['font', 'font-size', 'line-height', 'letter-spacing'],
        replace: true,
        mediaQuery: false,
        minRemValue: 0
    };

    const opts = Object.assign(defaults, options);
    const remReplace = createRemReplace(opts.rootValue, opts.unitPrecision, opts.minRemValue);

    const satisfyPropList = createPropListMatcher(opts.propList);

    return (css) => {

        css.walkDecls((decl, i) => {
            // This should be the fastest test and will remove most declarations
            if (decl.value.indexOf('rem') === -1) return;

            if (!satisfyPropList(decl.prop)) return;

            if (blacklistedSelector(opts.selectorBlackList, decl.parent.selector)) return;

            const value = decl.value.replace(remRegex, remReplace);

            // if px unit already exists, do not add or replace
            if (declarationExists(decl.parent, decl.prop, value)) return;

            if (opts.replace) {
                decl.value = value;
            } else {
                decl.parent.insertAfter(i, decl.clone({ value: value }));
            }
        });

        if (opts.mediaQuery) {
            css.walkAtRules('media', (rule) => {
                if (rule.params.indexOf('rem') === -1) return;
                rule.params = rule.params.replace(remRegex, remReplace);
            });
        }

    };
});

const createRemReplace = (rootValue, unitPrecision, minRemValue) => {
    return (m, $1) => {
        if (!$1) return m;
        return ($1 * 1.6) + 'rem'
    };
}

const declarationExists = (decls, prop, value) => {
    return decls.some((decl) => {
        return (decl.prop === prop && decl.value === value);
    });
}

const blacklistedSelector = (blacklist, selector) => {
    if (typeof selector !== 'string') return;
    return blacklist.some((regex) => {
        if (typeof regex === 'string') return selector.indexOf(regex) !== -1;
        return selector.match(regex);
    });
}

const createPropListMatcher = (propList) => {
    const hasWild = propList.indexOf('*') > -1;
    const matchAll = (hasWild && propList.length === 1);
    const lists = {
        exact: filterPropList.exact(propList),
        contain: filterPropList.contain(propList),
        startWith: filterPropList.startWith(propList),
        endWith: filterPropList.endWith(propList),
        notExact: filterPropList.notExact(propList),
        notContain: filterPropList.notContain(propList),
        notStartWith: filterPropList.notStartWith(propList),
        notEndWith: filterPropList.notEndWith(propList)
    };
    return (prop) => {
        if (matchAll) return true;
        return (
            (
                hasWild ||
                lists.exact.indexOf(prop) > -1 ||
                lists.contain.some((m) => {
                    return prop.indexOf(m) > -1;
                }) ||
                lists.startWith.some((m) => {
                    return prop.indexOf(m) === 0;
                }) ||
                lists.endWith.some((m) => {
                    return prop.indexOf(m) === prop.length - m.length;
                })
            ) &&
            !(
                lists.notExact.indexOf(prop) > -1 ||
                lists.notContain.some((m) => {
                    return prop.indexOf(m) > -1;
                }) ||
                lists.notStartWith.some((m) => {
                    return prop.indexOf(m) === 0;
                }) ||
                lists.notEndWith.some((m) => {
                    return prop.indexOf(m) === prop.length - m.length;
                })
            )
        );
    };
}
