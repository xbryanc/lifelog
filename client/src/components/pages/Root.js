import React, { Component } from 'react';
import '../../css/app.css';
import '../../css/root.css';

export default class Root extends Component {
    constructor(props) {
        super(props);

        this.state = {
            message: ""
        };
    }

    componentDidMount() {
        document.title = "Welcome!";
    }
    
    render() {
        return (
            <div className="rootContainer">
                <input name="message" type="text" onChange={this.updateField} />
                <button onClick={this.sendHello}>Click to Send Hello</button>
            </div>
        );
    }

    updateField = (event) => {
        this.setState({
            [event.target.name]: event.target.value,
        });
    }

    sendHello = () => {
        fetch(`/api/echo?message=${this.state.message}`)
        .then(res => res.json())
        .then(res => {
            alert("Server says " + res.message);
        })
    }
}