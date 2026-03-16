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

const TREASURY = 'TREASURY'
const MINER    = 'MINER_NODE_1'

// ══════════════════════════════════════════
// WALLET
// ══════════════════════════════════════════

app.get('/wallet/:address', (req, res) => {
  const balance = chain.ledger.getBalance(req.params.address)
  res.json({ success: true, address: req.params.address, balanceWUSD: balance })
})

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
  const block = chain.minePendingTransactions(MINER)
  res.json({
    success:    true,
    txId:       tx.id,
    txHash:     tx.hash,
    blockIndex: block?.index,
    blockHash:  block?.hash,
    newBalance: chain.ledger.getBalance(from),
  })
})

app.get('/transaction/:txId', (req, res) => {
  for (const block of chain.chain) {
    const tx = block.transactions.find(t => t.id === req.params.txId)
    if (tx) return res.json({ success: true, tx, blockIndex: block.index, blockHash: block.hash, confirmed: true })
  }
  const pending = chain.mempool.find(t => t.id === req.params.txId)
  if (pending) return res.json({ success: true, tx: pending, confirmed: false })
  res.status(404).json({ success: false, error: 'Transaction not found' })
})

// ══════════════════════════════════════════
// ESCROW
// ══════════════════════════════════════════

app.post('/escrow/create', (req, res) => {
  const { buyer, seller, amount, orderId } = req.body
  if (!buyer || !seller || !amount || !orderId) {
    return res.status(400).json({ success: false, error: 'buyer, seller, amount, orderId required' })
  }
  const escrowId = 'ESC-' + crypto.randomBytes(6).toString('hex').toUpperCase()
  const result   = chain.ledger.lockEscrow(escrowId, buyer, seller, Number(amount), orderId)
  if (!result.ok) return res.status(400).json({ success: false, error: result.error })
  const tx = new Transaction({
    from: buyer, to: 'ESCROW_VAULT', amount: Number(amount),
    type: 'ESCROW_LOCK', orderId,
    data: { escrowId, seller }
  })
  chain.mempool.push(tx)
  chain.minePendingTransactions(MINER)
  res.json({
    success:      true,
    escrowId,
    buyer,
    seller,
    amount:       Number(amount),
    orderId,
    status:       'LOCKED',
    txId:         tx.id,
    txHash:       tx.hash,
    buyerBalance: chain.ledger.getBalance(buyer),
  })
})

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
    success:       true,
    escrowId,
    status:        'RELEASED',
    sellerBalance: chain.ledger.getBalance(escrow.seller),
    txId:          tx.id,
  })
})

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
    success:      true,
    escrowId,
    status:       'REFUNDED',
    buyerBalance: chain.ledger.getBalance(escrow.buyer),
    txId:         tx.id,
  })
})

app.get('/escrow', (req, res) => {
  res.json({ success: true, data: chain.ledger.getAllEscrows() })
})

app.get('/escrow/:id', (req, res) => {
  const e = chain.ledger.getEscrow(req.params.id)
  if (!e) return res.status(404).json({ success: false, error: 'Not found' })
  res.json({ success: true, data: e })
})

// ══════════════════════════════════════════
// PRODUCTS (Applet Storage — replaces MongoDB)
// ══════════════════════════════════════════

const productStore = {}

const DEFAULT_PRODUCTS = [
  { id: 'PRD-001', name: 'iPhone 15 Pro Max',       category: 'phones',    priceWUSD: 1099, rating: 4.8, reviewCount: 2341, description: 'Latest iPhone with A17 Pro chip',       seller: 'APPLE_VAULT',   stock: 50,  emoji: '📱' },
  { id: 'PRD-002', name: 'Samsung Galaxy S25 Ultra', category: 'phones',    priceWUSD: 1199, rating: 4.7, reviewCount: 1890, description: 'Samsung flagship with S Pen',           seller: 'SAMSUNG_VAULT', stock: 40,  emoji: '📱' },
  { id: 'PRD-003', name: 'MacBook Pro M4',           category: 'laptops',   priceWUSD: 1999, rating: 4.9, reviewCount: 987,  description: 'Apple M4 chip powerhouse laptop',      seller: 'APPLE_VAULT',   stock: 25,  emoji: '💻' },
  { id: 'PRD-004', name: 'Sony WH-1000XM6',          category: 'audio',     priceWUSD: 349,  rating: 4.8, reviewCount: 3421, description: 'Best noise cancelling headphones',     seller: 'SONY_VAULT',    stock: 100, emoji: '🎧' },
  { id: 'PRD-005', name: 'iPad Pro M4',              category: 'tablets',   priceWUSD: 1099, rating: 4.7, reviewCount: 765,  description: 'Most powerful iPad ever made',         seller: 'APPLE_VAULT',   stock: 35,  emoji: '📱' },
  { id: 'PRD-006', name: 'PS5 Pro',                  category: 'gaming',    priceWUSD: 699,  rating: 4.9, reviewCount: 4521, description: 'Next gen PlayStation console',         seller: 'SONY_VAULT',    stock: 20,  emoji: '🎮' },
  { id: 'PRD-007', name: 'Apple Watch Series 10',    category: 'wearables', priceWUSD: 499,  rating: 4.6, reviewCount: 2109, description: 'Advanced health tracking smartwatch',  seller: 'APPLE_VAULT',   stock: 60,  emoji: '⌚' },
  { id: 'PRD-008', name: 'DJI Mini 4 Pro',           category: 'drones',    priceWUSD: 759,  rating: 4.8, reviewCount: 543,  description: 'Professional compact drone',           seller: 'DJI_VAULT',     stock: 15,  emoji: '🚁' },
  { id: 'PRD-009', name: 'Samsung 4K OLED TV',       category: 'tv',        priceWUSD: 1499, rating: 4.7, reviewCount: 876,  description: '65 inch 4K OLED smart display',        seller: 'SAMSUNG_VAULT', stock: 10,  emoji: '📺' },
]

