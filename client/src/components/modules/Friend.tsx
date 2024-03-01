import React, { useState, useEffect, useRef } from "react";
import _ from "lodash";

import clsx from "clsx";
import { Friend } from "../../../../defaults";
import { makeStyles } from "../../theme";

interface FriendProps {
  odd: boolean;
  friend: Friend;
  editFriend: (f: Friend) => void;
  deleteFriend: () => void;
  incrementEdits: () => void;
  decrementEdits: () => void;
}

const Friend: React.FC<FriendProps> = ({
  odd,
  friend,
  editFriend,
  deleteFriend,
  incrementEdits,
  decrementEdits,
}) => {
  const classes = useStyles();
  const isIncomplete = !friend.name;
  const [show, setShow] = useState(isIncomplete);
  const [name, setName] = useState(friend.name);
  const [lastUpdated, setLastUpdated] = useState(friend.lastUpdated);

  const [editing, setEditing] = useState(isIncomplete);
  const editingRef = useRef(editing);
  const [editName, setEditName] = useState(name);

  useEffect(() => {
    editFriend({
      _id: friend._id,
      name,
      lastUpdated,
    });
  }, [name, lastUpdated]);

  useEffect(() => {
    if (!editing) {
      incrementEdits(); // to counteract below on initialization
    }
    return () => {
      if (editingRef.current) {
        decrementEdits();
      }
    };
  }, []);

  useEffect(() => {
    editingRef.current = editing;
    if (editing) {
      incrementEdits();
    } else {
      decrementEdits();
    }
  }, [editing]);

  const startFriendEdit = () => {
    setEditing(true);
    setEditName(name);
  };

  const commitFriendEdit = () => {
    setEditing(false);
    setName(editName);
  };

  return (
    <div className={clsx(classes.entry, { odd: odd && !editing} )}>
      <div className={classes.header}>
        <div className={classes.name} onClick={() => setShow(!show)}>
          {editing ? (
            <input
              type="text"
              className={classes.editEntry}
              name="nameEntry"
              id="nameEntry"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            name
          )}
        </div>
        <div className={classes.lastUpdated}>
          {lastUpdated}
        </div>
        <div className={classes.icons}>
          <img
            className={clsx(classes.smallButton, "picture")}
            onClick={() => setLastUpdated(new Date(Date.now()).toLocaleDateString())}
            src={"/media/refresh.svg"}
          />
          <img
            className={clsx(classes.smallButton, "picture")}
            onClick={editing ? commitFriendEdit : startFriendEdit}
            src={editing ? "/media/check.svg" : "/media/pencil.svg"}
          />
          <div
            className={clsx(classes.smallButton, "text red")}
            onClick={deleteFriend}
          >
            x
          </div>
        </div>
      </div>
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
    "&.picture": {
      width: "30px",
    },
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
    "&.odd": {
      backgroundColor: theme.colors.coolGray20,
    },
  },
  body: {
    padding: "5px 10px",
    borderBottom: "1px solid black",
  },
  lastUpdated: {
    flexGrow: 0,
    padding: "5px",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
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

export default Friend;
