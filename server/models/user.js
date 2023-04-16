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
  tags: [String],
  subscriptions: [{
    start: String,
    end: String,
    frequency: String,
    cost: Number,
    description: String,
    location: String,
    tags: [String]
  }],
  goals: {
    type: Object,
    default: {},
  }
}, {minimize: false});

// compile model from schema
module.exports = mongoose.model('UserModel', UserModelSchema);
