import React, { useEffect, useState } from "react";
import clsx from "clsx";

import { NAVBAR_HAMBURGER_WIDTH_THRESHOLD, User } from "../../../../defaults";

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
  return (
    <div onClick={updatePath}>
      {width <= NAVBAR_HAMBURGER_WIDTH_THRESHOLD ? (
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
      ) : (
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
      )}
      <style>
        {`
          .navbar {
            background-color: #383838;
            width: 100vw;
            position: fixed;
            z-index: 100;
          }

          .navbar-brand {
            font-family: "Comfortaa", cursive;
            color: whitesmoke;
          }

          .navbar-brand:hover {
            color: #e0e0e0;
          }

          .navbar-nav {
            width: 100vw;
            justify-content: flex-end;
          }

          .nav-item {
            font-family: "Muli", sans-serif;
            color: whitesmoke;
          }

          .nav-item:hover {
            color: #e0e0e0;
          }

          .profileIcon {
            height: 40px;
            float: left;
          }

          .dropdown-menu {
            background-color: #565656;
            margin-top: 0;
            padding-top: 0;
            border-radius: 0;
            border: none;
          }

          .dropdown-menu-left {
            margin-top: 40px;
            margin-left: -16px;
          }

          .dropdown-menu-right {
            margin-right: -16px;
          }

          .dropdown-item {
            color: white;
          }

          .dropdown-item:hover {
            background-color: #e0e0e0;
            border-radius: 0;
          }

          .dropdown:hover .dropdown-menu {
            display: block;
          }

          .helpDiv {
            height: 7.5px;
            margin-bottom: 4px;
            background-color: #383838;
          }

          .hamburger {
            width: 20px;
            height: 20px;
          }

          .navbar-toggler:focus {
            outline: none;
          }

          .nav-current {
            background-color: #4c4c4c;
            color: whitesmoke;
            border-radius: 3px;
            box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
            animation: fadeInBackground 1s ease;
          }
        `}
      </style>
    </div>
  );
};

export default NavBar;
