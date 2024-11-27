import React from "react";
import { User } from "../../../../defaults";
import { makeStyles } from "../../theme";

interface StartButtonProps {
  userInfo?: User;
}

const StartButton: React.FC<StartButtonProps> = ({ userInfo }) => {
  const classes = useStyles();
  return (
    <div className={classes.login}>
      <a href={!userInfo ? "/auth/google" : "/home"}>
        <div className={classes.button}>{!userInfo ? "LOGIN" : "ENTER"}</div>
      </a>
    </div>
  );
};

const useStyles = makeStyles((theme) => ({
  login: {
    zIndex: theme.zIndex.layout,
  },
  button: {
    cursor: "pointer",
    fontFamily: "Montserrat, sans-serif",
    letterSpacing: "0.1em",
    fontSize: "30px",
    lineHeight: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0.55em 1.5em 0.6em",
    borderRadius: "20px",
    textDecorationLine: "none",
    border: `0.08em solid ${theme.colors.black}`,
    textAlign: "center",
    wordWrap: "break-word",
    transition: "transform 1s ease, box-shadow 1s ease",
    "&:hover": {
      transform: "scale(1.05, 1.05)",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2), 0 3px 10px rgba(0, 0, 0, 0.19)",
    },
    "&.disabled:hover": {
      transform: "none",
      boxShadow: "none",
      cursor: "default",
    },
  },
}));

export default StartButton;
