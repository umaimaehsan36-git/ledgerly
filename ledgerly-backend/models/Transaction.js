const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  category: { type: String, required: true },
  note: String,
  date: { type: Date, default: Date.now },
  riskScore: { type: Number, default: 0 },
  flagged: { type: Boolean, default: false },
  flagReasons: { type: [String], default: [] },
  reviewed: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);