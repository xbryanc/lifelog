import React, { useEffect } from "react";
import "../../css/app.css";
import "../../css/root.css";

import StartButton from "../modules/StartButton";
import { User } from "../../../../defaults";

interface RootProps {
  userInfo?: User;
}

const Root: React.FC<RootProps> = ({ userInfo }) => {
  useEffect(() => {
    document.title = "Welcome!";
  }, []);

  return (
    <div className="rootContainer">
      <div className="rootTitle">LIFELOG</div>
      <div className="rootDescription">
        a tool that combines support for a daily journal with a personal finance
        tracker
      </div>
      <StartButton userInfo={userInfo} />
      <div className="disclaimer">
        DISCLAIMER: If you are not comfortable with an unknown entity keeping
        track of your VERY personal data, do not use this website.
      </div>
    </div>
  );
};

export default Root;
