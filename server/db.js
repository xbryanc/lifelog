const mongoose = require('mongoose');

// set up mongoDB connection
const mongoURL = process.env.ATLAS_SRV;

let db = null;

if (mongoURL) {
    const options = {
        useNewUrlParser: true
    };
    mongoose.connect(mongoURL, options);
    mongoose.Promise = global.Promise;
    db = mongoose.connection;

    // db error handling
    db.on('error', console.error.bind(console, 'MongoDB connection error:'));
    db.on('connected', function() { console.log('database connected'); });
}

module.exports = db;
