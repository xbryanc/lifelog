import React, { useState, useEffect } from "react";
import _ from "lodash";
import clsx from "clsx";

import { Transaction } from "../../../../defaults";
import { formatCost } from "../../../../helpers";
import "../../css/app.css";
import "../../css/home.css";

interface TransactionProps {
  transaction: Transaction;
  editTransaction: (t: Transaction) => void;
  deleteTransaction: () => void;
  selectedTag: string;
  incrementEdits: () => void;
  decrementEdits: () => void;
}

const Transaction: React.FC<TransactionProps> = ({
  transaction,
  editTransaction,
  deleteTransaction: _deleteTransaction,
  selectedTag,
  incrementEdits,
  decrementEdits,
}) => {
  const [show, setShow] = useState(false);
  const [cost, setCost] = useState(transaction.cost);
  const [description, setDescription] = useState(transaction.description);
  const [location, setLocation] = useState(transaction.location);
  const [tags, setTags] = useState(transaction.tags);
  const [editing, setEditing] = useState(false);
  const [editCost, setEditCost] = useState(cost);
  const [editDescription, setEditDescription] = useState(description);
  const [editLocation, setEditLocation] = useState(location);

  useEffect(() => {
    editTransaction({ cost, description, location, tags });
  }, [cost, description, location, tags]);

  const handleClick = () => {
    if (selectedTag === "") {
      setShow(!setShow);
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

  const deleteTransaction = () => {
    if (editing) {
      decrementEdits();
    }
    _deleteTransaction();
  };

  const startTransactionEdit = () => {
    setEditing(true);
    setEditCost(cost);
    setEditLocation(location);
    setEditDescription(description);
    incrementEdits();
  };

  const commitTransactionEdit = () => {
    setEditing(false);
    setCost(editCost);
    setLocation(editLocation);
    setDescription(editDescription);
    decrementEdits();
  };

  return (
    <div className="finTransaction">
      <div className="transactionHeader">
        <div className="transactionLocation" onClick={handleClick}>
          {editing ? (
            <input
              type="text"
              className="transactionEditEntry"
              name="transactionLocationEntry"
              id="transactionLocationEntry"
              value={editLocation}
              onChange={(e) => setEditLocation(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            location
          )}
        </div>
        <div className="transactionTagsList" onClick={handleClick}>
          {tags.map((tag, tagInd) => (
            <div key={`tag${tagInd}`} className="transactionTag">
              {tag}
            </div>
          ))}
        </div>
        <div
          className={clsx("transactionCost", {
            zero: !editing && (!cost || cost === 0),
          })}
          onClick={handleClick}
        >
          {editing ? (
            <input
              type="number"
              className="transactionEditEntry"
              name="transactionCostEntry"
              id="transactionCostEntry"
              value={editCost}
              onChange={(e) => setEditCost(parseInt(e.target.value))}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            formatCost(cost)
          )}
        </div>
        <div className="transactionIcons">
          <img
            className="smallButton buttonPicture"
            onClick={editing ? commitTransactionEdit : startTransactionEdit}
            src={editing ? "/media/check.svg" : "/media/pencil.svg"}
          />
          <div className="smallButton text red" onClick={deleteTransaction}>
            x
          </div>
        </div>
      </div>
      {show ? (
        <div className="transactionBody">
          {editing ? (
            <textarea
              className="transactionEditDescription"
              name="transactionDescriptionEntry"
              id="transactionDescriptionEntry"
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

export default Transaction;
