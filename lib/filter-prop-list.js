module.exports = {
    exact: (list) => {
        return list.filter((m) => {
            return m.match(/^[^*!]+$/);
        });
    },
    contain: (list) => {
        return list
            .filter((m) => {
                return m.match(/^\*.+\*$/);
            })
            .map((m) => {
                return m.substr(1, m.length - 2);
            });
    },
    endWith: (list) => {
        return list
            .filter((m) => {
                return m.match(/^\*[^*]+$/);
            })
            .map((m) => {
                return m.substr(1);
            });
    },
    startWith: (list) => {
        return list
            .filter((m) => {
                return m.match(/^[^*!]+\*$/);
            })
            .map((m) => {
                return m.substr(0, m.length - 1);
            });
    },
    notExact: (list) => {
        return list
            .filter((m) => {
                return m.match(/^![^*].*$/);
            })
            .map((m) => {
                return m.substr(1);
            });
    },
    notContain: (list) => {
        return list
            .filter((m) => {
                return m.match(/^!\*.+\*$/);
            })
            .map((m) => {
                return m.substr(2, m.length - 3);
            });
    },
    notEndWith: (list) => {
        return list
            .filter((m) => {
                return m.match(/^!\*[^*]+$/);
            })
            .map((m) => {
                return m.substr(2);
            });
    },
    notStartWith: (list) => {
        return list
            .filter((m) => {
                return m.match(/^![^*]+\*$/);
            })
            .map((m) => {
                return m.substr(1, m.length - 2);
            });
    },
};
