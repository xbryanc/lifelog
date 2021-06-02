const CONSTANTS = {
    NAVBAR_HAMBURGER_WIDTH_THRESHOLD: 991,
    KONAMI_CODE: ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'],
    EMPTY_TRANSACTION: {
        cost: 0,
        description: "",
        location: "",
        tags: [],
        show: false,
    },
    EMPTY_SUBSCRIPTION: {
        cost: 0,
        description: "",
        location: "",
        tags: [],
        start: "",
        end: "",
        frequency: "",
        show: false,
    },
    SUBSCRIPTION_FREQUENCIES: ['', 'daily', 'weekly', 'monthly', 'yearly'],
    STAR_MAX: 10,
    INF: 1e18, // large number
};

module.exports = CONSTANTS;
