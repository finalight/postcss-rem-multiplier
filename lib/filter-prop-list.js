const exact = (list) => {
  return list.filter((m) => {
    return m.match(/^[^*!]+$/);
  });
};

const contain = (list) => {
  return list
    .filter((m) => {
      return m.match(/^\*.+\*$/);
    })
    .map((m) => {
      return m.substr(1, m.length - 2);
    });
};

const endWith = (list) => {
  return list
    .filter((m) => {
      return m.match(/^\*[^*]+$/);
    })
    .map((m) => {
      return m.substr(1);
    });
};

const startWith = (list) => {
  return list
    .filter((m) => {
      return m.match(/^[^*!]+\*$/);
    })
    .map((m) => {
      return m.substr(0, m.length - 1);
    });
};

const notExact = (list) => {
  return list
    .filter((m) => {
      return m.match(/^![^*].*$/);
    })
    .map((m) => {
      return m.substr(1);
    });
};

const notContain = (list) => {
  return list
    .filter((m) => {
      return m.match(/^!\*.+\*$/);
    })
    .map((m) => {
      return m.substr(2, m.length - 3);
    });
};

const notEndWith = (list) => {
  return list
    .filter((m) => {
      return m.match(/^!\*[^*]+$/);
    })
    .map((m) => {
      return m.substr(2);
    });
};

const notStartWith = (list) => {
  return list
    .filter((m) => {
      return m.match(/^![^*]+\*$/);
    })
    .map((m) => {
      return m.substr(1, m.length - 2);
    });
};

export { exact, contain, endWith, startWith, notEndWith, notExact, notStartWith, notContain };
