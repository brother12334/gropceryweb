const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true, unique: true },
  contacts: [String],
  coins: { type: Number, default: 50 },
});

module.exports = mongoose.model('User', userSchema);
