import React, { Component } from 'react';
import Calendar from 'react-calendar';

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
        tags: [Number], // index to a tag
    }
]
*/

export default class Home extends Component {
    constructor(props) {
        super(props);
        let diaryCopy = Object.assign({}, this.props.userInfo.diary);
        this.state = {
            currentDate: new Date(Date.now()).toLocaleDateString(),
            diary: diaryCopy,
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
                        Finance
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
            diary: this.state.diary
        };
        fetch("/api/publish_diary", {
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
                    alert("There was an issue saving your entry. Please make sure you're logged in.")
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