// dependencies
const express = require('express');
const connect = require('connect-ensure-login');

const router = express.Router();

router.get('/echo', function(req, res) {
    res.send({message: req.query.message});
});

module.exports = router;