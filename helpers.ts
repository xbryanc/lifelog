import { Span, Subscription, SubscriptionFrequency } from "./defaults";
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

export const subApplies = (sub: Subscription, selectedDate: string | Date) => {
  const curDate = new Date(selectedDate);
  if (sub.end !== "" && new Date(sub.end) < curDate) {
    return false;
  }
  if (!sub.start || sub.start === "" || new Date(sub.start) > curDate) {
    return false;
  }
  const startDate = new Date(sub.start);
  if (sub.frequency === SubscriptionFrequency.DAILY) {
    return true;
  } else if (sub.frequency === SubscriptionFrequency.WEEKLY) {
    return startDate.getDay() === curDate.getDay();
  } else if (sub.frequency === SubscriptionFrequency.MONTHLY) {
    return startDate.getDate() === curDate.getDate();
  } else if (sub.frequency === SubscriptionFrequency.YEARLY) {
    return (
      startDate.getMonth() === curDate.getMonth() &&
      startDate.getDate() === curDate.getDate()
    );
  }
  return false;
};

export const subtractPreset = (date: string, span: Span) => {
  const curDate = new Date(date);
  const newDate = curDate;
  if (span !== Span.DAY) {
    if (span === Span.WEEK) {
      newDate.setDate(curDate.getDate() - 7);
    } else if (span === Span.MONTH) {
      newDate.setMonth(curDate.getMonth() - 1);
    } else if (span === Span.YEAR) {
      newDate.setFullYear(curDate.getFullYear() - 1);
    }
    newDate.setDate(newDate.getDate() + 1);
  }
  return newDate.toLocaleDateString();
};

export const formatCost = (costInPennies: number) => {
  const dollar = Math.floor(costInPennies / 100);
  const cents = costInPennies % 100;
  const rest = `${Math.floor(cents / 10)}${cents % 10}`;
  // https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
  return `$${dollar.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}.${rest}`;
};

export const formatFrequency = (freq: SubscriptionFrequency) => {
  if (freq === SubscriptionFrequency.EMPTY) {
    return "(SET)";
  }
  return `(${freq})`;
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