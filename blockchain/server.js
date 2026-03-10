/**
 * WeilChain API Server
 * Run: node server.js
 * Port: 4000
 */

require('dotenv').config()
const express = require('express')
const cors    = require('cors')
const crypto  = require('crypto')
const { WeilChain, Transaction } = require('./core')

const app   = express()
const chain = new WeilChain()

app.use(cors({ origin: '*' }))
app.use(express.json())

// ── TREASURY: mint WUSD to new wallets ──
const TREASURY = 'TREASURY'
const MINER    = 'MINER_NODE_1'

// ══════════════════════════════════════════
// WALLET
// ══════════════════════════════════════════

// GET /wallet/:address — get balance
app.get('/wallet/:address', (req, res) => {
  const balance = chain.ledger.getBalance(req.params.address)
  res.json({ success: true, address: req.params.address, balanceWUSD: balance })
})

// POST /wallet/faucet — mint test WUSD to any address (testnet only)
app.post('/wallet/faucet', (req, res) => {
  const { address, amount = 1000 } = req.body
  if (!address) return res.status(400).json({ success: false, error: 'address required' })

  const tx = new Transaction({ from: 'MINT', to: address, amount, type: 'MINT', data: { reason: 'Faucet' } })
  chain.ledger.mint(address, amount)
  chain.mempool.push(tx)

  res.json({ success: true, address, amountMinted: amount, txId: tx.id })
})

// ══════════════════════════════════════════
// TRANSACTIONS
// ══════════════════════════════════════════

// POST /transaction — submit a WUSD transfer
app.post('/transaction', (req, res) => {
  const { from, to, amount, data = {} } = req.body
  if (!from || !to || !amount) return res.status(400).json({ success: false, error: 'from, to, amount required' })

  const balance = chain.ledger.getBalance(from)
  if (balance < amount) {
    return res.status(400).json({ success: false, error: `Insufficient balance. Have ${balance} WUSD, need ${amount}` })
  }

  const tx = new Transaction({ from, to, amount: Number(amount), type: 'TRANSFER', data })
  const result = chain.submitTransaction(tx)
  if (!result.ok) return res.status(400).json({ success: false, error: result.error })

  // Auto-mine after each tx (instant confirmation for demo)
  const block = chain.minePendingTransactions(MINER)

  res.json({
    success:   true,
    txId:      tx.id,
    txHash:    tx.hash,
    blockIndex: block?.index,
    blockHash:  block?.hash,
    newBalance: chain.ledger.getBalance(from),
  })
})

// GET /transaction/:txId — find tx in chain
app.get('/transaction/:txId', (req, res) => {
  for (const block of chain.chain) {
    const tx = block.transactions.find(t => t.id === req.params.txId)
    if (tx) return res.json({ success: true, tx, blockIndex: block.index, blockHash: block.hash, confirmed: true })
  }
  // Check mempool
  const pending = chain.mempool.find(t => t.id === req.params.txId)
  if (pending) return res.json({ success: true, tx: pending, confirmed: false })
  res.status(404).json({ success: false, error: 'Transaction not found' })
})

// ══════════════════════════════════════════
// ESCROW
// ══════════════════════════════════════════

// POST /escrow/create — lock WUSD in escrow for an order
app.post('/escrow/create', (req, res) => {
  const { buyer, seller, amount, orderId } = req.body
  if (!buyer || !seller || !amount || !orderId) {
    return res.status(400).json({ success: false, error: 'buyer, seller, amount, orderId required' })
  }

  const escrowId = 'ESC-' + crypto.randomBytes(6).toString('hex').toUpperCase()
  const result   = chain.ledger.lockEscrow(escrowId, buyer, seller, Number(amount), orderId)

  if (!result.ok) return res.status(400).json({ success: false, error: result.error })

  // Record on chain
  const tx = new Transaction({
    from: buyer, to: 'ESCROW_VAULT', amount: Number(amount),
    type: 'ESCROW_LOCK', orderId,
    data: { escrowId, seller }
  })
  chain.mempool.push(tx)
  chain.minePendingTransactions(MINER)

  res.json({
    success:    true,
    escrowId,
    buyer,
    seller,
    amount:     Number(amount),
    orderId,
    status:     'LOCKED',
    txId:       tx.id,
    txHash:     tx.hash,
    buyerBalance: chain.ledger.getBalance(buyer),
  })
})

