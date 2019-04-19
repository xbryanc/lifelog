import React, { Component } from 'react';
import { Route, Switch } from "react-router-dom";

import Root from './pages/Root';
import '../css/app.css';

class App extends Component {
  render() {
    return (
      <div>
        <Switch>
          <Route exact path="/" render={(props) => <Root {...props} /> } />
        </Switch>
      </div>
    );
  }
}

export default App;
