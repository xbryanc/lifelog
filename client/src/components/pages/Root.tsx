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
      <img src="/media/logo.svg" className={classes.title} />
      <div className={classes.description}>
        a daily journaling and personal finance tracking tool
      </div>
      <StartButton userInfo={userInfo} />
      <div className={classes.disclaimer}>
        DISCLAIMER: If you are not comfortable with an unknown entity keeping
        track of your VERY personal data, do not use this website
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
    gap: theme.spacing(3),
  },
  title: {
    height: "100px",
    marginBottom: theme.spacing(2),
  },
  description: {
    fontSize: "30px",
    fontFamily: "'Montserrat', sans-serif",
    textAlign: "center",
  },
  disclaimer: {
    fontSize: "10px",
    fontFamily: "'Montserrat', sans-serif",
    textAlign: "center",
  },
}));

export default Root;
