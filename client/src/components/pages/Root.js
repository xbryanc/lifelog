import React, { Component } from 'react';
import '../../css/app.css';
import '../../css/root.css';

import StartButton from '../modules/StartButton';

export default class Root extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        document.title = "Welcome!";
    }
    
    render() {
        return (
            <div className="rootContainer">
                <div className="rootTitle">
                    LIFELOG
                </div>
                <div className="rootDescription">
                    a tool that combines support for a daily journal with a personal finance tracker
                </div>
                <StartButton userInfo={this.props.userInfo} />
                <div className="disclaimer">
                    DISCLAIMER: If you are not comfortable with an unknown entity keeping track of your VERY personal data, do not use this website.
                </div>
            </div>
        );
    }

    updateField = (event) => {
        this.setState({
            [event.target.name]: event.target.value,
        });
    }
}