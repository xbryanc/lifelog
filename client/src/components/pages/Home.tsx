import React, { useState, useEffect } from "react";
import _ from 'lodash';
const Calendar = require("react-calendar");
import clsx from "clsx";

import { EMPTY_TRANSACTION, STAR_MAX, KONAMI_CODE, User } from "../../../../defaults";
import { subApplies, formatCost } from "../../../../helpers";
import "../../css/app.css";
import "../../css/home.css";

interface HomeProps {
  userInfo: User;
}

const Home: React.FC<HomeProps> = ({userInfo}) => {
  const [selectedDate, setSelectedDate] = useState(new Date(Date.now()).toLocaleDateString());
  const [diary, setDiary] = useState(_.cloneDeep(userInfo.diary));
  const [finance, setFinance] = useState(_.cloneDeep(userInfo.finance));
  const [subscriptions, setSubscriptions] = useState(_.cloneDeep(userInfo.subscriptions));
  const [tags, setTags] = useState(_.cloneDeep(userInfo.tags));
  const [tagEdits, setTagEdits] = useState({});
  const [newTag, setNewTag] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [keys, setKeys] = useState([]);
  const [konami, setKonami] = useState(false);
  const [bulkPaste, setBulkPaste] = useState("");
  const [hoverDetails, setHoverDetails] = useState(false);
  const [searchString, setSearchString] = useState("");
  const [searchResults, setSearchResults] = useState(new Set());

  useEffect(() => {
    document.title = "Home";
    calendarChange(selectedDate);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    }
  }, [])

  const maybeSearch = (e) => {
    const contains = (stringA, stringB) => {
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
      let results = new Set();
      if (this.state.searchString) {
        Object.keys(this.state.finance).forEach((date) => {
          this.state.finance[date].forEach((transaction) => {
            if (
              contains(transaction.location, this.state.searchString) ||
              contains(transaction.description, this.state.searchString)
            ) {
              results.add(date);
              return;
            }
          });
        });
        Object.keys(this.state.diary).forEach((date) => {
          if (
            contains(
              this.state.diary[date].description,
              this.state.searchString
            )
          ) {
            results.add(date);
          }
        });
      }
      this.setState({
        searchResults: results,
      });
    }
  };

  const diaryChanged = (dateOfInterest) => {
    let currentDiary = this.state.diary[dateOfInterest] || {};
    let prevDiary = this.props.userInfo.diary[dateOfInterest] || {};
    let curRating = currentDiary.rating || 0;
    let prevRating = prevDiary.rating || 0;
    return (
      curRating !== prevRating ||
      currentDiary.description !== prevDiary.description
    );
  };

  const financeChanged = (dateOfInterest) => {
    let currentFinance = this.state.finance[dateOfInterest] || [];
    let prevFinance = this.props.userInfo.finance[dateOfInterest] || [];
    if (currentFinance.length != prevFinance.length) {
      return true;
    }
    let changed = false;
    currentFinance.forEach((_, ind) => {
      if (changed) {
        return;
      }
      let cur = currentFinance[ind];
      let prev = prevFinance[ind];
      if (
        cur.cost !== prev.cost ||
        cur.description !== prev.description ||
        cur.location !== prev.location
      ) {
        changed = true;
      }
      let curTags = cur.tags;
      let prevTags = prev.tags;
      if (curTags.length != prevTags.length) {
        changed = true;
      }
      curTags.forEach((_, ind) => {
        if (curTags[ind] != prevTags[ind]) {
          changed = true;
        }
      });
    });
    return changed;
  };

  const tagsChanged = () => {
    let currentTags = this.state.tags;
    let prevTags = this.props.userInfo.tags;
    if (currentTags.length != prevTags.length) {
      return true;
    }
    let changed = false;
    currentTags.forEach((_, ind) => {
      if (currentTags[ind] != prevTags[ind]) {
        changed = true;
        return;
      }
    });
    return changed;
  };

  const startTransactionEdit = (transaction) => {
    transaction.editing = true;
    transaction.editCost = transaction.cost;
    transaction.editLocation = transaction.location;
    transaction.editDescription = transaction.description;
    this.setState({
      finance: this.state.finance,
    });
  };

  const commitTransactionEdit = (transaction) => {
    transaction.editing = false;
    transaction.cost = transaction.editCost;
    transaction.location = transaction.editLocation;
    transaction.description = transaction.editDescription;
    this.setState({
      finance: this.state.finance,
    });
  };

  const editTransaction = (transaction, fieldName, value) => {
    transaction[fieldName] = value;
    this.setState({
      finance: this.state.finance,
    });
  };

  const setDetails = (showing) => {
    this.setState({
      hoverDetails: showing,
    });
  };

  const toggleShow = (transaction) => {
    if (this.state.selectedTag !== "") {
      return;
    }
    transaction.show = !transaction.show;
    this.setState({
      finance: this.state.finance,
    });
  };

  const handleTransactionClick = (transaction) => {
    this.toggleTag(transaction);
    this.toggleShow(transaction);
  };

  const handleSubClick = (sub) => {
    sub.show = !sub.show;
    this.setState({
      subscriptions: this.state.subscriptions,
    });
  };

  const tagValid = (tag) => {
    return tag.length > 0 && this.state.tags.indexOf(tag) == -1;
  };

  const addTag = () => {
    if (!this.tagValid(this.state.newTag)) {
      return;
    }
    let newTags = this.state.tags;
    newTags.push(this.state.newTag);
    this.setState({
      tags: newTags,
      newTag: "",
    });
  };

  const startTagEdit = (tagName) => {
    this.editTag(tagName, tagName);
  };

  const editTag = (tagName, newTag) => {
    let newTagEdits = this.state.tagEdits;
    newTagEdits[tagName] = newTag;
    this.setState({
      tagEdits: newTagEdits,
    });
  };

  const changeTag = (tagName, toRemove) => {
    let newTagEdits = this.state.tagEdits;
    if (toRemove) {
      let intended = confirm(`Delete tag "${tagName}"?`);
      if (!intended) {
        return;
      }
    } else if (tagName === newTagEdits[tagName]) {
      delete newTagEdits[tagName];
      this.setState({
        tagEdits: newTagEdits,
      });
      return;
    }
    let newTag = this.state.tagEdits[tagName] || "";
    let newTags = this.state.tags;
    let ind = newTags.indexOf(tagName);
    if (ind == -1 || (!toRemove && !this.tagValid(newTag))) {
      return;
    }
    if (toRemove) {
      newTags.splice(ind, 1);
    } else {
      newTags[ind] = newTag;
      delete newTagEdits[tagName];
    }
    let newFinance = this.state.finance;
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
    let nextSelectedTag = this.state.selectedTag;
    if (toRemove && nextSelectedTag === tagName) {
      nextSelectedTag = "";
    } else if (!toRemove && nextSelectedTag === tagName) {
      nextSelectedTag = newTag;
    }
    this.setState({
      tags: newTags,
      finance: newFinance,
      selectedTag: nextSelectedTag,
      tagEdits: newTagEdits,
    });
  };

  const selectTag = (tag) => {
    this.setState({
      selectedTag: this.state.selectedTag === tag ? "" : tag,
    });
  };

  const toggleTag = (transaction) => {
    if (this.state.selectedTag === "") {
      return;
    }
    let tagList = transaction.tags;
    let tagIndex = tagList.indexOf(this.state.selectedTag);
    if (tagIndex === -1) {
      tagList.push(this.state.selectedTag);
    } else {
      tagList.splice(tagIndex, 1);
    }
    this.setState({
      finance: this.state.finance,
    });
  };

  const updateTagField = (value) => {
    this.setState({
      newTag: value,
    });
  };

  const updateFinanceField = (fieldName, value) => {
    let newTransaction = this.state.newTransaction;
    newTransaction[fieldName] = value;
    this.setState({
      newTransaction: newTransaction,
    });
  };

  const newTransactionInvalid = () => {
    let newTransaction = this.state.newTransaction;
    return newTransaction.description == "" || newTransaction.location == "";
  };

  const addTransaction = () => {
    let newFinance = this.state.finance;
    if (!newFinance.hasOwnProperty(this.state.selectedDate)) {
      newFinance[this.state.selectedDate] = [];
    }
    let newTransaction = Object.assign({}, EMPTY_TRANSACTION);
    newTransaction.tags = [];
    newFinance[this.state.selectedDate].push(newTransaction);
    this.setState({
      finance: newFinance,
    });
  };

  const deleteTransaction = (ind) => {
    let newFinance = this.state.finance;
    newFinance[this.state.selectedDate].splice(ind, 1);
    this.setState({
      finance: newFinance,
    });
  };

  const createStars = () => {
    let unfilled = "/media/star_light_unfilled.svg";
    let filled = "/media/star_light_filled.svg";
    return [...Array(STAR_MAX).keys()].map((ind) => (
      <img
        key={ind}
        className="diaryStars"
        src={ind < this.state.displayRating ? filled : unfilled}
        onMouseEnter={() => this.changeDisplay(ind + 1)}
        onMouseLeave={() => this.changeDisplay(this.state.rating)}
        onClick={() =>
          this.updateDiary(
            this.state.diaryText,
            this.state.rating === ind + 1 ? 0 : ind + 1
          )
        }
      />
    ));
  };

  const changeDisplay = (num) => {
    this.setState({
      displayRating: num,
    });
  };

  const calendarChange = (date) => {
    if (_.hasIn(diary, date)) {
      let entry = this.state.diary[date];
      this.setState({
        selectedDate: date,
        displayRating: entry.rating,
        rating: entry.rating,
        diaryText: entry.description,
      });
    } else {
      this.setState({
        selectedDate: date,
        displayRating: 0,
        rating: 0,
        diaryText: "",
      });
    }
  };

  const updateDiary = (text, rating) => {
    let newDiary = this.state.diary;
    if (text != "") {
      newDiary[this.state.selectedDate] = {
        description: text,
        rating: rating,
      };
    } else {
      rating = 0;
      delete newDiary[this.state.selectedDate];
    }
    this.setState({
      diary: newDiary,
      diaryText: text,
      rating: rating,
      displayRating: rating,
    });
  };

  const updateBulk = (e) => {
    this.setState({
      bulkPaste: e.target.value,
    });
  };

  const saveBulk = () => {
    let newDiary = this.state.diary;
    let dailyEntries = this.state.bulkPaste.split("\n\n");
    dailyEntries.forEach((dailyLog) => {
      let body = dailyLog.split("\n");
      let header = body.splice(0, 1)[0];
      let tokens = header.split(" ");
      let day = tokens[0];
      let rating = tokens[1].substring(1);
      newDiary[day] = {
        description: body.join("\n"),
        rating: rating,
      };
    });
    this.setState({
      diary: newDiary,
    });
    this.calendarChange(this.state.selectedDate);
    this.toggleKonami();
  };

  const isEditingAnything = () => {
    let result = false;
    Object.values(this.state.finance).forEach((transactionList) => {
      if (result) {
        return;
      }
      transactionList.forEach((t) => {
        if (t.editing) {
          result = true;
          return;
        }
      });
    });
    return result;
  };

  const saveInfo = () => {
    if (this.isEditingAnything()) {
      return;
    }
    Object.values(this.state.finance).forEach((transactionList) => {
      transactionList.forEach((t) => {
        delete t.show;
        delete t.editing;
        delete t.editCost;
        delete t.editLocation;
        delete t.editDescription;
      });
    });
    let body = {
      diary: this.state.diary,
      tags: this.state.tags,
      finance: this.state.finance,
      subscriptions: this.state.subscriptions,
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
    setKeys(newKeys)
    if (JSON.stringify(keys) == JSON.stringify(KONAMI_CODE)) {
      toggleKonami();
    }
  };

  const toggleKonami = () => {
    setKonami(!konami)
  };

  render() {
    const sortByDate = (a, b) => {
      let dateA = new Date(a);
      let dateB = new Date(b);
      return dateA < dateB ? -1 : 1;
    };
    let totalSet = new Set([
      ...Object.keys(this.state.diary),
      ...Object.keys(this.props.userInfo.diary),
      ...Object.keys(this.state.finance),
      ...Object.keys(this.props.userInfo.finance),
    ]);
    let changes = 0;
    let changeSet = [];
    totalSet.forEach((key) => {
      if (this.diaryChanged(key) || this.financeChanged(key)) {
        changes++;
        changeSet.push(key);
      }
    });
    changeSet.sort(sortByDate);
    let transactions = this.state.finance.hasOwnProperty(
      this.state.selectedDate
    )
      ? this.state.finance[this.state.selectedDate]
      : [];
    let incompleteDates = new Set();
    Object.keys(this.state.finance).forEach((dateKey) => {
      let curTransactions = this.state.finance[dateKey];
      let incomplete = false;
      curTransactions.forEach((el) => {
        if (!el.cost || parseInt(el.cost) === 0 || el.tags.length === 0) {
          incomplete = true;
          return;
        }
      });
      if (incomplete) {
        incompleteDates.add(dateKey);
      }
    });
    return (
      <div className="homeContainer">
        {!this.state.konami ? null : (
          <div className="homePopupContainer" onClick={this.toggleKonami}>
            <div className="homePopup" onClick={(e) => e.stopPropagation()}>
              Enter bulk entries:
              <textarea
                className="bulkEntry"
                name="bulkEntry"
                id="bulkEntry"
                onChange={this.updateBulk}
              />
              <div className="button saveButton" onClick={this.saveBulk}>
                Copy Over
              </div>
            </div>
          </div>
        )}
        <Calendar
          className="homeCalendar"
          onClickDay={(e) => this.calendarChange(e.toLocaleDateString())}
          calendarType="US"
          tileClassName={(properties) => {
            let dateKey = properties.date.toLocaleDateString();
            if (
              properties.view === "month" &&
              this.state.diary.hasOwnProperty(dateKey)
            ) {
              return `rating${this.state.diary[dateKey].rating}`;
            }
            return "calendarCell";
          }}
          tileContent={(properties) => {
            let dateKey = properties.date.toLocaleDateString();
            return incompleteDates.has(dateKey) ? (
              <div
                className={clsx("calendarIncomplete", {
                  details: this.state.hoverDetails,
                })}
              >
                !
              </div>
            ) : null;
          }}
          value={new Date(this.state.selectedDate)}
        />
        <div className="entryContainer">
          <div className="diaryContainer">
            <div className="searchContainer">
              <div className="searchHeader">
                <input
                  type="text"
                  name="searchString"
                  id="searchString"
                  placeholder="Search... (press Enter)"
                  onChange={(e) => setSearchString(e.target.value)}
                  onKeyPress={this.maybeSearch}
                />
                <div
                  className="dateLink"
                  onClick={() =>
                    this.calendarChange(
                      new Date(Date.now()).toLocaleDateString()
                    )
                  }
                >
                  Today
                </div>
              </div>
              <div className="searchResultList">
                {Array.from(this.state.searchResults)
                  .sort(sortByDate)
                  .map((dateString) => (
                    <div
                      className="dateLink homeDate"
                      onClick={() => this.calendarChange(dateString)}
                    >
                      {dateString}
                    </div>
                  ))}
              </div>
            </div>
            <div className="diaryHeader">
              <div className="starsContainer">
                {this.state.selectedDate}: {this.createStars()}
              </div>
              <div
                className="changeContainer"
                onMouseEnter={() => this.setDetails(true)}
                onMouseLeave={() => this.setDetails(false)}
              >
                {!this.state.diaryText ? 0 : this.state.diaryText.length} /{" "}
                {changes} / {incompleteDates.size}
                {changes == 0 ? (
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
              value={this.state.diaryText}
              onChange={(e) =>
                this.updateDiary(e.target.value, this.state.rating)
              }
            />
            <div
              className={clsx("button saveButton", {
                disabled: this.isEditingAnything(),
              })}
              onClick={this.saveInfo}
            >
              Save
            </div>
          </div>
          <div className="finContainer">
            <div className="finTagsContainer">
              <div className="finHeader">
                <div className="finHeaderMain">
                  TAGS
                  {this.tagsChanged() ? (
                    <div className="finChanged">*</div>
                  ) : null}
                </div>
              </div>
              <div className="finTagsList">
                {this.state.tags.map((el, ind) => {
                  let editing = this.state.tagEdits.hasOwnProperty(el);
                  return (
                    <div key={ind} className="finTag">
                      <div
                        className={clsx("finTagName", {
                          selected: el == this.state.selectedTag,
                        })}
                        onClick={() => this.selectTag(el)}
                      >
                        {editing ? (
                          <input
                            type="text"
                            className="tagEditEntry"
                            name="tagEditEntry"
                            id="tagEditEntry"
                            value={this.state.tagEdits[el]}
                            onChange={(e) => this.editTag(el, e.target.value)}
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
                              ? () => this.changeTag(el, false)
                              : () => this.startTagEdit(el)
                          }
                          src={
                            editing ? "/media/check.svg" : "/media/pencil.svg"
                          }
                        />
                        <div
                          className="smallButton text red"
                          onClick={() => this.changeTag(el, true)}
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
                    green: this.tagValid(this.state.newTag),
                  })}
                  onClick={this.addTag}
                >
                  +
                </div>
                <input
                  type="text"
                  className="finTagEntry"
                  name="tagEntry"
                  id="tagEntry"
                  placeholder="New Tag"
                  value={this.state.newTag}
                  onChange={(e) => this.updateTagField(e.target.value)}
                />
              </div>
            </div>
            <div className="finTransactionContainer">
              <div className="finHeader">
                <div className="finHeaderMain">
                  TRANSACTIONS
                  {this.financeChanged(this.state.selectedDate) ? (
                    <div className="finChanged">*</div>
                  ) : null}
                </div>
                <div className="finHeaderSecondary">
                  <div
                    className="smallButton text green"
                    onClick={this.addTransaction}
                  >
                    +
                  </div>
                </div>
              </div>
              <div className="finTransactionList">
                {this.state.subscriptions.map((sub, ind) =>
                  !subApplies(sub, this.state.selectedDate) ? null : (
                    <div key={ind} className="finTransaction">
                      <div className="transactionHeader sub">
                        <div
                          className="transactionLocation"
                          onClick={() => this.handleSubClick(sub)}
                        >
                          {sub.location}
                        </div>
                        <div
                          className="transactionTagsList"
                          onClick={() => this.handleSubClick(sub)}
                        >
                          {sub.tags.map((tag, tagInd) => (
                            <div
                              key={`tag${tagInd}`}
                              className="transactionTag"
                            >
                              {tag}
                            </div>
                          ))}
                        </div>
                        <div
                          className={clsx("transactionCost", {
                            zero: !sub.cost || parseInt(sub.cost) === 0,
                          })}
                          onClick={() => this.handleSubClick(sub)}
                        >
                          {formatCost(sub.cost)}
                        </div>
                      </div>
                      {sub.show ? (
                        <div className="transactionBody sub">
                          {sub.description}
                        </div>
                      ) : null}
                    </div>
                  )
                )}
                {transactions.map((el, ind) => (
                  <div key={ind} className="finTransaction">
                    <div className="transactionHeader">
                      <div
                        className="transactionLocation"
                        onClick={() => this.handleTransactionClick(el)}
                      >
                        {el.editing ? (
                          <input
                            type="text"
                            className="transactionEditEntry"
                            name="transactionLocationEntry"
                            id="transactionLocationEntry"
                            value={el.editLocation}
                            onChange={(e) =>
                              this.editTransaction(
                                el,
                                "editLocation",
                                e.target.value
                              )
                            }
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          el.location
                        )}
                      </div>
                      <div
                        className="transactionTagsList"
                        onClick={() => this.handleTransactionClick(el)}
                      >
                        {el.tags.map((tag, tagInd) => (
                          <div key={`tag${tagInd}`} className="transactionTag">
                            {tag}
                          </div>
                        ))}
                      </div>
                      <div
                        className={clsx("transactionCost", {
                          zero:
                            !el.editing &&
                            (!el.cost || parseInt(el.cost) === 0),
                        })}
                        onClick={() => this.handleTransactionClick(el)}
                      >
                        {el.editing ? (
                          <input
                            type="number"
                            className="transactionEditEntry"
                            name="transactionCostEntry"
                            id="transactionCostEntry"
                            value={el.editCost}
                            onChange={(e) =>
                              this.editTransaction(
                                el,
                                "editCost",
                                e.target.value
                              )
                            }
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          formatCost(el.cost)
                        )}
                      </div>
                      <div className="transactionIcons">
                        <img
                          className="smallButton buttonPicture"
                          onClick={
                            el.editing
                              ? () => this.commitTransactionEdit(el)
                              : () => this.startTransactionEdit(el)
                          }
                          src={
                            el.editing
                              ? "/media/check.svg"
                              : "/media/pencil.svg"
                          }
                        />
                        <div
                          className="smallButton text red"
                          onClick={() => this.deleteTransaction(ind)}
                        >
                          x
                        </div>
                      </div>
                    </div>
                    {el.show ? (
                      <div className="transactionBody">
                        {el.editing ? (
                          <textarea
                            type="text"
                            className="transactionEditDescription"
                            name="transactionDescriptionEntry"
                            id="transactionDescriptionEntry"
                            value={el.editDescription}
                            onChange={(e) =>
                              this.editTransaction(
                                el,
                                "editDescription",
                                e.target.value
                              )
                            }
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          el.description
                        )}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Home;