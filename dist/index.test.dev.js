"use strict";

var _postcss = _interopRequireDefault(require("postcss"));

var _ = _interopRequireDefault(require("."));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// Jasmine unit tests
// To run tests, run these commands from the project root:
// 1. `npm install -g jasmine-node`
// 2. `jasmine-node spec`

/* global describe, it, expect */
var basicCSS = '.rule { font-size: 0.9375rem }';

var filterPropList = require('./lib/filter-prop-list');

describe('rem multiplier', function () {
  it('should work with a multiplier input', function () {
    var input = '.rule { font-size: 1rem; }';
    var options = {
      multiplier: 1.6
    };
    var output = '.rule { font-size: 1.6rem; }';
    var processed = (0, _postcss["default"])((0, _["default"])(options)).process(input).css;
    expect(processed).toBe(output);
  });
  it('should have same output with no multiplier', function () {
    var input = 'h1 { margin: 0 0 20px; font-size: 3.2rem; line-height: 1.2; letter-spacing: 0.0625rem; }';
    var output = 'h1 { margin: 0 0 20px; font-size: 3.2rem; line-height: 1.2; letter-spacing: 0.0625rem; }';
    var processed = (0, _postcss["default"])((0, _["default"])()).process(input).css;
    expect(processed).toBe(output);
  });
  it('should ignore px properties', function () {
    var expected = '.rule { font-size: 2px }';
    var processed = (0, _postcss["default"])((0, _["default"])()).process(expected).css;
    expect(processed).toBe(expected);
  });
  it('should handle < 1 values and values without a leading 0', function () {
    var rules = '.rule { margin: 0.5px .03125rem -0.0125rem -.2em }';
    var expected = '.rule { margin: 0.5px 0.03125rem -0.0125rem -.2em }';
    var options = {
      propList: ['margin']
    };
    var processed = (0, _postcss["default"])((0, _["default"])(options)).process(rules).css;
    expect(processed).toBe(expected);
  });
  it('should remain unitless if 0', function () {
    var expected = '.rule { font-size: 0rem; font-size: 0; }';
    var processed = (0, _postcss["default"])((0, _["default"])()).process(expected).css;
    expect(processed).toBe(expected);
  });
  describe('value parsing', function () {
    it('should not replace values in double quotes or single quotes', function () {
      var options = {
        propList: ['*'],
        multiplier: 1.5
      };
      var rules = '.rule { content: \'1rem\'; font-family: "1rem"; font-size: 1rem; }';
      var expected = '.rule { content: \'1rem\'; font-family: "1rem"; font-size: 1.5rem; }';
      var processed = (0, _postcss["default"])((0, _["default"])(options)).process(rules).css;
      expect(processed).toBe(expected);
    });
    it('should not replace values in `url()`', function () {
      var options = {
        propList: ['*'],
        multiplier: 1.5
      };
      var rules = '.rule { background: url(1rem.jpg); font-size: 1rem; }';
      var expected = '.rule { background: url(1rem.jpg); font-size: 1.5rem; }';
      var processed = (0, _postcss["default"])((0, _["default"])(options)).process(rules).css;
      expect(processed).toBe(expected);
    });
    it('should not replace values with an uppercase R or REM', function () {
      var options = {
        propList: ['*'],
        multiplier: 1.5
      };
      var rules = '.rule { margin: 0.75rem calc(100% - 14REM); height: calc(100% - 1.25rem); font-size: 12Rem; line-height: 1rem; }';
      var expected = '.rule { margin: 1.125rem calc(100% - 14REM); height: calc(100% - 1.875rem); font-size: 12Rem; line-height: 1.5rem; }';
      var processed = (0, _postcss["default"])((0, _["default"])(options)).process(rules).css;
      expect(processed).toBe(expected);
    });
  });
  describe('unitPrecision', function () {
    it('should replace using a decimal of 2 places', function () {
      var rules = '.rule { font-size: 0.534375rem }';
      var expected = '.rule { font-size: 0.53rem }';
      var options = {
        unitPrecision: 2
      };
      var processed = (0, _postcss["default"])((0, _["default"])(options)).process(rules).css;
      expect(processed).toBe(expected);
    });
  });
  describe('propList', function () {
    it('should only replace properties in the prop list', function () {
      var rules = '.rule { font-size: 1rem; margin: 1rem; margin-left: 0.5rem; padding: 0.5rem; padding-right: 1rem }';
      var expected = '.rule { font-size: 1.2rem; margin: 1.2rem; margin-left: 0.5rem; padding: 0.5rem; padding-right: 1.2rem }';
      var options = {
        propList: ['*font*', 'margin*', '!margin-left', '*-right', 'pad'],
        multiplier: 1.2
      };
      var processed = (0, _postcss["default"])((0, _["default"])(options)).process(rules).css;
      expect(processed).toBe(expected);
    });
    it('should only replace properties in the prop list with wildcard', function () {
      var rules = '.rule { font-size: 1rem; margin: 1rem; margin-left: 0.5rem; padding: 0.5rem; padding-right: 1rem }';
      var expected = '.rule { font-size: 1rem; margin: 1.2rem; margin-left: 0.5rem; padding: 0.5rem; padding-right: 1rem }';
      var options = {
        propList: ['*', '!margin-left', '!*padding*', '!font*'],
        multiplier: 1.2
      };
      var processed = (0, _postcss["default"])((0, _["default"])(options)).process(rules).css;
      expect(processed).toBe(expected);
    });
    it('should replace all properties when white list is wildcard', function () {
      var rules = '.rule { margin: 1rem; font-size: 0.9375rem }';
      var expected = '.rule { margin: 1.2rem; font-size: 1.125rem }';
      var options = {
        propList: ['*'],
        multiplier: 1.2
      };
      var processed = (0, _postcss["default"])((0, _["default"])(options)).process(rules).css;
      expect(processed).toBe(expected);
    });
  });
  describe('selectorBlackList', function () {
    it('should ignore selectors in the selector black list', function () {
      var rules = '.rule { font-size: 0.9375rem } .rule2 { font-size: 15rem }';
      var expected = '.rule { font-size: 1.125rem } .rule2 { font-size: 15rem }';
      var options = {
        selectorBlackList: ['.rule2'],
        multiplier: 1.2
      };
      var processed = (0, _postcss["default"])((0, _["default"])(options)).process(rules).css;
      expect(processed).toBe(expected);
    });
    it('should ignore every selector with `body$`', function () {
      var rules = 'body { font-size: 1rem; } .class-body$ { font-size: 16rem; } .simple-class { font-size: 1rem; }';
      var expected = 'body { font-size: 1.2rem; } .class-body$ { font-size: 16rem; } .simple-class { font-size: 1.2rem; }';
      var options = {
        selectorBlackList: ['body$'],
        multiplier: 1.2
      };
      var processed = (0, _postcss["default"])((0, _["default"])(options)).process(rules).css;
      expect(processed).toBe(expected);
    });
    it('should only ignore exactly `body`', function () {
      var rules = 'body { font-size: 16rem; } .class-body { font-size: 1rem; } .simple-class { font-size: 1rem; }';
      var expected = 'body { font-size: 16rem; } .class-body { font-size: 1.2rem; } .simple-class { font-size: 1.2rem; }';
      var options = {
        selectorBlackList: [/^body$/],
        multiplier: 1.2
      };
      var processed = (0, _postcss["default"])((0, _["default"])(options)).process(rules).css;
      expect(processed).toBe(expected);
    });
  });
  describe('mediaQuery', function () {
    it('should multiply rem in media queries', function () {
      var rules = '@media (min-width: 31.25rem) { .rule { font-size: 1rem } }';
      var expected = '@media (min-width: 37.5rem) { .rule { font-size: 1.2rem } }';
      var options = {
        mediaQuery: true,
        multiplier: 1.2
      };
      var processed = (0, _postcss["default"])((0, _["default"])(options)).process(rules).css;
      expect(processed).toBe(expected);
    });
  });
  describe('filter-prop-list', function () {
    it('should find "exact" matches from propList', function () {
      var propList = ['font-size', 'margin', '!padding', '*border*', '*', '*y', '!*font*'];
      var expected = 'font-size,margin';
      expect(filterPropList.exact(propList).join()).toBe(expected);
    });
    it('should find "contain" matches from propList and reduce to string', function () {
      var propList = ['font-size', '*margin*', '!padding', '*border*', '*', '*y', '!*font*'];
      var expected = 'margin,border';
      expect(filterPropList.contain(propList).join()).toBe(expected);
    });
    it('should find "start" matches from propList and reduce to string', function () {
      var propList = ['font-size', '*margin*', '!padding', 'border*', '*', '*y', '!*font*'];
      var expected = 'border';
      expect(filterPropList.startWith(propList).join()).toBe(expected);
    });
    it('should find "end" matches from propList and reduce to string', function () {
      var propList = ['font-size', '*margin*', '!padding', 'border*', '*', '*y', '!*font*'];
      var expected = 'y';
      expect(filterPropList.endWith(propList).join()).toBe(expected);
    });
    it('should find "not" matches from propList and reduce to string', function () {
      var propList = ['font-size', '*margin*', '!padding', 'border*', '*', '*y', '!*font*'];
      var expected = 'padding';
      expect(filterPropList.notExact(propList).join()).toBe(expected);
    });
    it('should find "not contain" matches from propList and reduce to string', function () {
      var propList = ['font-size', '*margin*', '!padding', '!border*', '*', '*y', '!*font*'];
      var expected = 'font';
      expect(filterPropList.notContain(propList).join()).toBe(expected);
    });
    it('should find "not start" matches from propList and reduce to string', function () {
      var propList = ['font-size', '*margin*', '!padding', '!border*', '*', '*y', '!*font*'];
      var expected = 'border';
      expect(filterPropList.notStartWith(propList).join()).toBe(expected);
    });
    it('should find "not end" matches from propList and reduce to string', function () {
      var propList = ['font-size', '*margin*', '!padding', '!border*', '*', '!*y', '!*font*'];
      var expected = 'y';
      expect(filterPropList.notEndWith(propList).join()).toBe(expected);
    });
  });
});