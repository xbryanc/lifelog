const EMPTY = "";
const DAILY = "daily";
const WEEKLY = "weekly";
const MONTHLY = "monthly";
const YEARLY = "yearly";

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
    EMPTY: EMPTY,
    DAILY: DAILY,
    WEEKLY: WEEKLY,
    MONTHLY: MONTHLY,
    YEARLY: YEARLY,
    SUBSCRIPTION_FREQUENCIES: [EMPTY, DAILY, WEEKLY, MONTHLY, YEARLY],
    STAR_MAX: 10,
    INF: 1e18, // large number
};

module.exports = CONSTANTS;