DEFAULT_PRODUCTS.forEach(p => {
  productStore[p.id] = { ...p, createdAt: Date.now(), onChain: true }
})

app.get('/products', (req, res) => {
  const products = Object.values(productStore)
  res.json({ success: true, data: products, count: products.length, source: 'weilchain' })
})

app.get('/products/:id', (req, res) => {
  const product = productStore[req.params.id]
  if (!product) return res.status(404).json({ success: false, error: 'Product not found' })
  res.json({ success: true, data: product })
})

app.post('/products', (req, res) => {
  const { name, category, priceWUSD, description, seller, stock, emoji } = req.body
  if (!name || !priceWUSD) return res.status(400).json({ success: false, error: 'name and priceWUSD required' })
  const id = 'PRD-' + crypto.randomBytes(4).toString('hex').toUpperCase()
  const product = {
    id, name,
    category:    category    || 'general',
    priceWUSD:   Number(priceWUSD),
    description: description || '',
    seller:      seller      || 'MARKETPLACE',
    stock:       stock       || 100,
    emoji:       emoji       || '📦',
    rating:      4.5,
    reviewCount: 0,
    createdAt:   Date.now(),
    onChain:     true,
  }
  productStore[id] = product
  const tx = new Transaction({
    from: 'MARKETPLACE', to: 'PRODUCT_REGISTRY', amount: 0,
    type: 'PRODUCT_LISTED',
    data: { productId: id, name, priceWUSD }
  })
  chain.mempool.push(tx)
  res.json({ success: true, data: product, txId: tx.id })
})

// ══════════════════════════════════════════
// ORDERS (replaces MongoDB orders)
// ══════════════════════════════════════════

const orderStore = {}

app.post('/orders', (req, res) => {
  const { buyer, productId, productName, amount, agentSavings } = req.body
  if (!buyer || !productId || !amount) {
    return res.status(400).json({ success: false, error: 'buyer, productId, amount required' })
  }
  const orderId = 'ORDER-' + Date.now()
  const order = {
    id:           orderId,
    buyer,
    productId,
    productName:  productName || productId,
    amount:       Number(amount),
    agentSavings: agentSavings || 0,
    status:       'PENDING',
    createdAt:    Date.now(),
    onChain:      true,
  }
  orderStore[orderId] = order
  const tx = new Transaction({
    from: buyer, to: 'ORDER_REGISTRY', amount: 0,
    type: 'ORDER_CREATED',
    data: { orderId, productId, amount }
  })
  chain.mempool.push(tx)
  res.json({ success: true, data: order, txId: tx.id })
})

app.get('/orders/:buyer', (req, res) => {
  const orders = Object.values(orderStore).filter(o => o.buyer === req.params.buyer)
  res.json({ success: true, data: orders, count: orders.length })
})

app.get('/orders', (req, res) => {
  res.json({ success: true, data: Object.values(orderStore) })
})

// ══════════════════════════════════════════
// CHAIN INFO
// ══════════════════════════════════════════

app.get('/', (req, res) => {
  res.json({
    name:    'WeilChain',
    version: '1.0.0',
    network: 'testnet',
    status:  '✓ Running',
    ...chain.getStats()
  })
})

app.get('/blocks', (req, res) => {
  res.json({ success: true, blocks: chain.chain.length, data: chain.chain })
})

app.get('/blocks/:index', (req, res) => {
  const block = chain.chain[parseInt(req.params.index)]
  if (!block) return res.status(404).json({ success: false, error: 'Block not found' })
  res.json({ success: true, data: block })
})

app.get('/validate', (req, res) => {
  res.json({ success: true, valid: chain.isChainValid(), blocks: chain.chain.length })
})

app.get('/mempool', (req, res) => {
  res.json({ success: true, count: chain.mempool.length, data: chain.mempool })
})

// ══════════════════════════════════════════
// START
// ══════════════════════════════════════════

const PORT = process.env.BLOCKCHAIN_PORT || 4000
app.listen(PORT, () => {
  console.log(`⛓  WeilChain running on port ${PORT}`)
  console.log(`📦  Genesis block: ${chain.chain[0].hash.slice(0, 16)}...`)
  console.log(`💰  Treasury balance: ${chain.ledger.getBalance('TREASURY')} WUSD`)
  console.log(`🛒  Products seeded: ${Object.keys(productStore).length}`)
})

module.exports = app