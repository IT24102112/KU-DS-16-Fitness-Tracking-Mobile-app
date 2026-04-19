const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  weight: {
    type: Number,
    required: true
  },
  calories: {
    type: Number,
    required: true
  },
  chest: {
    type: Number
  },
  waist: {
    type: Number
  },
  hips: {
    type: Number
  },
  notes: {
    type: String
  },
  image: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Progress', progressSchema);