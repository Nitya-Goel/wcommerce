'use client'
import { useState } from 'react'
import Navbar from '@/components/Navbar'
import styles from './dashboard.module.css'

const KPI_DATA = [
  { icon: '◈', val: '1,250', label: 'WUSD Balance',    change: '+125 this week', up: true, grad: 'linear-gradient(90deg,#a855f7,#ec4899)' },
  { icon: '🤖', val: '3',     label: 'Active Agents',   change: '2 deployed today', up: true, grad: 'linear-gradient(90deg,#06b6d4,#3b82f6)' },
  { icon: '💰', val: '12.4%', label: 'Avg AI Savings',  change: 'vs manual buying', up: true, grad: 'linear-gradient(90deg,#10b981,#06b6d4)' },
  { icon: '🔐', val: '5',     label: 'Open Escrows',    change: '340 WUSD locked', up: false, grad: 'linear-gradient(90deg,#f59e0b,#ef4444)' },
]

const CHART_DATA = [
  { day: 'Mon', val: 120 }, { day: 'Tue', val: 85 }, { day: 'Wed', val: 200 },
  { day: 'Thu', val: 145 }, { day: 'Fri', val: 310 }, { day: 'Sat', val: 275 }, { day: 'Sun', val: 410 },
]

const AGENTS = [
  { name: 'Icarus_Alpha', task: 'Watching: AI Services · Budget: 500 WUSD', savings: '-18% saved', txns: '12 txns', status: 'active', emoji: '🤖', grad: 'linear-gradient(135deg,#a855f7,#ec4899)' },
  { name: 'Secure_Buyer', task: 'Watching: NFTs · Budget: 300 WUSD',        savings: '-9% saved',  txns: '5 txns',  status: 'active', emoji: '🛡️', grad: 'linear-gradient(135deg,#06b6d4,#3b82f6)' },
  { name: 'DeFi_Hunter',  task: 'Watching: DeFi · Budget: 200 WUSD',        savings: '-14% saved', txns: '8 txns',  status: 'idle',   emoji: '⚡', grad: 'linear-gradient(135deg,#10b981,#059669)' },
]

const TXS = [
  { product: 'AI Code Review',    hash: '0x4f2a...8c1d', amount: '30 WUSD',  status: 'success' },
  { product: 'DeFi Analytics',    hash: '0x8b1c...3e9f', amount: '45 WUSD',  status: 'success' },
  { product: 'Music NFT #42',     hash: '0x3d9e...7a2c', amount: '120 WUSD', status: 'pending' },
  { product: 'Smart Audit',       hash: '0x7a3f...1b4e', amount: '85 WUSD',  status: 'locked' },
  { product: 'Pixel Art #8',      hash: '0x2c5b...9d1f', amount: '350 WUSD', status: 'success' },
]

const ACTIVITY = [
  { icon: '🤖', type: 'ai',   text: 'Icarus_Alpha negotiated AI Code Review from 30 → 25.5 WUSD (-15%). Escrow locked.', time: '2m ago' },
  { icon: '✓',  type: 'tx',   text: 'Escrow 0x4f2a...8c1d released. AI Code Review delivered successfully.',              time: '18m ago' },
  { icon: '⚡', type: 'ai',   text: 'DeFi_Hunter found DeFi Analytics at 42 WUSD (7% below ask). Awaiting approval.',    time: '34m ago' },
  { icon: '⚠️', type: 'warn', text: 'High-value transaction: Luxury Watch at 1,500 WUSD. Human review required.',         time: '1h ago' },
  { icon: '✓',  type: 'tx',   text: 'Reputation NFT minted for SecureAI.eth — 5th successful trade verified on-chain.',   time: '2h ago' },
]

const maxVal = Math.max(...CHART_DATA.map(d => d.val))

