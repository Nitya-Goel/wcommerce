const router = require('express').Router()
// In-memory cart for hackathon (no DB needed)
const carts = {}

router.get('/:wallet', (req, res) => {
  res.json({ success: true, data: carts[req.params.wallet] || [] })
})
router.post('/:wallet', (req, res) => {
  const { item } = req.body
  if (!carts[req.params.wallet]) carts[req.params.wallet] = []
  carts[req.params.wallet].push(item)
  res.json({ success: true, data: carts[req.params.wallet] })
})
router.delete('/:wallet', (req, res) => {
  carts[req.params.wallet] = []
  res.json({ success: true })
})
module.exports = router