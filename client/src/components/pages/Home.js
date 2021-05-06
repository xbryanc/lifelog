import React, { Component } from 'react';
import Calendar from 'react-calendar';
import '../../css/app.css';
import '../../css/home.css';

export default class Home extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        document.title = "Home";
    }
    
    render() {
        return (
            <div className="homeContainer">
                <Calendar onChange={this.calendarChange} />
                <div className="entryContainer">
                    <div className="diaryContainer">
                        Diary
                    </div>
                    <div className="finContainer">
                        Finance
                    </div>
                </div>
            </div>
        );
    }

    calendarChange = (e) => {
        // TODO
    }
}