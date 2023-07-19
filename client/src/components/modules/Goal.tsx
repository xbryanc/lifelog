import React, { useState, useEffect } from "react";
import _ from "lodash";

import clsx from "clsx";
import { Goal, GoalStatus } from "../../../../defaults";
import { makeStyles } from "../../theme";

interface GoalProps {
  goal: Goal;
  editGoal: (g: Goal) => void;
  deleteGoal: () => void;
  cycleStatus: () => void;
  incrementEdits: () => void;
  decrementEdits: () => void;
}

const Goal: React.FC<GoalProps> = ({
  goal,
  editGoal,
  deleteGoal,
  cycleStatus,
  incrementEdits,
  decrementEdits,
}) => {
  const classes = useStyles();
  const isIncomplete = !goal.name || !goal.description;
  const [show, setShow] = useState(isIncomplete);
  const [name, setName] = useState(goal.name);
  const [description, setDescription] = useState(goal.description);

  const [editing, setEditing] = useState(isIncomplete);
  const [editName, setEditName] = useState(name);
  const [editDescription, setEditDescription] = useState(description);

  useEffect(() => {
    editGoal({
      name,
      description,
      status: goal.status,
    });
  }, [name, description]);

  useEffect(() => {
    if (!editing) {
      incrementEdits(); // to counteract below on initialization
    }
    return () => {
      if (editing) {
        decrementEdits();
      }
    };
  }, []);

  useEffect(() => {
    if (editing) {
      incrementEdits();
    } else {
      decrementEdits();
    }
  }, [editing]);

  const startGoalEdit = () => {
    setEditing(true);
    setEditName(name);
    setEditDescription(description);
  };

  const commitGoalEdit = () => {
    setEditing(false);
    setName(editName);
    setDescription(editDescription);
  };

  return (
    <div
      className={clsx(classes.entry, {
        passed: goal.status === GoalStatus.PASSED,
        failed: goal.status === GoalStatus.FAILED,
      })}
    >
      <div className={classes.header}>
        <div className={classes.name} onClick={() => setShow(!show)}>
          {editing ? (
            <input
              type="text"
              className={classes.editEntry}
              name="locationEntry"
              id="locationEntry"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            name
          )}
        </div>
        <div className={classes.icons}>
          <img
            className={clsx(classes.smallButton, classes.buttonPicture)}
            onClick={cycleStatus}
            src={"/media/refresh.svg"}
          />
          <img
            className={clsx(classes.smallButton, classes.buttonPicture)}
            onClick={editing ? commitGoalEdit : startGoalEdit}
            src={editing ? "/media/check.svg" : "/media/pencil.svg"}
          />
          <div
            className={clsx(classes.smallButton, "text red")}
            onClick={deleteGoal}
          >
            x
          </div>
        </div>
      </div>
      {show ? (
        <div className={classes.body}>
          {editing ? (
            <textarea
              className={classes.editDescription}
              name="goalDescriptionEntry"
              id="goalDescriptionEntry"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            description
          )}
        </div>
      ) : null}
    </div>
  );
};

const useStyles = makeStyles((theme) => ({
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
  buttonPicture: {
    width: "30px",
  },
  header: {
    display: "flex",
    flexDirection: "row",
    borderBottom: "1px solid black",
    padding: "0px 3px",
  },
  name: {
    cursor: "pointer",
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "0px 5px",
  },
  entry: {
    border: "1px solid black",
    borderRadius: "5px",
    marginTop: "3px",
    "&.passed": {
      backgroundColor: theme.colors.green400,
    },
    "&.failed": {
      backgroundColor: theme.colors.orange,
    },
  },
  body: {
    padding: "5px 10px",
    borderBottom: "1px solid black",
  },
  icons: {
    flexGrow: 0,
    padding: "5px",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
  },
  editEntry: {
    width: "100%",
  },
  editDescription: {
    width: "100%",
  },
}));

export default Goal;
