const mongoose = require('mongoose')
const schema = new mongoose.Schema({
  walletAddress: { type: String, required: true, unique: true, lowercase: true },
  username:      String,
  loginNonce:    String,
  totalOrders:   { type: Number, default: 0 },
  totalSpent:    { type: Number, default: 0 },
}, { timestamps: true })
module.exports = mongoose.model('User', schema)