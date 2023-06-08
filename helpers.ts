export const sortByDate = (a: string, b: string) => {
  let dateA = new Date(a);
  let dateB = new Date(b);
  return dateA < dateB ? -1 : 1;
};

export const toGoalsKey = (selectedDate: string) => {
  let curDate = new Date(selectedDate);
  const year = curDate.getFullYear();
  const month = curDate.getMonth();
  return `${year}-${Math.floor(month / 3)}`;
};

export const subApplies = (sub, selectedDate: string) => {
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
    return (
      startDate.getMonth() === curDate.getMonth() &&
      startDate.getDate() === curDate.getDate()
    );
  }
  return false;
};

export const subtractPreset = (date: string, span) => {
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
};

export const formatCost = (costInPennies: number) => {
  const dollar = Math.floor(costInPennies / 100);
  const cents = costInPennies % 100;
  const rest = `${Math.floor(cents / 10)}${cents % 10}`;
  // https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
  return `$${dollar.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}.${rest}`;
};

export const colorForKey = (key: string) => {
  function djb2(str: string) {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) + hash + str.charCodeAt(i); /* hash * 33 + c */
    }
    return hash;
  }

  let hash = djb2(key);
  let r = (hash & 0xff0000) >> 16;
  let g = (hash & 0x00ff00) >> 8;
  let b = hash & 0x0000ff;
  return (
    "#" +
    ("0" + r.toString(16)).substr(-2) +
    ("0" + g.toString(16)).substr(-2) +
    ("0" + b.toString(16)).substr(-2)
  );
};
