const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  name: { type: String, required: true },
  members: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['owner', 'member'], default: 'member' }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Account', accountSchema);