import React, { useEffect, useState } from "react";
import clsx from "clsx";

import { User } from "../../../../defaults";

import { Link } from "react-router-dom";
import { makeStyles } from "../../theme";

interface NavBarProps {
  userInfo?: User;
  logout: () => void;
}

const NavBar: React.FC<NavBarProps> = ({ userInfo, logout }) => {
  const classes = useStyles();
  const [path, setPath] = useState(window.location.pathname);

  const updatePath = () => {
    setPath(window.location.pathname);
  };

  if (!userInfo) return null;
  return (
    <div onClick={updatePath}>
      <nav className={classes.navbar}>
        <Link to="/">
          <img src="/media/logo.svg" className={classes.logo} />
        </Link>
        <div className={classes.linksContainer}>
          <React.Fragment>
            <Link
              to="/home"
              className={clsx(classes.link, {
                [classes.navCurrent]: path.startsWith("/home"),
              })}
            >
              My Journal and Transactions
            </Link>
            <Link
              to="/profile"
              className={clsx(classes.link, {
                [classes.navCurrent]: path.startsWith("/profile"),
              })}
            >
              Profile
            </Link>
            <Link
              to="/spending"
              className={clsx(classes.link, {
                [classes.navCurrent]: path.startsWith("/spending"),
              })}
            >
              My Spending
            </Link>
            <a className={classes.link} href="/logout" onClick={logout}>
              Logout
            </a>
          </React.Fragment>
        </div>
      </nav>
    </div>
  );
};

const useStyles = makeStyles((theme) => ({
  logo: {
    height: "35px",
    paddingLeft: theme.spacing(2),
    marginRight: "20vw",
  },
  navbar: {
    display: "flex",
    backgroundColor: theme.colors.coolGray20,
    alignItems: "center",
    width: "100vw",
    height: "8vh",
    position: "fixed",
    zIndex: 100,
  },
  linksContainer: {
    display: "flex",
    justifyContent: "space-evenly",
    flexGrow: 1,
  },
  link: {
    fontWeight: 500,
    color: theme.colors.black,
    "&:hover": {
      cursor: "pointer",
      color: theme.colors.periwinkle100,
      textDecoration: "none",
    },
  },
  navCurrent: {
    color: theme.colors.periwinkle100,
    position: "relative",
    display: "inline-block",
    "&::after": {
      content: '""',
      position: "absolute",
      bottom: -5,
      left: "50%",
      transform: "translateX(-50%)",
      width: "25%",
      height: "2px",
      backgroundColor: theme.colors.black,
    },
  },
}));

export default NavBar;
