import React, { Component } from 'react';
import Calendar from 'react-calendar';
import classNames from 'classnames';

import CONSTANTS from '../../../../constants';
import '../../css/app.css';
import '../../css/home.css';

/*
Diary structure: object from date strings to:
{
    rating: Number
    description: String
}
*/

/*
Finance structure: object from date strings to:
[
    {
        cost: Number,
        description: String,
        location: String,
        tags: [String],
        ---
        show: Boolean (always set to False),
        editing: Boolean,
        editCost: Number,
        editDescription: String,
        editLocation: String,
        ---
    }
]
*/

export default class Home extends Component {
    constructor(props) {
        super(props);
        let diaryCopy = Object.assign({}, this.props.userInfo.diary);
        let tagsCopy = this.props.userInfo.tags ? this.props.userInfo.tags.slice() : [];
        let financeCopy = {};
        let originalFinance = this.props.userInfo.finance;
        if (originalFinance) {
            Object.keys(originalFinance).forEach(key => {
                financeCopy[key] = [];
                originalFinance[key].forEach(el => {
                    let newEl = Object.assign({}, el);
                    newEl.tags = el.tags.slice();
                    financeCopy[key].push(newEl);
                });
            });
        }
        let subscriptionCopy = [];
        this.props.userInfo.subscriptions.forEach(sub => {
            let newSub = Object.assign({}, sub);
            let newTags = [];
            sub.tags.forEach(tag => {
                newTags.push(tag);
            });
            newSub.tags = newTags;
            subscriptionCopy.push(newSub);
        });
        this.state = {
            currentDate: new Date(Date.now()).toLocaleDateString(),
            diary: diaryCopy,
            finance: financeCopy,
            subscriptions: subscriptionCopy,
            tags: tagsCopy,
            tagEdits: {},
            newTag: "",
            selectedTag: "",
            keys: [],
            konami: false,
            bulkPaste: "",
            hoverDetails: false,
        }
    }
    
    componentDidMount() {
        document.title = "Home";
        this.calendarChange(this.state.currentDate);
        window.addEventListener("keydown", this.handleKeyDown);
    }

    componentWillUnmount() {
        window.removeEventListener("keydown", this.handleKeyDown);
    }
    
