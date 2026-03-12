const mongoose = require('mongoose')
const schema = new mongoose.Schema({
  name:        { type: String, required: true },
  description: String,
  priceWUSD:   { type: Number, required: true },
  stock:       { type: Number, default: 100 },
  category:    String,
  emoji:       String,
  seller:      { type: String, default: 'SELLER_VAULT' },
  rating:      { type: Number, default: 4.5 },
  reviewCount: { type: Number, default: 0 },
}, { timestamps: true })
module.exports = mongoose.model('Product', schema)