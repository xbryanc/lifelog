// import node modules
const mongoose = require('mongoose');

// define a schema
const UserModelSchema = new mongoose.Schema({
  name: String,
  googleid: String,
  diary: {
    type: Object,
    default: {}
  },
  finance: {
    type: Object,
    default: {}
  },
  subscriptions: [{
    start: String,
    frequency: String,
    cost: Number,
    description: String,
    tags: [String]
  }]
}, {minimize: false});

// compile model from schema
module.exports = mongoose.model('UserModel', UserModelSchema);
