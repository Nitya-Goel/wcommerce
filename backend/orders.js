const router = require('express').Router()
const Order  = require('../models/Order')
const User   = require('../models/User')
const auth   = require('../middleware/auth')

// POST /api/orders — create order (no auth required for hackathon)
router.post('/', async (req, res) => {
  try {
    const { walletAddress, items, totalWUSD, escrowId, txHash, blockIndex } = req.body
    if (!walletAddress || !items || !totalWUSD)
      return res.status(400).json({ success: false, error: 'walletAddress, items, totalWUSD required' })
    const order = await Order.create({
      walletAddress: walletAddress.toLowerCase(),
      items, totalWUSD, escrowId, txHash, blockIndex,
      status: escrowId ? 'ESCROWED' : 'PENDING'
    })
    // Update user stats
    await User.findOneAndUpdate(
      { walletAddress: walletAddress.toLowerCase() },
      { $inc: { totalOrders: 1, totalSpent: totalWUSD } },
      { upsert: true }
    )
    res.json({ success: true, data: order })
  } catch (e) { res.status(500).json({ success: false, error: e.message }) }
})

// GET /api/orders/:wallet — get orders by wallet
router.get('/:wallet', async (req, res) => {
  try {
    const orders = await Order.find({ walletAddress: req.params.wallet.toLowerCase() }).sort({ createdAt: -1 })
    res.json({ success: true, data: orders })
  } catch (e) { res.status(500).json({ success: false, error: e.message }) }
})

module.exports = router