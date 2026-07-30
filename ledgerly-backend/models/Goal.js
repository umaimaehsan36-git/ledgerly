const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
  title: { type: String, required: true },
  targetAmount: { type: Number, required: true },
  currentAmount: { type: Number, default: 0 },
  deadline: Date
}, { timestamps: true });

module.exports = mongoose.model('Goal', goalSchema);