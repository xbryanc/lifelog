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
import "../../css/app.css";
import "../../css/home.css";

interface SubscriptionProps {
  subscription: Subscription;
  editSubscription: (s: Subscription) => void;
  deleteSubscription: () => void;
  incrementEdits: () => void;
  decrementEdits: () => void;
}

const Subscription: React.FC<SubscriptionProps> = ({
  subscription,
  editSubscription,
  deleteSubscription: _deleteSubscription,
  incrementEdits,
  decrementEdits,
}) => {
  const [show, setShow] = useState(false);
  const [start, setStart] = useState(subscription.start);
  const [end, setEnd] = useState(subscription.end);
  const [frequency, setFrequency] = useState<SubscriptionFrequency>(
    subscription.frequency
  );
  const [cost, setCost] = useState(subscription.cost);
  const [location, setLocation] = useState(subscription.location);
  const [description, setDescription] = useState(subscription.description);
  // TODO: set tags
  const [tags, setTags] = useState(subscription.tags);
  const [editing, setEditing] = useState(false);
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

  const deleteSubscription = () => {
    if (editing) {
      decrementEdits();
    }
    _deleteSubscription();
  };

  const startSubEdit = () => {
    setEditing(true);
    setEditCost(cost);
    setEditLocation(location);
    setEditDescription(description);
    incrementEdits();
  };

  const commitSubEdit = () => {
    setEditing(false);
    setCost(editCost);
    setLocation(editLocation);
    setDescription(editDescription);
    decrementEdits();
  };

  return (
    <div className="subEntry">
      {!showSelect ? null : (
        <div className="selectContainer" onClick={commitDate}>
          <div className="selectPopup" onClick={(e) => e.stopPropagation()}>
            Selecting {endpointName} date as {endpointDate}
            <Calendar
              className="subCalendar"
              onClickDay={(e: any) => setEndpointDate(e.toLocaleDateString())}
              calendarType="US"
              defaultValue={new Date(endpointDate)}
            />
            <div className="button saveButton" onClick={commitDate}>
              Select Date
            </div>
          </div>
        </div>
      )}
      <div className="subHeader">
        <div className="subLocation" onClick={() => setShow(!show)}>
          {editing ? (
            <input
              type="text"
              className="subEditEntry"
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
          className={clsx("subTimeFrame", {
            editing: editing,
          })}
          onClick={() => {
            if (!editing) setShow(!show);
          }}
        >
          <div
            className={clsx("subTimeStart", {
              editing,
            })}
            onClick={() => selectDate("start")}
          >
            {formatSubTime(start)}
          </div>
          <div className="subTimeDash">-</div>
          <div
            className={clsx("subTimeEnd", {
              editing,
            })}
            onClick={() => selectDate("end")}
          >
            {formatSubTime(end)}
          </div>
          <div className="subTimeFrequency">
            {editing ? (
              <select
                className="subFrequencyEntry"
                name="subFrequency"
                id="subFrequency"
                value={frequency}
                onChange={(e) =>
                  setFrequency(e.target.value as SubscriptionFrequency)
                }
              >
                {_.values(SubscriptionFrequency).map((freq, ind) => (
                  <option key={ind} value={freq}>
                    {freq}
                  </option>
                ))}
              </select>
            ) : (
              formatFrequency(frequency)
            )}
          </div>
        </div>
        <div className="subTagsList" onClick={() => setShow(!show)}>
          {tags.map((tag, tagInd) => (
            <div key={tagInd} className="subTag">
              {tag}
            </div>
          ))}
        </div>
        <div
          className={clsx("subCost", {
            zero: !editing && !cost,
          })}
          onClick={() => setShow(!show)}
        >
          {editing ? (
            <input
              type="number"
              className="subEditEntry"
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
        <div className="subIcons">
          <img
            className="smallButton buttonPicture"
            onClick={editing ? commitSubEdit : startSubEdit}
            src={editing ? "/media/check.svg" : "/media/pencil.svg"}
          />
          <div className="smallButton text red" onClick={deleteSubscription}>
            x
          </div>
        </div>
      </div>
      {show ? (
        <div className="subBody">
          {editing ? (
            <textarea
              className="subEditDescription"
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

export default Subscription;
