import React, { useState, useEffect } from "react";
const Calendar = require("react-calendar");
import _ from 'lodash';
import clsx from "clsx";
import { PieChart } from "react-minimal-pie-chart";
import "../../css/app.css";
import "../../css/profile.css";

import { EMPTY_GOAL, Goal, GoalStatus, User } from "../../../../defaults";
import { subApplies, subtractPreset, toGoalsKey } from "../../../../helpers";
import Subscription from "../modules/Subscription";

interface ProfileProps {
  userInfo: User;
}

const Profile: React.FC<ProfileProps> = ({userInfo}) => {
  const [subscriptions, setSubscriptions] = useState(_.cloneDeep(userInfo.subscriptions));
  const [finance, setFinance] = useState(_.cloneDeep(userInfo.finance));
  const [chartStart, setChartStart] = useState(new Date(Date.now()).toLocaleDateString());
  const [chartEnd, setChartEnd] = useState(new Date(Date.now()).toLocaleDateString());
  const [selectingChart, setSelectingChart] = useState(false);
  const [hoverKey, setHoverKey] = useState("");
  const [defaultHoverKey, _setDefaultHoverKey] = useState("");
  const [goalsKey, setGoalsKey] = useState(toGoalsKey(new Date(Date.now()).toLocaleDateString()));
  const [goals, setGoals] = useState(_.cloneDeep(userInfo.goals));
  const [editCounts, setEditCounts] = useState(0);

  useEffect(() => {
    document.title = "Profile";
  }, [])

  const isEditingAnything = () => {
    let result = false;
    subscriptions.forEach((sub) => {
      if (sub.editing) {
        result = true;
        return;
      }
    });
    Object.values(goals).forEach((goalsList) => {
      goalsList.forEach((goal) => {
        if (goal.editing) {
          result = true;
          return;
        }
      });
    });
    return result;
  };

  const setPresetSpan = (span) => {
    let today = new Date(Date.now()).toLocaleDateString();
    let prev = subtractPreset(today, span);
    this.setState({
      chartStart: prev,
      chartEnd: today,
    });
  };

  const setDefaultHoverKey = (key: string) => {
      setDefaultHoverKey(defaultHoverKey === key ? "" : key)
  };

  const getSpendingByCategory = () => {
    let startDate = new Date(this.state.chartStart);
    let endDate = new Date(this.state.chartEnd);
    let total = 0;
    let itemized = {};
    let transactionList = {};
    if (endDate < startDate) {
      return { total, itemized, transactionList };
    }
    const addSpending = (tag, cost, location, date) => {
      if (!cost || parseInt(cost) === 0) {
        return;
      }
      cost = parseInt(cost);
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
      this.state.subscriptions.forEach((sub) => {
        if (subApplies(sub, date)) {
          addSpending(
            sub.tags.length === 0 ? "MISC" : sub.tags[0],
            sub.cost,
            sub.location,
            date.toLocaleDateString()
          );
        }
      });
      let dateStr = date.toLocaleDateString();
      let transactions = this.state.finance.hasOwnProperty(dateStr)
        ? this.state.finance[dateStr]
        : [];
      transactions.forEach((transaction) => {
        addSpending(
          transaction.tags.length === 0 ? "MISC" : transaction.tags[0],
          transaction.cost,
          transaction.location,
          date.toLocaleDateString()
        );
      });
    }
    return { total, itemized, transactionList };
  };

  const subChanged = () => {
    let currentSubs = this.state.subscriptions;
    let prevSubs = this.props.userInfo.subscriptions;
    if (currentSubs.length != prevSubs.length) {
      return true;
    }
    let changed = false;
    currentSubs.forEach((_, ind) => {
      if (changed) {
        return;
      }
      let cur = currentSubs[ind];
      let prev = prevSubs[ind];
      if (
        cur.cost !== prev.cost ||
        cur.description !== prev.description ||
        cur.location !== prev.location ||
        cur.start !== prev.start ||
        cur.end !== prev.end ||
        cur.frequency != prev.frequency
      ) {
        changed = true;
      }
      let curTags = cur.tags;
      let prevTags = prev.tags;
      if (curTags.length != prevTags.length) {
        changed = true;
      }
      curTags.forEach((_, ind) => {
        if (curTags[ind] != prevTags[ind]) {
          changed = true;
        }
      });
    });
    return changed;
  };

  const goalsChanged = () => {
    let currentGoals = this.state.goals;
    let prevGoals = this.props.userInfo.goals;
    let changed = false;
    let prevKeys = Object.keys(prevGoals);
    let currentKeys = Object.keys(currentGoals);
    if (
      prevKeys.length !== currentKeys.length ||
      !prevKeys.every((key) => currentKeys.includes(key)) ||
      !currentKeys.every((key) => prevKeys.includes(key))
    ) {
      return true;
    }
    currentKeys.forEach((key) => {
      if (changed) {
        return;
      }
      let prevEntries = prevGoals[key] || [];
      let currentEntries = currentGoals[key] || [];
      if (prevEntries.length !== currentEntries.length) {
        changed = true;
        return;
      }
      currentEntries.forEach((_, ind) => {
        let cur = currentEntries[ind];
        let prev = prevEntries[ind];
        if (
          cur.name !== prev.name ||
          cur.description !== prev.description ||
          cur.status !== prev.status
        ) {
          changed = true;
        }
      });
    });
    return changed;
  };

  const addGoal = () => {
    let newGoals = _.cloneDeep(goals);
    let newGoal = _.cloneDeep(EMPTY_GOAL);
    newGoals[goalsKey] = (
      newGoals[goalsKey] || []
    ).concat(newGoal);
    setGoals(newGoals);
  };

  const deleteGoal = (ind) => {
    let newGoals = _.cloneDeep(goals);
    newGoals[goalsKey].splice(ind, 1);
    setGoals(newGoals);
  };

  const cycleGoalStatus = (goal: Goal) => {
    if (goal.status === GoalStatus.FAILED) {
      goal.status = GoalStatus.IN_PROGRESS;
    } else if (goal.status === GoalStatus.IN_PROGRESS) {
      goal.status = GoalStatus.PASSED;
    } else if (goal.status === GoalStatus.PASSED) {
      goal.status = GoalStatus.FAILED;
    }
    setGoals(goals);
  };

  const editGoal = (goal, fieldName, value) => {
    goal[fieldName] = value;
    this.setState({
      goals: this.state.goals,
    });
  };

  const moveGoalsKey = (diff) => {
    let [year, quarter] = this.state.goalsKey.split("-");
    let rawValue = Number.parseInt(year) * 4 + Number.parseInt(quarter);
    let newValue = rawValue + diff;
    this.setState({
      goalsKey: `${Math.floor(newValue / 4)}-${newValue % 4}`,
    });
  };

  const addSub = () => {
    let newSubscriptions = this.state.subscriptions;
    let newSub = Object.assign({}, CONSTANTS.EMPTY_SUBSCRIPTION);
    newSub.tags = [];
    newSubscriptions.push(newSub);
    this.setState({
      subscriptions: newSubscriptions,
    });
  };

  const deleteSub = (ind) => {
    let newSubscriptions = this.state.subscriptions;
    newSubscriptions.splice(ind, 1);
    this.setState({
      subscriptions: newSubscriptions,
    });
  };

  const editSub = (sub, fieldName, value) => {
    sub[fieldName] = value;
    this.setState({
      subscriptions: this.state.subscriptions,
    });
  };

  const selectChartDate = (fieldName) => {
    let relevantDate =
      fieldName === "start" ? this.state.chartStart : this.state.chartEnd;
    this.setState({
      chartDateField: fieldName,
      setChartDate: relevantDate,
      selectingChart: true,
    });
  };

  const changeChartDate = (date) => {
    this.setState({
      setChartDate: date,
    });
  };

  const commitChartDate = () => {
    this.setState({
      selectingChart: false,
      [this.state.chartDateField === "start" ? "chartStart" : "chartEnd"]:
        this.state.setChartDate,
    });
  };

  const handleGoalClick = (goal) => {
    goal.show = !goal.show;
    this.setState({
      goals: this.state.goals,
    });
  };

  const handleSubClick = (sub) => {
    sub.show = !sub.show;
    this.setState({
      subscriptions: this.state.subscriptions,
    });
  };

  const startGoalEdit = (goal) => {
    goal.editing = true;
    goal.editName = goal.name;
    goal.editDescription = goal.description;
    this.setState({
      goals: this.state.goals,
    });
  };

  const commitGoalEdit = (goal) => {
    goal.editing = false;
    goal.name = goal.editName;
    goal.description = goal.editDescription;
    this.setState({
      goals: this.state.goals,
    });
  };

  const saveProfile = () => {
    if (isEditingAnything()) {
      return;
    }
    let body = {
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

  render() {
    const curKey = this.state.hoverKey || this.state.defaultHoverKey;
    let { total, itemized, transactionList } = this.getSpendingByCategory();
    let data = [];
    let curTransactions = transactionList[curKey] || [];
    let [goalsYear, goalsQuarter] = this.state.goalsKey.split("-");
    Object.keys(itemized).forEach((key) => {
      data.push({
        title: key,
        value: itemized[key],
        color: CONSTANTS.COLOR_FOR_KEY(key),
      });
    });
    return (
      <div className="profileContainer">
        {!selectingChart ? null : (
          <div className="selectContainer" onClick={this.commitChartDate}>
            <div className="selectPopup" onClick={(e) => e.stopPropagation()}>
              Selecting {this.state.chartDateField} date as{" "}
              {this.state.setChartDate}
              <Calendar
                className="subCalendar"
                onClickDay={(e) => this.changeChartDate(e.toLocaleDateString())}
                calendarType="US"
                defaultValue={new Date(this.state.setChartDate)}
              />
              <div className="button saveButton" onClick={this.commitChartDate}>
                Select Date
              </div>
            </div>
          </div>
        )}
        <div className="subContainer">
          <div className="subTitle">
            <div className="subTitleMain">
              SUBSCRIPTIONS
              {this.subChanged() ? <div className="subChanged">*</div> : null}
            </div>
            <div className="subTitleSecondary">
              <div className="smallButton text green" onClick={this.addSub}>
                +
              </div>
            </div>
          </div>
          <div className="subList">
            {subscriptions.map((el, ind) => (
              <Subscription key={ind} subscription={el} />
            ))}
          </div>
          <div
            className={clsx("button saveButton", {
              disabled: isEditingAnything(),
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
              {this.goalsChanged() ? (
                <div className="goalChanged">*</div>
              ) : null}
            </div>
            <div className="goalTitleSecondary">
              <div
                className="smallButton text"
                onClick={() => this.moveGoalsKey(-1)}
              >
                {"<"}
              </div>
              {`${goalsYear} Q${goalsQuarter + 1}`}
              <div
                className="smallButton text"
                onClick={() => this.moveGoalsKey(1)}
              >
                {">"}
              </div>
            </div>
            <div className="goalTitleSecondary">
              <div className="smallButton text green" onClick={this.addGoal}>
                +
              </div>
            </div>
          </div>
          <div className="goalList">
            {(this.state.goals[this.state.goalsKey] || []).map((el, ind) => (
              <div
                key={ind}
                className={clsx("goalEntry", {
                  passed: el.status === "passed",
                  failed: el.status === "failed",
                })}
              >
                <div className="goalHeader">
                  <div
                    className="goalName"
                    onClick={() => this.handleGoalClick(el)}
                  >
                    {el.editing ? (
                      <input
                        type="text"
                        className="goalEditEntry"
                        name="goalLocationEntry"
                        id="goalLocationEntry"
                        value={el.editName}
                        onChange={(e) =>
                          this.editGoal(el, "editName", e.target.value)
                        }
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      el.name
                    )}
                  </div>
                  <div className="goalIcons">
                    <img
                      className="smallButton buttonPicture"
                      onClick={() => this.cycleGoalStatus(el)}
                      src={"/media/refresh.svg"}
                    />
                    <img
                      className="smallButton buttonPicture"
                      onClick={
                        el.editing
                          ? () => this.commitGoalEdit(el)
                          : () => this.startGoalEdit(el)
                      }
                      src={
                        el.editing ? "/media/check.svg" : "/media/pencil.svg"
                      }
                    />
                    <div
                      className="smallButton text red"
                      onClick={() => this.deleteGoal(ind)}
                    >
                      x
                    </div>
                  </div>
                </div>
                {el.show ? (
                  <div className="goalBody">
                    {el.editing ? (
                      <textarea
                        type="text"
                        className="goalEditDescription"
                        name="goalDescriptionEntry"
                        id="goalDescriptionEntry"
                        value={el.editDescription}
                        onChange={(e) =>
                          this.editGoal(el, "editDescription", e.target.value)
                        }
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      el.description
                    )}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
          <div
            className={clsx("button saveButton", {
              disabled: isEditingAnything(),
            })}
            onClick={saveProfile}
          >
            Save
          </div>
        </div>
        <div className="chartContainer">
          <div className="chartHeader">
            <div
              className="chartDate"
              onClick={() => this.selectChartDate("start")}
            >
              {this.state.chartStart}
            </div>
            TO
            <div
              className="chartDate"
              onClick={() => this.selectChartDate("end")}
            >
              {this.state.chartEnd}
            </div>
            <div className="chartPresetList">
              {CONSTANTS.PRESET_SPANS.map((span) => (
                <div
                  className="chartPreset"
                  onClick={() => this.setPresetSpan(span)}
                >
                  {span}
                </div>
              ))}
            </div>
          </div>
          <div className="chartBody">
            <div className="chartPie">
              <PieChart
                data={data}
                onClick={(_, index) =>
                  this.setDefaultHoverKey(data[index].title)
                }
                onMouseOver={(_, index) => this.setHoverKey(data[index].title)}
                onMouseOut={() => this.setHoverKey("")}
              />
            </div>
            <div className="chartTotals">
              <div className="chartTotalMain">
                TOTAL: {CONSTANTS.FORMAT_COST(total)}
              </div>
              <div className="chartDetails">
                <div className="chartCategories">
                  {data.map((el, ind) => (
                    <div
                      key={ind}
                      className={clsx({
                        chartHoverKey: el.title === curKey,
                      })}
                    >
                      {el.title} : {CONSTANTS.FORMAT_COST(el.value)}
                    </div>
                  ))}
                </div>
                <div className="chartTransactions">
                  {curTransactions.map((transaction, ind) => (
                    <div key={ind}>
                      {transaction.date} - {transaction.location}:{" "}
                      {CONSTANTS.FORMAT_COST(transaction.cost)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Profile;