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
        this.state = {
            diary: this.props.userInfo.diary,
        }
    }
    
    componentDidMount() {
        document.title = "Home";
        let currentDate = new Date(Date.now()).toLocaleDateString();
        this.calendarChange(currentDate);
    }
    
    render() {
        return (
            <div className="homeContainer">
                <Calendar onClickDay={e => this.calendarChange(e.toLocaleDateString())} />
                <div className="entryContainer">
                    <div className="diaryContainer">
                        <div className="starsContainer">
                            {this.state.selectedDate}: {this.createStars()}
                        </div>
                        <textarea className="diaryEntry"  name="diaryEntry" id="diaryEntry" value={this.state.diaryText} onChange={e => this.updateDiary(e.target.value, this.state.rating)} />
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
            }
        } else {
            delete newDiary[this.state.selectedDate];
        }
        this.setState({
            diary: newDiary,
            diaryText: text,
            rating: rating,
            displayRating: rating,
        });
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
}