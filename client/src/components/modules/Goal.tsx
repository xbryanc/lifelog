import React, { useState, useEffect } from "react";
import _ from "lodash";

import clsx from "clsx";
import { Goal, GoalStatus } from "../../../../defaults";
import "../../css/app.css";
import "../../css/home.css";

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
  const [show, setShow] = useState(false);
  const [name, setName] = useState(goal.name);
  const [description, setDescription] = useState(goal.description);

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(name);
  const [editDescription, setEditDescription] = useState(description);

  useEffect(() => {
    editGoal({
      name,
      description,
      status: goal.status,
    });
  }, [name, description]);

  const startGoalEdit = () => {
    setEditing(true);
    setEditName(name);
    setEditDescription(description);
    incrementEdits();
  };

  const commitGoalEdit = () => {
    setEditing(false);
    setName(editName);
    setDescription(editDescription);
    decrementEdits();
  };

  return (
    <div
      className={clsx("goalEntry", {
        passed: goal.status === GoalStatus.PASSED,
        failed: goal.status === GoalStatus.FAILED,
      })}
    >
      <div className="goalHeader">
        <div className="goalName" onClick={() => setShow(!show)}>
          {editing ? (
            <input
              type="text"
              className="goalEditEntry"
              name="goalLocationEntry"
              id="goalLocationEntry"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            name
          )}
        </div>
        <div className="goalIcons">
          <img
            className="smallButton buttonPicture"
            onClick={cycleStatus}
            src={"/media/refresh.svg"}
          />
          <img
            className="smallButton buttonPicture"
            onClick={editing ? commitGoalEdit : startGoalEdit}
            src={editing ? "/media/check.svg" : "/media/pencil.svg"}
          />
          <div className="smallButton text red" onClick={deleteGoal}>
            x
          </div>
        </div>
      </div>
      {show ? (
        <div className="goalBody">
          {editing ? (
            <textarea
              className="goalEditDescription"
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

export default Goal;
