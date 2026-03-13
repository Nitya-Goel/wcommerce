'use client'
import { useState, useEffect, useRef } from 'react'
import Navbar from '@/components/Navbar'
import ProductCard from '@/components/ProductCard'
import AgentChat from '@/components/AgentChat'
import { useApp } from '@/context/AppContext'
import { PRODUCTS, ESCROW_DATA, CATEGORIES } from '@/data/products'
import styles from './marketplace.module.css'

const BACKEND_URL = 'https://wcommerce-production.up.railway.app'

const SOCIAL_POSTS = [
  {
    id: 1, creator: 'CryptoNitya', avatar: '👩‍💻', handle: '@nitya.web4',
    views: '2.4M', caption: 'My full Web4 setup — everything bought with WUSD 🔥',
    products: [
      { id: 3, name: 'MacBook Pro M4', emoji: '💻', price: 1999, category: 'laptops' },
      { id: 1, name: 'iPhone 15 Pro Max', emoji: '📱', price: 1099, category: 'phones' },
    ],
    agent: 'Icarus_Alpha', agentSave: '18%', tag: 'FEATURED',
    colors: ['#00ffc8', '#00d4ff', '#7b2fff'],
  },
  {
    id: 2, creator: 'TechVault', avatar: '🤖', handle: '@techvault.eth',
    views: '1.8M', caption: 'AI agent saved me 18% on this setup. Pure escrow. 💎',
    products: [
      { id: 6, name: 'PS5 Pro', emoji: '🎮', price: 699, category: 'gaming' },
      { id: 4, name: 'Sony WH-1000XM6', emoji: '🎧', price: 349, category: 'audio' },
    ],
    agent: 'Nexus_Beta', agentSave: '12%', tag: 'TRENDING',
    colors: ['#ff6b35', '#ffd93d', '#7b2fff'],
  },
  {
    id: 3, creator: 'AudioPhile', avatar: '🎧', handle: '@sound.wusd',
    views: '980K', caption: 'Studio quality. On-chain ownership. The future 🎵',
    products: [
      { id: 4, name: 'Sony WH-1000XM6', emoji: '🎧', price: 349, category: 'audio' },
    ],
    agent: 'Nova_Gamma', agentSave: '9%', tag: 'HOT',
    colors: ['#00d4ff', '#00ffc8', '#ff6b35'],
  },
]

