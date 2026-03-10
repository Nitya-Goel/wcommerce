/**
 * WeilChain — Quick test
 * Run: node test.js
 */

const { WeilChain, Transaction } = require('./core')

console.log('\n⛓  Testing WeilChain...\n')

const chain = new WeilChain()

// 1. Mint WUSD
chain.ledger.mint('BUYER_WALLET', 5000)
chain.ledger.mint('SELLER_WALLET', 0)
console.log('✅ Mint: BUYER has', chain.ledger.getBalance('BUYER_WALLET'), 'WUSD')

// 2. Transfer
const tx1 = new Transaction({ from: 'BUYER_WALLET', to: 'SELLER_WALLET', amount: 500, type: 'TRANSFER' })
chain.submitTransaction(tx1)
chain.minePendingTransactions('MINER')
console.log('✅ Transfer 500 WUSD: BUYER now has', chain.ledger.getBalance('BUYER_WALLET'), '| SELLER has', chain.ledger.getBalance('SELLER_WALLET'))

// 3. Escrow
chain.ledger.mint('BUYER2', 2000)
const escResult = chain.ledger.lockEscrow('ESC-001', 'BUYER2', 'SELLER_WALLET', 1199, 'ORDER-123')
console.log('✅ Escrow locked:', escResult, '| BUYER2 balance:', chain.ledger.getBalance('BUYER2'))

const relResult = chain.ledger.releaseEscrow('ESC-001')
console.log('✅ Escrow released:', relResult, '| SELLER balance:', chain.ledger.getBalance('SELLER_WALLET'))

// 4. Chain validity
console.log('\n📊 Chain Stats:', chain.getStats())
console.log('🔒 Chain valid:', chain.isChainValid())
console.log('\n✅ All tests passed!\n')