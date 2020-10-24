"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.notContain = exports.notStartWith = exports.notExact = exports.notEndWith = exports.startWith = exports.endWith = exports.contain = exports.exact = void 0;

const exact = list => {
  return list.filter(m => {
    return m.match(/^[^*!]+$/);
  });
};

exports.exact = exact;

const contain = list => {
  return list.filter(m => {
    return m.match(/^\*.+\*$/);
  }).map(m => {
    return m.substr(1, m.length - 2);
  });
};

exports.contain = contain;

const endWith = list => {
  return list.filter(m => {
    return m.match(/^\*[^*]+$/);
  }).map(m => {
    return m.substr(1);
  });
};

exports.endWith = endWith;

const startWith = list => {
  return list.filter(m => {
    return m.match(/^[^*!]+\*$/);
  }).map(m => {
    return m.substr(0, m.length - 1);
  });
};

exports.startWith = startWith;

const notExact = list => {
  return list.filter(m => {
    return m.match(/^![^*].*$/);
  }).map(m => {
    return m.substr(1);
  });
};

exports.notExact = notExact;

const notContain = list => {
  return list.filter(m => {
    return m.match(/^!\*.+\*$/);
  }).map(m => {
    return m.substr(2, m.length - 3);
  });
};

exports.notContain = notContain;

const notEndWith = list => {
  return list.filter(m => {
    return m.match(/^!\*[^*]+$/);
  }).map(m => {
    return m.substr(2);
  });
};

exports.notEndWith = notEndWith;

const notStartWith = list => {
  return list.filter(m => {
    return m.match(/^![^*]+\*$/);
  }).map(m => {
    return m.substr(1, m.length - 2);
  });
};

exports.notStartWith = notStartWith;