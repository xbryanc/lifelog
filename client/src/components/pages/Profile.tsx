import React, { useState, useEffect, useMemo } from "react";
// @ts-ignore
import _ from "lodash";
import clsx from "clsx";
import {
  EMPTY_GOAL,
  NEW_FRIEND,
  Friend,
  Goal,
  GoalStatus,
  User,
} from "../../../../defaults";
import {
  toGoalsKey,
  stripId,
} from "../../../../helpers";
import GoalComponent from "../modules/Goal";
import FriendComponent from "../modules/Friend";
import { makeStyles } from "../../theme";

interface ProfileProps {
  userInfo: User;
}

const Profile: React.FC<ProfileProps> = ({ userInfo }) => {
  const classes = useStyles();

  const [goalsKey, setGoalsKey] = useState(
    toGoalsKey(new Date().toLocaleDateString())
  );
  const [goals, setGoals] = useState(_.cloneDeep(userInfo.goals));
  const [friends, setFriends] = useState(_.cloneDeep(userInfo.friends).sort((friendA, friendB) => {
    const dateA = new Date(friendA.lastUpdated);
    const dateB = new Date(friendB.lastUpdated);
    return dateA > dateB ? -1 : 1;
  }));

  const [editCounts, setEditCounts] = useState(0);

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
  }, []);

  const addGoal = () => {
    const newGoals = _.cloneDeep(goals);
    const newGoal = EMPTY_GOAL();
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
    const newFriend = NEW_FRIEND();
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

  const saveProfile = () => {
    if (!!editCounts) {
      return;
    }
    const body = {
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

  const [goalsYear, goalsQuarter] = useMemo(
    () => goalsKey.split("-").map((s) => Number.parseInt(s)),
    [goalsKey]
  );

  return (
    <div className={classes.profileContainer}>
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
              key={el.id}
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
              key={el._id}
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
    </div>
  );
};

const useStyles = makeStyles((theme) => ({
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
    "&.picture": {
      width: "30px",
    },
    "&:hover": {
      opacity: "0.8",
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
  saveContainer: {
    width: "80%",
    margin: "5px",
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
}));

export default Profile;
