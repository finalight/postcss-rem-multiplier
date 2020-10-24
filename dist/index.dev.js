"use strict";

var _remUnitRegex = _interopRequireDefault(require("./lib/rem-unit-regex"));

var _filterPropList = require("./lib/filter-prop-list");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var toFixed = function toFixed(number, precision) {
  var multiplier = Math.pow(10, precision + 1);
  var wholeNumber = Math.floor(number * multiplier);
  return Math.round(wholeNumber / 10) * 10 / multiplier;
};

var createRemReplace = function createRemReplace(multiplier, unitPrecision) {
  return function (m, $1) {
    if (!$1) return m;
    var value = toFixed("".concat($1 * multiplier), unitPrecision);
    return "".concat(value, "rem");
  };
};

var blacklistedSelector = function blacklistedSelector(blacklist, selector) {
  if (typeof selector !== 'string') return null;
  return blacklist.some(function (regex) {
    if (typeof regex === 'string') {
      return selector.indexOf(regex) !== -1;
    }

    return selector.match(regex);
  });
};

var createPropListMatcher = function createPropListMatcher(propList) {
  var hasWild = propList.indexOf('*') > -1;
  var matchAll = hasWild && propList.length === 1;
  var lists = {
    exact: (0, _filterPropList.exact)(propList),
    contain: (0, _filterPropList.contain)(propList),
    startWith: (0, _filterPropList.startWith)(propList),
    endWith: (0, _filterPropList.endWith)(propList),
    notExact: (0, _filterPropList.notExact)(propList),
    notContain: (0, _filterPropList.notContain)(propList),
    notStartWith: (0, _filterPropList.notStartWith)(propList),
    notEndWith: (0, _filterPropList.notEndWith)(propList)
  };
  return function (prop) {
    if (matchAll) return true;
    return (hasWild || lists.exact.indexOf(prop) > -1 || lists.contain.some(function (m) {
      return prop.indexOf(m) > -1;
    }) || lists.startWith.some(function (m) {
      return prop.indexOf(m) === 0;
    }) || lists.endWith.some(function (m) {
      return prop.indexOf(m) === prop.length - m.length;
    })) && !(lists.notExact.indexOf(prop) > -1 || lists.notContain.some(function (m) {
      return prop.indexOf(m) > -1;
    }) || lists.notStartWith.some(function (m) {
      return prop.indexOf(m) === 0;
    }) || lists.notEndWith.some(function (m) {
      return prop.indexOf(m) === prop.length - m.length;
    }));
  };
};

module.exports = function () {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var defaults = {
    selectorBlackList: [],
    propList: ['font', 'font-size', 'line-height', 'letter-spacing'],
    mediaQuery: false,
    multiplier: 1,
    unitPrecision: 5
  };

  var opts = _objectSpread({}, defaults, {}, options);

  var remReplace = createRemReplace(opts.multiplier, opts.unitPrecision);
  var satisfyPropList = createPropListMatcher(opts.propList);
  return function (css) {
    css.walkDecls(function (decl, i) {
      // This should be the fastest test and will remove most declarations
      if (decl.value.indexOf('rem') === -1 || !satisfyPropList(decl.prop) || blacklistedSelector(opts.selectorBlackList, decl.parent.selector)) {
        return;
      }

      var value = decl.value.replace(_remUnitRegex["default"], remReplace);
      decl.value = value;
    });

    if (opts.mediaQuery) {
      css.walkAtRules('media', function (rule) {
        if (rule.params.indexOf('rem') === -1) return;
        rule.params = rule.params.replace(_remUnitRegex["default"], remReplace);
      });
    }
  };
};

module.exports.postcss = true;