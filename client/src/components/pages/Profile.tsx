import React, { useState, useEffect } from "react";
// @ts-ignore
import Calendar from "react-calendar";
import _ from "lodash";
import clsx from "clsx";
import { PieChart } from "react-minimal-pie-chart";
import "../../css/app.css";
import "../../css/profile.css";

import {
  EMPTY_GOAL,
  EMPTY_SUBSCRIPTION,
  Goal,
  GoalStatus,
  MISC_TAG,
  Span,
  Subscription,
  User,
} from "../../../../defaults";
import {
  colorForKey,
  formatCost,
  subApplies,
  subtractPreset,
  toGoalsKey,
} from "../../../../helpers";
import SubscriptionComponent from "../modules/Subscription";
import GoalComponent from "../modules/Goal";

interface ProfileProps {
  userInfo: User;
}

interface TransactionListItem {
  cost: number;
  location: string;
  date: string;
}

interface PieEntry {
  title: string;
  value: number;
  color: string;
}

const Profile: React.FC<ProfileProps> = ({ userInfo }) => {
  const [subscriptions, setSubscriptions] = useState(
    _.cloneDeep(userInfo.subscriptions)
  );
  const [chartStart, setChartStart] = useState(
    new Date(Date.now()).toLocaleDateString()
  );
  const [chartEnd, setChartEnd] = useState(
    new Date(Date.now()).toLocaleDateString()
  );
  const [chartDateField, setChartDateField] = useState<"start" | "end">(
    "start"
  );
  const [tempChartDate, setTempChartDate] = useState(
    new Date(Date.now()).toLocaleDateString()
  );
  const [selectingChart, setSelectingChart] = useState(false);
  const [hoverKey, setHoverKey] = useState("");
  const [defaultHoverKey, _setDefaultHoverKey] = useState("");
  const [goalsKey, setGoalsKey] = useState(
    toGoalsKey(new Date(Date.now()).toLocaleDateString())
  );
  const [goals, setGoals] = useState(_.cloneDeep(userInfo.goals));
  const [subsChanged, setSubsChanged] = useState(0);
  const [goalsChanged, setGoalsChanged] = useState(0);

  useEffect(() => {
    document.title = "Profile";
  }, []);

  const setPresetSpan = (span: Span) => {
    const today = new Date(Date.now()).toLocaleDateString();
    const prev = subtractPreset(today, span);
    setChartStart(prev);
    setChartEnd(today);
  };

  const setDefaultHoverKey = (key: string) => {
    _setDefaultHoverKey(defaultHoverKey === key ? "" : key);
  };

  const getSpendingByCategory = () => {
    const startDate = new Date(chartStart);
    const endDate = new Date(chartEnd);
    let total = 0;
    const itemized: Record<string, number> = {};
    const transactionList: Record<string, TransactionListItem[]> = {};
    if (endDate < startDate) {
      return { total, itemized, transactionList };
    }
    const addSpending = (
      tag: string,
      cost: number,
      location: string,
      date: string
    ) => {
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
    for (
      let date = startDate;
      date <= endDate;
      date.setDate(date.getDate() + 1)
    ) {
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
      const transactions = userInfo.finance[dateStr] ?? [];
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
  };

  const addGoal = () => {
    const newGoals = _.cloneDeep(goals);
    const newGoal = _.cloneDeep(EMPTY_GOAL);
    newGoals[goalsKey] = (newGoals[goalsKey] || []).concat(newGoal);
    setGoals(newGoals);
  };

  const deleteGoal = (ind: number) => {
    const newGoals = _.cloneDeep(goals);
    newGoals[goalsKey].splice(ind, 1);
    setGoals(newGoals);
  };

  const cycleGoalStatus = (ind: number) => {
    const newGoals = _.cloneDeep(goals);
    const goal = newGoals[goalsKey][ind];
    if (goal.status === GoalStatus.FAILED) {
      goal.status = GoalStatus.IN_PROGRESS;
    } else if (goal.status === GoalStatus.IN_PROGRESS) {
      goal.status = GoalStatus.PASSED;
    } else if (goal.status === GoalStatus.PASSED) {
      goal.status = GoalStatus.FAILED;
    }
    setGoals(goals);
  };

  const editGoal = (ind: number, newGoal: Goal) => {
    const newGoals = _.cloneDeep(goals);
    newGoals[goalsKey][ind] = newGoal;
    setGoals(newGoals);
  };

  const moveGoalsKey = (diff: number) => {
    const [year, quarter] = goalsKey.split("-");
    const rawValue = Number.parseInt(year) * 4 + Number.parseInt(quarter);
    const newValue = rawValue + diff;
    setGoalsKey(`${Math.floor(newValue / 4)}-${newValue % 4}`);
  };

  const addSub = () => {
    const newSubscriptions = _.cloneDeep(subscriptions);
    const newSub = _.cloneDeep(EMPTY_SUBSCRIPTION);
    newSub.tags = [];
    newSubscriptions.push(newSub);
    setSubscriptions(newSubscriptions);
  };

  const deleteSub = (ind: number) => {
    const newSubscriptions = _.cloneDeep(subscriptions);
    newSubscriptions.splice(ind, 1);
    setSubscriptions(newSubscriptions);
  };

  const editSub = (ind: number, newSub: Subscription) => {
    const newSubscriptions = _.cloneDeep(subscriptions);
    newSubscriptions[ind] = newSub;
    setSubscriptions(newSubscriptions);
  };

  const selectChartDate = (fieldName: "start" | "end") => {
    const relevantDate = fieldName === "start" ? chartStart : chartEnd;
    setChartDateField(fieldName);
    setTempChartDate(relevantDate);
    setSelectingChart(true);
  };

  const commitChartDate = () => {
    setSelectingChart(false);
    if (chartDateField === "start") {
      setChartStart(tempChartDate);
    } else {
      setChartEnd(tempChartDate);
    }
  };

  const saveProfile = () => {
    if (subsChanged || goalsChanged) {
      return;
    }
    const body = {
      subscriptions,
      goals,
    };
    fetch("/api/save_profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }).then((res) => {
      if (res.status === 200) {
        window.location.reload();
      } else {
        alert(
          "There was an issue saving your entry. Please make sure you're logged in."
        );
      }
    });
  };

  const curKey = hoverKey || defaultHoverKey;
  const { total, itemized, transactionList } = getSpendingByCategory();
  const data: PieEntry[] = Object.entries(itemized).map(([key, value]) => ({
    title: key,
    value,
    color: colorForKey(key),
  }));
  const curTransactions = transactionList[curKey] || [];
  const [goalsYear, goalsQuarter] = goalsKey
    .split("-")
    .map((s) => Number.parseInt(s));

  return (
    <div className="profileContainer">
      {!selectingChart ? null : (
        <div className="selectContainer" onClick={commitChartDate}>
          <div className="selectPopup" onClick={(e) => e.stopPropagation()}>
            Selecting {chartDateField} date as {tempChartDate}
            <Calendar
              className="subCalendar"
              onClickDay={(e: any) => setTempChartDate(e.toLocaleDateString())}
              calendarType="US"
              defaultValue={new Date(tempChartDate)}
            />
            <div className="button saveButton" onClick={commitChartDate}>
              Select Date
            </div>
          </div>
        </div>
      )}
      <div className="subContainer">
        <div className="subTitle">
          <div className="subTitleMain">
            SUBSCRIPTIONS
            {!!subsChanged ? <div className="subChanged">*</div> : null}
          </div>
          <div className="subTitleSecondary">
            <div className="smallButton text green" onClick={addSub}>
              +
            </div>
          </div>
        </div>
        <div className="subList">
          {subscriptions.map((el, ind) => (
            <SubscriptionComponent
              key={ind}
              subscription={el}
              editSubscription={(s: Subscription) => editSub(ind, s)}
              deleteSubscription={() => deleteSub(ind)}
              incrementEdits={() => setSubsChanged(subsChanged + 1)}
              decrementEdits={() => setSubsChanged(subsChanged - 1)}
            />
          ))}
        </div>
        <div
          className={clsx("button saveButton", {
            disabled: subsChanged || goalsChanged,
          })}
          onClick={saveProfile}
        >
          Save
        </div>
      </div>
      <div className="goalContainer">
        <div className="goalTitle">
          <div className="goalTitleMain">
            GOALS
            {!!goalsChanged ? <div className="goalChanged">*</div> : null}
          </div>
          <div className="goalTitleSecondary">
            <div className="smallButton text" onClick={() => moveGoalsKey(-1)}>
              {"<"}
            </div>
            {`${goalsYear} Q${goalsQuarter + 1}`}
            <div className="smallButton text" onClick={() => moveGoalsKey(1)}>
              {">"}
            </div>
          </div>
          <div className="goalTitleSecondary">
            <div className="smallButton text green" onClick={addGoal}>
              +
            </div>
          </div>
        </div>
        <div className="goalList">
          {(goals[goalsKey] || []).map((el, ind) => (
            <GoalComponent
              key={ind}
              goal={el}
              editGoal={(g: Goal) => editGoal(ind, g)}
              deleteGoal={() => deleteGoal(ind)}
              cycleStatus={() => cycleGoalStatus(ind)}
              incrementEdits={() => setGoalsChanged(goalsChanged + 1)}
              decrementEdits={() => setGoalsChanged(goalsChanged - 1)}
            />
          ))}
        </div>
        <div
          className={clsx("button saveButton", {
            disabled: subsChanged || goalsChanged,
          })}
          onClick={saveProfile}
        >
          Save
        </div>
      </div>
      <div className="chartContainer">
        <div className="chartHeader">
          <div className="chartDate" onClick={() => selectChartDate("start")}>
            {chartStart}
          </div>
          TO
          <div className="chartDate" onClick={() => selectChartDate("end")}>
            {chartEnd}
          </div>
          <div className="chartPresetList">
            {_.values(Span).map((span) => (
              <div className="chartPreset" onClick={() => setPresetSpan(span)}>
                {span}
              </div>
            ))}
          </div>
        </div>
        <div className="chartBody">
          <div className="chartPie">
            <PieChart
              data={data}
              onClick={(_, index) => setDefaultHoverKey(data[index].title)}
              onMouseOver={(_, index) => setHoverKey(data[index].title)}
              onMouseOut={() => setHoverKey("")}
            />
          </div>
          <div className="chartTotals">
            <div className="chartTotalMain">TOTAL: {formatCost(total)}</div>
            <div className="chartDetails">
              <div className="chartCategories">
                {data.map((el, ind) => (
                  <div
                    key={ind}
                    className={clsx({
                      chartHoverKey: el.title === curKey,
                    })}
                  >
                    {el.title} : {formatCost(el.value)}
                  </div>
                ))}
              </div>
              <div className="chartTransactions">
                {curTransactions.map((transaction, ind) => (
                  <div key={ind}>
                    {transaction.date} - {transaction.location}:{" "}
                    {formatCost(transaction.cost)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
