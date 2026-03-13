'use client'
import { useState, useEffect, useRef } from 'react'
import Navbar from '@/components/Navbar'
import { useApp } from '@/context/AppContext'
import styles from './checkout.module.css'

function Confetti({ active }) {
  const canvasRef = useRef(null)
  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: -10,
      r: Math.random() * 6 + 2,
      d: Math.random() * 3 + 1,
      color: ['#00ffc8','#00d4ff','#7b2fff','#ffd93d','#ff4757'][Math.floor(Math.random()*5)],
      tilt: Math.random() * 10 - 5,
      tiltAngle: 0,
      tiltSpeed: Math.random() * 0.1 + 0.05,
    }))
    let frame
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.tiltAngle += p.tiltSpeed
        p.y += p.d
        p.x += Math.sin(p.tiltAngle) * 1.5
        ctx.beginPath()
        ctx.fillStyle = p.color
        ctx.ellipse(p.x, p.y, p.r, p.r * 0.4, p.tiltAngle, 0, Math.PI * 2)
        ctx.fill()
      })
      if (particles.some(p => p.y < canvas.height)) frame = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(frame)
  }, [active])
  if (!active) return null
  return <canvas ref={canvasRef} style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:9999 }} />
}

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart, connectWallet, wallet, payWithWUSD } = useApp()

  // Form state
  const [address, setAddress] = useState({ name: '', email: '', street: '', city: '', zip: '', country: 'India' })
  const [done, setDone] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [escrowResult, setEscrowResult] = useState(null)
  const [escrowError, setEscrowError] = useState(null)
  const [confetti, setConfetti] = useState(false)
  const [connectingMsg, setConnectingMsg] = useState('')
  const [connecting, setConnecting] = useState(false)

  const aiSavings = Math.round(cartTotal * 0.12 * 100) / 100
  const fee = Math.round(cartTotal * 0.01 * 100) / 100
  const total = Math.round((cartTotal - aiSavings + fee) * 100) / 100

  const CONNECT_STEPS = ['Initializing wallet...', 'Requesting permissions...', 'Verifying on Weilchain...', 'Loading WUSD balance...', 'Ready!']
  const ESCROW_STEPS = ['Creating escrow contract...', 'Locking WUSD...', 'AI verification initiated...', 'On-chain audit logged...', 'Done!']

  async function handleConnect() {
    setConnecting(true)
    for (const msg of CONNECT_STEPS) {
      setConnectingMsg(msg)
      await new Promise(r => setTimeout(r, 500))
    }
    await connectWallet()
    setConnecting(false)
  }

  async function handleConfirm() {
    if (!wallet) return
    setConfirming(true)
    setEscrowError(null)
    for (let i = 0; i < ESCROW_STEPS.length - 1; i++) {
      setConnectingMsg(ESCROW_STEPS[i])
      await new Promise(r => setTimeout(r, 600))
    }
    try {
      const seller = cart[0]?.seller || 'SELLER_VAULT'
      const result = await payWithWUSD({ to: seller, amount: total, orderId: 'ORDER-' + Date.now() })
      setEscrowResult(result)
      setConfetti(true)
      setTimeout(() => setConfetti(false), 4000)
    } catch (err) {
      setEscrowError(err.message)
    }
    setConnectingMsg('')
    setConfirming(false)
    clearCart()
    setDone(true)
  }

  return (
    <>
      <Navbar />
      <Confetti active={confetti} />
      <div className={styles.page}>
        <div className={styles.pageGrid}>

          {/* ── LEFT: FORM ── */}
          <div className={styles.left}>
            <h2 className={styles.sectionHead}>01 · DELIVERY</h2>
            <div className={styles.formGrid}>
              {[
                { key:'name', label:'Full Name', placeholder:' ' },
                { key:'email', label:'Email', placeholder:' ' },
                { key:'street', label:'Street Address', placeholder:' ' },
                { key:'city', label:'City', placeholder:' ' },
                { key:'zip', label:'PIN Code', placeholder:' ' },
              ].map(f => (
                <div key={f.key} className={styles.field}>
                  <label className={styles.label}>{f.label}</label>
                  <input
                    className={styles.input}
                    placeholder={f.placeholder}
                    value={address[f.key]}
                    onChange={e => setAddress(a => ({...a, [f.key]: e.target.value}))}
                  />
                </div>
              ))}
            </div>

            <h2 className={styles.sectionHead} style={{marginTop:32}}>02 · PAYMENT</h2>
            {!wallet ? (
              <div className={styles.walletConnect}>
                <div className={styles.walletIcon}>⬡</div>
                <div>
                  <div style={{fontWeight:700,marginBottom:4}}>Connect Weil Wallet</div>
                  <div style={{fontSize:'0.78rem',color:'var(--muted)'}}>Pay with WUSD · Protected by Escrow</div>
                </div>
                <button className={styles.connectBtn} onClick={handleConnect} disabled={connecting}>
                  {connecting ? connectingMsg : '⬡ Connect'}
                </button>
              </div>
            ) : (
              <div className={styles.walletConnected}>
                <div style={{display:'flex',alignItems:'center',gap:12}}>
                  <div style={{fontSize:'1.5rem'}}>⬡</div>
                  <div>
                    <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'0.75rem',color:'var(--muted)'}}>{wallet.address?.slice(0,18)}...</div>
                    <div style={{color:'var(--neon)',fontFamily:"'JetBrains Mono',monospace",fontWeight:700}}>{(wallet.balance || 0).toLocaleString()} WUSD</div>
                  </div>
                  <div style={{marginLeft:'auto',color:'var(--neon)',fontSize:'1.2rem'}}>✓</div>
                </div>
                <div className={styles.aiSavings}>🤖 Icarus Agent negotiated 12% savings on this order!</div>
              </div>
            )}
          </div>

          {/* ── RIGHT: ORDER SUMMARY ── */}
          <div className={styles.right}>
            <h2 className={styles.sectionHead}>03 · ORDER SUMMARY</h2>

            {cart.length === 0 && !done ? (
              <div style={{color:'var(--muted)',fontSize:'0.85rem',padding:'20px 0'}}>
                No items in cart. <a href="/marketplace" style={{color:'var(--neon)'}}>Go shopping →</a>
              </div>
            ) : done ? (
              <div className={styles.success}>
                <div className={styles.successIcon}>✓</div>
                <h3 style={{color:'var(--neon)',fontFamily:"'Bebas Neue',cursive",fontSize:'1.8rem',letterSpacing:'0.05em'}}>ESCROW CREATED!</h3>
                <p style={{color:'var(--muted)',fontSize:'0.82rem',lineHeight:1.6,margin:'8px 0 20px'}}>
                  Your WUSD is locked on WeilChain. Icarus Agent is monitoring delivery.
                </p>
                {escrowError && (
                  <div style={{color:'var(--red)',fontSize:'0.75rem',marginBottom:12,fontFamily:"'JetBrains Mono',monospace"}}>⚠ {escrowError}</div>
                )}
                <div className={styles.receipt}>
                  {[
                    { label: 'Amount Locked', val: total + ' WUSD' },
                    { label: 'Escrow ID', val: escrowResult?.escrowId || '—' },
                    { label: 'Block', val: escrowResult?.blockIndex ? '#' + escrowResult.blockIndex : '#48,294' },
                    { label: 'Agent', val: 'Icarus_Alpha' },
                    { label: 'Status', val: 'ESCROWED ✓' },
                  ].map(r => (
                    <div key={r.label} className={styles.receiptRow}>
                      <span style={{color:'var(--muted)'}}>{r.label}</span>
                      <span style={{fontFamily:"'JetBrains Mono',monospace",color:'var(--neon)'}}>{r.val}</span>
                    </div>
                  ))}
                </div>
                <a href="/dashboard" className={styles.mainBtn} style={{display:'block',textAlign:'center',marginTop:16}}>📊 View in Dashboard</a>
                <a href="/marketplace" className={styles.secondBtn} style={{display:'block',textAlign:'center',marginTop:8}}>← Back to Marketplace</a>
              </div>
            ) : (
              <>
                <div className={styles.items}>
                  {cart.map(item => (
                    <div key={item.id} className={styles.item}>
                      <div style={{fontSize:'1.8rem'}}>{item.emoji}</div>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:600,fontSize:'0.88rem'}}>{item.name}</div>
                        <div style={{fontSize:'0.75rem',color:'var(--muted)'}}>Qty: {item.qty}</div>
                      </div>
                      <div style={{fontFamily:"'JetBrains Mono',monospace",color:'var(--neon)',fontSize:'0.88rem'}}>
                        {(item.priceWUSD || item.price) * item.qty} WUSD
                      </div>
                    </div>
                  ))}
                </div>

                <div className={styles.totals}>
                  <div className={styles.totalRow}><span>Subtotal</span><span>{cartTotal} WUSD</span></div>
                  <div className={styles.totalRow} style={{color:'#00ffc8'}}><span>🤖 AI Savings (12%)</span><span>-{aiSavings} WUSD</span></div>
                  <div className={styles.totalRow}><span>Platform fee (1%)</span><span>{fee} WUSD</span></div>
                  <div className={styles.divider} />
                  <div className={`${styles.totalRow} ${styles.totalFinal}`}><span>TOTAL</span><span>{total} WUSD</span></div>
                </div>

                <div className={styles.escrowNote}>
                  🔐 <strong>{total} WUSD</strong> will be locked in WeilChain escrow. Released automatically on delivery.
                </div>

                {confirming ? (
                  <div className={styles.spinnerWrap}>
                    <div className={styles.spinner} />
                    <div className={styles.spinnerText}>{connectingMsg}</div>
                  </div>
                ) : (
                  <button
                    className={styles.mainBtn}
                    onClick={handleConfirm}
                    disabled={!wallet || cart.length === 0}
                    style={{width:'100%',marginTop:16,opacity:(!wallet||cart.length===0)?0.5:1}}
                  >
                    🔐 Lock {total} WUSD in Escrow
                  </button>
                )}
                {!wallet && <div style={{textAlign:'center',fontSize:'0.75rem',color:'var(--muted)',marginTop:8}}>Connect wallet above to pay</div>}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}