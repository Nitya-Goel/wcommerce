require('dotenv').config()
const mongoose = require('mongoose')
const Product  = require('./models/Product')

const PRODUCTS = [
  { name: 'iPhone 15 Pro', description: 'Latest Apple flagship with A17 Pro chip', priceWUSD: 999, stock: 50, category: 'phones', emoji: '📱', seller: 'APPLE_VAULT', rating: 4.8, reviewCount: 2341 },
  { name: 'Samsung Galaxy S24', description: 'Android flagship with AI features', priceWUSD: 849, stock: 40, category: 'phones', emoji: '📲', seller: 'SAMSUNG_VAULT', rating: 4.7, reviewCount: 1823 },
  { name: 'MacBook Pro M3', description: 'Professional laptop with M3 chip', priceWUSD: 1999, stock: 25, category: 'laptops', emoji: '💻', seller: 'APPLE_VAULT', rating: 4.9, reviewCount: 987 },
  { name: 'Sony WH-1000XM5', description: 'Industry-leading noise cancelling headphones', priceWUSD: 349, stock: 80, category: 'audio', emoji: '🎧', seller: 'SONY_VAULT', rating: 4.8, reviewCount: 5621 },
  { name: 'iPad Pro 12.9"', description: 'Most powerful iPad ever with M2 chip', priceWUSD: 1099, stock: 35, category: 'tablets', emoji: '📋', seller: 'APPLE_VAULT', rating: 4.7, reviewCount: 743 },
  { name: 'PlayStation 5', description: 'Next-gen gaming console', priceWUSD: 499, stock: 15, category: 'gaming', emoji: '🎮', seller: 'SONY_VAULT', rating: 4.9, reviewCount: 8932 },
  { name: 'Apple Watch Series 9', description: 'Advanced health monitoring smartwatch', priceWUSD: 399, stock: 60, category: 'wearables', emoji: '⌚', seller: 'APPLE_VAULT', rating: 4.6, reviewCount: 3241 },
  { name: 'DJI Mini 4 Pro', description: '4K drone with obstacle avoidance', priceWUSD: 759, stock: 20, category: 'drones', emoji: '🚁', seller: 'DJI_VAULT', rating: 4.8, reviewCount: 1204 },
  { name: 'Samsung 65" QLED TV', description: '4K QLED smart TV with quantum dots', priceWUSD: 1299, stock: 10, category: 'tv', emoji: '📺', seller: 'SAMSUNG_VAULT', rating: 4.7, reviewCount: 2109 },
]

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('Connected to MongoDB')
  await Product.deleteMany({})
  await Product.insertMany(PRODUCTS)
  console.log(`✅ Seeded ${PRODUCTS.length} products`)
  process.exit(0)
}

seed().catch(e => { console.error(e); process.exit(1) })