require('dotenv').config()
const express  = require('express')
const cors     = require('cors')
const mongoose = require('mongoose')

const app = express()

// ── CORS — allow all origins ──
app.use(cors({ origin: '*', methods: ['GET','POST','PUT','DELETE','OPTIONS'] }))
app.use(express.json())

// ── ROUTES ──
app.use('/api/products', require('./routes/products'))
app.use('/api/auth',     require('./routes/auth'))
app.use('/api/orders',   require('./routes/orders'))
app.use('/api/cart',     require('./routes/cart'))

// ── HEALTH ──
app.get('/', (req, res) => res.json({
  name:    'W-Commerce X Backend',
  status:  '✓ Running',
  version: '1.0.0',
}))

// ── DB ──
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected')
    const PORT = process.env.PORT || 5000
    app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`))
  })
  .catch(err => {
    console.error('❌ MongoDB error:', err.message)
    process.exit(1)
  })