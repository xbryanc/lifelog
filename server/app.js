// libraries
const https = require('https');
const http = require('http');
const fs = require('fs');
const bodyParser = require('body-parser');
const session = require('express-session');
const express = require('express');
const path = require('path');

// env setup
require('dotenv').config();

// local dependencies
const db = require('./db');
const passport = require('./passport');
const api = require('./routes/api');

// initialize express app
const app = express();
const publicPath = path.join(__dirname, '../client/public');

// set POST request body parser
app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));

// set up sessions
app.use(session({
  secret: 'session-secret',
  resave: 'false',
  saveUninitialized: 'true'
}));

app.use(express.static(publicPath));

app.use('/api', api);

app.get('/', function (req, res) {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// 404 route
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// route error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.send({
    status: err.status,
    message: err.message,
  });
});

// port config
const port = (process.env.PORT || 3000); // config variable

let server = http.Server(app);

server.listen(port, function() {
  console.log('Server running on port: ' + port);
});
