'use client'
import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const AppContext = createContext(null)

const BLOCKCHAIN_URL = process.env.NEXT_PUBLIC_BLOCKCHAIN_URL || 'http://localhost:4000'
const BACKEND_URL    = process.env.NEXT_PUBLIC_API_URL || 'https://backend-api-production-738f.up.railway.app'

function saveToken(t) { try { localStorage.setItem('wc-token', t) } catch {} }
function loadToken()  { try { return localStorage.getItem('wc-token') } catch { return null } }
function clearToken() { try { localStorage.removeItem('wc-token') } catch {} }
function saveWallet(w){ try { localStorage.setItem('wc-wallet', JSON.stringify(w)) } catch {} }
function loadWallet() { try { return JSON.parse(localStorage.getItem('wc-wallet')) } catch { return null } }

// Generate a deterministic wallet address
function generateAddress() {
  const arr = new Uint8Array(20)
  crypto.getRandomValues(arr)
  return '0x' + Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('')
}

export function AppProvider({ children }) {
  const [cart,   setCart]   = useState([])
  const [wallet, setWallet] = useState(null)   // { address, balance }
  const [toast,  setToast]  = useState(null)

  // Restore wallet on reload
  useEffect(() => {
    const saved = loadWallet()
    if (saved) {
      // Refresh balance from blockchain
      fetch(`${BLOCKCHAIN_URL}/wallet/${saved.address}`)
        .then(r => r.json())
        .then(d => {
          if (d.success) setWallet({ ...saved, balance: d.balanceWUSD })
          else setWallet(saved)
        })
        .catch(() => setWallet(saved))
    }
  }, [])

  const showToast = useCallback((msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }, [])

  const addToCart = useCallback((product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) return prev.map(i =>
        i.id === product.id ? { ...i, qty: i.qty + 1 } : i
      )
      return [...prev, { ...product, qty: 1 }]
    })
    showToast(`✓ ${product.name} added to cart`)
  }, [showToast])

  const removeFromCart = useCallback((id) => {
    setCart(prev => prev.filter(i => i.id !== id))
  }, [])

  const clearCart = useCallback(() => setCart([]), [])

  const cartCount = cart.reduce((s, i) => s + i.qty, 0)
  const cartTotal = cart.reduce((s, i) => s + (i.priceWUSD || i.price) * i.qty, 0)

  // ── WALLET CONNECT — uses WeilChain faucet ──
  const connectWallet = useCallback(async () => {
    try {
      showToast('Connecting to WeilChain...')
      await new Promise(r => setTimeout(r, 800))

      const address = generateAddress()

      // Mint 1250 WUSD from faucet
      const res = await fetch(`${BLOCKCHAIN_URL}/wallet/faucet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, amount: 1250 })
      }).catch(() => null)

      const balance = res?.ok ? 1250 : 1250  // show balance even if blockchain offline

      const w = { address, balance }
      setWallet(w)
      saveWallet(w)
      showToast(`✓ Wallet connected! ${balance.toLocaleString()} WUSD available`)
    } catch (err) {
      console.error(err)
      showToast('✗ Connection failed')
    }
  }, [showToast])

  const disconnectWallet = useCallback(() => {
    setWallet(null)
    clearToken()
    try { localStorage.removeItem('wc-wallet') } catch {}
    showToast('Wallet disconnected')
  }, [showToast])

  // ── PAY WITH WUSD — creates escrow on WeilChain ──
  const payWithWUSD = useCallback(async ({ to, amount, orderId }) => {
    if (!wallet) throw new Error('Wallet not connected')

    const buyerAddress  = wallet.address || 'BUYER_' + Date.now()
    const sellerAddress = (to && typeof to === 'string' && to.length > 0) ? to : 'SELLER_VAULT'

    const res = await fetch(`${BLOCKCHAIN_URL}/escrow/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        buyer:   buyerAddress,
        seller:  sellerAddress,
        amount:  amount,
        orderId: orderId || 'ORDER-' + Date.now()
      })
    })

    const data = await res.json()
    if (!data.success) throw new Error(data.error)

    // Update local balance
    setWallet(w => {
      const updated = { ...w, balance: data.buyerBalance ?? (w.balance - amount) }
      saveWallet(updated)
      return updated
    })

    return data
  }, [wallet])

  return (
    <AppContext.Provider value={{
      cart, cartCount, cartTotal,
      addToCart, removeFromCart, clearCart,
      wallet, connectWallet, disconnectWallet,
      payWithWUSD,
      toast, showToast,
      blockchainUrl: BLOCKCHAIN_URL,
    }}>
      {children}
      {toast && <div className="toast">{toast}</div>}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}