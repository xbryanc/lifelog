import React, { useState, useEffect } from "react";
// @ts-ignore
import Calendar from "react-calendar";
import _ from "lodash";
import clsx from "clsx";

import { Subscription, SubscriptionFrequency } from "../../../../defaults";
import {
  formatCost,
  formatFrequency,
  formatSubTime,
} from "../../../../helpers";
import { makeStyles, theme } from "../../theme";

interface SubscriptionProps {
  highlight?: boolean;
  subscription: Subscription;
  editSubscription: (s: Subscription) => void;
  deleteSubscription: () => void;
  selectedTag: string;
  incrementEdits: () => void;
  decrementEdits: () => void;
}

const Subscription: React.FC<SubscriptionProps> = ({
  highlight,
  subscription,
  editSubscription,
  deleteSubscription,
  selectedTag,
  incrementEdits,
  decrementEdits,
}) => {
  const classes = useStyles();
  const isIncomplete =
    !subscription.location || !subscription.cost || !subscription.description;
  const [show, setShow] = useState(isIncomplete);
  const [start, setStart] = useState(subscription.start);
  const [end, setEnd] = useState(subscription.end);
  const [frequency, setFrequency] = useState<SubscriptionFrequency>(
    subscription.frequency
  );
  const [cost, setCost] = useState(subscription.cost);
  const [location, setLocation] = useState(subscription.location);
  const [description, setDescription] = useState(subscription.description);
  const [tags, setTags] = useState(subscription.tags);
  const [editing, setEditing] = useState(isIncomplete);
  const [editCost, setEditCost] = useState(cost);
  const [editLocation, setEditLocation] = useState(location);
  const [editDescription, setEditDescription] = useState(description);

  const [showSelect, setShowSelect] = useState(false);
  const [endpointName, setEndpointName] = useState<"start" | "end">("start");
  const [endpointDate, setEndpointDate] = useState(
    new Date(Date.now()).toLocaleDateString()
  );

  useEffect(() => {
    editSubscription({
      start,
      end,
      frequency,
      cost,
      location,
      description,
      tags,
    });
  }, [start, end, frequency, cost, location, description, tags]);

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

  const handleClick = () => {
    if (selectedTag === "") {
      setShow(!show);
      return;
    }
    const newTags = _.cloneDeep(tags);
    const tagIndex = newTags.indexOf(selectedTag);
    if (tagIndex === -1) {
      newTags.push(selectedTag);
    } else {
      newTags.splice(tagIndex, 1);
    }
    setTags(newTags);
  };

  const selectDate = (fieldName: "start" | "end") => {
    if (!editing) {
      return;
    }
    setEndpointName(fieldName);
    setEndpointDate(
      (fieldName === "start" ? start : end) ||
        new Date(Date.now()).toLocaleDateString()
    );
    setShowSelect(true);
  };

  const commitDate = () => {
    if (endpointName === "start") {
      setStart(endpointDate);
    } else {
      setEnd(endpointDate);
    }
    setShowSelect(false);
  };

  const startSubEdit = () => {
    setEditing(true);
    setEditCost(cost);
    setEditLocation(location);
    setEditDescription(description);
  };

  const commitSubEdit = () => {
    setEditing(false);
    setCost(editCost);
    setLocation(editLocation);
    setDescription(editDescription);
  };

  return (
    <div
      className={clsx(classes.entry, {
        highlight: !!highlight,
      })}
    >
      {!showSelect ? null : (
        <div className={classes.selectContainer} onClick={commitDate}>
          <div
            className={classes.selectPopup}
            onClick={(e) => e.stopPropagation()}
          >
            Selecting {endpointName} date as {endpointDate}
            <div>
              <Calendar
                onClickDay={(e: any) => setEndpointDate(e.toLocaleDateString())}
                calendarType="US"
                defaultValue={new Date(endpointDate)}
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
            <div
              className={clsx(classes.button, "savebutton")}
              onClick={commitDate}
            >
              Select Date
            </div>
          </div>
        </div>
      )}
      <div className={classes.header}>
        <div className={classes.location} onClick={handleClick}>
          {editing ? (
            <input
              type="text"
              className={classes.editEntry}
              name="subLocationEntry"
              id="subLocationEntry"
              value={editLocation}
              onChange={(e) => setEditLocation(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            location
          )}
        </div>
        <div
          className={clsx(classes.timeFrame, {
            editing: editing,
          })}
          onClick={() => editing && handleClick()}
        >
          <div
            className={clsx(classes.timeStart, {
              editing,
            })}
            onClick={() => selectDate("start")}
          >
            {formatSubTime(start)}
          </div>
          <div className={classes.timeDash}>-</div>
          <div
            className={clsx(classes.timeEnd, {
              editing,
            })}
            onClick={() => selectDate("end")}
          >
            {formatSubTime(end)}
          </div>
          <div>
            {editing ? (
              <select
                name="subFrequency"
                id="subFrequency"
                value={frequency}
                onChange={(e) =>
                  setFrequency(e.target.value as SubscriptionFrequency)
                }
              >
                {_.values(SubscriptionFrequency).map((freq) => (
                  <option key={freq} value={freq}>
                    {freq}
                  </option>
                ))}
              </select>
            ) : (
              formatFrequency(frequency)
            )}
          </div>
        </div>
        <div className={classes.tagsList} onClick={handleClick}>
          {tags.map((tag) => (
            <div key={tag} className={classes.tag}>
              {tag}
            </div>
          ))}
        </div>
        <div
          className={clsx(classes.cost, {
            zero: !editing && !cost,
          })}
          onClick={handleClick}
        >
          {editing ? (
            <input
              type="number"
              className={classes.editEntry}
              name="subCostEntry"
              id="subCostEntry"
              value={editCost}
              onChange={(e) => setEditCost(parseInt(e.target.value))}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            formatCost(cost)
          )}
        </div>
        <div className={classes.icons}>
          <img
            className={clsx(classes.smallButton, classes.buttonPicture)}
            onClick={editing ? commitSubEdit : startSubEdit}
            src={editing ? "/media/check.svg" : "/media/pencil.svg"}
          />
          <div
            className={clsx(classes.smallButton, "text red")}
            onClick={deleteSubscription}
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
              name="subDescriptionEntry"
              id="subDescriptionEntry"
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
  header: {
    display: "flex",
    flexDirection: "row",
    borderBottom: "1px solid black",
    padding: "0px 3px",
  },
  location: {
    cursor: "pointer",
    flexGrow: 0,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "0px 5px",
  },
  tagsList: {
    cursor: "pointer",
    flexGrow: 1,
    display: "flex",
    flexDirection: "row",
  },
  tag: {
    border: "1px solid black",
    borderRadius: "5px",
    margin: "5px",
    padding: "5px",
  },
  cost: {
    cursor: "pointer",
    flexGrow: 0,
    borderLeft: "1px solid black",
    borderRight: "1px solid black",
    padding: "0px 3px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  zero: {
    color: "red",
  },
  entry: {
    border: "1px solid black",
    borderRadius: "5px",
    marginTop: "3px",
    "&.highlight": {
      backgroundColor: theme.colors.periwinkle50,
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
  timeFrame: {
    flexGrow: 0,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    borderLeft: "1px solid black",
    borderRight: "1px solid black",
    padding: "0px 5px",
    cursor: "pointer",
    "&.editing": {
      cursor: "default",
    },
  },
  timeStart: {
    "&.editing": {
      cursor: "pointer",
    },
  },
  timeEnd: {
    "&.editing": {
      cursor: "pointer",
    },
  },
  timeDash: {
    margin: "0px 5px",
  },
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
    border: `1px solid ${theme.colors.coolGray80}`,
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
  buttonPicture: {
    width: "30px",
  },
}));

export default Subscription;
