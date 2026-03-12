const express = require('express')
const router = express.Router()
router.post('/initiate', (req, res) => res.json({ success: true, message: 'Payment initiated' }))
router.post('/confirm', (req, res) => res.json({ success: true, message: 'Payment confirmed' }))
module.exports = router
