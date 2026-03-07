'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { useTheme } from '@/context/ThemeContext'
import CartDrawer from './CartDrawer'
import styles from './Navbar.module.css'

export default function Navbar() {
  const pathname = usePathname()
  const { wallet, connectWallet, cartCount } = useApp()
  const { theme, toggleTheme } = useTheme()
  const [connecting, setConnecting] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [ripples, setRipples] = useState([])

  async function handleConnect(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    const id = Date.now()
    setRipples(p => [...p, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }])
    setTimeout(() => setRipples(p => p.filter(r => r.id !== id)), 700)
    setConnecting(true)
    await connectWallet()
    setConnecting(false)
  }

  return (
    <>
      <nav className={styles.nav}>
        <Link href="/marketplace" className={styles.logo}>
          <div className={styles.logoIcon}>⬡</div>
          W-Commerce<span>X</span>
        </Link>

        <div className={styles.links}>
          {[
            { href: '/marketplace', label: 'Marketplace' },
            { href: '/dashboard',   label: 'Dashboard' },
            { href: '/checkout',    label: 'Checkout' },
          ].map(l => (
            <Link key={l.href} href={l.href}
              className={pathname === l.href ? styles.active : ''}>
              {l.label}
            </Link>
          ))}
        </div>

        <div className={styles.right}>

          {/* ── THEME TOGGLE: Morphing sun/moon orb ── */}
          <button
            className={styles.themeToggle}
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle theme"
          >
            <div className={`${styles.orb} ${theme === 'light' ? styles.orbLight : ''}`}>
              {theme === 'dark' ? (
                /* Moon */
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              ) : (
                /* Sun */
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              )}
            </div>
            <span className={styles.themeLabel}>
              {theme === 'dark' ? 'LIGHT' : 'DARK'}
            </span>
          </button>

          {wallet && (
            <div className={styles.wusdBadge}>◈ {wallet.balance.toLocaleString()} WUSD</div>
          )}

          <button
            className={wallet ? styles.walletConnected : styles.walletBtn}
            onClick={wallet ? undefined : handleConnect}
            disabled={connecting || !!wallet}
            style={{ position:'relative', overflow:'hidden' }}
          >
            {ripples.map(r => (
              <span key={r.id} className={styles.ripple}
                style={{ left: r.x, top: r.y }} />
            ))}
            {connecting ? '⬡ Connecting...' : wallet ? `⬡ ${wallet.address}` : '⬡ Connect Wallet'}
          </button>

          <button className={styles.cartBtn} onClick={() => setCartOpen(true)}>
            🛒 {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
          </button>
        </div>
      </nav>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}