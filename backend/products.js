const router  = require('express').Router()
const Product = require('../models/Product')

// GET all products
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query
    let query = {}
    if (category && category !== 'all') query.category = category
    if (search) query.name = { $regex: search, $options: 'i' }
    const products = await Product.find(query).sort({ createdAt: -1 })
    res.json({ success: true, data: products, total: products.length })
  } catch (e) { res.status(500).json({ success: false, error: e.message }) }
})

// GET single product
router.get('/:id', async (req, res) => {
  try {
    const p = await Product.findById(req.params.id)
    if (!p) return res.status(404).json({ success: false, error: 'Not found' })
    res.json({ success: true, data: p })
  } catch (e) { res.status(500).json({ success: false, error: e.message }) }
})

module.exports = router