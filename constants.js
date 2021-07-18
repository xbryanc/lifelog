const EMPTY = "";
const DAILY = "daily";
const WEEKLY = "weekly";
const MONTHLY = "monthly";
const YEARLY = "yearly";
const DAY = "day";
const WEEK = "week";
const MONTH = "month";
const YEAR = "year";

const CONSTANTS = {
    NAVBAR_HAMBURGER_WIDTH_THRESHOLD: 991,
    KONAMI_CODE: ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'],
    EMPTY_TRANSACTION: {
        cost: 0,
        description: "",
        location: "",
        tags: [],
        show: true,
        editing: true,
        editCost: 0,
        editDescription: "",
        editLocation: "",
    },
    EMPTY_SUBSCRIPTION: {
        cost: 0,
        description: "",
        location: "",
        tags: [],
        start: "",
        end: "",
        frequency: "",
        show: true,
        editing: true,
        editCost: 0,
        editDescription: "",
        editLocation: "",
    },
    EMPTY: EMPTY,
    DAILY: DAILY,
    WEEKLY: WEEKLY,
    MONTHLY: MONTHLY,
    YEARLY: YEARLY,
    DAY: DAY,
    WEEK: WEEK,
    MONTH: MONTH,
    YEAR: YEAR,
    SUBSCRIPTION_FREQUENCIES: [EMPTY, DAILY, WEEKLY, MONTHLY, YEARLY],
    PRESET_SPANS: [DAY, WEEK, MONTH, YEAR],
    STAR_MAX: 10,
    INF: 1e18, // large number
    SUB_APPLIES: (sub, selectedDate) => {
        let curDate = new Date(selectedDate);
        if (sub.end !== "" && new Date(sub.end) < curDate) {
            return false;
        }
        if (!sub.start || sub.start === "" || new Date(sub.start) > curDate) {
            return false;
        }
        let startDate = new Date(sub.start);
        if (sub.frequency === DAILY) {
            return true;
        } else if (sub.frequency === WEEKLY) {
            return startDate.getDay() === curDate.getDay();
        } else if (sub.frequency === MONTHLY) {
            return startDate.getDate() === curDate.getDate();
        } else if (sub.frequency === YEARLY) {
            return startDate.getMonth() === curDate.getMonth() && startDate.getDate() === curDate.getDate();
        }
        return false;
    },
    SUBTRACT_PRESET: (date, span) => {
        let curDate = new Date(date);
        let newDate = curDate;
        if (span !== DAY) {
            if (span === WEEK) {
                newDate.setDate(curDate.getDate() - 7);
            } else if (span === MONTH) {
                newDate.setMonth(curDate.getMonth() - 1);
            } else if (span === YEAR) {
                newDate.setFullYear(curDate.getFullYear() - 1);
            }
            newDate.setDate(newDate.getDate() + 1);
        }
        return newDate.toLocaleDateString();
    },
    FORMAT_COST: (costInPennies) => {
        let dollar = Math.floor(costInPennies / 100);
        let cents = costInPennies % 100;
        let rest = `${Math.floor(cents / 10)}${cents % 10}`;
        return `$${dollar}.${rest}`;
    },
    COLOR_FOR_KEY: (key) => {
        function djb2(str) {
            let hash = 5381;
            for (let i = 0; i < str.length; i++) {
                hash = ((hash << 5) + hash) + str.charCodeAt(i); /* hash * 33 + c */
            }
            return hash;
        }

        let hash = djb2(key);
        let r = (hash & 0xFF0000) >> 16;
        let g = (hash & 0x00FF00) >> 8;
        let b = hash & 0x0000FF;
        return "#" + ("0" + r.toString(16)).substr(-2) + ("0" + g.toString(16)).substr(-2) + ("0" + b.toString(16)).substr(-2);
    },
};

module.exports = CONSTANTS;
