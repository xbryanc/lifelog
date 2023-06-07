import React from "react";
import "../../css/app.css";
import "../../css/root.css";
import { User } from "../../../../defaults";

interface StartButtonProps {
  userInfo?: User;
}

const StartButton: React.FC<StartButtonProps> = ({ userInfo }) => {
  return (
    <div className="login" style={{ zIndex: 10 }}>
      <a href={!userInfo ? "/auth/google" : "/home"}>
        <div className="button">{!userInfo ? "login" : "enter"}</div>
      </a>
    </div>
  );
};

export default StartButton;
