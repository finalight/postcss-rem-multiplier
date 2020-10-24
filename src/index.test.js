/* global describe, it, expect */

import postcss from 'postcss';
import remToPx from '.';

const filterPropList = require('./lib/filter-prop-list');

describe('rem multiplier', () => {
  it('should work with a multiplier input', () => {
    const input = '.rule { font-size: 1rem; }';

    const options = {
      multiplier: 1.6,
    };

    const output = '.rule { font-size: 1.6rem; }';
    const processed = postcss(remToPx(options)).process(input).css;

    expect(processed).toBe(output);
  });

  it('should have same output with no multiplier', () => {
    const input =
      'h1 { margin: 0 0 20px; font-size: 3.2rem; line-height: 1.2; letter-spacing: 0.0625rem; }';
    const output =
      'h1 { margin: 0 0 20px; font-size: 3.2rem; line-height: 1.2; letter-spacing: 0.0625rem; }';
    const processed = postcss(remToPx()).process(input).css;

    expect(processed).toBe(output);
  });

  it('should ignore px properties', () => {
    const expected = '.rule { font-size: 2px }';
    const processed = postcss(remToPx()).process(expected).css;

    expect(processed).toBe(expected);
  });

  it('should handle < 1 values and values without a leading 0', () => {
    const rules = '.rule { margin: 0.5px .03125rem -0.0125rem -.2em }';
    const expected = '.rule { margin: 0.5px 0.03125rem -0.0125rem -.2em }';
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
        multiplier: 1.5,
      };
      const rules = '.rule { content: \'1rem\'; font-family: "1rem"; font-size: 1rem; }';
      const expected = '.rule { content: \'1rem\'; font-family: "1rem"; font-size: 1.5rem; }';
      const processed = postcss(remToPx(options)).process(rules).css;

      expect(processed).toBe(expected);
    });

    it('should not replace values in `url()`', () => {
      const options = {
        propList: ['*'],
        multiplier: 1.5,
      };
      const rules = '.rule { background: url(1rem.jpg); font-size: 1rem; }';
      const expected = '.rule { background: url(1rem.jpg); font-size: 1.5rem; }';
      const processed = postcss(remToPx(options)).process(rules).css;

      expect(processed).toBe(expected);
    });

    it('should not replace values with an uppercase R or REM', () => {
      const options = {
        propList: ['*'],
        multiplier: 1.5,
      };
      const rules =
        '.rule { margin: 0.75rem calc(100% - 14REM); height: calc(100% - 1.25rem); font-size: 12Rem; line-height: 1rem; }';
      const expected =
        '.rule { margin: 1.125rem calc(100% - 14REM); height: calc(100% - 1.875rem); font-size: 12Rem; line-height: 1.5rem; }';
      const processed = postcss(remToPx(options)).process(rules).css;

      expect(processed).toBe(expected);
    });
  });

  describe('unitPrecision', () => {
    it('should replace using a decimal of 2 places', () => {
      const rules = '.rule { font-size: 0.534375rem }';
      const expected = '.rule { font-size: 0.53rem }';
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
        '.rule { font-size: 1.2rem; margin: 1.2rem; margin-left: 0.5rem; padding: 0.5rem; padding-right: 1.2rem }';
      const options = {
        propList: ['*font*', 'margin*', '!margin-left', '*-right', 'pad'],
        multiplier: 1.2,
      };

      const processed = postcss(remToPx(options)).process(rules).css;

      expect(processed).toBe(expected);
    });

    it('should only replace properties in the prop list with wildcard', () => {
      const rules =
        '.rule { font-size: 1rem; margin: 1rem; margin-left: 0.5rem; padding: 0.5rem; padding-right: 1rem }';
      const expected =
        '.rule { font-size: 1rem; margin: 1.2rem; margin-left: 0.5rem; padding: 0.5rem; padding-right: 1rem }';
      const options = {
        propList: ['*', '!margin-left', '!*padding*', '!font*'],
        multiplier: 1.2,
      };
      const processed = postcss(remToPx(options)).process(rules).css;

      expect(processed).toBe(expected);
    });

    it('should replace all properties when white list is wildcard', () => {
      const rules = '.rule { margin: 1rem; font-size: 0.9375rem }';
      const expected = '.rule { margin: 1.2rem; font-size: 1.125rem }';
      const options = {
        propList: ['*'],
        multiplier: 1.2,
      };
      const processed = postcss(remToPx(options)).process(rules).css;

      expect(processed).toBe(expected);
    });
  });

  describe('selectorBlackList', () => {
    it('should ignore selectors in the selector black list', () => {
      const rules = '.rule { font-size: 0.9375rem } .rule2 { font-size: 15rem }';
      const expected = '.rule { font-size: 1.125rem } .rule2 { font-size: 15rem }';
      const options = {
        selectorBlackList: ['.rule2'],
        multiplier: 1.2,
      };
      const processed = postcss(remToPx(options)).process(rules).css;

      expect(processed).toBe(expected);
    });

    it('should ignore every selector with `body$`', () => {
      const rules =
        'body { font-size: 1rem; } .class-body$ { font-size: 16rem; } .simple-class { font-size: 1rem; }';
      const expected =
        'body { font-size: 1.2rem; } .class-body$ { font-size: 16rem; } .simple-class { font-size: 1.2rem; }';
      const options = {
        selectorBlackList: ['body$'],
        multiplier: 1.2,
      };
      const processed = postcss(remToPx(options)).process(rules).css;

      expect(processed).toBe(expected);
    });

    it('should only ignore exactly `body`', () => {
      const rules =
        'body { font-size: 16rem; } .class-body { font-size: 1rem; } .simple-class { font-size: 1rem; }';
      const expected =
        'body { font-size: 16rem; } .class-body { font-size: 1.2rem; } .simple-class { font-size: 1.2rem; }';
      const options = {
        selectorBlackList: [/^body$/],
        multiplier: 1.2,
      };
      const processed = postcss(remToPx(options)).process(rules).css;

      expect(processed).toBe(expected);
    });
  });

  describe('mediaQuery', () => {
    it('should multiply rem in media queries', () => {
      const rules = '@media (min-width: 31.25rem) { .rule { font-size: 1rem } }';
      const expected = '@media (min-width: 37.5rem) { .rule { font-size: 1.2rem } }';
      const options = {
        mediaQuery: true,
        multiplier: 1.2,
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
