import React, { Component } from 'react';
import '../../css/App.css';
import '../../css/root.css';

export default class Root extends Component {
    componentDidMount() {
        document.title = "Welcome!";
    }
    
    render() {
        return (
            <div className="rootContainer">
                Hello!
            </div>
        );
    }
}