    render() {
        let totalSet = new Set([
            ...Object.keys(this.state.diary),
            ...Object.keys(this.props.userInfo.diary),
            ...Object.keys(this.state.finance),
            ...Object.keys(this.props.userInfo.finance),
        ]);
        let changes = 0;
        let changeSet = [];
        totalSet.forEach(key => {
            if (this.diaryChanged(key) || this.financeChanged(key)) {
                changes++;
                changeSet.push(key);
            }
        });
        changeSet.sort((a, b) => {
            let dateA = new Date(a);
            let dateB = new Date(b);
            return dateA < dateB;
        });
        let transactions = this.state.finance.hasOwnProperty(this.state.selectedDate) ? this.state.finance[this.state.selectedDate] : [];
        let incompleteDates = new Set();
        Object.keys(this.state.finance).forEach(dateKey => {
            let curTransactions = this.state.finance[dateKey];
            let incomplete = false;
            curTransactions.forEach(el => {
                if (!el.cost || parseInt(el.cost) === 0 || el.tags.length === 0) {
                    incomplete = true;
                    return;
                }
            });
            if (incomplete) {
                incompleteDates.add(dateKey);
            }
        })
        return (
            <div className="homeContainer">
                {!this.state.konami ? (null) :
                    <div className="homePopupContainer" onClick={this.toggleKonami}>
                        <div className="homePopup" onClick={e => e.stopPropagation()}>
                            Enter bulk entries:
                            <textarea className="bulkEntry" name="bulkEntry" id="bulkEntry" onChange={this.updateBulk} />
                            <div className="button saveButton" onClick={this.saveBulk}>
                                Copy Over
                            </div>
                        </div>
                    </div>
                }
                <Calendar
                    className="homeCalendar"
                    onClickDay={e => this.calendarChange(e.toLocaleDateString())}
                    calendarType="US"
                    tileClassName={properties => {
                        let dateKey = properties.date.toLocaleDateString();
                        if (properties.view === "month" && this.state.diary.hasOwnProperty(dateKey)) {
                            return `rating${this.state.diary[dateKey].rating}`;
                        }
                        return "calendarCell";
                    }}
                    tileContent={properties => {
                        let dateKey = properties.date.toLocaleDateString();
                        return incompleteDates.has(dateKey) ? <div className={classNames("calendarIncomplete", {"details" : this.state.hoverDetails})}>!</div> : null;
                    }}
                />
                <div className="entryContainer">
                    <div className="diaryContainer">
                        <div className="diaryHeader">
                            <div className="starsContainer">
                                {this.state.selectedDate}: {this.createStars()}
                            </div>
                            <div className="changeContainer" onMouseEnter={() => this.setDetails(true)} onMouseLeave={() => this.setDetails(false)}>
                                {!this.state.diaryText ? 0 : this.state.diaryText.length} / {changes} / {incompleteDates.size}
                                {changes == 0 ?
                                <div className="changeDetails">
                                    letters / changes / incomplete
                                </div>
                                :
                                <div className="changeDetails">
                                    <ul>
                                        {changeSet.map((el, ind) => (
                                        <li key={ind}>
                                            {el}
                                        </li>
                                        ))}
                                    </ul>
                                </div>
                                }
                            </div>
                        </div>
                        <textarea className="diaryEntry" name="diaryEntry" id="diaryEntry" value={this.state.diaryText} onChange={e => this.updateDiary(e.target.value, this.state.rating)} />
                        <div className={classNames("button saveButton", {"disabled": this.isEditingAnything()})} onClick={this.saveInfo}>
                            Save
                        </div>
                    </div>
                    <div className="finContainer">
                        <div className="finTagsContainer">
                            <div className="finHeader">
                                <div className="finHeaderMain">
                                    TAGS
                                    {this.tagsChanged() ?
                                    <div className="finChanged">*</div>
                                    :
                                    null
                                    }
                                </div>
                            </div>
                            <div className="finTagsList">
                                {this.state.tags.map((el, ind) => {
                                    let editing = this.state.tagEdits.hasOwnProperty(el);
                                    return (
                                    <div key={ind} className="finTag">
                                        <div className={classNames("finTagName", {"selected": el == this.state.selectedTag})} onClick={() => this.selectTag(el)}>
                                            {editing ?
                                            <input type="text" className="tagEditEntry" name="tagEditEntry" id="tagEditEntry" value={this.state.tagEdits[el]} onChange={e => this.editTag(el, e.target.value)} onClick={e => e.stopPropagation()} />
                                            :
                                            el
                                            }
                                        </div>
                                        <div className="finTagIcons">
                                            <img
                                                className="smallButton buttonPicture"
                                                onClick={editing ? () => this.changeTag(el, false) : () => this.startTagEdit(el)}
                                                src={editing ? "/media/check.svg" : "/media/pencil.svg"}
                                            />
                                            <div className="smallButton text red" onClick={() => this.changeTag(el, true)}>x</div>
                                        </div>
                                    </div>
                                    );
                                })}
                            </div>
                            <div className="finTagCreate">
                                <div className={classNames("smallButton text", {"green": this.tagValid(this.state.newTag)})} onClick={this.addTag}>+</div>
                                <input type="text" className="finTagEntry" name="tagEntry" id="tagEntry" placeholder="New Tag" value={this.state.newTag} onChange={e => this.updateTagField(e.target.value)} />
                            </div>
                        </div>
                        <div className="finTransactionContainer">
                            <div className="finHeader">
                                <div className="finHeaderMain">
                                    TRANSACTIONS
                                    {this.financeChanged(this.state.selectedDate) ?
                                    <div className="finChanged">*</div>
                                    :
                                    null
                                    }
                                </div>
                                <div className="finHeaderSecondary">
                                    <div className="smallButton text green" onClick={this.addTransaction}>+</div>
                                </div>
                            </div>
                            <div className="finTransactionList">
                                {this.state.subscriptions.map((sub, ind) => (
                                    !CONSTANTS.SUB_APPLIES(sub, this.state.selectedDate) ?
                                    null
                                    :
                                    <div key={ind} className="finTransaction">
                                        <div className="transactionHeader sub">
                                            <div className="transactionLocation" onClick={() => this.handleSubClick(sub)}>
                                                {sub.location}
                                            </div>
                                            <div className="transactionTagsList" onClick={() => this.handleSubClick(sub)}>
                                                {sub.tags.map((tag, tagInd) => (
                                                    <div key={`tag${tagInd}`} className="transactionTag">
                                                        {tag}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className={classNames("transactionCost", {"zero": !sub.cost || parseInt(sub.cost) === 0})} onClick={() => this.handleSubClick(sub)}>
                                                {CONSTANTS.FORMAT_COST(sub.cost)}
                                            </div>
                                        </div>
                                        {sub.show ?
                                        <div className="transactionBody sub">
                                            {sub.description}
                                        </div>
                                        :
                                        null
                                        }
                                    </div>
                                ))}
                                {transactions.map((el, ind) => (
                                    <div key={ind} className="finTransaction">
                                        <div className="transactionHeader">
                                            <div className="transactionLocation" onClick={() => this.handleTransactionClick(el)}>
                                                {el.editing ?
                                                <input type="text" className="transactionEditEntry" name="transactionLocationEntry" id="transactionLocationEntry" value={el.editLocation} onChange={e => this.editTransaction(el, "editLocation", e.target.value)} onClick={e => e.stopPropagation()} />
                                                :
                                                el.location
                                                }
                                            </div>
                                            <div className="transactionTagsList" onClick={() => this.handleTransactionClick(el)}>
                                                {el.tags.map((tag, tagInd) => (
                                                    <div key={`tag${tagInd}`} className="transactionTag">
                                                        {tag}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className={classNames("transactionCost", {"zero": !el.editing && (!el.cost || parseInt(el.cost) === 0)})} onClick={() => this.handleTransactionClick(el)}>
                                                {el.editing ?
                                                <input type="number" className="transactionEditEntry" name="transactionCostEntry" id="transactionCostEntry" value={el.editCost} onChange={e => this.editTransaction(el, "editCost", e.target.value)} onClick={e => e.stopPropagation()} />
                                                :
                                                CONSTANTS.FORMAT_COST(el.cost)
                                                }
                                            </div>
                                            <div className="transactionIcons">
                                                <img
                                                    className="smallButton buttonPicture"
                                                    onClick={el.editing ? () => this.commitTransactionEdit(el) : () => this.startTransactionEdit(el)}
                                                    src={el.editing ? "/media/check.svg" : "/media/pencil.svg"}
                                                />
                                                <div className="smallButton text red" onClick={() => this.deleteTransaction(ind)}>x</div>
                                            </div>
                                        </div>
                                        {el.show ?
                                        <div className="transactionBody">
                                            {el.editing ?
                                            <textarea type="text" className="transactionEditDescription" name="transactionDescriptionEntry" id="transactionDescriptionEntry" value={el.editDescription} onChange={e => this.editTransaction(el, "editDescription", e.target.value)} onClick={e => e.stopPropagation()} />
                                            :
                                            el.description
                                            }
                                        </div>
                                        :
                                        null
                                        }
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    diaryChanged = (dateOfInterest) => {
        let currentDiary = this.state.diary[dateOfInterest] || {};
        let prevDiary = this.props.userInfo.diary[dateOfInterest] || {};
        let curRating = currentDiary.rating || 0;
        let prevRating = prevDiary.rating || 0;
        return curRating !== prevRating || currentDiary.description !== prevDiary.description;
    }

    financeChanged = (dateOfInterest) => {
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
            if (cur.cost !== prev.cost || cur.description !== prev.description || cur.location !== prev.location) {
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
        })
        return changed;
    }

    tagsChanged = () => {
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
    }

    startTransactionEdit = (transaction) => {
        transaction.editing = true;
        transaction.editCost = transaction.cost;
        transaction.editLocation = transaction.location;
        transaction.editDescription = transaction.description;
        this.setState({
            finance: this.state.finance,
        })
    }

    commitTransactionEdit = (transaction) => {
        transaction.editing = false;
        transaction.cost = transaction.editCost;
        transaction.location = transaction.editLocation;
        transaction.description = transaction.editDescription;
        this.setState({
            finance: this.state.finance,
        });
    }

    editTransaction = (transaction, fieldName, value) => {
        transaction[fieldName] = value;
        this.setState({
            finance: this.state.finance,
        });
    }

    setDetails = (showing) => {
        this.setState({
            hoverDetails: showing,
        });
    }

    toggleShow = (transaction) => {
        if (this.state.selectedTag !== "") {
            return;
        }
        transaction.show = !transaction.show;
        this.setState({
            finance: this.state.finance,
        });
    }

    handleTransactionClick = (transaction) => {
        this.toggleTag(transaction);
        this.toggleShow(transaction);
    }

    handleSubClick = (sub) => {
        sub.show = !sub.show;
        this.setState({
            subscriptions: this.state.subscriptions,
        });
    }

    tagValid = (tag) => {
        return tag.length > 0 && this.state.tags.indexOf(tag) == -1;
    }

    addTag = () => {
        if (!this.tagValid(this.state.newTag)) {
            return;
        }
        let newTags = this.state.tags;
        newTags.push(this.state.newTag);
        this.setState({
            tags: newTags,
            newTag: "",
        });
    }

    startTagEdit = (tagName) => {
        this.editTag(tagName, tagName);
    }

    editTag = (tagName, newTag) => {
        let newTagEdits = this.state.tagEdits;
        newTagEdits[tagName] = newTag;
        this.setState({
            tagEdits: newTagEdits,
        });
    }

    changeTag = (tagName, toRemove) => {
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
        Object.keys(newFinance).forEach(key => {
            newFinance[key].forEach(el => {
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
    }

    selectTag = (tag) => {
        this.setState({
            selectedTag: this.state.selectedTag === tag ? "" : tag,
        });
    }

    toggleTag = (transaction) => {
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
    }

    updateTagField = (value) => {
        this.setState({
            newTag: value,
        });
    }

    updateFinanceField = (fieldName, value) => {
        let newTransaction = this.state.newTransaction;
        newTransaction[fieldName] = value;
        this.setState({
            newTransaction: newTransaction,
        });
    }

    newTransactionInvalid = () => {
        let newTransaction = this.state.newTransaction;
        return newTransaction.description == "" || newTransaction.location == "";
    }

    addTransaction = () => {
        let newFinance = this.state.finance;
        if (!newFinance.hasOwnProperty(this.state.selectedDate)) {
            newFinance[this.state.selectedDate] = [];
        }
        let newTransaction = Object.assign({}, CONSTANTS.EMPTY_TRANSACTION);
        newTransaction.tags = [];
        newFinance[this.state.selectedDate].push(newTransaction);
        this.setState({
            finance: newFinance,
        });
    }

    deleteTransaction = (ind) => {
        let newFinance = this.state.finance;
        newFinance[this.state.selectedDate].splice(ind, 1);
        this.setState({
            finance: newFinance,
        });
    }

    createStars = () => {
        let unfilled = "/media/star_light_unfilled.svg";
        let filled = "/media/star_light_filled.svg";
        return [...Array(CONSTANTS.STAR_MAX).keys()].map(ind => (
            <img
                key={ind}
                className="diaryStars"
                src={ind < this.state.displayRating ? filled : unfilled}
                onMouseEnter={() => this.changeDisplay(ind + 1)}
                onMouseLeave={() => this.changeDisplay(this.state.rating)}
                onClick={() => this.updateDiary(this.state.diaryText, this.state.rating === ind + 1 ? 0 : ind + 1)}
            />
        ));
    }

    changeDisplay = (num) => {
        this.setState({
            displayRating: num
        });
    }

    calendarChange = (date) => {
        if (this.state.diary.hasOwnProperty(date)) {
            let entry = this.state.diary[date];
            this.setState({
                selectedDate: date,
                displayRating: entry.rating,
                rating: entry.rating,
                diaryText: entry.description,
            })
        } else {
            this.setState({
                selectedDate: date,
                displayRating: 0,
                rating: 0,
                diaryText: "",
            });
        }
    }

    updateDiary = (text, rating) => {
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
    }

    updateBulk = (e) => {
        this.setState({
            bulkPaste: e.target.value
        });
    }

    saveBulk = () => {
        let newDiary = this.state.diary;
        let dailyEntries = this.state.bulkPaste.split("\n\n");
        dailyEntries.forEach(dailyLog => {
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
    }

    isEditingAnything = () => {
        let result = false;
        Object.values(this.state.finance).forEach(transactionList => {
            if (result) {
                return;
            }
            transactionList.forEach(t => {
                if (t.editing) {
                    result = true;
                    return;
                }
            })
        });
        return result;
    }

    saveInfo = () => {
        if (this.isEditingAnything()) {
            return;
        }
        Object.values(this.state.finance).forEach(transactionList => {
            transactionList.forEach(t => {
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
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body),
        }).then(
            res => {
                if (res.status === 200) {
                    window.location.reload();
                } else {
                    alert("There was an issue saving your entry. Please make sure you're logged in.");
                }
            }
        )
    }

    handleKeyDown = (event) => {
        if (event.key === "Escape") {
            this.selectTag("");
        }
        let keys = this.state.keys;
        keys.push(event.key.toLowerCase());
        keys = keys.slice(Math.max(keys.length - CONSTANTS.KONAMI_CODE.length, 0));
        this.setState({
            keys: keys,
        });
        if (JSON.stringify(keys) == JSON.stringify(CONSTANTS.KONAMI_CODE)) {
            this.toggleKonami();
        }
    }

    toggleKonami = () => {
        this.setState({
            konami: !this.state.konami,
        });
    }
}