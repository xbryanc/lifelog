import React, { Component } from 'react';
import { Route, Switch, Redirect } from "react-router-dom";

import NavBar from "./modules/NavBar";

import Root from './pages/Root';
import Home from './pages/Home';
import '../css/app.css';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      userInfo: null,
      fetching: true,
    }
  }

  componentDidMount() {
    this.getUserInfo();
  }

  render() {
    if (this.state.fetching) {
      return (null);
    }
    if (!this.state.userInfo && window.location.pathname != "/") {
      return <Redirect to="/" />;
    }
    return (
      <div>
        <NavBar userInfo={this.state.userInfo} logout={this.logout} />
        <Switch>
          <Route exact path="/" render={(props) => <Root {...props} userInfo={this.state.userInfo} /> } />
          <Route exact path="/home" render={(props) => <Home {...props} userInfo={this.state.userInfo} /> } />
        </Switch>
      </div>
    );
  }

  logout = () => {
    this.setState({
      userInfo: null,
    });
  }

  getUserInfo = () => {
    fetch('/api/whoami')
    .then(res => res.json())
    .then(res => {
      if (!res._id) {
        this.setState({
          userInfo: null,
          fetching: false,
        });
      } else {
        fetch('/api/user?_id=' + res._id)
        .then(res => res.json())
        .then(userObj => {
          this.setState({
            userInfo: userObj,
            fetching: false,
          });
        });
      }
    });
  }
}

export default App;