export default function DashboardPage() {
  const [deployOpen, setDeployOpen] = useState(false)

  return (
    <>
      <Navbar />
      <div className={styles.layout}>

        {/* SIDEBAR */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarSection}>NAVIGATION</div>
          {[
            { href: '/marketplace', icon: '🏪', label: 'Marketplace' },
            { href: '/dashboard',   icon: '📊', label: 'Dashboard',    active: true, badge: null },
            { href: '#',            icon: '🤖', label: 'My Agents',    badge: '3' },
            { href: '#',            icon: '🔐', label: 'Escrow' },
            { href: '#',            icon: '📋', label: 'Audit Log' },
            { href: '#',            icon: '🏆', label: 'Reputation NFTs' },
          ].map(item => (
            <a key={item.label} href={item.href}
              className={`${styles.navItem} ${item.active ? styles.navActive : ''}`}>
              <span>{item.icon}</span>
              {item.label}
              {item.badge && <span className={styles.navBadge}>{item.badge}</span>}
            </a>
          ))}

          <div className={styles.sidebarWallet}>
            <div className={styles.walletAddr}>0x4f2a...8c1d</div>
            <div className={styles.walletBal}>1,250.00</div>
            <div className={styles.walletLabel}>WUSD BALANCE</div>
            <div className={styles.walletStatus}>Connected · Testnet</div>
          </div>
        </aside>

        {/* MAIN */}
        <main className={styles.main}>
          <div className={styles.pageHead}>
            <h1 className={styles.pageTitle}>Agent Dashboard</h1>
            <p className={styles.pageSub}>Monitor your autonomous agents, escrows, and on-chain activity.</p>
            <div className={styles.pageActions}>
              <button className="btn-primary" onClick={() => setDeployOpen(true)}>🤖 Deploy New Agent</button>
              <a href="/marketplace" className="btn-secondary">← Marketplace</a>
            </div>
          </div>

          {/* KPI */}
          <div className={styles.kpiGrid}>
            {KPI_DATA.map(k => (
              <div key={k.label} className={styles.kpiCard} style={{ '--kpi-grad': k.grad }}>
                <div className={styles.kpiIcon}>{k.icon}</div>
                <div className={styles.kpiVal}>{k.val}</div>
                <div className={styles.kpiLabel}>{k.label}</div>
                <div className={`${styles.kpiChange} ${k.up ? styles.up : styles.gold}`}>
                  {k.up ? '↑' : '→'} {k.change}
                </div>
              </div>
            ))}
          </div>

          {/* CHART + AGENTS */}
          <div className={styles.grid2}>
            {/* BAR CHART */}
            <div className={styles.card}>
              <div className={styles.cardHead}><span className={styles.cardTitle}>WUSD Volume (7d)</span><span className={styles.cardTag}>LIVE</span></div>
              <div className={styles.chartArea}>
                {CHART_DATA.map(d => (
                  <div key={d.day} className={styles.barWrap}>
                    <div className={styles.barVal}>{d.val}</div>
                    <div className={styles.bar} style={{ height: `${Math.round((d.val / maxVal) * 120)}px` }} />
                    <div className={styles.barLabel}>{d.day}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* AGENTS */}
            <div className={styles.card}>
              <div className={styles.cardHead}>
                <span className={styles.cardTitle}>My Agents</span>
                <button className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.78rem' }} onClick={() => setDeployOpen(true)}>+ Deploy</button>
              </div>
              <div className={styles.cardBody}>
                {AGENTS.map(a => (
                  <div key={a.name} className={styles.agentItem}>
                    <div className={styles.agentAvatar} style={{ background: a.grad }}>{a.emoji}</div>
                    <div className={styles.agentInfo}>
                      <div className={styles.agentName}>{a.name}</div>
                      <div className={styles.agentTask}>{a.task}</div>
                    </div>
                    <div className={styles.agentStats}>
                      <div className={styles.agentSavings}>{a.savings}</div>
                      <div className={styles.agentTxns}>{a.txns}</div>
                    </div>
                    <div className={`${styles.dot} ${a.status === 'active' ? styles.dotActive : styles.dotIdle}`} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* TX TABLE */}
          <div className={styles.card} style={{ marginBottom: 20 }}>
            <div className={styles.cardHead}><span className={styles.cardTitle}>Recent Transactions</span><span className={styles.cardTag}>ON-CHAIN</span></div>
            <div style={{ overflowX: 'auto' }}>
              <table className={styles.txTable}>
                <thead><tr><th>PRODUCT</th><th>HASH</th><th>AMOUNT</th><th>STATUS</th></tr></thead>
                <tbody>
                  {TXS.map((t, i) => (
                    <tr key={i}>
                      <td><strong>{t.product}</strong></td>
                      <td style={{ fontFamily: "'DM Mono',monospace", color: 'var(--accent3)', fontSize: '0.78rem' }}>{t.hash}</td>
                      <td style={{ fontFamily: "'DM Mono',monospace" }}>{t.amount}</td>
                      <td><span className={`status-pill pill-${t.status}`}>{t.status.toUpperCase()}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ACTIVITY */}
          <div className={styles.card}>
            <div className={styles.cardHead}><span className={styles.cardTitle}>Agent Activity Feed</span><span className={styles.cardTag}>REAL-TIME</span></div>
            <div className={styles.cardBody}>
              {ACTIVITY.map((a, i) => (
                <div key={i} className={styles.notif}>
                  <div className={`${styles.notifIcon} ${styles['notif_' + a.type]}`}>{a.icon}</div>
                  <div className={styles.notifText}>{a.text}</div>
                  <div className={styles.notifTime}>{a.time}</div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* DEPLOY MODAL */}
      {deployOpen && (
        <div className={styles.modalOverlay} onClick={() => setDeployOpen(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>🤖 Deploy Commerce Agent</h2>
            <p className={styles.modalSub}>Configure your autonomous AI agent for Weilchain.</p>
            {[
              { label: 'AGENT NAME', type: 'text', placeholder: 'e.g. MyBuyerAgent_001' },
              { label: 'MAX BUDGET (WUSD)', type: 'number', placeholder: '500' },
            ].map(f => (
              <div key={f.label} className={styles.formGroup}>
                <label className={styles.formLabel}>{f.label}</label>
                <input className={styles.formInput} type={f.type} placeholder={f.placeholder} />
              </div>
            ))}
            {[
              { label: 'NEGOTIATION STRATEGY', opts: ['Aggressive (-20%)', 'Balanced (-10%)', 'Conservative (-5%)', 'Fixed Price'] },
              { label: 'CATEGORIES TO WATCH', opts: ['All Categories', 'AI Services', 'NFTs', 'Digital Goods', 'DeFi Tools'] },
            ].map(s => (
              <div key={s.label} className={styles.formGroup}>
                <label className={styles.formLabel}>{s.label}</label>
                <select className={styles.formInput}>{s.opts.map(o => <option key={o}>{o}</option>)}</select>
              </div>
            ))}
            <div className={styles.modalActions}>
              <button className="btn-primary" style={{ flex: 1 }} onClick={() => { setDeployOpen(false); alert('Agent deployed on Weilchain!') }}>⚡ Deploy on Weilchain</button>
              <button className="btn-secondary" onClick={() => setDeployOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}