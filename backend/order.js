const mongoose = require('mongoose')
const itemSchema = new mongoose.Schema({
  productId: String, name: String, emoji: String, priceWUSD: Number, qty: Number,
})
const schema = new mongoose.Schema({
  walletAddress: { type: String, required: true },
  items:         [itemSchema],
  totalWUSD:     Number,
  escrowId:      String,
  txHash:        String,
  blockIndex:    Number,
  status: { type: String, enum: ['PENDING','ESCROWED','DELIVERED','REFUNDED'], default: 'PENDING' },
}, { timestamps: true })
module.exports = mongoose.model('Order', schema)