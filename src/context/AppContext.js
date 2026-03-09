'use client'
import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [cart,   setCart]   = useState([])
  const [wallet, setWallet] = useState(null)
  const [toast,  setToast]  = useState(null)

  const showToast = useCallback((msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }, [])

  const addToCart = useCallback((product) => {
    const price = product.priceWUSD || product.price
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) return prev.map(i =>
        i.id === product.id ? { ...i, qty: i.qty + 1 } : i
      )
      return [...prev, { ...product, qty: 1 }]
    })
    // Deduct from wallet balance
    setWallet(w => w ? { ...w, balance: Math.max(0, (w.balance || 0) - price) } : w)
    showToast(`✓ ${product.name} added — ${price} WUSD deducted`)
  }, [showToast])

  const removeFromCart = useCallback((id) => {
    setCart(prev => {
      const item = prev.find(i => i.id === id)
      if (item) {
        const refund = (item.priceWUSD || item.price) * item.qty
        setWallet(w => w ? { ...w, balance: (w.balance || 0) + refund } : w)
      }
      return prev.filter(i => i.id !== id)
    })
  }, [])

  const clearCart = useCallback(() => setCart([]), [])

  const cartCount = cart.reduce((s, i) => s + i.qty, 0)
  const cartTotal = cart.reduce((s, i) => s + (i.priceWUSD || i.price) * i.qty, 0)

  // ── WALLET CONNECT ──
  // WeilWallet SDK only has: getAxiosInstance, getTransactionId, submitTransaction
  // No connect() or signMessage() — using simulated wallet for demo
  const connectWallet = useCallback(async () => {
    try {
      showToast('Connecting to Weil Wallet...')
      await new Promise(r => setTimeout(r, 1500))

      // Simulate a realistic testnet wallet address
      const mockAddr = '0x' + Array.from({length: 40}, () =>
        '0123456789abcdef'[Math.floor(Math.random() * 16)]
      ).join('')

      setWallet({ address: mockAddr, balance: 1250 })
      showToast('✓ Weil Wallet connected! 1,250 WUSD available')
    } catch (err) {
      showToast('✗ Connection failed')
    }
  }, [showToast])

  const disconnectWallet = useCallback(() => {
    setWallet(null)
    showToast('Wallet disconnected')
  }, [showToast])

  // ── PAYMENT via WeilWallet.submitTransaction ──
  const payWithWUSD = useCallback(async ({ to, amount }) => {
    if (!wallet) throw new Error('Wallet not connected')
    const { WeilWallet } = await import('@weilliptic/weil-sdk')
    const sdk = new WeilWallet({ network: 'testnet' })
    return sdk.submitTransaction({
      from: wallet.address,
      to,
      amount,
      token: 'WUSD'
    })
  }, [wallet])

  return (
    <AppContext.Provider value={{
      cart, cartCount, cartTotal,
      addToCart, removeFromCart, clearCart,
      wallet, connectWallet, disconnectWallet,
      payWithWUSD,
      toast, showToast,
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