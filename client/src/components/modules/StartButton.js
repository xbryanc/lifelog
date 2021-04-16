import React from 'react';
import '../../css/app.css';
import '../../css/root.css';

class StartButton extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        console.log(this.props.userInfo);
        return (
            <div className="login" style={{zIndex:10}}>
                <a href={this.props.userInfo === null ? "/auth/google" : "/home"}>
                    <div className="button primary">
                        {this.props.userInfo === null ? "login" : "enter"}
                    </div>
                </a>
            </div>
        )
    }
}

export default StartButton;
