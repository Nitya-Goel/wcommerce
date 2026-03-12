const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  description: { type: String },
  priceWUSD:   { type: Number, required: true },
  stock:       { type: Number, default: 0 },
  category:    { type: String },
  emoji:       { type: String },
  seller:      { type: String },
  rating:      { type: Number, default: 4.5 },
  reviewCount: { type: Number, default: 0 },
  createdAt:   { type: Date, default: Date.now },
})

module.exports = mongoose.model('Product', productSchema)