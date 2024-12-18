import {
  FinanceLog,
  TransactionListItem,
  TransactionSummary,
  Span,
  Subscription,
  SubscriptionFrequency,
  MISC_TAG,
  FREQUENCY_TO_DISPLAY } from "./defaults";
import _ from 'lodash';

export const mkk = (tags: any[]) => strhash(JSON.stringify(tags));

export const sortByDate = (a: string, b: string) => {
  const dateA = new Date(a);
  const dateB = new Date(b);
  return dateA < dateB ? -1 : 1;
};

export const toGoalsKey = (selectedDate: string) => {
  const curDate = new Date(selectedDate);
  const year = curDate.getFullYear();
  const month = curDate.getMonth();
  return `${year}-${Math.floor(month / 3)}`;
};

export const stripId = (obj: Object): Object => _.omit(obj, '_id');

export const getTransactionsWithinDates = (
  finance: FinanceLog,
  subscriptions: Subscription[],
  startDate: Date,
  endDate: Date,
): TransactionSummary => {
  let total = 0;
  const itemized: Record<string, number> = {};
  const transactionList: Record<string, TransactionListItem[]> = {};

  const addSpending = (tag: string, cost: number, location: string, date: string) => {
    if (!cost) {
      return;
    }
    total += cost;
    if (tag !== "") {
      if (!itemized.hasOwnProperty(tag)) {
        itemized[tag] = 0;
        transactionList[tag] = [];
      }
      itemized[tag] += cost;
      transactionList[tag].push({
        cost,
        location,
        date,
      });
    }
  };

  for (const date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    subscriptions.forEach((sub) => {
      if (subApplies(sub, date)) {
        addSpending(
          sub.tags.length === 0 ? MISC_TAG : sub.tags[0],
          sub.cost,
          sub.location,
          date.toLocaleDateString()
        );
      }
    });
    const dateStr = date.toLocaleDateString();
    const transactions = finance[dateStr] ?? [];
    transactions.forEach((transaction) => {
      addSpending(
        transaction.tags.length === 0 ? MISC_TAG : transaction.tags[0],
        transaction.cost,
        transaction.location,
        date.toLocaleDateString()
      );
    });
  }

  return { total, itemized, transactionList };
}

export const subApplies = (sub: Subscription, selectedDate: string | Date) => {
  const startDate = new Date(sub.start);
  const endDate = new Date(sub.end);
  const curDate = new Date(selectedDate);
  const gap = sub.frequencyGap || 1;
  if (sub.end !== "" && endDate < curDate) {
    return false;
  }
  if (!sub.start || sub.start === "" || startDate > curDate || sub.frequency === SubscriptionFrequency.EMPTY) {
    return false;
  }

  if (sub.frequency === SubscriptionFrequency.DAILY || sub.frequency === SubscriptionFrequency.WEEKLY) {
    const startDateUTC = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate()));
    const curDateUTC = new Date(Date.UTC(curDate.getUTCFullYear(), curDate.getUTCMonth(), curDate.getUTCDate()));

    const diffMs = curDateUTC.getTime() - startDateUTC.getTime();
    const gapMs = sub.frequency === SubscriptionFrequency.DAILY
      ? gap * 24 * 60 * 60 * 1000
      : gap * 7 * 24 * 60 * 60 * 1000;
    return diffMs % gapMs === 0;
  }

  if (sub.frequency === SubscriptionFrequency.MONTHLY) {
    const monthsDiff = (curDate.getFullYear() - startDate.getFullYear()) * 12 + (curDate.getMonth() - startDate.getMonth());
    return monthsDiff % gap === 0 && curDate.getDate() === startDate.getDate();
  }

  if (sub.frequency === SubscriptionFrequency.YEARLY) {
    const yearsDiff = curDate.getFullYear() - startDate.getFullYear();
    return (
      yearsDiff % gap === 0 &&
      startDate.getMonth() === curDate.getMonth() &&
      startDate.getDate() === curDate.getDate()
    );
  }
  return false;
};

export const subtractSpan = (curDate: Date, span: Span) => {
  const newDate = new Date(curDate);
  if (span === Span.DAY) {
    newDate.setDate(curDate.getDate() - 1);
  } else if (span === Span.WEEK) {
    newDate.setDate(curDate.getDate() - 7);
  } else if (span === Span.MONTH) {
    newDate.setMonth(curDate.getMonth() - 1);
  } else if (span === Span.YEAR) {
    newDate.setFullYear(curDate.getFullYear() - 1);
  }
  return newDate;
};

export const formatCost = (costInPennies: number) => {
  const dollar = Math.floor(costInPennies / 100);
  const cents = costInPennies % 100;
  const rest = `${Math.floor(cents / 10)}${cents % 10}`;
  // https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
  return `$${dollar.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}.${rest}`;
};

export const formatFrequency = (freq: SubscriptionFrequency, gap: number) => {
  if (freq === SubscriptionFrequency.EMPTY) {
    return "NULL";
  }
  return `${gap} ${FREQUENCY_TO_DISPLAY[freq]}`;
};

export const formatSubTime = (date: string) => {
  if (!date || date === "") {
    return "\u221E";
  }
  return date;
};

export const colorForKey = (key: string) => {
  const hash = strhash(key);
  const r = (hash & 0xff0000) >> 16;
  const g = (hash & 0x00ff00) >> 8;
  const b = hash & 0x0000ff;
  return (
    "#" +
    ("0" + r.toString(16)).substr(-2) +
    ("0" + g.toString(16)).substr(-2) +
    ("0" + b.toString(16)).substr(-2)
  );
};

const strhash = (str: string) => {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) + hash + str.charCodeAt(i); /* hash * 33 + c */
  }
  return hash;
}