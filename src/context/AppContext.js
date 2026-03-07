'use client'
import { createContext, useContext, useState, useCallback } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [cart, setCart] = useState([])
  const [wallet, setWallet] = useState(null)   // { address, balance }
  const [toast, setToast] = useState(null)

  const showToast = useCallback((msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }, [])

  const addToCart = useCallback((product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { ...product, qty: 1 }]
    })
    showToast(`✓ ${product.name} added to cart`)
  }, [showToast])

  const removeFromCart = useCallback((id) => {
    setCart(prev => prev.filter(i => i.id !== id))
  }, [])

  const clearCart = useCallback(() => setCart([]), [])

  const cartCount = cart.reduce((s, i) => s + i.qty, 0)
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0)

  // ── WALLET CONNECT ──
  // When Vishandeep integrates Weil SDK, replace this mock:
  const connectWallet = useCallback(async () => {
    // TODO: replace with real SDK call:
    // import { WeilSDK } from '@weilliptic/weil-sdk'
    // const sdk = new WeilSDK({ network: 'testnet' })
    // const result = await sdk.connect()
    // setWallet({ address: result.address, balance: result.wusdBalance })

    // MOCK (remove when SDK is ready):
    await new Promise(r => setTimeout(r, 1500))
    setWallet({ address: '0x4f2a...8c1d', balance: 1250 })
    showToast('✓ Wallet connected! 1,250 WUSD available')
  }, [showToast])

  const disconnectWallet = useCallback(() => {
    setWallet(null)
    showToast('Wallet disconnected')
  }, [showToast])

  return (
    <AppContext.Provider value={{
      cart, cartCount, cartTotal,
      addToCart, removeFromCart, clearCart,
      wallet, connectWallet, disconnectWallet,
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