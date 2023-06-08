import React, { useState, useEffect } from "react";
import _ from "lodash";
const Calendar = require("react-calendar");
import clsx from "clsx";

import {
  EMPTY_TRANSACTION,
  STAR_MAX,
  KONAMI_CODE,
  User,
  Log,
  Transaction,
} from "../../../../defaults";
import { subApplies, sortByDate } from "../../../../helpers";
import "../../css/app.css";
import "../../css/home.css";
import TransactionComponent from "../modules/Transaction";
import Subscription from "../modules/Subscription";

interface HomeProps {
  userInfo: User;
}

const Home: React.FC<HomeProps> = ({ userInfo }) => {
  const [selectedDate, setSelectedDate] = useState(
    new Date(Date.now()).toLocaleDateString()
  );
  const [diary, setDiary] = useState(_.cloneDeep(userInfo.diary));
  const [finance, setFinance] = useState(_.cloneDeep(userInfo.finance));
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
        .replaceAll(" ", "")
        .replaceAll("\t", "")
        .replaceAll("\n", "")
        .toLowerCase();
      const strippedB = stringB
        .replaceAll(" ", "")
        .replaceAll("\t", "")
        .replaceAll("\n", "")
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
    finance[selectedDate][ind] = newTransaction;
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
      const intended = confirm(`Delete tag "${tagName}"?`);
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
        let tagIndex = el.tags.indexOf(tagName);
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

  const createStars = () => {
    const unfilled = "/media/star_light_unfilled.svg";
    const filled = "/media/star_light_filled.svg";
    return [...Array(STAR_MAX).keys()].map((ind) => (
      <img
        key={ind}
        className="diaryStars"
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
    let newDiary = _.cloneDeep(diary);
    let dailyEntries = bulkPaste.split("\n\n");
    dailyEntries.forEach((dailyLog) => {
      let body = dailyLog.split("\n");
      let header = body.splice(0, 1)[0];
      let tokens = header.split(" ");
      let day = tokens[0];
      let rating = parseInt(tokens[1].substring(1));
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
    let body = {
      diary,
      tags,
      finance,
      subscriptions: userInfo.subscriptions,
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
    <div className="homeContainer">
      {!konami ? null : (
        <div className="homePopupContainer" onClick={toggleKonami}>
          <div className="homePopup" onClick={(e) => e.stopPropagation()}>
            Enter bulk entries:
            <textarea
              className="bulkEntry"
              name="bulkEntry"
              id="bulkEntry"
              onChange={(e) => setBulkPaste(e.target.value)}
            />
            <div className="button saveButton" onClick={saveBulk}>
              Copy Over
            </div>
          </div>
        </div>
      )}
      <Calendar
        className="homeCalendar"
        onClickDay={(e: any) => calendarChange(e.toLocaleDateString())}
        calendarType="US"
        tileClassName={(properties: any) => {
          let dateKey = properties.date.toLocaleDateString();
          if (properties.view === "month" && _.hasIn(diary, dateKey)) {
            return `rating${diary[dateKey].rating}`;
          }
          return "calendarCell";
        }}
        tileContent={(properties: any) => {
          let dateKey = properties.date.toLocaleDateString();
          return incompleteDates.includes(dateKey) ? (
            <div
              className={clsx("calendarIncomplete", {
                details: hoverDetails,
              })}
            >
              !
            </div>
          ) : null;
        }}
        value={new Date(selectedDate)}
      />
      <div className="entryContainer">
        <div className="diaryContainer">
          <div className="searchContainer">
            <div className="searchHeader">
              <input
                type="text"
                name="searchString"
                id="searchString"
                placeholder="Search..."
                onChange={(e) => setSearchString(e.target.value)}
                onKeyPress={maybeSearch}
              />
              {/* TODO: button to search as well */}
              <div
                className="dateLink"
                onClick={() =>
                  calendarChange(new Date(Date.now()).toLocaleDateString())
                }
              >
                Today
              </div>
            </div>
            <div className="searchResultList">
              {searchResults.map((dateString) => (
                <div
                  className="dateLink homeDate"
                  onClick={() => calendarChange(dateString)}
                >
                  {dateString}
                </div>
              ))}
            </div>
          </div>
          <div className="diaryHeader">
            <div className="starsContainer">
              {selectedDate}: {createStars()}
            </div>
            <div
              className="changeContainer"
              onMouseEnter={() => setHoverDetails(true)}
              onMouseLeave={() => setHoverDetails(false)}
            >
              {!diaryText ? 0 : diaryText.length} / {changeSet.length} /{" "}
              {incompleteDates.length}
              {!changeSet.length ? (
                <div className="changeDetails">
                  letters / changes / incomplete
                </div>
              ) : (
                <div className="changeDetails">
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
            className="diaryEntry"
            name="diaryEntry"
            id="diaryEntry"
            value={diaryText}
            onChange={(e) => updateDiary(e.target.value, rating)}
          />
          <div
            className={clsx("button saveButton", {
              disabled: !!editCounts,
            })}
            onClick={saveInfo}
          >
            Save
          </div>
        </div>
        <div className="finContainer">
          <div className="finTagsContainer">
            <div className="finHeader">
              <div className="finHeaderMain">
                TAGS
                {tagsChanged() ? <div className="finChanged">*</div> : null}
              </div>
            </div>
            <div className="finTagsList">
              {tags.map((el, ind) => {
                let editing = _.hasIn(tagEdits, el);
                return (
                  <div key={ind} className="finTag">
                    <div
                      className={clsx("finTagName", {
                        selected: el == selectedTag,
                      })}
                      onClick={() => selectTag(el)}
                    >
                      {editing ? (
                        <input
                          type="text"
                          className="tagEditEntry"
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
                    <div className="finTagIcons">
                      <img
                        className="smallButton buttonPicture"
                        onClick={
                          editing
                            ? () => changeTag(el, false)
                            : () => editTag(el, el)
                        }
                        src={editing ? "/media/check.svg" : "/media/pencil.svg"}
                      />
                      <div
                        className="smallButton text red"
                        onClick={() => changeTag(el, true)}
                      >
                        x
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="finTagCreate">
              <div
                className={clsx("smallButton text", {
                  green: tagValid(newTag),
                })}
                onClick={addTag}
              >
                +
              </div>
              <input
                type="text"
                className="finTagEntry"
                name="tagEntry"
                id="tagEntry"
                placeholder="New Tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
              />
            </div>
          </div>
          <div className="finTransactionContainer">
            <div className="finHeader">
              <div className="finHeaderMain">
                TRANSACTIONS
                {financeChanged(selectedDate) ? (
                  <div className="finChanged">*</div>
                ) : null}
              </div>
              <div className="finHeaderSecondary">
                <div
                  className="smallButton text green"
                  onClick={addTransaction}
                >
                  +
                </div>
              </div>
            </div>
            <div className="finTransactionList">
              {userInfo.subscriptions.map((sub, ind) =>
                !subApplies(sub, selectedDate) ? null : (
                  <Subscription
                    key={ind}
                    subscription={sub}
                    incrementEdits={() => setEditCounts(editCounts + 1)}
                    decrementEdits={() => setEditCounts(editCounts - 1)}
                  />
                )
              )}
              {finance[selectedDate].map((el, ind) => (
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

export default Home;
