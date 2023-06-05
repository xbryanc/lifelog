import React from "react";
import "../../css/app.css";
import "../../css/root.css";

class StartButton extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div className="login" style={{ zIndex: 10 }}>
        <a href={this.props.userInfo === null ? "/auth/google" : "/home"}>
          <div className="button">
            {this.props.userInfo === null ? "login" : "enter"}
          </div>
        </a>
      </div>
    );
  }
}

export default StartButton;
