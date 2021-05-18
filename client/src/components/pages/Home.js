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
        let newTransaction = Object.assign({}, CONSTANTS.EMPTY_TRANSACTION);
        newTransaction.tags = [];
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
        this.state = {
            currentDate: new Date(Date.now()).toLocaleDateString(),
            diary: diaryCopy,
            finance: financeCopy,
            tags: tagsCopy,
            newTransaction: newTransaction,
            newTag: "",
            changes: 0,
            changeSet: [],
            keys: [],
            konami: false,
            bulkPaste: "",
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
        let transactions = this.state.finance.hasOwnProperty(this.state.selectedDate) ? this.state.finance[this.state.selectedDate] : [];
        return (
            <div className="homeContainer">
                {!this.state.konami ? (null) :
                    <div className="homePopupContainer" onClick={this.toggleKonami}>
                        <div className="homePopup" onClick={(e) => { e.stopPropagation(); }}>
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
                        if (this.state.diary.hasOwnProperty(dateKey)) {
                            return `rating${this.state.diary[dateKey].rating}`;
                        }
                        return "calendarCell";
                    }}
                />
                <div className="entryContainer">
                    <div className="diaryContainer">
                        <div className="diaryHeader">
                            <div className="starsContainer">
                                {this.state.selectedDate}: {this.createStars()}
                            </div>
                            <div className="changeContainer">
                                {!this.state.diaryText ? 0 : this.state.diaryText.length} / {this.state.changes}
                                {this.state.changes == 0 ?
                                <div className="changeDetails">
                                    letters / changes
                                </div>
                                :
                                <div className="changeDetails">
                                    <ul>
                                        {this.state.changeSet.map((el, ind) => (
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
                        <div className="button saveButton" onClick={this.saveInfo}>
                            Save
                        </div>
                    </div>
                    <div className="finContainer">
                        <div className="finTagsContainer">
                            <div className="finTagsList">
                                {this.state.tags.map((el, ind) => (
                                    <div key={ind} className="finTag">
                                        {el}
                                        <div className="smallButton red" onClick={() => this.changeTag(el, "", true)}>x</div>
                                    </div>
                                ))}
                            </div>
                            <div className="finTagCreate">
                                <div className={classNames("smallButton", {"green": this.tagValid(this.state.newTag)})} onClick={this.addTag}>+</div>
                                <input type="text" className="finTagEntry" name="tagEntry" id="tagEntry" placeholder="New Tag" value={this.state.newTag} onChange={e => this.updateTagField(e.target.value)} />
                            </div>
                        </div>
                        <div className="finTransactionContainer">
                            <div className="finTransactionList">
                                {transactions.length == 0 ?
                                "NO TRANSACTIONS"
                                :
                                transactions.map((el, ind) => (
                                    <div key={ind} className="finTransaction">
                                        {el.location} : {el.description}
                                        <br />
                                        {this.formatCost(el.cost)}
                                        <br />
                                        TAGS:
                                        <ul>
                                            {el.tags.map((tag, tagInd) => (
                                                <li key={`tag${tagInd}`}>
                                                    {tag}
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="smallButton red" onClick={() => this.deleteTransaction(ind)}>x</div>
                                    </div>
                                ))}
                            </div>
                            <div className="finTransactionCreate">
                                <input type="number" className="finCostEntry" name="costEntry" id="costEntry" value={this.state.newTransaction.cost} onChange={e => this.updateFinanceField("cost", e.target.value)} />
                                <input type="text" className="finLocationEntry" name="locationEntry" id="locationEntry" placeholder="Location" value={this.state.newTransaction.location} onChange={e => this.updateFinanceField("location", e.target.value)} />
                                <input type="text" className="finDescriptionEntry" name="descriptionEntry" id="descriptionEntry" placeholder="Description" value={this.state.newTransaction.description} onChange={e => this.updateFinanceField("description", e.target.value)} />
                                <div className={classNames("smallButton", {"green": !this.newTransactionInvalid()})} onClick={this.addTransaction}>+</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    calculateChanges = () => {
        let newSet = new Set(Object.keys(this.state.diary));
        let totalSet = new Set(Object.keys(this.props.userInfo.diary));
        newSet.forEach(key => {
            totalSet.add(key);
        });
        let changes = 0;
        let changeSet = [];
        totalSet.forEach(key => {
            let curEntry = this.state.diary[key];
            let prevEntry = this.props.userInfo.diary[key];
            if (curEntry != prevEntry) {
                changes++;
                changeSet.push(key);
            }
        });
        changeSet.sort((a, b) => {
            let dateA = new Date(a);
            let dateB = new Date(b);
            return dateA < dateB;
        });
        this.setState({
            changes: changes,
            changeSet: changeSet
        });
    }

    formatCost = (costInPennies) => {
        let dollar = costInPennies/100;
        let cents = costInPennies % 100;
        let rest = "";
        if (cents === 0) {
            rest = "00";
        } else if (cents < 10) {
            rest = `0${cents}`;
        } else {
            rest = `${cents}`;
        }
        return `$${dollar}.${rest}`;
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

    changeTag = (tagName, newTag, toRemove) => {
        let newTags = this.state.tags;
        let ind = newTags.indexOf(tagName);
        if (ind == -1 || (!toRemove && !this.tagValid(newTag))) {
            return;
        }
        if (toRemove) {
            newTags.splice(ind, 1);
        } else {
            newTags[ind] = newTag;
        }
        let newFinance = this.state.finance;
        Object.keys(newFinance).forEach(key => {
            newFinance[key].forEach(el => {
                let tagIndex = el.tags.indexOf(tagName);
                if (tagList > -1) {
                    if (toRemove) {
                        el.tags.splice(tagIndex, 1);
                    } else {
                        el.tags[tagIndex] = newTag;
                    }
                }
            });
        });
        this.setState({
            tags: newTags,
            finance: newFinance,
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
        if (this.newTransactionInvalid()) {
            return;
        }
        let newTransaction = this.state.newTransaction;
        let newFinance = this.state.finance;
        if (!newFinance.hasOwnProperty(this.state.selectedDate)) {
            newFinance[this.state.selectedDate] = [];
        }
        newFinance[this.state.selectedDate].push(newTransaction);
        let refreshTransaction = Object.assign({}, CONSTANTS.EMPTY_TRANSACTION);
        refreshTransaction.tags = [];
        this.setState({
            finance: newFinance,
            newTransaction: refreshTransaction,
        });
    }

    deleteTransaction = (ind) => {
        let newFinance = this.state.finance;
        newFinance[this.state.selectedDate].splice(ind);
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
                onClick={() => this.updateDiary(this.state.diaryText, ind + 1)}
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
        this.calculateChanges();
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

    saveInfo = () => {
        let body = {
            diary: this.state.diary,
            tags: this.state.tags,
            finance: this.state.finance,
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