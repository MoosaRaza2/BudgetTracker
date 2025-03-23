const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  targetAmount: {
    type: Number,
    required: true,
    min: 0
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  category: {
    type: String,
    default: 'General Savings'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  targetDate: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  icon: {
    type: String,
    default: 'piggy-bank'
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contributionHistory: [{
    amount: Number,
    date: {
      type: Date,
      default: Date.now
    },
    note: String
  }]
}, { timestamps: true });

const Goal = mongoose.model('Goal', goalSchema);

module.exports = Goal; 