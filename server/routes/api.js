// dependencies
const express = require('express');
const connect = require('connect-ensure-login');

const User = require('../models/user');

const router = express.Router();

router.get('/whoami', function(req, res) {
    if (req.isAuthenticated()) {
        res.send({_id: req.user._id});
    } else {
        res.send({});
    }
});

router.get('/user', function(req, res) {
  User.findOne({ _id: req.query._id }, function(err, user) {
    res.send(user);
  });
});


router.get('/echo', function(req, res) {
    res.send({message: req.query.message});
});

router.post('/save_info',
    connect.ensureLoggedIn(),
    function(req, res) {
        User.updateOne({_id: req.user._id}, {diary: req.body.diary, finance: req.body.finance, tags: req.body.tags}, function(err, user) {
            if (err) console.log(error);
            res.send({});
        });
    }
);

module.exports = router;