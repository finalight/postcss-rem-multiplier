// Jasmine unit tests
// To run tests, run these commands from the project root:
// 1. `npm install -g jasmine-node`
// 2. `jasmine-node spec`

/* global describe, it, expect */

import postcss from 'postcss';
import remToPx from '.';

const basicCSS = '.rule { font-size: 0.9375rem }';
const filterPropList = require('./lib/filter-prop-list');

describe('rem multiplier', () => {
  it('should work on the readme example', () => {
    const input =
      'h1 { margin: 0 0 20px; font-size: 2rem; line-height: 1.2; letter-spacing: 0.0625rem; }';
    const output =
      'h1 { margin: 0 0 20px; font-size: 3.2rem; line-height: 1.2; letter-spacing: 0.1rem; }';
    const processed = postcss(remToPx()).process(input).css;

    expect(processed).toBe(output);
  });

  it('should replace the rem unit with a certain multiplier', () => {
    const processed = postcss(remToPx()).process(basicCSS).css;
    const expected = '.rule { font-size: 1.5rem }';

    expect(processed).toBe(expected);
  });

  it('should ignore px properties', () => {
    const expected = '.rule { font-size: 2px }';
    const processed = postcss(remToPx()).process(expected).css;

    expect(processed).toBe(expected);
  });

  it('should handle < 1 values and values without a leading 0', () => {
    const rules = '.rule { margin: 0.5px .03125rem -0.0125rem -.2em }';
    const expected = '.rule { margin: 0.5px 0.05rem -0.020000000000000004rem -.2em }';
    const options = {
      propList: ['margin'],
    };
    const processed = postcss(remToPx(options)).process(rules).css;

    expect(processed).toBe(expected);
  });

  it('should remain unitless if 0', () => {
    const expected = '.rule { font-size: 0rem; font-size: 0; }';
    const processed = postcss(remToPx()).process(expected).css;

    expect(processed).toBe(expected);
  });

  describe('value parsing', () => {
    it('should not replace values in double quotes or single quotes', () => {
      const options = {
        propList: ['*'],
      };
      const rules = '.rule { content: \'1rem\'; font-family: "1rem"; font-size: 1rem; }';
      const expected = '.rule { content: \'1rem\'; font-family: "1rem"; font-size: 1.6rem; }';
      const processed = postcss(remToPx(options)).process(rules).css;

      expect(processed).toBe(expected);
    });

    it('should not replace values in `url()`', () => {
      const options = {
        propList: ['*'],
      };
      const rules = '.rule { background: url(1rem.jpg); font-size: 1rem; }';
      const expected = '.rule { background: url(1rem.jpg); font-size: 1.6rem; }';
      const processed = postcss(remToPx(options)).process(rules).css;

      expect(processed).toBe(expected);
    });

    it('should not replace values with an uppercase R or REM', () => {
      const options = {
        propList: ['*'],
      };
      const rules =
        '.rule { margin: 0.75rem calc(100% - 14REM); height: calc(100% - 1.25rem); font-size: 12Rem; line-height: 1rem; }';
      const expected =
        '.rule { margin: 1.2000000000000002rem calc(100% - 14REM); height: calc(100% - 2rem); font-size: 12Rem; line-height: 1.6rem; }';
      const processed = postcss(remToPx(options)).process(rules).css;

      expect(processed).toBe(expected);
    });
  });

  describe('rootValue', () => {
    it('should replace using a root value of 10', () => {
      const expected = '.rule { font-size: 1.5rem }';
      const options = {
        rootValue: 10,
      };
      const processed = postcss(remToPx(options)).process(basicCSS).css;

      expect(processed).toBe(expected);
    });
  });

  describe('unitPrecision', () => {
    it('should replace using a decimal of 2 places', () => {
      const rules = '.rule { font-size: 0.534375rem }';
      const expected = '.rule { font-size: 0.8550000000000001rem }';
      const options = {
        unitPrecision: 2,
      };
      const processed = postcss(remToPx(options)).process(rules).css;

      expect(processed).toBe(expected);
    });
  });

  describe('propList', () => {
    it('should only replace properties in the prop list', () => {
      const rules =
        '.rule { font-size: 1rem; margin: 1rem; margin-left: 0.5rem; padding: 0.5rem; padding-right: 1rem }';
      const expected =
        '.rule { font-size: 1.6rem; margin: 1.6rem; margin-left: 0.5rem; padding: 0.5rem; padding-right: 1.6rem }';
      const options = {
        propList: ['*font*', 'margin*', '!margin-left', '*-right', 'pad'],
      };
      const processed = postcss(remToPx(options)).process(rules).css;

      expect(processed).toBe(expected);
    });

    it('should only replace properties in the prop list with wildcard', () => {
      const rules =
        '.rule { font-size: 1rem; margin: 1rem; margin-left: 0.5rem; padding: 0.5rem; padding-right: 1rem }';
      const expected =
        '.rule { font-size: 1rem; margin: 1.6rem; margin-left: 0.5rem; padding: 0.5rem; padding-right: 1rem }';
      const options = {
        propList: ['*', '!margin-left', '!*padding*', '!font*'],
      };
      const processed = postcss(remToPx(options)).process(rules).css;

      expect(processed).toBe(expected);
    });

    it('should replace all properties when white list is wildcard', () => {
      const rules = '.rule { margin: 1rem; font-size: 0.9375rem }';
      const expected = '.rule { margin: 1.6rem; font-size: 1.5rem }';
      const options = {
        propList: ['*'],
      };
      const processed = postcss(remToPx(options)).process(rules).css;

      expect(processed).toBe(expected);
    });
  });

  describe('selectorBlackList', () => {
    it('should ignore selectors in the selector black list', () => {
      const rules = '.rule { font-size: 0.9375rem } .rule2 { font-size: 15rem }';
      const expected = '.rule { font-size: 1.5rem } .rule2 { font-size: 15rem }';
      const options = {
        selectorBlackList: ['.rule2'],
      };
      const processed = postcss(remToPx(options)).process(rules).css;

      expect(processed).toBe(expected);
    });

    it('should ignore every selector with `body$`', () => {
      const rules =
        'body { font-size: 1rem; } .class-body$ { font-size: 16rem; } .simple-class { font-size: 1rem; }';
      const expected =
        'body { font-size: 1.6rem; } .class-body$ { font-size: 16rem; } .simple-class { font-size: 1.6rem; }';
      const options = {
        selectorBlackList: ['body$'],
      };
      const processed = postcss(remToPx(options)).process(rules).css;

      expect(processed).toBe(expected);
    });

    it('should only ignore exactly `body`', () => {
      const rules =
        'body { font-size: 16rem; } .class-body { font-size: 1rem; } .simple-class { font-size: 1rem; }';
      const expected =
        'body { font-size: 16rem; } .class-body { font-size: 1.6rem; } .simple-class { font-size: 1.6rem; }';
      const options = {
        selectorBlackList: [/^body$/],
      };
      const processed = postcss(remToPx(options)).process(rules).css;

      expect(processed).toBe(expected);
    });
  });

  xdescribe('replace', () => {
    it('should leave fallback pixel unit with root em value', () => {
      const options = {
        replace: false,
      };
      const expected = '.rule { font-size: 0.9375rem; font-size: 15px }';
      const processed = postcss(remToPx(options)).process(basicCSS).css;

      expect(processed).toBe(expected);
    });
  });

  describe('mediaQuery', () => {
    it('should replace rem in media queries', () => {
      const rules = '@media (min-width: 31.25rem) { .rule { font-size: 1rem } }';
      const expected = '@media (min-width: 50rem) { .rule { font-size: 1.6rem } }';
      const options = {
        mediaQuery: true,
      };
      const processed = postcss(remToPx(options)).process(rules).css;

      expect(processed).toBe(expected);
    });
  });

  describe('minRemValue', () => {
    it('should not replace values below minRemValue', () => {
      const rules =
        '.rule { border: 0.0625rem solid #000; font-size: 1rem; margin: 0.0625rem 0.625rem; }';
      const expected =
        '.rule { border: 0.1rem solid #000; font-size: 1.6rem; margin: 0.1rem 1rem; }';
      const options = {
        propList: ['*'],
        minRemValue: 0.5,
      };
      const processed = postcss(remToPx(options)).process(rules).css;

      expect(processed).toBe(expected);
    });
  });

  describe('filter-prop-list', () => {
    it('should find "exact" matches from propList', () => {
      const propList = ['font-size', 'margin', '!padding', '*border*', '*', '*y', '!*font*'];
      const expected = 'font-size,margin';
      expect(filterPropList.exact(propList).join()).toBe(expected);
    });

    it('should find "contain" matches from propList and reduce to string', () => {
      const propList = ['font-size', '*margin*', '!padding', '*border*', '*', '*y', '!*font*'];
      const expected = 'margin,border';
      expect(filterPropList.contain(propList).join()).toBe(expected);
    });

    it('should find "start" matches from propList and reduce to string', () => {
      const propList = ['font-size', '*margin*', '!padding', 'border*', '*', '*y', '!*font*'];
      const expected = 'border';
      expect(filterPropList.startWith(propList).join()).toBe(expected);
    });

    it('should find "end" matches from propList and reduce to string', () => {
      const propList = ['font-size', '*margin*', '!padding', 'border*', '*', '*y', '!*font*'];
      const expected = 'y';
      expect(filterPropList.endWith(propList).join()).toBe(expected);
    });

    it('should find "not" matches from propList and reduce to string', () => {
      const propList = ['font-size', '*margin*', '!padding', 'border*', '*', '*y', '!*font*'];
      const expected = 'padding';
      expect(filterPropList.notExact(propList).join()).toBe(expected);
    });

    it('should find "not contain" matches from propList and reduce to string', () => {
      const propList = ['font-size', '*margin*', '!padding', '!border*', '*', '*y', '!*font*'];
      const expected = 'font';
      expect(filterPropList.notContain(propList).join()).toBe(expected);
    });

    it('should find "not start" matches from propList and reduce to string', () => {
      const propList = ['font-size', '*margin*', '!padding', '!border*', '*', '*y', '!*font*'];
      const expected = 'border';
      expect(filterPropList.notStartWith(propList).join()).toBe(expected);
    });

    it('should find "not end" matches from propList and reduce to string', () => {
      const propList = ['font-size', '*margin*', '!padding', '!border*', '*', '!*y', '!*font*'];
      const expected = 'y';
      expect(filterPropList.notEndWith(propList).join()).toBe(expected);
    });
  });
});
