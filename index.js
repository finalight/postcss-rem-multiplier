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

const toFixed = (number, precision) => {
  const multiplier = 10 ** (precision + 1);
  const wholeNumber = Math.floor(number * multiplier);
  return (Math.round(wholeNumber / 10) * 10) / multiplier;
};

const createRemReplace = (multiplier, unitPrecision) => {
  return (m, $1) => {
    if (!$1) return m;
    const value = toFixed(`${$1 * multiplier}`, unitPrecision);
    return `${value}rem`;
  };
};

const blacklistedSelector = (blacklist, selector) => {
  if (typeof selector !== 'string') return null;
  return blacklist.some((regex) => {
    if (typeof regex === 'string') {
      return selector.indexOf(regex) !== -1;
    }
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
    selectorBlackList: [],
    propList: ['font', 'font-size', 'line-height', 'letter-spacing'],
    mediaQuery: false,
    multiplier: 1,
    unitPrecision: 5,
  };

  const opts = { ...defaults, ...options };
  const remReplace = createRemReplace(opts.multiplier, opts.unitPrecision);

  const satisfyPropList = createPropListMatcher(opts.propList);

  return (css) => {
    css.walkDecls((decl, i) => {
      // This should be the fastest test and will remove most declarations

      if (
        decl.value.indexOf('rem') === -1 ||
        !satisfyPropList(decl.prop) ||
        blacklistedSelector(opts.selectorBlackList, decl.parent.selector)
      ) {
        return;
      }

      const value = decl.value.replace(remRegex, remReplace);
      decl.value = value;
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
