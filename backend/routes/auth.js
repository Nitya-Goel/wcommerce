const express = require('express')
const router = express.Router()

router.post('/nonce', (req, res) => {
  res.json({ success: true, nonce: require('crypto').randomBytes(16).toString('hex') })
})

router.post('/login', (req, res) => {
  const token = require('crypto').randomBytes(32).toString('hex')
  res.json({ success: true, token, user: { walletAddress: req.body.walletAddress } })
})

router.get('/me', (req, res) => {
  res.json({ success: true, user: { walletAddress: 'unknown' } })
})

module.exports = router
