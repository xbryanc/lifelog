import React, { useState, useEffect, useMemo, useCallback } from "react";
// @ts-ignore
import Calendar from "react-calendar";
import _ from "lodash";
import clsx from "clsx";
import { PieChart } from "react-minimal-pie-chart";

import {
  EMPTY_GOAL,
  EMPTY_SUBSCRIPTION,
  NEW_FRIEND,
  FinanceLog,
  Friend,
  Goal,
  GoalStatus,
  MISC_TAG,
  Span,
  Subscription,
  User,
} from "../../../../defaults";
import {
  mkk,
  colorForKey,
  formatCost,
  subApplies,
  subtractPreset,
  toGoalsKey,
  stripId,
} from "../../../../helpers";
import SubscriptionComponent from "../modules/Subscription";
import GoalComponent from "../modules/Goal";
import FriendComponent from "../modules/Friend";
import { makeStyles, theme } from "../../theme";

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
  const classes = useStyles();
  const [selectedTag, _setSelectedTag] = useState("");
  const [finance, setFinance] = useState<FinanceLog>({});
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
  const [friends, setFriends] = useState(_.cloneDeep(userInfo.friends).sort((friendA, friendB) => {
    const dateA = new Date(friendA.lastUpdated);
    const dateB = new Date(friendB.lastUpdated);
    return dateA > dateB ? -1 : 1;
  }));

  const [editCounts, setEditCounts] = useState(0);

  const subsChanged = useMemo(
    () => !_.isEqual(subscriptions.map(stripId), userInfo.subscriptions.map(stripId)),
    [subscriptions, userInfo.subscriptions]
  )

  const goalsChanged = useMemo(
    () => !_.isEqual(goals, userInfo.goals),
    [goals, userInfo.goals]
  );

  const friendsChanged = useMemo(
    () => !_.isEqual(friends.map(stripId), userInfo.friends.map(stripId)),
    [friends, userInfo.friends]
  );

  useEffect(() => {
    document.title = "Profile";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    (async () => {
      const finance: FinanceLog = {};
      const allYears = await (await fetch("/api/all_years")).json();
      for (const year of allYears) {
        const newFinanceEntry = await (
          await fetch(`/api/finance?year=${year}`)
        ).json();
        Object.assign(finance, newFinanceEntry);
      }
      setFinance(finance);
    })();
  }, []);

  const selectTag = (tag: string) => {
    _setSelectedTag(selectedTag === tag ? "" : tag);
  };

  const handleKeyDown = (event: any) => {
    if (event.key === "Escape") {
      selectTag("");
    }
  };

  const setPresetSpan = (span: Span) => {
    const today = new Date(Date.now()).toLocaleDateString();
    const prev = subtractPreset(today, span);
    setChartStart(prev);
    setChartEnd(today);
  };

  const setDefaultHoverKey = (key: string) => {
    _setDefaultHoverKey(defaultHoverKey === key ? "" : key);
  };

  const getSpendingByCategory = useCallback(() => {
    const startDate = new Date(chartStart);
    const endDate = new Date(chartEnd);
    let total = 0;
    const itemized: Record<string, number> = {};
    const transactionList: Record<string, TransactionListItem[]> = {};
    if (endDate < startDate) {
      return { total, transactionList, pieData: [] };
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
    const pieData: PieEntry[] = Object.entries(itemized).map(
      ([key, value]) => ({
        title: key,
        value,
        color: colorForKey(key),
      })
    );
    return { total, transactionList, pieData };
  }, [chartStart, chartEnd, subscriptions, finance]);

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
    setGoals(newGoals);
  };

  const editGoal = (ind: number, newGoal: Goal) => {
    const newGoals = _.cloneDeep(goals);
    newGoals[goalsKey][ind] = newGoal;
    setGoals(newGoals);
  };

  const addFriend = () => {
    const newFriends = _.cloneDeep(friends);
    const newFriend = _.cloneDeep(NEW_FRIEND);
    newFriends.push(newFriend);
    setFriends(newFriends);
  }

  const deleteFriend = (ind: number) => {
    const newFriends = _.cloneDeep(friends);
    newFriends.splice(ind, 1);
    setFriends(newFriends);
  }

  const editFriend = (ind: number, newFriend: Friend) => {
    const newFriends = _.cloneDeep(friends);
    newFriends[ind] = newFriend;
    setFriends(newFriends);
  }

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
    if (editCounts) {
      return;
    }
    const body = {
      subscriptions,
      goals,
      friends,
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

  const curKey = useMemo(
    () => hoverKey || defaultHoverKey,
    [hoverKey, defaultHoverKey]
  );
  const { total, pieData, transactionList } = useMemo(getSpendingByCategory, [
    getSpendingByCategory,
  ]);

  const curTransactions = useMemo(
    () => transactionList[curKey] || [],
    [transactionList, curKey]
  );
  const [goalsYear, goalsQuarter] = useMemo(
    () => goalsKey.split("-").map((s) => Number.parseInt(s)),
    [goalsKey]
  );

  return (
    <div className={classes.profileContainer}>
      {!selectingChart ? null : (
        <div className={classes.selectContainer} onClick={commitChartDate}>
          <div
            className={classes.selectPopup}
            onClick={(e) => e.stopPropagation()}
          >
            Selecting {chartDateField} date as {tempChartDate}
            <div>
              <Calendar
                onClickDay={(e: any) =>
                  setTempChartDate(e.toLocaleDateString())
                }
                calendarType="US"
                defaultValue={new Date(tempChartDate)}
              />
              <style>
                {`
                  .react-calendar__tile {
                      display: flex;
                      flex-direction: row;
                      justify-content: center;
                  }

                  .react-calendar__tile--now {
                      border-color: ${theme.colors.periwinkle50};
                  }

                  .react-calendar__tile--active {
                      border-color: ${theme.colors.gold};
                  }
                `}
              </style>
            </div>
            <div className={classes.button} onClick={commitChartDate}>
              Select Date
            </div>
          </div>
        </div>
      )}
      <div className={classes.subContainer}>
        <div className={classes.subTitle}>
          <div className={classes.subTitleMain}>
            SUBSCRIPTIONS
            {!!subsChanged ? <div className={classes.changed}>*</div> : null}
          </div>
          <div className={classes.subTitleSecondary}>
            <div
              className={clsx(classes.smallButton, "text green")}
              onClick={addSub}
            >
              +
            </div>
          </div>
        </div>
        <div className={classes.finTagsList}>
          {userInfo.tags.map((el) => {
            return (
              <div key={el} className={classes.finTag}>
                <div
                  className={clsx(classes.finTagName, {
                    selected: el == selectedTag,
                  })}
                  onClick={() => selectTag(el)}
                >
                  {el}
                </div>
              </div>
            );
          })}
        </div>
        <div>
          {subscriptions.map((el, ind) => (
            <SubscriptionComponent
              odd={ind % 2 == 1}
              key={ind}
              subscription={el}
              editSubscription={(s: Subscription) => editSub(ind, s)}
              deleteSubscription={() => deleteSub(ind)}
              selectedTag={selectedTag}
              incrementEdits={() => setEditCounts((ec) => ec + 1)}
              decrementEdits={() => setEditCounts((ec) => ec - 1)}
            />
          ))}
        </div>
      </div>
      <div className={classes.goalContainer}>
        <div className={classes.goalTitle}>
          <div className={classes.goalTitleMain}>
            GOALS
            {!!goalsChanged ? <div className={classes.changed}>*</div> : null}
          </div>
          <div className={classes.goalTitleSecondary}>
            <div
              className={clsx(classes.smallButton, "text")}
              onClick={() => moveGoalsKey(-1)}
            >
              {"<"}
            </div>
            {`${goalsYear} Q${goalsQuarter + 1}`}
            <div
              className={clsx(classes.smallButton, "text")}
              onClick={() => moveGoalsKey(1)}
            >
              {">"}
            </div>
          </div>
          <div className={classes.goalTitleSecondary}>
            <div
              className={clsx(classes.smallButton, "text green")}
              onClick={addGoal}
            >
              +
            </div>
          </div>
        </div>
        <div>
          {(goals[goalsKey] || []).map((el, ind) => (
            <GoalComponent
              key={mkk([goalsKey, ind, el])}
              goal={el}
              editGoal={(g: Goal) => editGoal(ind, g)}
              deleteGoal={() => deleteGoal(ind)}
              cycleStatus={() => cycleGoalStatus(ind)}
              incrementEdits={() => setEditCounts((ec) => ec + 1)}
              decrementEdits={() => setEditCounts((ec) => ec - 1)}
            />
          ))}
        </div>
      </div>
      <div className={classes.friendContainer}>
        <div className={classes.friendTitle}>
          <div className={classes.friendTitleMain}>
            FRIENDS
            {!!friendsChanged ? <div className={classes.changed}>*</div> : null}
          </div>
          <div className={classes.friendTitleSecondary}>
            <div
              className={clsx(classes.smallButton, "text green")}
              onClick={addFriend}
            >
              +
            </div>
          </div>
        </div>
        <div>
          {friends.map((el, ind) => (
            <FriendComponent
              odd={ind % 2 == 1}
              key={ind}
              friend={el}
              editFriend={(f: Friend) => editFriend(ind, f)}
              deleteFriend={() => deleteFriend(ind)}
              incrementEdits={() => setEditCounts((ec) => ec + 1)}
              decrementEdits={() => setEditCounts((ec) => ec - 1)}
            />
          ))}
        </div>
      </div>
      <div
          className={clsx(classes.saveContainer, classes.button, {
            disabled: !!editCounts,
          })}
          onClick={saveProfile}
        >
          Save
        </div>
      <div className={classes.chartContainer}>
        <div className={classes.chartHeader}>
          <div
            className={classes.chartDate}
            onClick={() => selectChartDate("start")}
          >
            {chartStart}
          </div>
          TO
          <div
            className={classes.chartDate}
            onClick={() => selectChartDate("end")}
          >
            {chartEnd}
          </div>
          <div className={classes.chartPresetList}>
            {_.values(Span).map((span) => (
              <div
                className={classes.chartPreset}
                onClick={() => setPresetSpan(span)}
              >
                {span}
              </div>
            ))}
          </div>
        </div>
        <div className={classes.chartBody}>
          <div className={classes.chartPie}>
            <PieChart
              data={pieData}
              onClick={(_, index) => setDefaultHoverKey(pieData[index].title)}
              onMouseOver={(_, index) => setHoverKey(pieData[index].title)}
              onMouseOut={() => setHoverKey("")}
            />
          </div>
          <div className={classes.chartTotals}>
            <div className={classes.chartTotalMain}>
              TOTAL: {formatCost(total)}
            </div>
            <div className={classes.chartDetails}>
              <div>
                {pieData.map((el) => (
                  <div
                    key={mkk([el.title, el.value])}
                    className={clsx({
                      [classes.chartHoverKey]: el.title === curKey,
                    })}
                  >
                    {el.title} : {formatCost(el.value)}
                  </div>
                ))}
              </div>
              <div className={classes.chartTransactions}>
                {curTransactions.map((transaction, ind) => (
                  <div
                    key={mkk([ind, transaction])}
                  >
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

const useStyles = makeStyles((theme) => ({
  selectContainer: {
    position: "fixed",
    width: "100%",
    height: "100%",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    margin: "auto",
    zIndex: 150,
  },
  selectPopup: {
    display: "flex",
    flexDirection: "column",
    position: "absolute",
    left: "10%",
    right: "10%",
    top: "10%",
    bottom: "10%",
    margin: "auto",
    backgroundColor: "whitesmoke",
    border: "1px solid #383838",
    borderRadius: "5px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2), 0 6px 20px rgba(0, 0, 0, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    cursor: "pointer",
    fontFamily: "Montserrat, sans-serif",
    letterSpacing: "0.1em",
    fontSize: "2vh",
    lineHeight: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0.55em 1.5em 0.6em",
    borderRadius: "100vw",
    textDecorationLine: "none",
    border: `0.08em solid ${theme.colors.black}`,
    textAlign: "center",
    wordWrap: "break-word",
    transition: "transform 1s ease, box-shadow 1s ease",
    "&:hover": {
      transform: "scale(1.05, 1.05)",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2), 0 3px 10px rgba(0, 0, 0, 0.19)",
    },
    "&.disabled:hover": {
      transform: "none",
      boxShadow: "none",
      cursor: "default",
    },
  },
  smallButton: {
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    "&.text": {
      fontSize: "20px",
      fontWeight: "bold",
    },
    "&.red": {
      color: theme.colors.red,
    },
    "&.green": {
      color: theme.colors.green,
    },
  },
  profileContainer: {
    display: "flex",
    paddingTop: "8vh",
    width: "100%",
    height: "100%",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  chartDate: {
    textDecoration: "underline",
    margin: "0 5px",
    cursor: "pointer",
  },
  saveContainer: {
    width: "80%",
    margin: "5px",
  },
  chartContainer: {
    border: "1px solid black",
    borderRadius: "5px",
    padding: "5px",
    width: "80%",
  },
  chartHeader: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    borderBottom: "1px solid black",
    padding: "10px",
  },
  chartBody: {
    display: "flex",
    flexDirection: "row",
  },
  chartPie: {
    width: "40vw",
    height: "40vw",
    padding: "5px",
  },
  chartTotals: {
    width: "50%",
    padding: "5px",
    display: "flex",
    flexDirection: "column",
  },
  chartTotalMain: {
    marginBottom: "30px",
    fontSize: "30px",
  },
  chartDetails: {
    height: "70%",
    display: "flex",
    flexDirection: "row",
  },
  chartHoverKey: {
    color: theme.colors.green,
  },
  chartPresetList: {
    display: "flex",
    flexDirection: "row",
  },
  chartPreset: {
    cursor: "pointer",
    margin: "0px 2px",
    border: "1px solid black",
    borderRadius: "5px",
  },
  chartTransactions: {
    paddingLeft: "10px",
  },
  subContainer: {
    border: "1px solid black",
    borderRadius: "5px",
    padding: "5px",
    width: "80%",
  },
  subTitle: {
    display: "flex",
    flexDirection: "row",
  },
  subTitleMain: {
    display: "flex",
    flexDirection: "row",
    flexGrow: 1,
  },
  subTitleSecondary: {
    flexGrow: 0,
  },
  goalContainer: {
    border: "1px solid black",
    borderRadius: "5px",
    padding: "5px",
    width: "80%",
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  goalTitle: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  goalTitleMain: {
    display: "flex",
    flexDirection: "row",
    width: "10px",
  },
  goalTitleSecondary: {
    display: "flex",
    flexDirection: "row",
    gap: "4px",
    alignItems: "center",
  },
  friendContainer: {
    border: "1px solid black",
    borderRadius: "5px",
    padding: "5px",
    width: "80%",
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  friendTitle: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  friendTitleMain: {
    display: "flex",
    flexDirection: "row",
    width: "10px",
  },
  friendTitleSecondary: {
    display: "flex",
    flexDirection: "row",
    gap: "4px",
    alignItems: "center",
  },
  changed: {
    fontWeight: "bold",
    fontSize: "20px",
    color: theme.colors.orange,
  },
  finTagsList: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  finTag: {
    display: "flex",
    flexDirection: "row",
    margin: "5px",
  },
  finTagName: {
    border: "1px solid black",
    borderRadius: "5px",
    cursor: "pointer",
    padding: "3px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    "&.selected": {
      backgroundColor: theme.colors.green400,
    },
  },
}));

export default Profile;