// POST /escrow/release — release WUSD to seller (order fulfilled)
app.post('/escrow/release', (req, res) => {
  const { escrowId } = req.body
  if (!escrowId) return res.status(400).json({ success: false, error: 'escrowId required' })

  const escrow = chain.ledger.getEscrow(escrowId)
  if (!escrow) return res.status(404).json({ success: false, error: 'Escrow not found' })

  const result = chain.ledger.releaseEscrow(escrowId)
  if (!result.ok) return res.status(400).json({ success: false, error: result.error })

  const tx = new Transaction({
    from: 'ESCROW_VAULT', to: escrow.seller, amount: escrow.amount,
    type: 'ESCROW_RELEASE', orderId: escrow.orderId,
    data: { escrowId }
  })
  chain.mempool.push(tx)
  chain.minePendingTransactions(MINER)

  res.json({
    success: true,
    escrowId,
    status:  'RELEASED',
    sellerBalance: chain.ledger.getBalance(escrow.seller),
    txId:    tx.id,
  })
})

// POST /escrow/refund — refund WUSD to buyer (order cancelled)
app.post('/escrow/refund', (req, res) => {
  const { escrowId } = req.body
  if (!escrowId) return res.status(400).json({ success: false, error: 'escrowId required' })

  const escrow = chain.ledger.getEscrow(escrowId)
  if (!escrow) return res.status(404).json({ success: false, error: 'Escrow not found' })

  const result = chain.ledger.refundEscrow(escrowId)
  if (!result.ok) return res.status(400).json({ success: false, error: result.error })

  const tx = new Transaction({
    from: 'ESCROW_VAULT', to: escrow.buyer, amount: escrow.amount,
    type: 'ESCROW_REFUND', orderId: escrow.orderId,
    data: { escrowId }
  })
  chain.mempool.push(tx)
  chain.minePendingTransactions(MINER)

  res.json({
    success: true,
    escrowId,
    status:  'REFUNDED',
    buyerBalance: chain.ledger.getBalance(escrow.buyer),
    txId:    tx.id,
  })
})

// GET /escrow — all escrows
app.get('/escrow', (req, res) => {
  res.json({ success: true, data: chain.ledger.getAllEscrows() })
})

// GET /escrow/:id — single escrow
app.get('/escrow/:id', (req, res) => {
  const e = chain.ledger.getEscrow(req.params.id)
  if (!e) return res.status(404).json({ success: false, error: 'Not found' })
  res.json({ success: true, data: e })
})

// ══════════════════════════════════════════
// CHAIN INFO
// ══════════════════════════════════════════

// GET / — chain status
app.get('/', (req, res) => {
  res.json({
    name:    'WeilChain',
    version: '1.0.0',
    network: 'testnet',
    status:  '✓ Running',
    ...chain.getStats()
  })
})

// GET /blocks — full chain
app.get('/blocks', (req, res) => {
  res.json({ success: true, blocks: chain.chain.length, data: chain.chain })
})

// GET /blocks/:index — single block
app.get('/blocks/:index', (req, res) => {
  const block = chain.chain[parseInt(req.params.index)]
  if (!block) return res.status(404).json({ success: false, error: 'Block not found' })
  res.json({ success: true, data: block })
})

// GET /validate — verify chain integrity
app.get('/validate', (req, res) => {
  res.json({ success: true, valid: chain.isChainValid(), blocks: chain.chain.length })
})

// GET /mempool — pending transactions
app.get('/mempool', (req, res) => {
  res.json({ success: true, count: chain.mempool.length, data: chain.mempool })
})

const PORT = process.env.BLOCKCHAIN_PORT || 4000
app.listen(PORT, () => {
  console.log(`⛓  WeilChain running on port ${PORT}`)
  console.log(`📦  Genesis block: ${chain.chain[0].hash.slice(0, 16)}...`)
  console.log(`💰  Treasury balance: ${chain.ledger.getBalance('TREASURY')} WUSD`)
})

module.exports = app