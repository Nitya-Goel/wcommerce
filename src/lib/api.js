const BASE = process.env.NEXT_PUBLIC_API_URL || 'https://backend-api-production-738f.up.railway.app'

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`)
  return res.json()
}

export async function fetchProducts(params = {}) {
  const q = new URLSearchParams(params).toString()
  return apiFetch(`/api/products${q ? `?${q}` : ''}`)
}

export async function fetchEscrow() {
  return apiFetch('/api/escrow')
}

export async function createOrder(order, token) {
  return apiFetch('/api/orders', {
    method: 'POST',
    body: JSON.stringify(order),
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function getWalletNonce(walletAddress) {
  return apiFetch('/api/auth/nonce', {
    method: 'POST',
    body: JSON.stringify({ walletAddress }),
  })
}

export async function loginWithWallet(walletAddress, signature) {
  return apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ walletAddress, signature }),
  })
}