function AIVideoCanvas({ post, index }) {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = 400, H = 200
    canvas.width = W; canvas.height = H
    const colors = post.colors
    const bars = Array.from({ length: 32 }, (_, i) => ({ phase: (i / 32) * Math.PI * 3 + index * 1.1 }))
    const pts = Array.from({ length: 16 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 2 + 0.5,
      vy: -(Math.random() * 0.5 + 0.2),
      vx: (Math.random() - 0.5) * 0.3,
      life: Math.random(),
    }))
    const t0 = performance.now()

    function draw() {
      const t = (performance.now() - t0) / 1000
      const bg = ctx.createLinearGradient(0, 0, W, H)
      bg.addColorStop(0, '#020810'); bg.addColorStop(1, '#0a1830')
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H)
      for (let y = 0; y < H; y += 4) { ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.fillRect(0, y, W, 1) }
      ctx.strokeStyle = 'rgba(0,255,200,0.04)'; ctx.lineWidth = 1
      for (let x = 0; x < W; x += 25) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke() }
      for (let y = 0; y < H; y += 25) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }
      const bw = W / bars.length - 1
      bars.forEach((bar, i) => {
        const amp = H * 0.2
        const bh = Math.abs(Math.sin(bar.phase + t * 2.2)) * amp + 3
        const by = H / 2 - bh / 2
        const bx = (i / bars.length) * W
        const g = ctx.createLinearGradient(0, by, 0, by + bh)
        g.addColorStop(0, colors[i % colors.length]); g.addColorStop(1, colors[i % colors.length] + '22')
        ctx.fillStyle = g
        ctx.shadowColor = colors[i % colors.length]; ctx.shadowBlur = 5
        ctx.fillRect(bx, by, bw, bh); ctx.shadowBlur = 0
      })
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.life += 0.007
        if (p.y < -4 || p.life > 1) { p.y = H + 4; p.x = Math.random() * W; p.life = 0 }
        const a = Math.floor((1 - p.life) * 190).toString(16).padStart(2, '0')
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = colors[0] + a; ctx.fill()
      })
      const cx = W / 2, cy = H / 2
      const gw = ctx.createRadialGradient(cx, cy, 0, cx, cy, 50)
      gw.addColorStop(0, colors[0] + '55'); gw.addColorStop(1, 'transparent')
      ctx.fillStyle = gw; ctx.fillRect(0, 0, W, H)
      ctx.font = '34px serif'; ctx.textAlign = 'center'
      ctx.shadowColor = colors[0]; ctx.shadowBlur = 18
      ctx.fillStyle = '#fff'; ctx.fillText(post.avatar, cx, cy + 12); ctx.shadowBlur = 0
      ctx.beginPath(); ctx.moveTo(0, H - 2)
      for (let x = 0; x < W; x++) { ctx.lineTo(x, H - 2 - Math.abs(Math.sin((x / W) * Math.PI * 7 + t * 2.5)) * 7) }
      ctx.strokeStyle = colors[0] + 'bb'; ctx.lineWidth = 1.5; ctx.stroke()
      const pulse = 0.6 + 0.4 * Math.sin(t * 4)
      ctx.beginPath(); ctx.arc(16, 16, 4.5 * pulse, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255,50,50,${pulse})`
      ctx.shadowColor = '#ff2222'; ctx.shadowBlur = 10 * pulse
      ctx.fill(); ctx.shadowBlur = 0
      ctx.font = 'bold 8px monospace'; ctx.textAlign = 'left'
      ctx.fillStyle = colors[0]; ctx.fillText(`◈ AI_PROMO_${String(index + 1).padStart(3, '0')}`, 8, H - 8)
      ctx.textAlign = 'right'; ctx.fillStyle = 'rgba(255,255,255,0.6)'
      ctx.font = '8px monospace'; ctx.fillText(`▶ ${post.views}`, W - 8, H - 8)
      rafRef.current = requestAnimationFrame(draw)
    }
    rafRef.current = requestAnimationFrame(draw)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [post, index])

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '200px' }} />
}

function useCounter(target, duration = 1800, start = false) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!start) return
    let t0 = null
    const isDecimal = String(target).includes('.')
    const num = parseFloat(String(target).replace(/[^0-9.]/g, ''))
    function step(ts) {
      if (!t0) t0 = ts
      const p = Math.min((ts - t0) / duration, 1)
      const e = 1 - Math.pow(1 - p, 3)
      setValue(isDecimal ? (e * num).toFixed(1) : Math.floor(e * num).toLocaleString())
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, start, duration])
  return value
}

function StatItem({ val, label, delay }) {
  const ref = useRef(null)
  const [vis, setVis] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true) }, { threshold: 0.3 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  const prefix = val.startsWith('$') ? '$' : ''
  const raw = val.replace(/[$%M,]/g, '')
  const count = useCounter(raw, 1800, vis)
  return (
    <div ref={ref} className={styles.statItem} style={{ animationDelay: `${delay}s` }}>
      <div className={styles.statVal}>{prefix}{count}{val.endsWith('%') ? '%' : val.includes('M') ? 'M' : ''}</div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  )
}

export default function MarketplacePage() {
  const { addToCart } = useApp()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSug, setShowSug] = useState(false)
  const [sort, setSort] = useState('default')
  const [negotiateProduct, setNegotiateProduct] = useState(null)
  const [products, setProducts] = useState([])
  const [mounted, setMounted] = useState(false)
  const [section, setSection] = useState('shop')
  const [cartFlash, setCartFlash] = useState({})

  // Refs for scroll targets
  const shopRef   = useRef(null)
  const socialRef = useRef(null)
  const tabRef    = useRef(null)

  // ── KEY FIX: change section AND scroll down ──
  const goToSection = (name) => {
    setSection(name)
    // Small timeout to let React render the section first
    setTimeout(() => {
      const target = name === 'social' ? socialRef.current : shopRef.current
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      } else if (tabRef.current) {
        tabRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 50)
  }

  useEffect(() => {
    setMounted(true)
    setProducts(PRODUCTS)
    fetch(`${BACKEND_URL}/api/products`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.data?.length > 0) {
          setProducts(data.data.map(p => ({
            ...p, id: p._id, price: p.priceWUSD, desc: p.description,
            imgBg: 'linear-gradient(135deg,#061020,#0a1830)', imgGlow: '#00ffc8',
            badges: [], reviews: p.reviewCount,
          })))
        }
      }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!search) { setSuggestions([]); return }
    setSuggestions(products.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.desc || '').toLowerCase().includes(search.toLowerCase())
    ).slice(0, 5))
  }, [search, products])

  const filtered = products.filter(p => {
    const mc = filter === 'all' || p.category === filter
    const ms = !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.desc || p.description || '').toLowerCase().includes(search.toLowerCase())
    return mc && ms
  }).sort((a, b) =>
    sort === 'price-asc' ? a.price - b.price :
    sort === 'price-desc' ? b.price - a.price :
    sort === 'rating' ? b.rating - a.rating : 0
  )

  const handleSocialCart = (p) => {
    addToCart(p)
    setCartFlash(prev => ({ ...prev, [p.id]: true }))
    setTimeout(() => setCartFlash(prev => ({ ...prev, [p.id]: false })), 1800)
  }

  if (!mounted) return null

  return (
    <>
      <Navbar />
      <div className="ticker">
        <div className="ticker-inner">
          {[...Array(2)].map((_, i) => (
            <span key={i} style={{ display: 'contents' }}>
              <span className="ticker-item">WUSD/USD <span className="up">$1.00</span></span>
              <span className="ticker-item mono">◈ WEILCHAIN TESTNET</span>
              <span className="ticker-item">Active Agents <span className="up">1,247</span></span>
              <span className="ticker-item">Escrows <span className="up">$84,320 WUSD</span></span>
              <span className="ticker-item">AI Savings <span className="up">12.4%</span></span>
            </span>
          ))}
        </div>
      </div>

      <main className={styles.main}>
        <section className={styles.hero}>
          <div className="container">
            <div className={styles.heroEyebrow}><span className={styles.liveDot} />LIVE ON WEILCHAIN TESTNET</div>
            <h1 className={styles.heroTitle}>
              <span className={`${styles.line1} glitch`} data-text="W-COMMERCE">W-COMMERCE</span>
              <span className={styles.line2}>AUTONOMOUS</span>
              <span className={styles.line3}>MARKETPLACE</span>
            </h1>
            <p className={styles.heroSub}>AI agents negotiate. Escrow enforces. WUSD settles.</p>
            <div className={styles.heroActions}>
              {/* Hero buttons scroll down to section */}
              <button className="btn-primary ripple-btn" onClick={() => goToSection('shop')}>
                [ SHOP PRODUCTS ]
              </button>
              <button className="btn-secondary" onClick={() => goToSection('social')}>
                [ 🎬 SOCIAL ]
              </button>
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

        {/* Tab bar — sticky */}
        <div className={styles.tabBar} ref={tabRef}>
          <div className="container" style={{ display: 'flex' }}>
            <button
              className={`${styles.tab} ${section === 'shop' ? styles.tabActive : ''}`}
              onClick={() => goToSection('shop')}
            >◈ MARKETPLACE</button>
            <button
              className={`${styles.tab} ${section === 'social' ? styles.tabActive : ''}`}
              onClick={() => goToSection('social')}
            >🎬 SOCIAL COMMERCE</button>
          </div>
        </div>

        {/* ── SOCIAL ── */}
        {section === 'social' && (
          <section className={styles.socialSection} ref={socialRef}>
            <div className="container">
              <div className={styles.sectionHeader}>
                <div>
                  <h2 className={styles.sectionTitle}>SHOP THE LOOK</h2>
                  <p className={styles.sectionSub}>AI-promoted products. Creator verified. Escrow protected.</p>
                </div>
                <span className={styles.sectionTag}>◈ AI LIVE PROMOS</span>
              </div>

              <div className={styles.socialGrid}>
                {SOCIAL_POSTS.map((post, idx) => (
                  <div key={post.id} className={styles.socialCard}>
                    <div className={styles.videoBox}>
                      <AIVideoCanvas post={post} index={idx} />
                      <div className={styles.liveBadge}><span className={styles.livePulse} />LIVE</div>
                      <div className={styles[`postTag${post.tag}`]}>{post.tag}</div>
                      <div className={styles.agentOverlay}>🤖 {post.agent} · Saved {post.agentSave}</div>
                    </div>
                    <div className={styles.creatorRow}>
                      <div className={styles.creatorAvatar}>{post.avatar}</div>
                      <div className={styles.creatorMeta}>
                        <div className={styles.creatorName}>{post.creator}</div>
                        <div className={styles.creatorHandle}>{post.handle}</div>
                      </div>
                      <div className={styles.viewCount}>▶ {post.views}</div>
                    </div>
                    <div className={styles.postCaption}>{post.caption}</div>
                    <div className={styles.productsLabel}>PRODUCTS IN THIS REEL</div>
                    <div className={styles.productsList}>
                      {post.products.map(p => (
                        <div key={p.id} className={styles.productRow}>
                          <span className={styles.prodEmoji}>{p.emoji}</span>
                          <div className={styles.prodMeta}>
                            <span className={styles.prodName}>{p.name}</span>
                            <span className={styles.prodCat}>{p.category.toUpperCase()}</span>
                          </div>
                          <span className={styles.prodPrice}>{p.price} WUSD</span>
                          <button
                            className={cartFlash[p.id] ? styles.addBtnActive : styles.addBtn}
                            onClick={() => handleSocialCart(p)}
                          >{cartFlash[p.id] ? '✓' : '+'}</button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── SHOP ── */}
        {section === 'shop' && (
          <section id="shop" className={styles.shop} ref={shopRef}>
            <div className="container">
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>PRODUCTS</h2>
                <span className={styles.sectionTag}>WEILCHAIN · WUSD</span>
              </div>

              <div className={styles.searchWrap}>
                <div className={styles.searchBar}>
                  <span style={{ color: 'var(--neon)', flexShrink: 0 }}>◈</span>
                  <input className={styles.searchInput} type="text" placeholder="search_products..."
                    value={search}
                    onChange={e => { setSearch(e.target.value); setShowSug(true) }}
                    onFocus={() => setShowSug(true)}
                    onBlur={() => setTimeout(() => setShowSug(false), 150)}
                  />
                  {search && <button className={styles.clearBtn} onClick={() => setSearch('')}>✕</button>}
                  <span style={{ fontSize: '1rem', opacity: 0.6, cursor: 'pointer' }}>🎤</span>
                </div>
                {showSug && suggestions.length > 0 && (
                  <div className={styles.suggestions}>
                    {suggestions.map(p => (
                      <div key={p.id} className={styles.suggestion} onClick={() => { setSearch(p.name); setShowSug(false) }}>
                        <span>{p.emoji}</span>
                        <span style={{ flex: 1 }}>{p.name}</span>
                        <span style={{ color: 'var(--neon)', fontSize: '0.75rem', fontFamily: "'JetBrains Mono',monospace" }}>{p.price} WUSD</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.filterRow}>
                <div className={styles.filterBar}>
                  {CATEGORIES.map(c => (
                    <button key={c.key}
                      className={`${styles.chip} ${filter === c.key ? styles.chipActive : ''}`}
                      onClick={() => setFilter(c.key)}>{c.label}</button>
                  ))}
                </div>
                <select className={styles.sortSelect} value={sort} onChange={e => setSort(e.target.value)}>
                  <option value="default">↕ Sort</option>
                  <option value="price-asc">Price ↑</option>
                  <option value="price-desc">Price ↓</option>
                  <option value="rating">⭐ Rating</option>
                </select>
              </div>

              <div className={styles.grid}>
                {filtered.map((p, i) => (
                  <div key={p._id || p.id} className="reveal">
                    <ProductCard product={p} delay={i * 0.06} onAgentNegotiate={setNegotiateProduct} />
                  </div>
                ))}
                {filtered.length === 0 && (
                  <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 0', fontFamily: "'JetBrains Mono',monospace", color: 'var(--muted)' }}>NO PRODUCTS FOUND</div>
                )}
              </div>
            </div>
          </section>
        )}

        <section className={styles.escrowSection}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>LIVE ESCROW</h2>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.65rem', color: 'var(--neon)', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '0.1em' }}>
                <span style={{ width: 5, height: 5, background: 'var(--neon)', borderRadius: '50%', display: 'inline-block', animation: 'blink 1.5s infinite' }} />
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
                      <td style={{ fontFamily: "'JetBrains Mono',monospace", color: 'var(--muted)', fontSize: '0.75rem' }}>{e.buyer}</td>
                      <td style={{ fontFamily: "'JetBrains Mono',monospace", color: 'var(--neon)' }}>{e.amount}</td>
                      <td><span className={`status-pill pill-${e.status}`}>{e.status.toUpperCase()}</span></td>
                      <td style={{ fontFamily: "'JetBrains Mono',monospace", color: 'var(--muted)', fontSize: '0.75rem' }}>#{e.block}</td>
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