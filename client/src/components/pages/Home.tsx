import React, { useState, useEffect, useMemo } from "react";
import _ from "lodash";
// @ts-ignore
import Calendar from "react-calendar";
import clsx from "clsx";

import {
  EMPTY_TRANSACTION,
  EMPTY_SUBSCRIPTION,
  STAR_MAX,
  User,
  Transaction,
  Subscription,
  Diary,
  FinanceLog,
} from "../../../../defaults";
import { subApplies, sortByDate, stripId } from "../../../../helpers";
import TransactionComponent from "../modules/Transaction";
import SubscriptionComponent from "../modules/Subscription";
import { generateReactCalendarStyle, makeStyles } from "../../theme";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';

interface HomeProps {
  userInfo: User;
}

const Home: React.FC<HomeProps> = ({ userInfo }) => {
  const classes = useStyles();
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString());
  const [queriedYears, setQueriedYears] = useState<string[]>([]);
  const [originalDiary, setOriginalDiary] = useState<Diary>({});
  const [diary, setDiary] = useState<Diary>({});
  const [originalFinance, setOriginalFinance] = useState<FinanceLog>({});
  const [finance, setFinance] = useState<FinanceLog>({});
  const [subscriptions, setSubscriptions] = useState(
    _.cloneDeep(userInfo.subscriptions)
  );
  const [showAllSubs, setShowAllSubs] = useState(false);
  const [tags, setTags] = useState(_.cloneDeep(userInfo.tags));
  const [tagEdits, setTagEdits] = useState<Record<string, string>>({});
  const [editCounts, setEditCounts] = useState(0);
  const [newTag, setNewTag] = useState("");
  const [selectedTag, _setSelectedTag] = useState("");
  const [hoverDetails, setHoverDetails] = useState(false);
  const [searchString, setSearchString] = useState("");
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [diaryText, setDiaryText] = useState(
    diary[new Date().toLocaleDateString()]?.description ?? ""
  );
  const [rating, setRating] = useState(
    diary[new Date().toLocaleDateString()]?.rating ?? 0
  );
  const [displayRating, setDisplayRating] = useState(
    diary[new Date().toLocaleDateString()]?.rating ?? 0
  );
  const [productivity, setProductivity] = useState(
    diary[new Date().toLocaleDateString()]?.productivity ?? 0
  );
  const [displayProductivity, setDisplayProductivity] = useState(
    diary[new Date().toLocaleDateString()]?.productivity ?? 0
  );
  const [revised, setRevised] = useState(
    !!diary[new Date().toLocaleDateString()]?.revised
  );
  const [refresherDate, setRefresherDate] = useState<string | undefined>(undefined);
  const [changeSet, setChangeSet] = useState<string[]>([]);
  const [incompleteDates, setIncompleteDates] = useState<string[]>([]);

  const transactions = useMemo(
    () => finance[selectedDate] ?? [],
    [finance, selectedDate]
  );


  useEffect(() => {
    document.title = "Home";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    (async () => {
      const newIncompleteDates = await (
        await fetch("/api/incomplete_dates")
      ).json();
      setIncompleteDates(newIncompleteDates);
    })();
  }, []);

  useEffect(() => {
    handleChange();
  }, [diary, originalDiary, finance, originalFinance, selectedDate]);

  const fetchAllYears = async (): Promise<{
    diary: Diary;
    finance: FinanceLog;
  }> => {
    const newDiary: Diary = _.cloneDeep(diary);
    const newFinance: FinanceLog = _.cloneDeep(finance);
    const allYears = await (await fetch("/api/all_years")).json();
    for (const year of allYears) {
      const { diary: newDiaryEntry, finance: newFinanceEntry } =
        await fetchYear(year);
      Object.assign(newDiary, newDiaryEntry);
      Object.assign(newFinance, newFinanceEntry);
    }
    return { diary: newDiary, finance: newFinance };
  };

  const fetchYear = async (
    year: string
  ): Promise<{ diary: Diary; finance: FinanceLog }> => {
    let newDiary = diary;
    let newFinance = finance;
    if (year && !queriedYears.includes(year)) {
      const newDiaryEntry = await (
        await fetch(`/api/diary?year=${year}`)
      ).json();
      newDiary = {
        ...diary,
        ...newDiaryEntry,
      };
      setDiary(newDiary);
      setOriginalDiary({
        ...originalDiary,
        ...newDiaryEntry,
      });

      const newFinanceEntry = await (
        await fetch(`/api/finance?year=${year}`)
      ).json();
      newFinance = {
        ...finance,
        ...newFinanceEntry,
      };
      setFinance(newFinance);
      setOriginalFinance({
        ...originalFinance,
        ...newFinanceEntry,
      });

      setQueriedYears([...queriedYears, year]);
    }
    return { diary: newDiary, finance: newFinance };
  };

  useEffect(() => {
    (async () => {
      const year = _.last(selectedDate.split("/"));
      const { diary: newDiary } = await fetchYear(year);
      calendarChange(selectedDate, newDiary);
      if (selectedDate === refresherDate) {
        setRevised(true);
      }
    })();
  }, [selectedDate]);

  const handleChange = () => {
    const newChangeSet = _.cloneDeep(changeSet);
    const isDirty = diaryChanged(selectedDate) || financeChanged(selectedDate);
    let ind = newChangeSet.indexOf(selectedDate);
    if (ind >= 0 && !isDirty) {
      newChangeSet.splice(ind, 1);
    } else if (ind === -1 && isDirty) {
      newChangeSet.push(selectedDate);
    }
    setChangeSet(newChangeSet.sort(sortByDate));

    const newIncompleteDates = _.cloneDeep(incompleteDates);
    const incomplete = transactions.some((t) => !t.cost || !t.tags.length);
    ind = newIncompleteDates.indexOf(selectedDate);
    if (ind >= 0 && !incomplete) {
      newIncompleteDates.splice(ind, 1);
    } else if (ind === -1 && incomplete) {
      newIncompleteDates.push(selectedDate);
    }
    setIncompleteDates(newIncompleteDates.sort(sortByDate));
  };

  const fetchNewRefresherDate = async () => {
    const newRefresherDate = await (await fetch("/api/lookback")).json();
    setRefresherDate(newRefresherDate.refresherDate);
  }

  const search = async () => {
    const { diary, finance } = await fetchAllYears();
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
  };

  const diaryChanged = (dateOfInterest: string) => {
    return !_.isEqual(diary[dateOfInterest], originalDiary[dateOfInterest]);
  };

  const financeChanged = (dateOfInterest: string) => {
    return !_.isEqual(finance[dateOfInterest], originalFinance[dateOfInterest]);
  };

  const subsChanged = useMemo(
    () => !_.isEqual(subscriptions.map(stripId), userInfo.subscriptions.map(stripId)),
    [subscriptions, userInfo.subscriptions]
  );

  const toggleShowAllSubs = () => setShowAllSubs(!showAllSubs);

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
    _setSelectedTag(nextSelectedTag);
    setTagEdits(newTagEdits);
  };

  const selectTag = (tag: string) => {
    _setSelectedTag(selectedTag === tag ? "" : tag);
  };

  const handleKeyDown = (event: any) => {
    if (event.key === "Escape") {
      selectTag("");
    }
  };

  const addTransaction = () => {
    const newFinance = _.cloneDeep(finance);
    if (!_.hasIn(newFinance, selectedDate)) {
      newFinance[selectedDate] = [];
    }
    newFinance[selectedDate].push(EMPTY_TRANSACTION());
    setFinance(newFinance);
  };

  const deleteTransaction = (ind: number) => {
    const newFinance = _.cloneDeep(finance);
    newFinance[selectedDate].splice(ind, 1);
    setFinance(newFinance);
  };

  const addSub = () => {
    const newSubscriptions = _.cloneDeep(subscriptions);
    const newSub = EMPTY_SUBSCRIPTION();
    newSub.tags = [];
    newSubscriptions.push(newSub);
    setSubscriptions(newSubscriptions);
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

  const createRatingStars = () => _.range(0, STAR_MAX).map((ind) => (
    <FontAwesomeIcon
      key={ind}
      icon={faStar}
      className={clsx(classes.diaryStars, { red: ind < displayRating, faded: ind >= displayRating })}
      onMouseEnter={() => setDisplayRating(ind + 1)}
      onMouseLeave={() => setDisplayRating(rating)}
      onClick={() => updateDiary(diaryText, rating === ind + 1 ? 0 : ind + 1, productivity)}
    />
  ));

  const createProductivityStars = () => _.range(0, STAR_MAX).map((ind) => (
    <FontAwesomeIcon
      key={ind}
      icon={faStar}
      className={clsx(classes.diaryStars, { green: ind < displayProductivity, faded: ind >= displayProductivity })}
      onMouseEnter={() => setDisplayProductivity(ind + 1)}
      onMouseLeave={() => setDisplayProductivity(productivity)}
      onClick={() => updateDiary(diaryText, rating, productivity === ind + 1 ? 0 : ind + 1)}
    />
  ));

  const calendarChange = (date: string, overrideDiary?: Diary) => {
    const refDiary = overrideDiary ?? diary;
    if (_.hasIn(refDiary, date)) {
      const { rating, description, productivity, revised } = refDiary[date];
      setSelectedDate(date);
      setDisplayRating(rating);
      setRating(rating);
      setDisplayProductivity(productivity ?? 0);
      setProductivity(productivity ?? 0);
      setRevised(revised);
      setDiaryText(description);
    } else {
      setSelectedDate(date);
      setDisplayRating(0);
      setRating(0);
      setDisplayProductivity(0);
      setProductivity(0);
      setRevised(false);
      setDiaryText("");
    }
  };

  const updateDiary = (text: string, rating: number, productivity: number) => {
    const newDiary = _.cloneDeep(diary);
    newDiary[selectedDate] = {
      description: text,
      rating,
      productivity,
      revised,
    };
    setDiary(newDiary);
    setDiaryText(text);
    setRating(rating);
    setDisplayRating(rating);
    setProductivity(productivity);
    setDisplayProductivity(productivity);
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

  return (
    <div className={classes.homeContainer}>
      <div className={classes.entryContainer}>
        <div>
          <Calendar
            className={classes.calendar}
            onClickDay={(e: any) => calendarChange(e.toLocaleDateString())}
            onActiveStartDateChange={(e: any) =>
              fetchYear(new Date(e.activeStartDate).getFullYear().toString())
            }
            calendarType="US"
            tileClassName={(properties: any) => {
              const dateKey = properties.date.toLocaleDateString();
              const classNames: string[] = [];
              if (properties.view === "month" && _.hasIn(diary, dateKey)) {
                const ratings = _.filter([diary[dateKey].rating, diary[dateKey].productivity], num => !!num);
                if (!ratings.length) {
                  classNames.push(classes.rating0);
                } else {
                  const geometricRating = Math.pow(_.reduce(ratings, (prod, num) => prod * num, 1), 1 / ratings.length);
                  classNames.push(classes[`rating${Math.round(geometricRating)}` as keyof typeof classes]);
                }
              } else {
                classNames.push(classes.calendarCell);
              }
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
            {generateReactCalendarStyle()}
          </style>
        </div>
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
                onKeyPress={(e) => {
                  e.key === "Enter" && search();
                }}
              />
              <div className={classes.simpleButton} onClick={search}>
                Search
              </div>
              <div
                className={classes.simpleButton}
                onClick={() =>
                  calendarChange(new Date().toLocaleDateString())
                }
              >
                Today
              </div>
            </div>
            <div className={classes.searchResultList}>
              {searchResults.map((dateString) => (
                <div
                  className={clsx(classes.simpleButton, classes.homeDate)}
                  onClick={() => calendarChange(dateString)}
                >
                  {dateString}
                </div>
              ))}
            </div>
          </div>
          <div className={classes.diaryHeader}>
            {selectedDate}
            <div className={classes.refresherHeader}>
              {!!refresherDate ? (
                <div
                  className={clsx(classes.simpleButton, classes.homeDate)}
                  onClick={() => calendarChange(refresherDate)}
                >
                  {refresherDate}
                </div>
              ) : (
                <div>
                  Click for refresher:
                </div>
              )}
              <img
                className={clsx(classes.smallButton, "picture")}
                onClick={fetchNewRefresherDate}
                src={"/media/refresh.svg"}
              />
            </div>
            <div
              className={classes.changeContainer}
              onMouseEnter={() => setHoverDetails(true)}
              onMouseLeave={() => setHoverDetails(false)}
            >
              {!diaryText ? 0 : diaryText.length} / {changeSet.length} /{" "}
              {incompleteDates.length}
              {!changeSet.length ? (
                <div
                  className={clsx(classes.changeDetails, {
                    [classes.changeDetailsVisible]: hoverDetails,
                  })}
                >
                  letters/changes/incomplete
                </div>
              ) : (
                <div
                  className={clsx(classes.changeDetails, {
                    [classes.changeDetailsVisible]: hoverDetails,
                  })}
                >
                  {changeSet.join("\n")}
                </div>
              )}
            </div>
          </div>
          <div className={classes.ratingContainer}>
            <div>
              RATING: {createRatingStars()}
            </div>
            <div>
              PRODUCTIVITY: {createProductivityStars()}
            </div>
          </div>
          <textarea
            className={classes.diaryEntry}
            name="diaryEntry"
            id="diaryEntry"
            value={diaryText}
            onChange={(e) => updateDiary(e.target.value, rating, productivity)}
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
            {tags.map((el) => {
              const editing = _.hasIn(tagEdits, el);
              return (
                <div key={el} className={classes.finTag}>
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
                      className={clsx(classes.smallButton, "picture")}
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
        <div className={classes.subContainer}>
          <div className={classes.subTitle}>
            <div className={classes.subTitleMain}>
              SUBSCRIPTIONS
              {!!subsChanged ? <div className={classes.changed}>*</div> : null}
            </div>
            <div className={classes.subTitleSecondary}>
              <div
                className={clsx(classes.smallButton, "text")}
                onClick={toggleShowAllSubs}
              >
                SHOW {showAllSubs ? "RELEVANT" : "ALL"}
              </div>
              <div
                className={clsx(classes.smallButton, "text green")}
                onClick={() => { addSub(); setShowAllSubs(true); }}
              >
                +
              </div>
            </div>
          </div>
          <div>
            {subscriptions.map((el, ind) =>
              showAllSubs || subApplies(el, selectedDate)
                ? (
                  <SubscriptionComponent
                    odd={ind % 2 == 1}
                    inactive={!subApplies(el, selectedDate)}
                    key={el._id}
                    subscription={el}
                    editSubscription={(s: Subscription) => editSub(ind, s)}
                    deleteSubscription={() => deleteSub(ind)}
                    selectedTag={selectedTag}
                    incrementEdits={() => setEditCounts((ec) => ec + 1)}
                    decrementEdits={() => setEditCounts((ec) => ec - 1)}
                  />
                ) : null)}
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
            {transactions.map((el, ind) => (
              <TransactionComponent
                key={el.id}
                odd={(ind + subscriptions.length) % 2 == 1}
                transaction={el}
                editTransaction={(t: Transaction) => editTransaction(ind, t)}
                deleteTransaction={() => deleteTransaction(ind)}
                selectedTag={selectedTag}
                incrementEdits={() => setEditCounts((ec) => ec + 1)}
                decrementEdits={() => setEditCounts((ec) => ec - 1)}
              />
            ))}
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
    "&.picture": {
      width: "30px",
    },
    "&:hover": {
      opacity: "0.8",
    },
  },
  homeContainer: {
    display: "flex",
    paddingTop: "8vh",
    width: "100%",
    height: "100%",
    flexDirection: "row",
    justifyContent: "center",
  },
  entryContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: theme.spacing(1),
    width: "50%",
    marginTop: theme.spacing(3),
    marginLeft: theme.spacing(3),
  },
  diaryContainer: {
    width: "100%",
    height: "100%",
  },
  finContainer: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1),
    width: "50%",
    height: "100%",
    marginTop: theme.spacing(3),
    marginRight: theme.spacing(3),
    padding: `0 ${theme.spacing(3)}px`,
  },
  diaryHeader: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 20,
  },
  refresherHeader: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: theme.spacing(1),
  },
  ratingContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
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
  subContainer: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    border: "1px solid black",
    borderRadius: "5px",
    padding: "5px",
  },
  subTitle: {
    display: "flex",
    flexDirection: "row",
  },
  subTitleMain: {
    display: "flex",
    flexDirection: "row",
    flexGrow: 1,
  },
  subTitleSecondary: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(1),
    flexGrow: 0,
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
  changeContainer: {
    position: "relative",
    display: "inline-block",
    flexGrow: 0,
    textAlign: "right",
    borderBottom: "1px dotted black",
    marginBottom: "5px",
  },
  changeDetails: {
    visibility: "hidden",
    backgroundColor: "black",
    color: "whitesmoke",
    fontSize: "10px",
    textAlign: "center",
    width: "fit-content",
    padding: "5px",
    borderRadius: "3px",
    position: "absolute",
    zIndex: 1,
    top: "-5px",
    left: "105%",
  },
  changeDetailsVisible: {
    visibility: "visible",
  },
  diaryEntry: {
    width: "100%",
    height: "30vh",
  },
  diaryStars: {
    width: "1.5vw",
    "&.red": {
      color: theme.colors.red,
    },
    "&.green": {
      color: theme.colors.green,
    },
    "&.faded": {
      opacity: 0.2,
    },
  },
  calendar: {
    width: "100%",
  },
  calendarCell: {
    padding: 0,
  },
  rating0: {
    backgroundColor: "darkgrey",
  },
  rating1: {
    backgroundColor: "#ED0000",
  },
  rating2: {
    backgroundColor: "#ED712D",
  },
  rating3: {
    backgroundColor: "#F19E38",
  },
  rating4: {
    backgroundColor: "#F7CE46",
  },
  rating5: {
    backgroundColor: "#FFFF53",
  },
  rating6: {
    backgroundColor: "#D7FE51",
  },
  rating7: {
    backgroundColor: "#B1FD50",
  },
  rating8: {
    backgroundColor: "#92FC4D",
  },
  rating9: {
    backgroundColor: "#71F040",
  },
  rating10: {
    backgroundColor: "#37F000",
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
  simpleButton: {
    cursor: "pointer",
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
