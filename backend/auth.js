const router = require('express').Router()
const jwt    = require('jsonwebtoken')
const crypto = require('crypto')
const User   = require('../models/User')
const auth   = require('../middleware/auth')

// POST /api/auth/nonce
router.post('/nonce', async (req, res) => {
  try {
    const { walletAddress } = req.body
    if (!walletAddress) return res.status(400).json({ success: false, error: 'walletAddress required' })
    const nonce = crypto.randomBytes(16).toString('hex')
    await User.findOneAndUpdate(
      { walletAddress: walletAddress.toLowerCase() },
      { loginNonce: nonce },
      { upsert: true, new: true }
    )
    res.json({ success: true, nonce })
  } catch (e) { res.status(500).json({ success: false, error: e.message }) }
})

// POST /api/auth/login — no signature needed for hackathon, just wallet address
router.post('/login', async (req, res) => {
  try {
    const { walletAddress } = req.body
    if (!walletAddress) return res.status(400).json({ success: false, error: 'walletAddress required' })
    const user = await User.findOneAndUpdate(
      { walletAddress: walletAddress.toLowerCase() },
      { loginNonce: null },
      { upsert: true, new: true }
    )
    const token = jwt.sign(
      { userId: user._id, walletAddress: user.walletAddress },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )
    res.json({ success: true, token, user: { id: user._id, walletAddress: user.walletAddress } })
  } catch (e) { res.status(500).json({ success: false, error: e.message }) }
})

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
    res.json({ success: true, user })
  } catch (e) { res.status(500).json({ success: false, error: e.message }) }
})

module.exports = router