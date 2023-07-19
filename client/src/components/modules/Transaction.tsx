import React, { useState, useEffect } from "react";
import _ from "lodash";
import clsx from "clsx";

import { Transaction } from "../../../../defaults";
import { formatCost } from "../../../../helpers";
import { makeStyles } from "../../theme";

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
  deleteTransaction,
  selectedTag,
  incrementEdits,
  decrementEdits,
}) => {
  const classes = useStyles();
  const isIncomplete =
    !transaction.location || !transaction.cost || !transaction.description;
  const [show, setShow] = useState(isIncomplete);
  const [cost, setCost] = useState(transaction.cost);
  const [description, setDescription] = useState(transaction.description);
  const [location, setLocation] = useState(transaction.location);
  const [tags, setTags] = useState(transaction.tags);
  const [editing, setEditing] = useState(isIncomplete);
  const [editCost, setEditCost] = useState(cost);
  const [editDescription, setEditDescription] = useState(description);
  const [editLocation, setEditLocation] = useState(location);

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

  useEffect(() => {
    editTransaction({ cost, description, location, tags });
  }, [cost, description, location, tags]);

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

  const startTransactionEdit = () => {
    setEditing(true);
    setEditCost(cost);
    setEditLocation(location);
    setEditDescription(description);
  };

  const commitTransactionEdit = () => {
    setEditing(false);
    setCost(editCost);
    setLocation(editLocation);
    setDescription(editDescription);
  };

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <div className={classes.location} onClick={handleClick}>
          {editing ? (
            <input
              type="text"
              className={classes.editEntry}
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
        <div className={classes.icons}>
          <img
            className={clsx(classes.smallButton, classes.buttonPicture)}
            onClick={editing ? commitTransactionEdit : startTransactionEdit}
            src={editing ? "/media/check.svg" : "/media/pencil.svg"}
          />
          <div
            className={clsx(classes.smallButton, "text red")}
            onClick={deleteTransaction}
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
  container: {
    border: "1px solid black",
    borderRadius: "5px",
    marginTop: "3px",
  },
  header: {
    display: "flex",
    flexDirection: "row",
    borderBottom: "1px solid black",
    padding: "0px 3px",
  },
  headerSub: {
    backgroundColor: theme.colors.periwinkle25,
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
    padding: "0px 3px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    "&.zero": {
      color: theme.colors.red,
    },
  },
  editEntry: {
    width: "100%",
  },
  editDescription: {
    width: "100%",
  },
  icons: {
    flexGrow: 0,
    padding: "5px",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    borderLeft: "1px solid black",
  },
  body: {
    padding: "5px 10px",
    borderBottom: "1px solid black",
  },
  bodySub: {
    backgroundColor: theme.colors.periwinkle25,
  },
}));

export default Transaction;
