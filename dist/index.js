"use strict";

var _remUnitRegex = _interopRequireDefault(require("./lib/rem-unit-regex"));

var _filterPropList = require("./lib/filter-prop-list");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const toFixed = (number, precision) => {
  const multiplier = 10 ** (precision + 1);
  const wholeNumber = Math.floor(number * multiplier);
  return Math.round(wholeNumber / 10) * 10 / multiplier;
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
  return blacklist.some(regex => {
    if (typeof regex === 'string') {
      return selector.indexOf(regex) !== -1;
    }

    return selector.match(regex);
  });
};

const createPropListMatcher = propList => {
  const hasWild = propList.indexOf('*') > -1;
  const matchAll = hasWild && propList.length === 1;
  const lists = {
    exact: (0, _filterPropList.exact)(propList),
    contain: (0, _filterPropList.contain)(propList),
    startWith: (0, _filterPropList.startWith)(propList),
    endWith: (0, _filterPropList.endWith)(propList),
    notExact: (0, _filterPropList.notExact)(propList),
    notContain: (0, _filterPropList.notContain)(propList),
    notStartWith: (0, _filterPropList.notStartWith)(propList),
    notEndWith: (0, _filterPropList.notEndWith)(propList)
  };
  return prop => {
    if (matchAll) return true;
    return (hasWild || lists.exact.indexOf(prop) > -1 || lists.contain.some(m => {
      return prop.indexOf(m) > -1;
    }) || lists.startWith.some(m => {
      return prop.indexOf(m) === 0;
    }) || lists.endWith.some(m => {
      return prop.indexOf(m) === prop.length - m.length;
    })) && !(lists.notExact.indexOf(prop) > -1 || lists.notContain.some(m => {
      return prop.indexOf(m) > -1;
    }) || lists.notStartWith.some(m => {
      return prop.indexOf(m) === 0;
    }) || lists.notEndWith.some(m => {
      return prop.indexOf(m) === prop.length - m.length;
    }));
  };
};

module.exports = (options = {}) => {
  const defaults = {
    selectorBlackList: [],
    propList: ['font', 'font-size', 'line-height', 'letter-spacing'],
    mediaQuery: false,
    multiplier: 1,
    unitPrecision: 5
  };
  const opts = { ...defaults,
    ...options
  };
  const remReplace = createRemReplace(opts.multiplier, opts.unitPrecision);
  const satisfyPropList = createPropListMatcher(opts.propList);
  return css => {
    css.walkDecls((decl, i) => {
      // This should be the fastest test and will remove most declarations
      if (decl.value.indexOf('rem') === -1 || !satisfyPropList(decl.prop) || blacklistedSelector(opts.selectorBlackList, decl.parent.selector)) {
        return;
      }

      const value = decl.value.replace(_remUnitRegex.default, remReplace);
      decl.value = value;
    });

    if (opts.mediaQuery) {
      css.walkAtRules('media', rule => {
        if (rule.params.indexOf('rem') === -1) return;
        rule.params = rule.params.replace(_remUnitRegex.default, remReplace);
      });
    }
  };
};

module.exports.postcss = true;