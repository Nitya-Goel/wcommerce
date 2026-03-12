const express = require('express')
const router  = express.Router()
const Product = require('../models/Product')

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({})
    res.json({ success: true, data: products, pagination: { total: products.length } })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({ success: false, error: 'Not found' })
    res.json({ success: true, data: product })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

module.exports = router