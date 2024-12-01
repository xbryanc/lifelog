import React, { useState, useEffect } from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import { ThemeProvider } from "@material-ui/core/styles";

import NavBar from "./modules/NavBar";

import Root from "./pages/Root";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Spending from "./pages/Spending";
import { User } from "../../../defaults";
import { theme } from "../theme";

interface AppProps {}

const App: React.FC<AppProps> = () => {
  const [userInfo, setUserInfo] = useState<User | undefined>(undefined);
  const [fetching, setFetching] = useState(true);

  const logout = () => {
    setUserInfo(undefined);
  };

  const getUserInfo = () => {
    fetch("/api/whoami")
      .then((res) => res.json())
      .then((res) => {
        if (!res._id) {
          setUserInfo(undefined);
          setFetching(false);
        } else {
          fetch("/api/user?_id=" + res._id)
            .then((res) => res.json())
            .then((userObj) => {
              setUserInfo(userObj);
              setFetching(false);
            });
        }
      });
  };

  useEffect(() => {
    getUserInfo();
  }, []);

  if (fetching) {
    return null;
  }
  if (!userInfo && window.location.pathname != "/") {
    return <Redirect to="/" />;
  }
  return (
    <ThemeProvider theme={theme}>
      <NavBar userInfo={userInfo} logout={logout} />
      <Switch>
        <Route
          exact
          path="/"
          render={(props) => <Root {...props} userInfo={userInfo} />}
        />
        <Route
          exact
          path="/home"
          render={(props) => <Home {...props} userInfo={userInfo} />}
        />
        <Route
          exact
          path="/profile"
          render={(props) => <Profile {...props} userInfo={userInfo} />}
        />
        <Route
          exact
          path="/spending"
          render={(props) => <Spending {...props} userInfo={userInfo} />}
        />
      </Switch>
    </ThemeProvider>
  );
};

export default App;
