const BLOCKCHAIN = process.env.NEXT_PUBLIC_BLOCKCHAIN_URL || 'https://just-rebirth-production.up.railway.app'
const BACKEND    = process.env.NEXT_PUBLIC_API_URL        || 'https://backend-api-production-738f.up.railway.app'

async function blockchainFetch(path, options = {}) {
  const res = await fetch(`${BLOCKCHAIN}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) throw new Error(`Blockchain API ${res.status}: ${path}`)
  return res.json()
}

async function backendFetch(path, options = {}) {
  const res = await fetch(`${BACKEND}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) throw new Error(`Backend ${res.status}: ${path}`)
  return res.json()
}

export async function fetchProducts() {
  try {
    const data = await blockchainFetch('/products')
    if (data.success && data.data) {
      return { success: true, data: data.data.map(p => ({ ...p, _id: p.id, price: p.priceWUSD, desc: p.description, reviews: p.reviewCount || 0, imgBg: 'linear-gradient(135deg,#061020,#0a1830)', imgGlow: '#00ffc8', badges: [] })) }
    }
    return data
  } catch (err) { return { success: false, data: [] } }
}

export async function fetchEscrow() {
  try { return await blockchainFetch('/escrow') }
  catch { return { success: false, data: [] } }
}

export async function createEscrow({ buyer, seller, amount, orderId }) {
  return blockchainFetch('/escrow/create', { method: 'POST', body: JSON.stringify({ buyer, seller, amount, orderId }) })
}

export async function createOrder(order, token) {
  try { return await blockchainFetch('/orders', { method: 'POST', body: JSON.stringify(order) }) }
  catch { return backendFetch('/api/orders', { method: 'POST', body: JSON.stringify(order), headers: { Authorization: `Bearer ${token}` } }) }
}

export async function getOrders(buyerAddress) {
  try { return await blockchainFetch(`/orders/${buyerAddress}`) }
  catch { return { success: false, data: [] } }
}

export async function getWalletBalance(address) {
  return blockchainFetch(`/wallet/${address}`)
}

export async function mintWUSD(address, amount = 1250) {
  return blockchainFetch('/wallet/faucet', { method: 'POST', body: JSON.stringify({ address, amount }) })
}

export async function submitTransaction({ from, to, amount, data = {} }) {
  return blockchainFetch('/transaction', { method: 'POST', body: JSON.stringify({ from, to, amount, data }) })
}

export async function getWalletNonce(walletAddress) {
  try { return await backendFetch('/api/auth/nonce', { method: 'POST', body: JSON.stringify({ walletAddress }) }) }
  catch { return { success: true, nonce: `weilchain-${Date.now()}` } }
}

export async function loginWithWallet(walletAddress, signature) {
  try { return await backendFetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ walletAddress, signature }) }) }
  catch { return { success: true, token: `mock-jwt-${walletAddress}` } }
}

export async function getChainStatus() {
  return blockchainFetch('/')
}
