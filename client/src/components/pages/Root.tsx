import React, { useEffect } from "react";

import StartButton from "../modules/StartButton";
import { User } from "../../../../defaults";
import { makeStyles } from "../../theme";

interface RootProps {
  userInfo?: User;
}

const Root: React.FC<RootProps> = ({ userInfo }) => {
  const classes = useStyles();
  useEffect(() => {
    document.title = "Welcome!";
  }, []);

  return (
    <div className={classes.container}>
      <div className={classes.title}>LIFELOG</div>
      <div className={classes.description}>
        a tool that combines support for a daily journal with a personal finance
        tracker
      </div>
      <StartButton userInfo={userInfo} />
      <div className={classes.disclaimer}>
        DISCLAIMER: If you are not comfortable with an unknown entity keeping
        track of your VERY personal data, do not use this website.
      </div>
    </div>
  );
};

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
  },
  title: {
    fontSize: "45px",
    fontFamily: "'Comfortaa', cursive",
  },
  description: {
    fontSize: "30px",
    fontFamily: "'Montserrat', sans-serif",
  },
  disclaimer: {
    fontSize: "10px",
    fontFamily: "'Montserrat', sans-serif",
  },
}));

export default Root;
