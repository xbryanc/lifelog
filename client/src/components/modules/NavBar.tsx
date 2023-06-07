import React, { useEffect, useState } from "react";
import clsx from "clsx";

import { NAVBAR_HAMBURGER_WIDTH_THRESHOLD, User } from "../../../../defaults";

import "../../css/navbar.css";
import { Link } from "react-router-dom";
const icon = require("../../../public/media/navbar_icon_transparent.svg");

interface NavBarProps {
  userInfo?: User;
  logout: () => void;
}

const NavBar: React.FC<NavBarProps> = ({ userInfo, logout }) => {
  const [width, setWidth] = useState(0);
  const [path, setPath] = useState(window.location.pathname);

  const updateWidth = () => {
    setWidth(window.innerWidth);
  };

  const updatePath = () => {
    setPath(window.location.pathname);
  };

  useEffect(() => {
    window.addEventListener("resize", updateWidth);
    return () => {
      window.removeEventListener("resize", updateWidth);
    };
  }, []);

  if (!userInfo) return null;
  if (width <= NAVBAR_HAMBURGER_WIDTH_THRESHOLD) {
    return (
      <div onClick={updatePath}>
        <nav className="navbar">
          <Link to="/" className="navbar-brand nav-link">
            lifelog
          </Link>

          <button
            className="navbar-toggler first-button"
            type="button"
            data-toggle="collapse"
            data-target="#navbarExpandedContent"
            aria-controls="navbarExpandedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <img className="hamburger" src="/media/menuicon.svg" />
          </button>

          <div className="collapse navbar-collapse" id="navbarExpandedContent">
            <Link
              to="/home"
              className={clsx("nav-item", "nav-link", {
                "nav-current": path.startsWith("/home"),
              })}
            >
              Home
            </Link>
            <div className="nav-item dropdown">
              <img
                className={clsx("nav-link dropdown-toggle profileIcon", {
                  "nav-current": path.startsWith("/profile"),
                })}
                id="navbarDropdown"
                role="button"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
                src={icon}
              />
              <div
                className="dropdown-menu dropdown-menu-left"
                aria-labelledby="navbarDropdown"
              >
                <div className="helpDiv"></div>
                <Link to="/profile" className="dropdown-item">
                  Profile
                </Link>
                <a className="dropdown-item" href="/logout" onClick={logout}>
                  Logout
                </a>
              </div>
            </div>
          </div>
        </nav>
      </div>
    );
  }
  return (
    <div onClick={updatePath}>
      <nav className="navbar navbar-expand-lg">
        <Link to="/" className="navbar-brand nav-link">
          lifelog
        </Link>
        <div className="navbar-nav">
          <React.Fragment>
            <Link
              to="/home"
              className={clsx("nav-item", "nav-link", {
                "nav-current": path.startsWith("/home"),
              })}
            >
              Home
            </Link>
            <div className="nav-item dropdown">
              <img
                className={clsx("nav-link dropdown-toggle profileIcon", {
                  "nav-current": path.startsWith("/profile"),
                })}
                id="navbarDropdown"
                role="button"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
                src={icon}
              />
              <div
                className="dropdown-menu dropdown-menu-right"
                aria-labelledby="navbarDropdown"
              >
                <div className="helpDiv"></div>
                <Link to="/profile" className="dropdown-item">
                  Profile
                </Link>
                <a className="dropdown-item" href="/logout" onClick={logout}>
                  Logout
                </a>
              </div>
            </div>
          </React.Fragment>
        </div>
      </nav>
    </div>
  );
};

export default NavBar;
