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
                <StartButton userInfo={this.props.userInfo} />
            </div>
        );
    }

    updateField = (event) => {
        this.setState({
            [event.target.name]: event.target.value,
        });
    }
}