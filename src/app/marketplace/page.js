'use client'
import { useState, useEffect, useRef } from 'react'
import Navbar from '@/components/Navbar'
import ProductCard from '@/components/ProductCard'
import AgentChat from '@/components/AgentChat'
import { PRODUCTS, ESCROW_DATA, CATEGORIES } from '@/data/products'
import styles from './marketplace.module.css'

function useCounter(target, duration = 1800, start = false) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!start) return
    let startTime = null
    const isDecimal = String(target).includes('.')
    const numTarget = parseFloat(String(target).replace(/[^0-9.]/g, ''))
    function step(ts) {
      if (!startTime) startTime = ts
      const progress = Math.min((ts - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(isDecimal ? (eased * numTarget).toFixed(1) : Math.floor(eased * numTarget).toLocaleString())
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, start, duration])
  return value
}

function StatItem({ val, label, delay }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.3 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  const prefix = val.startsWith('$') ? '$' : ''
  const raw = val.replace(/[$%M,]/g, '')
  const count = useCounter(raw, 1800, visible)
  return (
    <div ref={ref} className={styles.statItem} style={{ animationDelay: `${delay}s` }}>
      <div className={styles.statVal}>{prefix}{count}{val.endsWith('%') ? '%' : val.includes('M') ? 'M' : ''}</div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  )
}

export default function MarketplacePage() {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [negotiateProduct, setNegotiateProduct] = useState(null)
  const [products, setProducts] = useState([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Step 1: set static products immediately on client
    setProducts(PRODUCTS)
    setMounted(true)

    // Step 2: try to fetch from backend in background
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 6000)

    fetch('https://wcommerce-production.up.railway.app/api/products', {
      signal: controller.signal
    })
      .then(r => r.json())
      .then(data => {
        clearTimeout(timeout)
        if (data.success && data.data?.length > 0) {
          setProducts(data.data.map(p => ({
            ...p,
            id: p._id,
            price: p.priceWUSD,
            desc: p.description,
            imgBg: 'linear-gradient(135deg, #061020, #0a1830)',
            imgGlow: '#00ffc8',
            badges: [],
            reviews: p.reviewCount,
          })))
        }
      })
      .catch(() => clearTimeout(timeout))

    return () => { clearTimeout(timeout); controller.abort() }
  }, [])

  useEffect(() => {
    if (!mounted) return
    const cards = document.querySelectorAll('.reveal')
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') })
    }, { threshold: 0.1 })
    cards.forEach(c => obs.observe(c))
    return () => obs.disconnect()
  }, [filter, search, products, mounted])

  const filtered = products.filter(p => {
    const matchCat = filter === 'all' || p.category === filter
    const matchSearch = !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.desc || p.description || '').toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  if (!mounted) return null

  return (
    <>
      <Navbar />
      <div className="ticker">
        <div className="ticker-inner">
          {[...Array(2)].map((_, i) => (
            <span key={i} style={{display:'contents'}}>
              <span className="ticker-item">WUSD/USD <span className="up">$1.00 +0.00%</span></span>
              <span className="ticker-item mono">◈ WEILCHAIN TESTNET</span>
              <span className="ticker-item">Active Agents <span className="up">1,247</span></span>
              <span className="ticker-item">Escrows Locked <span className="up">$84,320 WUSD</span></span>
              <span className="ticker-item">Transactions <span className="up">3,891</span></span>
              <span className="ticker-item">AI Savings <span className="up">12.4%</span></span>
            </span>
          ))}
        </div>
      </div>

      <main className={styles.main}>
        <section className={styles.hero}>
          <div className="container">
            <div className={styles.heroEyebrow}>
              <span className={styles.liveDot} />
              LIVE ON WEILCHAIN TESTNET
            </div>
            <h1 className={styles.heroTitle}>
              <span className={`${styles.line1} glitch`} data-text="W-COMMERCE">W-COMMERCE</span>
              <span className={styles.line2}>AUTONOMOUS</span>
              <span className={styles.line3}>MARKETPLACE</span>
            </h1>
            <p className={styles.heroSub}>
              AI agents negotiate. Escrow enforces. WUSD settles.
              Buy electronics on-chain with zero trust required.
            </p>
            <div className={styles.heroActions}>
              <a href="#shop" className="btn-primary ripple-btn">[ START SHOPPING ]</a>
              <a href="/dashboard" className="btn-secondary">[ DEPLOY AGENT ]</a>
            </div>
            <div className={styles.statsRow}>
              {[
                { val: '$2.4M', label: 'TOTAL WUSD VOLUME' },
                { val: '1247',  label: 'ACTIVE AI AGENTS' },
                { val: '12.4%', label: 'AVG NEGOTIATION SAVINGS' },
                { val: '99.8%', label: 'ESCROW SUCCESS RATE' },
              ].map((s, i) => <StatItem key={s.label} val={s.val} label={s.label} delay={i * 0.1} />)}
            </div>
          </div>
        </section>

        <section id="shop" className={styles.shop}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>PRODUCTS</h2>
              <span className={styles.sectionTag}>WEILCHAIN · WUSD</span>
            </div>
            <div className={styles.searchBar}>
              <span>◈</span>
              <input type="text" placeholder="search_products..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className={styles.filterBar}>
              {CATEGORIES.map(c => (
                <button key={c.key} className={`${styles.chip} ${filter === c.key ? styles.chipActive : ''}`} onClick={() => setFilter(c.key)}>
                  {c.label}
                </button>
              ))}
            </div>
            {filtered.length === 0 ? (
              <div style={{ textAlign:'center', padding:'60px 0', fontFamily:"'JetBrains Mono',monospace", color:'var(--muted)', fontSize:'0.85rem' }}>
                NO PRODUCTS FOUND
              </div>
            ) : (
              <div className={styles.grid}>
                {filtered.map((p, i) => (
                  <ProductCard key={p._id || p.id} product={p} delay={i * 0.06} onAgentNegotiate={setNegotiateProduct} />
                ))}
              </div>
            )}
          </div>
        </section>

        <section className={styles.escrowSection}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>LIVE ESCROW</h2>
              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'0.65rem', color:'var(--neon)', display:'flex', alignItems:'center', gap:'8px', letterSpacing:'0.1em' }}>
                <span style={{ width:5, height:5, background:'var(--neon)', borderRadius:'50%', display:'inline-block', animation:'pulse 1.5s infinite', boxShadow:'0 0 5px var(--neon)' }} />
                REAL-TIME · ON-CHAIN
              </span>
            </div>
            <div className={styles.escrowCard}>
              <table className={styles.table}>
                <thead><tr><th>PRODUCT</th><th>BUYER AGENT</th><th>AMOUNT</th><th>STATUS</th><th>BLOCK</th></tr></thead>
                <tbody>
                  {ESCROW_DATA.map((e, i) => (
                    <tr key={i}>
                      <td><strong>{e.product}</strong></td>
                      <td style={{ fontFamily:"'JetBrains Mono',monospace", color:'var(--muted)', fontSize:'0.75rem' }}>{e.buyer}</td>
                      <td style={{ fontFamily:"'JetBrains Mono',monospace", color:'var(--neon)' }}>{e.amount}</td>
                      <td><span className={`status-pill pill-${e.status}`}>{e.status.toUpperCase()}</span></td>
                      <td style={{ fontFamily:"'JetBrains Mono',monospace", color:'var(--muted)', fontSize:'0.75rem' }}>#{e.block}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      <AgentChat initialProduct={negotiateProduct} />
    </>
  )
}