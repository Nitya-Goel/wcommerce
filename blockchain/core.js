/**
 * W-Commerce X — WeilChain (Pure JS, no Solidity)
 * Custom blockchain with WUSD stablecoin + escrow logic
 */

const crypto = require('crypto')

// ══════════════════════════════════════════
// TRANSACTION
// ══════════════════════════════════════════
class Transaction {
  constructor({ from, to, amount, type = 'TRANSFER', orderId = null, data = {} }) {
    this.id        = crypto.randomUUID()
    this.from      = from
    this.to        = to
    this.amount    = amount          // in WUSD
    this.type      = type            // TRANSFER | ESCROW_LOCK | ESCROW_RELEASE | ESCROW_REFUND | MINT
    this.orderId   = orderId
    this.data      = data
    this.timestamp = Date.now()
    this.hash      = this.computeHash()
  }

  computeHash() {
    const payload = `${this.from}${this.to}${this.amount}${this.type}${this.timestamp}${JSON.stringify(this.data)}`
    return crypto.createHash('sha256').update(payload).digest('hex')
  }

  isValid() {
    if (!this.from || !this.to) return false
    if (this.amount <= 0) return false
    if (this.hash !== this.computeHash()) return false
    return true
  }
}

// ══════════════════════════════════════════
// BLOCK
// ══════════════════════════════════════════
class Block {
  constructor({ index, transactions, previousHash = '0', difficulty = 2 }) {
    this.index        = index
    this.timestamp    = Date.now()
    this.transactions = transactions
    this.previousHash = previousHash
    this.difficulty   = difficulty
    this.nonce        = 0
    this.hash         = this.computeHash()
  }

  computeHash() {
    const payload = `${this.index}${this.timestamp}${this.previousHash}${this.nonce}${JSON.stringify(this.transactions)}`
    return crypto.createHash('sha256').update(payload).digest('hex')
  }

  // Proof of Work mining
  mine() {
    const target = '0'.repeat(this.difficulty)
    while (!this.hash.startsWith(target)) {
      this.nonce++
      this.hash = this.computeHash()
    }
    return this
  }
}

// ══════════════════════════════════════════
// WUSD LEDGER (balances + escrow)
// ══════════════════════════════════════════
class WUSDLedger {
  constructor() {
    this.balances = new Map()   // address → balance
    this.escrows  = new Map()   // escrowId → { buyer, seller, amount, status, orderId }
  }

  getBalance(address) {
    return this.balances.get(address) || 0
  }

  mint(address, amount) {
    const current = this.getBalance(address)
    this.balances.set(address, current + amount)
  }

  transfer(from, to, amount) {
    if (from === 'MINT') { this.mint(to, amount); return true }
    const fromBal = this.getBalance(from)
    if (fromBal < amount) return false
    this.balances.set(from, fromBal - amount)
    this.balances.set(to, (this.getBalance(to)) + amount)
    return true
  }

  lockEscrow(escrowId, buyer, seller, amount, orderId) {
    const buyerBal = this.getBalance(buyer)
    if (buyerBal < amount) return { ok: false, error: 'Insufficient WUSD balance' }
    this.balances.set(buyer, buyerBal - amount)
    this.escrows.set(escrowId, { buyer, seller, amount, orderId, status: 'LOCKED', lockedAt: Date.now() })
    return { ok: true, escrowId }
  }

  releaseEscrow(escrowId) {
    const e = this.escrows.get(escrowId)
    if (!e || e.status !== 'LOCKED') return { ok: false, error: 'Escrow not found or already settled' }
    this.balances.set(e.seller, (this.getBalance(e.seller)) + e.amount)
    e.status = 'RELEASED'
    e.releasedAt = Date.now()
    this.escrows.set(escrowId, e)
    return { ok: true }
  }

  refundEscrow(escrowId) {
    const e = this.escrows.get(escrowId)
    if (!e || e.status !== 'LOCKED') return { ok: false, error: 'Escrow not found or already settled' }
    this.balances.set(e.buyer, (this.getBalance(e.buyer)) + e.amount)
    e.status = 'REFUNDED'
    e.refundedAt = Date.now()
    this.escrows.set(escrowId, e)
    return { ok: true }
  }

  getEscrow(escrowId) {
    return this.escrows.get(escrowId) || null
  }

  getAllEscrows() {
    return Array.from(this.escrows.entries()).map(([id, e]) => ({ id, ...e }))
  }
}

// ══════════════════════════════════════════
// BLOCKCHAIN
// ══════════════════════════════════════════
class WeilChain {
  constructor() {
    this.chain      = []
    this.mempool    = []   // pending transactions
    this.ledger     = new WUSDLedger()
    this.difficulty = 2
    this.blockReward = 10  // WUSD reward per block mined

    // Genesis block
    this._addBlock([new Transaction({
      from: 'GENESIS', to: 'GENESIS', amount: 0, type: 'TRANSFER',
      data: { message: 'WeilChain Genesis — W-Commerce X' }
    })])

    // Mint initial supply to treasury
    this.ledger.mint('TREASURY', 1_000_000)
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1]
  }

  _addBlock(transactions) {
    const block = new Block({
      index:        this.chain.length,
      transactions,
      previousHash: this.chain.length > 0 ? this.getLatestBlock().hash : '0',
      difficulty:   this.difficulty,
    }).mine()
    this.chain.push(block)
    return block
  }

  // Add tx to mempool
  submitTransaction(tx) {
    if (!tx.isValid()) return { ok: false, error: 'Invalid transaction' }
    this.mempool.push(tx)
    return { ok: true, txId: tx.id, hash: tx.hash }
  }

  // Mine pending txs into a new block
  minePendingTransactions(minerAddress) {
    if (this.mempool.length === 0) return null

    // Apply all pending txs to ledger
    for (const tx of this.mempool) {
      if (tx.type === 'TRANSFER' || tx.type === 'MINT') {
        this.ledger.transfer(tx.from, tx.to, tx.amount)
      }
      // ESCROW types are handled separately via escrow methods
    }

    // Reward miner
    const rewardTx = new Transaction({
      from: 'MINT', to: minerAddress,
      amount: this.blockReward, type: 'MINT',
      data: { reason: 'Block mining reward' }
    })
    this.ledger.mint(minerAddress, this.blockReward)

    const block = this._addBlock([...this.mempool, rewardTx])
    this.mempool = []
    return block
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const curr = this.chain[i]
      const prev = this.chain[i - 1]
      if (curr.hash !== curr.computeHash()) return false
      if (curr.previousHash !== prev.hash) return false
    }
    return true
  }

  getStats() {
    return {
      blocks:       this.chain.length,
      transactions: this.chain.reduce((s, b) => s + b.transactions.length, 0),
      pendingTxs:   this.mempool.length,
      isValid:      this.isChainValid(),
      difficulty:   this.difficulty,
    }
  }
}

module.exports = { WeilChain, Block, Transaction, WUSDLedger }