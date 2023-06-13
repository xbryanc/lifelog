import React, { useState, useEffect } from "react";
import _ from "lodash";
// @ts-ignore
import Calendar from "react-calendar";
import clsx from "clsx";

import {
  EMPTY_TRANSACTION,
  STAR_MAX,
  KONAMI_CODE,
  User,
  Transaction,
  Subscription,
} from "../../../../defaults";
import { subApplies, sortByDate } from "../../../../helpers";
import TransactionComponent from "../modules/Transaction";
import SubscriptionComponent from "../modules/Subscription";
import { makeStyles } from "../../theme";

interface HomeProps {
  userInfo: User;
}

const Home: React.FC<HomeProps> = ({ userInfo }) => {
  const classes = useStyles();
  const [selectedDate, setSelectedDate] = useState(
    new Date(Date.now()).toLocaleDateString()
  );
  const [diary, setDiary] = useState(_.cloneDeep(userInfo.diary));
  const [finance, setFinance] = useState(_.cloneDeep(userInfo.finance));
  const [subscriptions, setSubscriptions] = useState(
    _.cloneDeep(userInfo.subscriptions)
  );
  const [tags, setTags] = useState(_.cloneDeep(userInfo.tags));
  const [tagEdits, setTagEdits] = useState<Record<string, string>>({});
  const [editCounts, setEditCounts] = useState(0);
  const [newTag, setNewTag] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [keys, setKeys] = useState<string[]>([]);
  const [konami, setKonami] = useState(false);
  const [bulkPaste, setBulkPaste] = useState("");
  const [hoverDetails, setHoverDetails] = useState(false);
  const [searchString, setSearchString] = useState("");
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [diaryText, setDiaryText] = useState(
    diary[new Date(Date.now()).toLocaleDateString()]?.description ?? ""
  );
  const [rating, setRating] = useState(
    diary[new Date(Date.now()).toLocaleDateString()]?.rating ?? 0
  );
  const [displayRating, setDisplayRating] = useState(
    diary[new Date(Date.now()).toLocaleDateString()]?.rating ?? 0
  );
  const [changeSet, setChangeSet] = useState<string[]>([]);
  const [incompleteDates, setIncompleteDates] = useState<string[]>([]);

  useEffect(() => {
    document.title = "Home";
    calendarChange(selectedDate);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    handleChange();
  }, [diary, finance, selectedDate]);

  const handleChange = () => {
    const newChangeSet = _.cloneDeep(changeSet);
    const isDirty = diaryChanged(selectedDate) || financeChanged(selectedDate);
    let ind = newChangeSet.indexOf(selectedDate);
    if (ind >= 0 && !isDirty) {
      newChangeSet.splice(ind, 1);
    } else if (ind === -1 && isDirty) {
      newChangeSet.push(selectedDate);
    }
    setChangeSet(changeSet.sort(sortByDate));

    const newIncompleteDates = _.cloneDeep(incompleteDates);
    const transactions = finance[selectedDate] ?? [];
    const incomplete = transactions.some((t) => !t.cost || !t.tags.length);
    ind = newIncompleteDates.indexOf(selectedDate);
    if (ind >= 0 && !incomplete) {
      newIncompleteDates.splice(ind, 1);
    } else if (ind === -1 && incomplete) {
      newIncompleteDates.push(selectedDate);
    }
    setIncompleteDates(newIncompleteDates.sort(sortByDate));
  };

  const maybeSearch = (e: any) => {
    const contains = (stringA: string, stringB: string) => {
      const strippedA = (stringA || "")
        .replace(/ /g, "")
        .replace(/\t/g, "")
        .replace(/\n/g, "")
        .toLowerCase();
      const strippedB = stringB
        .replace(/ /g, "")
        .replace(/\t/g, "")
        .replace(/\n/g, "")
        .toLowerCase();
      return strippedA.indexOf(strippedB) !== -1;
    };
    if (e.key === "Enter") {
      const results: string[] = [];
      if (searchString) {
        Object.keys(finance).forEach((date) => {
          finance[date].forEach((transaction) => {
            if (
              contains(transaction.location, searchString) ||
              contains(transaction.description, searchString)
            ) {
              results.push(date);
              return;
            }
          });
        });
        Object.keys(diary).forEach((date) => {
          if (contains(diary[date].description, searchString)) {
            results.push(date);
          }
        });
      }
      setSearchResults(_.uniq(results).sort(sortByDate));
    }
  };

  const diaryChanged = (dateOfInterest: string) => {
    return !_.isEqual(diary[dateOfInterest], userInfo.diary[dateOfInterest]);
  };

  const financeChanged = (dateOfInterest: string) => {
    return !_.isEqual(
      finance[dateOfInterest],
      userInfo.finance[dateOfInterest]
    );
  };

  const tagsChanged = () => {
    return !_.isEqual(tags, userInfo.tags);
  };

  const editTransaction = (ind: number, newTransaction: Transaction) => {
    const newFinance = _.cloneDeep(finance);
    newFinance[selectedDate][ind] = newTransaction;
    setFinance(newFinance);
  };

  const tagValid = (tag: string) => {
    return tag.length > 0 && tags.indexOf(tag) == -1;
  };

  const addTag = () => {
    if (!tagValid(newTag)) {
      return;
    }
    const newTags = _.cloneDeep(tags);
    newTags.push(newTag);
    setTags(newTags);
    setNewTag("");
  };

  const editTag = (tagName: string, newTag: string) => {
    const newTagEdits = _.cloneDeep(tagEdits);
    newTagEdits[tagName] = newTag;
    setTagEdits(newTagEdits);
  };

  const changeTag = (tagName: string, toRemove: boolean) => {
    const newTagEdits = tagEdits;
    if (toRemove) {
      const intended = window.confirm(`Delete tag "${tagName}"?`);
      if (!intended) {
        return;
      }
    } else if (tagName === newTagEdits[tagName]) {
      delete newTagEdits[tagName];
      setTagEdits(newTagEdits);
      return;
    }
    const newTag = tagEdits[tagName] || "";
    const newTags = _.cloneDeep(tags);
    const ind = newTags.indexOf(tagName);
    if (ind == -1 || (!toRemove && !tagValid(newTag))) {
      return;
    }
    if (toRemove) {
      newTags.splice(ind, 1);
    } else {
      newTags[ind] = newTag;
      delete newTagEdits[tagName];
    }
    const newFinance = _.cloneDeep(finance);
    Object.keys(newFinance).forEach((key) => {
      newFinance[key].forEach((el) => {
        const tagIndex = el.tags.indexOf(tagName);
        if (tagIndex > -1) {
          if (toRemove) {
            el.tags.splice(tagIndex, 1);
          } else {
            el.tags[tagIndex] = newTag;
          }
        }
      });
    });
    let nextSelectedTag = selectedTag;
    if (toRemove && nextSelectedTag === tagName) {
      nextSelectedTag = "";
    } else if (!toRemove && nextSelectedTag === tagName) {
      nextSelectedTag = newTag;
    }
    setTags(newTags);
    setFinance(newFinance);
    setSelectedTag(nextSelectedTag);
    setTagEdits(newTagEdits);
  };

  const selectTag = (tag: string) => {
    setSelectedTag(selectedTag === tag ? "" : tag);
  };

  const addTransaction = () => {
    const newFinance = _.cloneDeep(finance);
    if (!_.hasIn(newFinance, selectedDate)) {
      newFinance[selectedDate] = [];
    }
    newFinance[selectedDate].push(_.cloneDeep(EMPTY_TRANSACTION));
    setFinance(newFinance);
  };

  const deleteTransaction = (ind: number) => {
    const newFinance = _.cloneDeep(finance);
    newFinance[selectedDate].splice(ind, 1);
    setFinance(newFinance);
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

  const createStars = () => {
    const unfilled = "/media/star_light_unfilled.svg";
    const filled = "/media/star_light_filled.svg";
    return _.range(0, STAR_MAX).map((ind) => (
      <img
        key={ind}
        className={classes.diaryStars}
        src={ind < displayRating ? filled : unfilled}
        onMouseEnter={() => setDisplayRating(ind + 1)}
        onMouseLeave={() => setDisplayRating(rating)}
        onClick={() => updateDiary(diaryText, rating === ind + 1 ? 0 : ind + 1)}
      />
    ));
  };

  const calendarChange = (date: string) => {
    if (_.hasIn(diary, date)) {
      const { rating, description } = diary[date];
      setSelectedDate(date);
      setDisplayRating(rating);
      setRating(rating);
      setDiaryText(description);
    } else {
      setSelectedDate(date);
      setDisplayRating(0);
      setRating(0);
      setDiaryText("");
    }
  };

  const updateDiary = (text: string, rating: number) => {
    const newDiary = _.cloneDeep(diary);
    if (text !== "") {
      newDiary[selectedDate] = {
        description: text,
        rating: rating,
      };
    } else {
      rating = 0;
      delete newDiary[selectedDate];
    }
    setDiary(newDiary);
    setDiaryText(text);
    setRating(rating);
    setDisplayRating(rating);
  };

  const saveBulk = () => {
    const newDiary = _.cloneDeep(diary);
    const dailyEntries = bulkPaste.split("\n\n");
    dailyEntries.forEach((dailyLog) => {
      const body = dailyLog.split("\n");
      const header = body.splice(0, 1)[0];
      const tokens = header.split(" ");
      const day = tokens[0];
      const rating = parseInt(tokens[1].substring(1));
      newDiary[day] = {
        description: body.join("\n"),
        rating,
      };
    });
    setDiary(newDiary);
    calendarChange(selectedDate);
    toggleKonami();
  };

  const saveInfo = () => {
    if (editCounts) {
      return;
    }
    const body = {
      diary,
      tags,
      finance,
      subscriptions,
    };
    fetch("/api/save_info", {
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

  const handleKeyDown = (event: any) => {
    if (event.key === "Escape") {
      selectTag("");
    }
    let newKeys = _.cloneDeep(keys);
    newKeys.push(event.key.toLowerCase());
    newKeys = newKeys.slice(Math.max(newKeys.length - KONAMI_CODE.length, 0));
    setKeys(newKeys);
    if (JSON.stringify(keys) == JSON.stringify(KONAMI_CODE)) {
      toggleKonami();
    }
  };

  const toggleKonami = () => {
    setKonami(!konami);
  };

  return (
    <div className={classes.homeContainer}>
      {konami && (
        <div className={classes.homePopupContainer} onClick={toggleKonami}>
          <div
            className={classes.homePopup}
            onClick={(e) => e.stopPropagation()}
          >
            Enter bulk entries:
            <textarea
              className={classes.bulkEntry}
              name="bulkEntry"
              id="bulkEntry"
              onChange={(e) => setBulkPaste(e.target.value)}
            />
            <div className={classes.button} onClick={saveBulk}>
              Copy Over
            </div>
          </div>
        </div>
      )}
      <div>
        <Calendar
          className={classes.homeCalendar}
          onClickDay={(e: any) => calendarChange(e.toLocaleDateString())}
          calendarType="US"
          tileClassName={(properties: any) => {
            const dateKey = properties.date.toLocaleDateString();
            const classNames: string[] = [
              properties.view === "month" && _.hasIn(diary, dateKey)
                ? classes[
                    `rating${diary[dateKey].rating}` as keyof typeof classes
                  ]
                : classes.calendarCell,
            ];
            if (incompleteDates.includes(dateKey)) {
              classNames.push(classes.calendarIncomplete);
              if (hoverDetails) {
                classNames.push("details");
              }
            }
            return clsx(...classNames);
          }}
          value={new Date(selectedDate)}
        />
        <style>
          {`
            .react-calendar__tile {
                display: flex;
                flex-direction: row;
                justify-content: center;
            }

            .react-calendar__tile--now {
                border-color: magenta;
            }

            .react-calendar__tile--active {
                border-color: cyan;
            }
          `}
        </style>
      </div>
      <div className={classes.entryContainer}>
        <div className={classes.diaryContainer}>
          <div>
            <div className={classes.searchHeader}>
              <input
                type="text"
                className={classes.searchString}
                name="searchString"
                id="searchString"
                placeholder="Search..."
                onChange={(e) => setSearchString(e.target.value)}
                onKeyPress={maybeSearch}
              />
              {/* TODO: button to search as well */}
              <div
                className={classes.dateLink}
                onClick={() =>
                  calendarChange(new Date(Date.now()).toLocaleDateString())
                }
              >
                Today
              </div>
            </div>
            <div className={classes.searchResultList}>
              {searchResults.map((dateString) => (
                <div
                  className={clsx(classes.dateLink, classes.homeDate)}
                  onClick={() => calendarChange(dateString)}
                >
                  {dateString}
                </div>
              ))}
            </div>
          </div>
          <div className={classes.diaryHeader}>
            <div className={classes.starsContainer}>
              {selectedDate}: {createStars()}
            </div>
            <div
              className={classes.changeContainer}
              onMouseEnter={() => setHoverDetails(true)}
              onMouseLeave={() => setHoverDetails(false)}
            >
              {!diaryText ? 0 : diaryText.length} / {changeSet.length} /{" "}
              {incompleteDates.length}
              {!changeSet.length ? (
                <div className={classes.changeDetails}>
                  letters / changes / incomplete
                </div>
              ) : (
                <div className={classes.changeDetails}>
                  <ul>
                    {changeSet.map((el, ind) => (
                      <li key={ind}>{el}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          <textarea
            className={classes.diaryEntry}
            name="diaryEntry"
            id="diaryEntry"
            value={diaryText}
            onChange={(e) => updateDiary(e.target.value, rating)}
          />
          <div
            className={clsx(classes.button, {
              disabled: !!editCounts,
            })}
            onClick={saveInfo}
          >
            Save
          </div>
        </div>
        <div className={classes.finContainer}>
          <div className={classes.finTagsContainer}>
            <div className={classes.finHeader}>
              <div className={classes.finHeaderMain}>
                TAGS
                {tagsChanged() ? (
                  <div className={classes.changed}>*</div>
                ) : null}
              </div>
            </div>
            <div className={classes.finTagsList}>
              {tags.map((el, ind) => {
                const editing = _.hasIn(tagEdits, el);
                return (
                  <div key={ind} className={classes.finTag}>
                    <div
                      className={clsx(classes.finTagName, {
                        selected: el == selectedTag,
                      })}
                      onClick={() => selectTag(el)}
                    >
                      {editing ? (
                        <input
                          type="text"
                          name="tagEditEntry"
                          id="tagEditEntry"
                          value={tagEdits[el]}
                          onChange={(e) => editTag(el, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        el
                      )}
                    </div>
                    <div className={classes.finTagIcons}>
                      <img
                        className={clsx(
                          classes.smallButton,
                          classes.buttonPicture
                        )}
                        onClick={
                          editing
                            ? () => changeTag(el, false)
                            : () => editTag(el, el)
                        }
                        src={editing ? "/media/check.svg" : "/media/pencil.svg"}
                      />
                      <div
                        className={clsx(classes.smallButton, "text red")}
                        onClick={() => changeTag(el, true)}
                      >
                        x
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className={classes.finTagCreate}>
              <div
                className={clsx(classes.smallButton, "text", {
                  green: tagValid(newTag),
                })}
                onClick={addTag}
              >
                +
              </div>
              <input
                type="text"
                name="tagEntry"
                id="tagEntry"
                placeholder="New Tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
              />
            </div>
          </div>
          <div className={classes.finTransactionContainer}>
            <div className={classes.finHeader}>
              <div className={classes.finHeaderMain}>
                TRANSACTIONS
                {financeChanged(selectedDate) ? (
                  <div className={classes.changed}>*</div>
                ) : null}
              </div>
              <div className={classes.finHeaderSecondary}>
                <div
                  className={clsx(classes.smallButton, "text green")}
                  onClick={addTransaction}
                >
                  +
                </div>
              </div>
            </div>
            <div>
              {subscriptions.map((sub, ind) =>
                !subApplies(sub, selectedDate) ? null : (
                  <SubscriptionComponent
                    key={ind}
                    highlight
                    subscription={sub}
                    editSubscription={(s: Subscription) => editSub(ind, s)}
                    deleteSubscription={() => deleteSub(ind)}
                    incrementEdits={() => setEditCounts(editCounts + 1)}
                    decrementEdits={() => setEditCounts(editCounts - 1)}
                  />
                )
              )}
              {(finance[selectedDate] ?? []).map((el, ind) => (
                <TransactionComponent
                  key={ind}
                  transaction={el}
                  editTransaction={(t: Transaction) => editTransaction(ind, t)}
                  deleteTransaction={() => deleteTransaction(ind)}
                  selectedTag={selectedTag}
                  incrementEdits={() => setEditCounts(editCounts + 1)}
                  decrementEdits={() => setEditCounts(editCounts - 1)}
                />
              ))}
            </div>
          </div>
        </div>
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
  },
  buttonPicture: {
    width: "30px",
  },
  homeContainer: {
    display: "flex",
    paddingTop: "8vh",
    width: "100%",
    height: "100%",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  entryContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    padding: "0 5vw",
  },
  diaryContainer: {
    width: "50%",
    height: "100%",
    margin: "5px",
  },
  finContainer: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1),
    width: "50%",
    height: "100%",
    margin: "5px",
  },
  diaryHeader: {
    display: "flex",
    flexDirection: "row",
  },
  finHeader: {
    display: "flex",
    flexDirection: "row",
  },
  finHeaderMain: {
    display: "flex",
    flexDirection: "row",
    flexGrow: 1,
  },
  finHeaderSecondary: {
    flexGrow: 0,
  },
  finTagsContainer: {
    border: "1px solid black",
    borderRadius: "5px",
    padding: "5px",
  },
  finTagsList: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  finTagCreate: {
    display: "flex",
    flexDirection: "row",
  },
  finTag: {
    display: "flex",
    flexDirection: "row",
    margin: "5px",
  },
  finTagIcons: {
    border: "1px solid black",
    borderRadius: "0 5px 5px 0",
    padding: "3px",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
  },
  finTagName: {
    border: "1px solid black",
    borderRadius: "5px 0 0 5px",
    cursor: "pointer",
    padding: "3px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    "&.selected": {
      backgroundColor: theme.colors.green400,
    },
  },
  finTransactionContainer: {
    border: "1px solid black",
    borderRadius: "5px",
    padding: "5px",
  },
  finTransaction: {
    border: "1px solid black",
    borderRadius: "5px",
    marginTop: "3px",
  },
  finTransactionCreate: {
    display: "flex",
    flexDirection: "row",
    border: "1px solid black",
    borderRadius: "5px",
    padding: "5px",
  },
  changed: {
    fontWeight: "bold",
    fontSize: "20px",
    color: "orange",
  },
  starsContainer: {
    flexGrow: 1,
  },
  changeContainer: {
    position: "relative",
    display: "inline-block",
    flexGrow: 0,
    fontSize: "20px",
    textAlign: "right",
    borderBottom: "1px dotted black",
    marginBottom: "5px",
    "&:hover .changeDetails": {
      visibility: "visible",
    },
  },
  changeDetails: {
    visibility: "hidden",
    backgroundColor: "black",
    color: "whitesmoke",
    fontSize: "10px",
    textAlign: "center",
    padding: "5px 20px 5px 0px",
    borderRadius: "3px",
    position: "absolute",
    zIndex: 1,
    top: "-5px",
    left: "105%",
  },
  diaryEntry: {
    width: "100%",
    height: "30vh",
  },
  bulkEntry: {
    width: "60vw",
    height: "50vh",
  },
  diaryStars: {
    width: "2vw",
  },
  homeCalendar: {
    width: "70vw",
    margin: "20px 0",
  },
  calendarCell: {
    padding: 0,
  },
  rating0: {
    backgroundColor: "darkgrey",
  },
  rating1: {
    backgroundColor: "#FF3300",
  },
  rating2: {
    backgroundColor: "#ff6600",
  },
  rating3: {
    backgroundColor: "#ff9900",
  },
  rating4: {
    backgroundColor: "#FFCC00",
  },
  rating5: {
    backgroundColor: "#FFFF00",
  },
  rating6: {
    backgroundColor: "#ccff00",
  },
  rating7: {
    backgroundColor: "#99ff00",
  },
  rating8: {
    backgroundColor: "#66ff00",
  },
  rating9: {
    backgroundColor: "#33ff00",
  },
  rating10: {
    backgroundColor: "#00FF00",
  },
  reactCalendarTile: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
  },
  reactCalendarTileNow: {
    borderColor: theme.colors.indigo900,
  },
  reactCalendarTileActive: {
    borderColor: theme.colors.periwinkle100,
  },
  calendarIncomplete: {
    color: theme.colors.red,
    "&.details": {
      fontWeight: "bold",
      textDecoration: "underline",
    },
  },
  homePopupContainer: {
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
  homePopup: {
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
  searchString: {
    flexGrow: 1,
  },
  homeDate: {
    flexGrow: 0,
  },
  searchResultList: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dateLink: {
    border: "1px solid black",
    margin: "2px 5px",
    borderRadius: "5px",
  },
  searchHeader: {
    display: "flex",
    flexDirection: "row",
  },
}));

export default Home;
