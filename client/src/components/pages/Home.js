import React, { Component } from 'react';
import Calendar from 'react-calendar';
import '../../css/app.css';
import '../../css/home.css';

/*
Diary structure: object from date strings to:
{
    rating: Number
    description: String
}
*/

export default class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedDate: new Date(Date.now()).toLocaleDateString(),
            diary: this.props.userInfo.diary
        }
    }

    componentDidMount() {
        document.title = "Home";
    }
    
    render() {
        let curText = "";
        let rating = 0;
        if (this.state.diary.hasOwnProperty(this.state.selectedDate)) {
            let entry = this.state.diary[this.state.selectedDate];
            curText = entry.description;
            rating = entry.rating | 0;
        }
        return (
            <div className="homeContainer">
                <Calendar onClickDay={this.calendarChange} />
                <div className="entryContainer">
                    <div className="diaryContainer">
                        <div className="starsContainer">
                            {this.state.selectedDate}: {rating}
                        </div>
                        <textarea className="diaryEntry"  name="diaryEntry" id="diaryEntry" value={curText} onChange={e => this.updateDiary(e.target.value, rating)} />
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

    calendarChange = (e) => {
        this.setState({
            selectedDate: e.toLocaleDateString()
        });
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