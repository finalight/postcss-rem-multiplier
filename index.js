import postcss from 'postcss';
import remRegex from './lib/rem-unit-regex';
import {
  exact,
  contain,
  endWith,
  startWith,
  notEndWith,
  notExact,
  notStartWith,
  notContain,
} from './lib/filter-prop-list';

const createRemReplace = () => {
  return (m, $1) => {
    if (!$1) return m;
    return `${$1 * 1.6}rem`;
  };
};

const declarationExists = (decls, prop, value) => {
  return decls.some((decl) => {
    return decl.prop === prop && decl.value === value;
  });
};

const blacklistedSelector = (blacklist, selector) => {
  if (typeof selector !== 'string') return null;
  return blacklist.some((regex) => {
    if (typeof regex === 'string') return selector.indexOf(regex) !== -1;
    return selector.match(regex);
  });
};

const createPropListMatcher = (propList) => {
  const hasWild = propList.indexOf('*') > -1;
  const matchAll = hasWild && propList.length === 1;
  const lists = {
    exact: exact(propList),
    contain: contain(propList),
    startWith: startWith(propList),
    endWith: endWith(propList),
    notExact: notExact(propList),
    notContain: notContain(propList),
    notStartWith: notStartWith(propList),
    notEndWith: notEndWith(propList),
  };

  return (prop) => {
    if (matchAll) return true;
    return (
      (hasWild ||
        lists.exact.indexOf(prop) > -1 ||
        lists.contain.some((m) => {
          return prop.indexOf(m) > -1;
        }) ||
        lists.startWith.some((m) => {
          return prop.indexOf(m) === 0;
        }) ||
        lists.endWith.some((m) => {
          return prop.indexOf(m) === prop.length - m.length;
        })) &&
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
};

module.exports = (options = {}) => {
  const defaults = {
    rootValue: 16,
    unitPrecision: 5,
    selectorBlackList: [],
    propList: ['font', 'font-size', 'line-height', 'letter-spacing'],
    replace: true,
    mediaQuery: false,
    minRemValue: 0,
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
        decl.parent.insertAfter(i, decl.clone({ value }));
      }
    });

    if (opts.mediaQuery) {
      css.walkAtRules('media', (rule) => {
        if (rule.params.indexOf('rem') === -1) return;
        rule.params = rule.params.replace(remRegex, remReplace);
      });
    }
  };
};

module.exports.postcss = true;
