'use client'
import { useState } from 'react'
import Navbar from '@/components/Navbar'
import { useApp } from '@/context/AppContext'
import styles from './checkout.module.css'

const STEPS = ['WALLET', 'REVIEW', 'CONFIRM']
const WALLET_OPTIONS = [
  { id: 'weil', icon: '⬡', name: 'Weil Wallet', desc: 'Official Weilchain wallet with native WUSD support', badge: 'OFFICIAL', recommended: true },
  { id: 'metamask', icon: '🦊', name: 'MetaMask', desc: 'Connect via EVM bridge to Weilchain', badge: 'EVM' },
  { id: 'walletconnect', icon: '🔗', name: 'WalletConnect', desc: 'Scan QR code with any compatible wallet' },
]
const CONNECT_STEPS = ['Initializing wallet...', 'Requesting permissions...', 'Verifying on Weilchain...', 'Loading WUSD balance...', 'Ready!']
const ESCROW_STEPS  = ['Creating escrow contract...', 'Locking WUSD...', 'AI verification initiated...', 'On-chain audit logged...', 'Done!']

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart, connectWallet, wallet } = useApp()
  const [step, setStep] = useState(0)           // 0=wallet, 1=review, 2=done
  const [selectedWallet, setSelectedWallet] = useState('weil')
  const [connecting, setConnecting] = useState(false)
  const [connectingMsg, setConnectingMsg] = useState('')
  const [confirming, setConfirming] = useState(false)
  const aiSavings = Math.round(cartTotal * 0.12 * 100) / 100
  const fee = Math.round(cartTotal * 0.01 * 100) / 100
  const total = Math.round((cartTotal - aiSavings + fee) * 100) / 100

  async function handleConnect() {
    setConnecting(true)
    for (const msg of CONNECT_STEPS) {
      setConnectingMsg(msg)
      await new Promise(r => setTimeout(r, 600))
    }
    await connectWallet()
    setConnecting(false)
    setStep(1)
  }

  async function handleConfirm() {
    setConfirming(true)
    for (const msg of ESCROW_STEPS) {
      setConnectingMsg(msg)
      await new Promise(r => setTimeout(r, 700))
    }
    setConfirming(false)
    setStep(2)
    clearCart()
  }

  return (
    <>
      <Navbar />
      <div className={styles.page}>
        {/* STEPS */}
        <div className={styles.steps}>
          {STEPS.map((s, i) => (
            <span key={s} style={{ display: 'contents' }}>
              <div className={`${styles.step} ${i <= step ? styles.stepDone : ''} ${i === step ? styles.stepActive : ''}`}>
                <div className={styles.stepCircle}>{i < step ? '✓' : i + 1}</div>
                <div className={styles.stepLabel}>{s}</div>
              </div>
              {i < STEPS.length - 1 && <div className={styles.stepLine} />}
            </span>
          ))}
        </div>

        <div className={styles.card}>
          <div className={styles.cardHead}>
            <div className={styles.logoRow}>
              <div className={styles.logoIcon}>⬡</div>
              <div className={styles.logoText}>W-Commerce<span>X</span></div>
            </div>
            <h2 className={styles.cardTitle}>
              {step === 0 ? 'Connect Weil Wallet' : step === 1 ? 'Review & Pay' : 'Payment Confirmed!'}
            </h2>
            <p className={styles.cardSub}>
              {step === 0 ? 'Authenticate with your Weilchain wallet to shop with WUSD.'
               : step === 1 ? 'Your AI agent negotiated the best prices. Confirm to lock WUSD in escrow.'
               : 'Your escrow is live on Weilchain. Icarus is monitoring delivery.'}
            </p>
          </div>

          <div className={styles.cardBody}>
            {/* ── WALLET SELECTION ── */}
            {step === 0 && !connecting && (
              <>
                <div className={styles.walletOptions}>
                  {WALLET_OPTIONS.map(w => (
                    <div
                      key={w.id}
                      className={`${styles.walletOption} ${selectedWallet === w.id ? styles.walletSelected : ''}`}
                      onClick={() => setSelectedWallet(w.id)}
                    >
                      {w.recommended && <div className={styles.recommended}>RECOMMENDED</div>}
                      <div className={styles.walletIcon}>{w.icon}</div>
                      <div className={styles.walletInfo}>
                        <div className={styles.walletName}>{w.name}</div>
                        <div className={styles.walletDesc}>{w.desc}</div>
                      </div>
                      {w.badge && <span className={styles.walletBadge}>{w.badge}</span>}
                    </div>
                  ))}
                </div>
                <button className={styles.mainBtn} onClick={handleConnect}>⬡ Connect Selected Wallet</button>
                <a href="/marketplace" className={styles.secondBtn}>← Back to Marketplace</a>
              </>
            )}

            {/* ── CONNECTING / CONFIRMING ── */}
            {(connecting || confirming) && (
              <div className={styles.spinnerWrap}>
                <div className={styles.spinner} />
                <div className={styles.spinnerText}>{connecting ? 'Connecting to Weilchain...' : 'Locking WUSD in escrow...'}</div>
                <div className={styles.spinnerStep}>{connectingMsg}</div>
              </div>
            )}

            {/* ── ORDER REVIEW ── */}
            {step === 1 && !confirming && (
              <>
                <div className={styles.walletCard}>
                  <div className={styles.walletConnIcon}>⬡</div>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{wallet?.address || '0x4f2a...8c1d'}</div>
                    <div className={styles.wusdAmt}>{wallet?.balance?.toLocaleString() || '1,250'} WUSD</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Available Balance</div>
                  </div>
                  <div style={{ marginLeft: 'auto', fontSize: '1.5rem' }}>✓</div>
                </div>

                {cart.length > 0 && (
                  <div className={styles.aiSavings}>🤖 Icarus Agent negotiated 12% savings on your order!</div>
                )}

                <div className={styles.orderSummary}>
                  <div className={styles.orderTitle}>ORDER SUMMARY</div>
                  {cart.length === 0
                    ? <div style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>No items — return to marketplace.</div>
                    : cart.map(item => (
                      <div key={item.id} className={styles.orderItem}>
                        <div className={styles.orderEmoji}>{item.emoji}</div>
                        <div style={{ flex: 1, fontSize: '0.88rem', fontWeight: 500 }}>{item.name}</div>
                        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.88rem', color: 'var(--accent3)' }}>{item.price * item.qty} WUSD</div>
                      </div>
                    ))
                  }
                  <div className={styles.divider} />
                  <div className={styles.row}><span>Subtotal</span><span style={{fontFamily:"'DM Mono',monospace"}}>{cartTotal} WUSD</span></div>
                  <div className={styles.row}><span>AI Savings (12%)</span><span style={{fontFamily:"'DM Mono',monospace",color:'var(--green)'}}>-{aiSavings} WUSD</span></div>
                  <div className={styles.row}><span>Platform fee (1%)</span><span style={{fontFamily:"'DM Mono',monospace"}}>{fee} WUSD</span></div>
                  <div className={styles.divider} />
                  <div className={`${styles.row} ${styles.rowTotal}`}><span>Total</span><span style={{fontFamily:"'DM Mono',monospace",color:'var(--accent3)',fontSize:'1.1rem'}}>{total} WUSD</span></div>
                </div>

                <div className={styles.escrowNote}>
                  🔐 <strong>Smart Escrow:</strong> {total} WUSD will be locked on Weilchain. Funds release automatically when AI verification confirms delivery.
                </div>

                <button className={styles.mainBtn} onClick={handleConfirm} disabled={cart.length === 0}>
                  🔐 Lock {total} WUSD in Escrow
                </button>
                <a href="/marketplace" className={styles.secondBtn}>Edit Order</a>
              </>
            )}

            {/* ── SUCCESS ── */}
            {step === 2 && !confirming && (
              <div className={styles.success}>
                <div className={styles.successIcon}>✓</div>
                <h3 className={styles.successTitle}>Escrow Created!</h3>
                <p className={styles.successSub}>Your payment is locked on Weilchain. Icarus Agent is monitoring delivery. Funds release automatically upon verification.</p>
                <div className={styles.receipt}>
                  {[
                    { label: 'Amount Locked', val: `${total} WUSD` },
                    { label: 'Block',          val: '#48,294' },
                    { label: 'Agent',          val: 'Icarus_Alpha' },
                    { label: 'Status',         val: 'ESCROWED' },
                  ].map(r => (
                    <div key={r.label} className={styles.receiptRow}>
                      <span style={{ color: 'var(--muted)' }}>{r.label}</span>
                      <span style={{ fontFamily: "'DM Mono',monospace", color: 'var(--accent3)' }}>{r.val}</span>
                    </div>
                  ))}
                </div>
                <a href="/dashboard" className={styles.mainBtn} style={{ textAlign: 'center', justifyContent: 'center' }}>📊 View in Dashboard</a>
                <a href="/marketplace" className={styles.secondBtn} style={{ textAlign: 'center' }}>← Back to Marketplace</a>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}