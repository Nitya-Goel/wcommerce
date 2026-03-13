'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import Navbar from '@/components/Navbar'
import { useApp } from '@/context/AppContext'
import styles from './dashboard.module.css'

const WEEKLY = [
  { day: 'Mon', val: 120 }, { day: 'Tue', val: 85 },
  { day: 'Wed', val: 200 }, { day: 'Thu', val: 145 },
  { day: 'Fri', val: 310 }, { day: 'Sat', val: 275 }, { day: 'Sun', val: 410 },
]
const MAX_VAL = Math.max(...WEEKLY.map(d => d.val))

const AGENTS = [
  { name: 'Icarus_Alpha', task: 'Monitoring iPhone 15 Pro Max escrow', status: 'active', emoji: '🤖', budget: '1,200 WUSD', savings: '18%', txns: 4 },
  { name: 'Nexus_Beta',   task: 'Negotiating Sony WH-1000XM6 price',  status: 'active', emoji: '🔮', budget: '500 WUSD',   savings: '12%', txns: 2 },
  { name: 'Nova_Gamma',   task: 'Idle — awaiting deployment',           status: 'idle',   emoji: '⚡', budget: '800 WUSD',   savings: '—',   txns: 0 },
]

const ESCROWS = [
  { id: 'ESC-001', product: 'iPhone 15 Pro Max', amount: '1,099 WUSD', buyer: '0xdcb8...709d', status: 'locked',   block: '#4821', created: '2m ago' },
  { id: 'ESC-002', product: 'MacBook Pro M4',    amount: '1,999 WUSD', buyer: '0x4f2a...331c', status: 'pending',  block: '#4819', created: '14m ago' },
  { id: 'ESC-003', product: 'Sony WH-1000XM6',  amount: '349 WUSD',   buyer: '0x9a1b...cc72', status: 'released', block: '#4801', created: '1h ago' },
  { id: 'ESC-004', product: 'PS5 Pro',           amount: '699 WUSD',   buyer: '0x7e3d...f019', status: 'locked',   block: '#4788', created: '3h ago' },
  { id: 'ESC-005', product: 'Apple Watch S10',   amount: '499 WUSD',   buyer: '0xb2c4...8a3e', status: 'released', block: '#4755', created: '5h ago' },
]

const AUDIT_LOGS = [
  { time: '00:02:14', event: 'ESCROW_LOCKED',    agent: 'Icarus_Alpha', detail: 'Locked 1,099 WUSD for iPhone 15 Pro Max', hash: '0xa4f2...819b', type: 'lock' },
  { time: '23:48:32', event: 'NEGOTIATION_WIN',  agent: 'Nexus_Beta',   detail: 'Negotiated 12% discount on Sony WH-1000XM6', hash: '0x7c3d...20ff', type: 'success' },
  { time: '23:01:55', event: 'ESCROW_RELEASED',  agent: 'Icarus_Alpha', detail: 'Released 1,999 WUSD — MacBook delivery confirmed', hash: '0x1e9a...cc4d', type: 'release' },
  { time: '22:14:08', event: 'AGENT_DEPLOYED',   agent: 'Nova_Gamma',   detail: 'Agent deployed on Weilchain Testnet block #4800', hash: '0xf8b1...3a77', type: 'deploy' },
  { time: '21:33:47', event: 'BLOCK_MINED',      agent: 'SYSTEM',       detail: 'Block #4821 mined — 3 transactions confirmed', hash: '0x2d7e...91bc', type: 'block' },
  { time: '20:58:21', event: 'FAUCET_MINT',      agent: 'SYSTEM',       detail: 'Minted 1,250 WUSD to 0xdcb8...709d', hash: '0x5a3f...b2e8', type: 'mint' },
  { time: '20:12:03', event: 'NEGOTIATION_WIN',  agent: 'Nexus_Beta',   detail: 'Negotiated 9% discount on Apple Watch S10', hash: '0x8c1d...44fa', type: 'success' },
  { time: '19:45:30', event: 'ESCROW_LOCKED',    agent: 'Nova_Gamma',   detail: 'Locked 499 WUSD for Apple Watch S10', hash: '0x3b6e...d19c', type: 'lock' },
]

const TRANSACTIONS = [
  { id: '#001', product: 'iPhone 15 Pro Max', amount: '1099 WUSD', status: 'success', time: '2m' },
  { id: '#002', product: 'MacBook Pro M4',    amount: '1999 WUSD', status: 'pending', time: '14m' },
  { id: '#003', product: 'Sony WH-1000XM6',  amount: '349 WUSD',  status: 'success', time: '1h' },
  { id: '#004', product: 'PS5 Pro',           amount: '699 WUSD',  status: 'locked',  time: '3h' },
]

const DONUT = [
  { label: 'Phones',  pct: 35, color: '#00ffc8' },
  { label: 'Laptops', pct: 25, color: '#7b2fff' },
  { label: 'Gaming',  pct: 20, color: '#00d4ff' },
  { label: 'Audio',   pct: 12, color: '#ffd93d' },
  { label: 'Other',   pct: 8,  color: '#ff4757' },
]

const SPIN_PRIZES = ['5% OFF','10% OFF','2% OFF','🎁 MYSTERY','15% OFF','1% OFF','FREE SHIP','20% OFF 🔥']
const SPIN_COLORS = ['#00ffc8','#7b2fff','#00d4ff','#ffd93d','#ff4757','#00ffc8','#7b2fff','#ffd93d']
const BAR_COLORS  = ['#00ffc8','#00d4ff','#7b2fff','#00ffc8','#ffd93d','#00d4ff','#00ffc8']

const NAV = [
  { icon: '📊', label: 'Dashboard',       id: 'dashboard' },
  { icon: '🤖', label: 'My Agents',       id: 'agents',  badge: '3' },
  { icon: '🔐', label: 'Escrow',          id: 'escrow',  badge: '5' },
  { icon: '📋', label: 'Audit Log',       id: 'audit' },
  { icon: '🏆', label: 'Reputation NFTs', id: 'nfts' },
  { icon: '🎮', label: 'Rewards & Games', id: 'rewards' },
]

const AUDIT_COLORS = { lock: '#00d4ff', success: '#00ffc8', release: '#7b2fff', deploy: '#ffd93d', block: '#4a7a6a', mint: '#ff6b35' }
const AUDIT_ICONS  = { lock: '🔐', success: '✅', release: '🔓', deploy: '🚀', block: '⛓', mint: '💰' }

export default function DashboardPage() {
  const { wallet, connectWallet } = useApp()
  const [activeNav, setActiveNav] = useState('dashboard')
  const [showModal, setShowModal] = useState(false)
  const [spinning, setSpinning] = useState(false)
  const [spinResult, setSpinResult] = useState(null)
  const [rewardXP, setRewardXP] = useState(750)
  const [agentFilter, setAgentFilter] = useState('all')
  const [escrowFilter, setEscrowFilter] = useState('all')
  const donutRef = useRef(null)
  const spinRef  = useRef(null)
  const raf      = useRef(null)

  // Draw donut
  useEffect(() => {
    const c = donutRef.current; if (!c) return
    const ctx = c.getContext('2d')
    const cx = c.width/2, cy = c.height/2, r = 62, inner = 36
    ctx.clearRect(0,0,c.width,c.height)
    let a = -Math.PI/2
    DONUT.forEach(seg => {
      const arc = (seg.pct/100)*2*Math.PI
      ctx.beginPath(); ctx.moveTo(cx,cy)
      ctx.arc(cx,cy,r,a,a+arc); ctx.closePath()
      ctx.fillStyle = seg.color; ctx.fill()
      a += arc
    })
    ctx.beginPath(); ctx.arc(cx,cy,inner,0,Math.PI*2)
    ctx.fillStyle = '#061020'; ctx.fill()
    ctx.font = 'bold 13px "Bebas Neue",cursive'; ctx.textAlign = 'center'
    ctx.fillStyle = '#00ffc8'; ctx.fillText('SPEND',cx,cy-3)
    ctx.font = '8px "JetBrains Mono",monospace'; ctx.fillStyle = '#4a7a6a'
    ctx.fillText('BY CAT',cx,cy+10)
  }, [activeNav])

  // Spin wheel
  const drawWheel = useCallback((angle) => {
    const c = spinRef.current; if (!c) return
    const ctx = c.getContext('2d'), cx = c.width/2, cy = c.height/2, r = cx-8
    ctx.clearRect(0,0,c.width,c.height)
    SPIN_PRIZES.forEach((prize,i) => {
      const arc = (2*Math.PI)/8
      const s = i*arc+(angle*Math.PI)/180
      ctx.beginPath(); ctx.moveTo(cx,cy); ctx.arc(cx,cy,r,s,s+arc)
      ctx.fillStyle = i%2===0?'#061020':'#0a1830'; ctx.fill()
      ctx.strokeStyle = SPIN_COLORS[i]; ctx.lineWidth = 1.5; ctx.stroke()
      ctx.save(); ctx.translate(cx,cy); ctx.rotate(s+arc/2)
      ctx.fillStyle = SPIN_COLORS[i]; ctx.font = 'bold 8px "JetBrains Mono",monospace'
      ctx.textAlign = 'right'; ctx.fillText(prize,r-6,3); ctx.restore()
    })
    ctx.beginPath(); ctx.arc(cx,cy,14,0,Math.PI*2)
    ctx.fillStyle = '#020810'; ctx.fill(); ctx.strokeStyle = '#00ffc8'; ctx.lineWidth=2; ctx.stroke()
    ctx.beginPath(); ctx.moveTo(cx+r-2,cy); ctx.lineTo(cx+r+12,cy-6); ctx.lineTo(cx+r+12,cy+6)
    ctx.fillStyle = '#ffd93d'; ctx.fill()
  },[])

  useEffect(() => { if (activeNav==='rewards') drawWheel(0) }, [activeNav,drawWheel])

  const spinWheel = () => {
    if (spinning) return; setSpinning(true); setSpinResult(null)
    const wi = Math.floor(Math.random()*8)
    const target = 360*5+(360/8)*(8-wi)-360/16
    const t0 = performance.now(), dur = 3500
    const animate = (now) => {
      const p = Math.min((now-t0)/dur,1), e = 1-Math.pow(1-p,4)
      drawWheel(target*e)
      if (p<1) { raf.current=requestAnimationFrame(animate) }
      else { setSpinning(false); setSpinResult(SPIN_PRIZES[wi]); setRewardXP(x=>Math.min(1000,x+50)) }
    }
    raf.current = requestAnimationFrame(animate)
  }
  useEffect(()=>()=>{if(raf.current)cancelAnimationFrame(raf.current)},[])

  const filteredAgents  = agentFilter==='all' ? AGENTS : AGENTS.filter(a=>a.status===agentFilter)
  const filteredEscrows = escrowFilter==='all' ? ESCROWS : ESCROWS.filter(e=>e.status===escrowFilter)

  // ── Shared header ──
  const SectionHeader = ({ title, sub, color }) => (
    <div className={styles.pageHeader}>
      <h1 className={styles.pageTitle} style={color?{color}:{}}>{title}</h1>
      <p className={styles.pageSub}>{sub}</p>
      <div className={styles.headerBtns}>
        <button className="btn-primary" onClick={()=>setShowModal(true)}>🤖 Deploy New Agent</button>
        <a href="/marketplace" className="btn-secondary" style={{textDecoration:'none',padding:'8px 16px',fontSize:'0.78rem',display:'inline-block'}}>← Marketplace</a>
      </div>
    </div>
  )

  return (
    <>
      <Navbar />
      <div className={styles.dash}>

        {/* ── Sidebar ── */}
        <aside className={styles.sidebar}>
          <div className={styles.sideTitle}>NAVIGATION</div>
          {NAV.map(item => (
            <button key={item.id}
              className={`${styles.navItem} ${activeNav===item.id?styles.navItemActive:''}`}
              onClick={()=>setActiveNav(item.id)}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {item.label}
              {item.badge && <span className={styles.navBadge}>{item.badge}</span>}
            </button>
          ))}
          <div className={styles.sideFooter}>
            {wallet ? (
              <>
                <div className={styles.walletAddr}>{wallet.address}</div>
                <div className={styles.wusdBig}>{wallet.balance?.toLocaleString?.()??wallet.balance}</div>
                <div className={styles.wusdLabel}>WUSD BALANCE</div>
                <div className={styles.netBadge}><span className={styles.netDot}/>Connected · Testnet</div>
              </>
            ) : (
              <button className="btn-primary" style={{width:'100%',padding:'8px',fontSize:'0.75rem'}} onClick={connectWallet}>⬡ Connect Wallet</button>
            )}
          </div>
        </aside>

        {/* ── Main ── */}
        <main className={styles.content}>

          {/* ════════════════ DASHBOARD ════════════════ */}
          {activeNav==='dashboard' && (
            <>
              <SectionHeader title="AGENT DASHBOARD" sub="Monitor your autonomous agents, escrows, and on-chain activity." />

              <div className={styles.kpiGrid}>
                {[
                  { emoji:'◈', val: wallet?.balance?.toLocaleString?.()??wallet?.balance??'0', label:'WUSD Balance',  sub:'+125 this week' },
                  { emoji:'🤖', val:'3',     label:'Active Agents',  sub:'2 deployed today' },
                  { emoji:'💰', val:'12.4%', label:'Avg AI Savings', sub:'vs manual buying' },
                  { emoji:'🔐', val:'5',     label:'Open Escrows',   sub:'340 WUSD locked' },
                ].map(c=>(
                  <div key={c.label} className={styles.kpiCard}>
                    <span className={styles.kpiEmoji}>{c.emoji}</span>
                    <div className={styles.kpiVal}>{c.val}</div>
                    <span className={styles.kpiLabel}>{c.label}</span>
                    <div className={styles.kpiSub}>↑ {c.sub}</div>
                  </div>
                ))}
              </div>

              <div className={styles.chartsRow}>
                <div className={styles.panel}>
                  <div className={styles.panelTitle}>
                    <span style={{width:6,height:6,background:'var(--neon)',borderRadius:'50%',display:'inline-block',animation:'blink 1.5s infinite'}}/>
                    WUSD VOLUME (7D) LIVE
                  </div>
                  <div className={styles.chartWrap}>
                    <div className={styles.yAxis}>
                      {[MAX_VAL,Math.round(MAX_VAL*.75),Math.round(MAX_VAL*.5),Math.round(MAX_VAL*.25),0].map(v=>(
                        <div key={v} className={styles.yLabel}>{v}</div>
                      ))}
                    </div>
                    <div className={styles.chartInner}>
                      <div className={styles.chartBars}>
                        {[.25,.5,.75,1].map(f=><div key={f} className={styles.gridLine} style={{bottom:`${f*100}%`}}/>)}
                        {WEEKLY.map((d,i)=>(
                          <div key={d.day} className={styles.barCol}>
                            <div className={styles.barTooltip}>{d.val} WUSD</div>
                            <div className={styles.bar} style={{
                              height:`${(d.val/MAX_VAL)*100}%`,
                              background:`linear-gradient(180deg,${BAR_COLORS[i]},${BAR_COLORS[i]}55)`,
                              boxShadow:`0 0 10px ${BAR_COLORS[i]}66`,
                            }}/>
                          </div>
                        ))}
                      </div>
                      <div className={styles.xAxis}>
                        {WEEKLY.map(d=><div key={d.day} className={styles.xLabel}>{d.day}</div>)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.panel}>
                  <div className={styles.panelTitle}>SPEND BY CATEGORY</div>
                  <div className={styles.donutWrap}>
                    <canvas ref={donutRef} width={150} height={150}/>
                    <div className={styles.legend}>
                      {DONUT.map(seg=>(
                        <div key={seg.label} className={styles.legendItem}>
                          <span className={styles.legendDot} style={{background:seg.color}}/>
                          {seg.label}
                          <span className={styles.legendVal}>{seg.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.bottomRow}>
                <div className={styles.panel}>
                  <div className={styles.panelTitle}>🤖 ACTIVE AGENTS</div>
                  <div className={styles.agentList}>
                    {AGENTS.map(ag=>(
                      <div key={ag.name} className={styles.agentItem}>
                        <div className={styles.agentAvatar}>{ag.emoji}</div>
                        <div className={styles.agentInfo}>
                          <div className={styles.agentName}>{ag.name}</div>
                          <div className={styles.agentTask}>{ag.task}</div>
                        </div>
                        <span className={ag.status==='active'?styles.dotActive:styles.dotIdle}/>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.panel}>
                  <div className={styles.panelTitle}>📋 TRANSACTIONS</div>
                  <table className={styles.txTable}>
                    <thead><tr><th>ID</th><th>PRODUCT</th><th>AMOUNT</th><th>STATUS</th></tr></thead>
                    <tbody>
                      {TRANSACTIONS.map(tx=>(
                        <tr key={tx.id}>
                          <td style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'0.68rem',color:'var(--muted)'}}>{tx.id}</td>
                          <td style={{fontWeight:600}}>{tx.product}</td>
                          <td style={{fontFamily:"'JetBrains Mono',monospace",color:'var(--neon)',fontSize:'0.75rem'}}>{tx.amount}</td>
                          <td><span className={`status-pill pill-${tx.status}`}>{tx.status.toUpperCase()}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className={styles.panel}>
                <div className={styles.panelTitle}>⚡ REAL-TIME ACTIVITY</div>
                {[
                  {icon:'🔐',text:<><strong>Icarus_Alpha</strong> locked 1,099 WUSD for iPhone 15 Pro Max</>,t:'2m ago'},
                  {icon:'🤖',text:<><strong>Nexus_Beta</strong> negotiated 12% off Sony headphones</>,t:'14m ago'},
                  {icon:'✅',text:<><strong>Escrow #482</strong> released — MacBook delivery confirmed</>,t:'1h ago'},
                  {icon:'🚀',text:<><strong>Nova_Gamma</strong> deployed on Weilchain Testnet</>,t:'3h ago'},
                ].map((f,i)=>(
                  <div key={i} className={styles.feedItem}>
                    <span className={styles.feedIcon}>{f.icon}</span>
                    <span className={styles.feedText}>{f.text}</span>
                    <span className={styles.feedTime}>{f.t}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ════════════════ MY AGENTS ════════════════ */}
          {activeNav==='agents' && (
            <>
              <SectionHeader title="MY AGENTS" sub="Manage and monitor your deployed AI negotiation agents." />

              {/* Stats */}
              <div className={styles.kpiGrid}>
                {[
                  {emoji:'🤖',val:'3',     label:'Total Agents',   sub:'2 active, 1 idle'},
                  {emoji:'✅',val:'18',    label:'Transactions',   sub:'all time'},
                  {emoji:'💰',val:'12.4%', label:'Avg Savings',    sub:'vs market price'},
                  {emoji:'⚡',val:'2',     label:'Active Now',     sub:'negotiating live'},
                ].map(c=>(
                  <div key={c.label} className={styles.kpiCard}>
                    <span className={styles.kpiEmoji}>{c.emoji}</span>
                    <div className={styles.kpiVal}>{c.val}</div>
                    <span className={styles.kpiLabel}>{c.label}</span>
                    <div className={styles.kpiSub}>↑ {c.sub}</div>
                  </div>
                ))}
              </div>

              {/* Filter */}
              <div style={{display:'flex',gap:8,marginBottom:20}}>
                {['all','active','idle'].map(f=>(
                  <button key={f}
                    onClick={()=>setAgentFilter(f)}
                    style={{
                      padding:'5px 14px',
                      background: agentFilter===f?'rgba(0,255,200,0.1)':'none',
                      border:`1px solid ${agentFilter===f?'var(--neon)':'var(--border)'}`,
                      color: agentFilter===f?'var(--neon)':'var(--muted)',
                      borderRadius:3,cursor:'pointer',
                      fontFamily:"'JetBrains Mono',monospace",fontSize:'0.7rem',letterSpacing:'0.08em',
                      transition:'all 0.2s',
                    }}
                  >{f.toUpperCase()}</button>
                ))}
                <button className="btn-primary" style={{marginLeft:'auto',fontSize:'0.75rem'}} onClick={()=>setShowModal(true)}>
                  + Deploy New Agent
                </button>
              </div>

              {/* Agent cards */}
              <div style={{display:'flex',flexDirection:'column',gap:14}}>
                {filteredAgents.map(ag=>(
                  <div key={ag.name} className={styles.panel} style={{margin:0,display:'flex',alignItems:'center',gap:20,padding:'20px 24px'}}>
                    <div style={{
                      width:52,height:52,borderRadius:'50%',flexShrink:0,
                      background:'rgba(0,255,200,0.08)',border:'1px solid rgba(0,255,200,0.2)',
                      display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.6rem',
                    }}>{ag.emoji}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:700,fontSize:'1rem',color:'var(--text)',marginBottom:3}}>{ag.name}</div>
                      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'0.68rem',color:'var(--muted)'}}>{ag.task}</div>
                    </div>
                    <div style={{display:'flex',gap:24,flexShrink:0}}>
                      {[
                        {label:'BUDGET',val:ag.budget},
                        {label:'SAVINGS',val:ag.savings},
                        {label:'TXNS',val:ag.txns},
                      ].map(s=>(
                        <div key={s.label} style={{textAlign:'center'}}>
                          <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:'1.3rem',color:'var(--neon)',lineHeight:1}}>{s.val}</div>
                          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'0.58rem',color:'var(--muted)',letterSpacing:'0.1em'}}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
                      <span style={{
                        width:8,height:8,borderRadius:'50%',flexShrink:0,
                        background:ag.status==='active'?'var(--neon)':'var(--muted)',
                        boxShadow:ag.status==='active'?'0 0 8px var(--neon)':'none',
                      }}/>
                      <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'0.65rem',color:ag.status==='active'?'var(--neon)':'var(--muted)',textTransform:'uppercase'}}>
                        {ag.status}
                      </span>
                    </div>
                    {ag.status==='idle' && (
                      <button className="btn-primary" style={{fontSize:'0.7rem',padding:'6px 12px',flexShrink:0}}>▶ Activate</button>
                    )}
                    {ag.status==='active' && (
                      <button className="btn-secondary" style={{fontSize:'0.7rem',padding:'6px 12px',flexShrink:0}}>⏸ Pause</button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ════════════════ ESCROW ════════════════ */}
          {activeNav==='escrow' && (
            <>
              <SectionHeader title="ESCROW MANAGER" sub="Track all on-chain escrow contracts and their status." />

              <div className={styles.kpiGrid}>
                {[
                  {emoji:'🔐',val:'5',        label:'Open Escrows',    sub:'currently active'},
                  {emoji:'💰',val:'340 WUSD',  label:'Total Locked',    sub:'in escrow contracts'},
                  {emoji:'✅',val:'24',         label:'Released',        sub:'all time'},
                  {emoji:'⚡',val:'0',          label:'Disputes',        sub:'no conflicts'},
                ].map(c=>(
                  <div key={c.label} className={styles.kpiCard}>
                    <span className={styles.kpiEmoji}>{c.emoji}</span>
                    <div className={styles.kpiVal}>{c.val}</div>
                    <span className={styles.kpiLabel}>{c.label}</span>
                    <div className={styles.kpiSub}>↑ {c.sub}</div>
                  </div>
                ))}
              </div>

              {/* Filter */}
              <div style={{display:'flex',gap:8,marginBottom:20}}>
                {['all','locked','pending','released'].map(f=>(
                  <button key={f}
                    onClick={()=>setEscrowFilter(f)}
                    style={{
                      padding:'5px 14px',
                      background: escrowFilter===f?'rgba(0,255,200,0.1)':'none',
                      border:`1px solid ${escrowFilter===f?'var(--neon)':'var(--border)'}`,
                      color: escrowFilter===f?'var(--neon)':'var(--muted)',
                      borderRadius:3,cursor:'pointer',
                      fontFamily:"'JetBrains Mono',monospace",fontSize:'0.7rem',letterSpacing:'0.08em',
                      transition:'all 0.2s',
                    }}
                  >{f.toUpperCase()}</button>
                ))}
              </div>

              <div className={styles.panel} style={{margin:0}}>
                <table className={styles.txTable} style={{width:'100%'}}>
                  <thead>
                    <tr>
                      <th>ESCROW ID</th><th>PRODUCT</th><th>AMOUNT</th>
                      <th>BUYER</th><th>STATUS</th><th>BLOCK</th><th>CREATED</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEscrows.map(e=>(
                      <tr key={e.id}>
                        <td style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'0.68rem',color:'var(--neon)'}}>{e.id}</td>
                        <td style={{fontWeight:600}}>{e.product}</td>
                        <td style={{fontFamily:"'JetBrains Mono',monospace",color:'var(--neon)',fontSize:'0.75rem'}}>{e.amount}</td>
                        <td style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'0.68rem',color:'var(--muted)'}}>{e.buyer}</td>
                        <td><span className={`status-pill pill-${e.status}`}>{e.status.toUpperCase()}</span></td>
                        <td style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'0.68rem',color:'var(--muted)'}}>{e.block}</td>
                        <td style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'0.65rem',color:'var(--muted)'}}>{e.created}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ════════════════ AUDIT LOG ════════════════ */}
          {activeNav==='audit' && (
            <>
              <SectionHeader title="AUDIT LOG" sub="Full on-chain transaction history and agent activity." />

              <div className={styles.kpiGrid}>
                {[
                  {emoji:'📋',val:'8',    label:'Events Today',  sub:'last 24 hours'},
                  {emoji:'⛓',val:'4821', label:'Current Block', sub:'weilchain testnet'},
                  {emoji:'🤖',val:'3',    label:'Agents Active', sub:'logging events'},
                  {emoji:'🔒',val:'100%', label:'Integrity',     sub:'all hashes valid'},
                ].map(c=>(
                  <div key={c.label} className={styles.kpiCard}>
                    <span className={styles.kpiEmoji}>{c.emoji}</span>
                    <div className={styles.kpiVal}>{c.val}</div>
                    <span className={styles.kpiLabel}>{c.label}</span>
                    <div className={styles.kpiSub}>↑ {c.sub}</div>
                  </div>
                ))}
              </div>

              <div className={styles.panel} style={{margin:0}}>
                <div className={styles.panelTitle}>BLOCKCHAIN EVENTS</div>
                <div style={{display:'flex',flexDirection:'column',gap:0}}>
                  {AUDIT_LOGS.map((log,i)=>(
                    <div key={i} style={{
                      display:'flex',alignItems:'flex-start',gap:14,
                      padding:'14px 0',
                      borderBottom: i<AUDIT_LOGS.length-1 ? '1px solid var(--border)' : 'none',
                    }}>
                      {/* Icon */}
                      <div style={{
                        width:34,height:34,borderRadius:'50%',flexShrink:0,
                        background:`${AUDIT_COLORS[log.type]}18`,
                        border:`1px solid ${AUDIT_COLORS[log.type]}44`,
                        display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1rem',
                      }}>{AUDIT_ICONS[log.type]}</div>

                      {/* Content */}
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3,flexWrap:'wrap'}}>
                          <span style={{
                            fontFamily:"'JetBrains Mono',monospace",fontSize:'0.68rem',
                            fontWeight:700,color:AUDIT_COLORS[log.type],letterSpacing:'0.08em',
                          }}>{log.event}</span>
                          <span style={{
                            fontFamily:"'JetBrains Mono',monospace",fontSize:'0.62rem',
                            color:'var(--muted)',background:'var(--surface2)',
                            border:'1px solid var(--border)',padding:'1px 6px',borderRadius:2,
                          }}>{log.agent}</span>
                        </div>
                        <div style={{fontSize:'0.78rem',color:'var(--muted)',marginBottom:4,lineHeight:1.4}}>
                          {log.detail}
                        </div>
                        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'0.62rem',color:'rgba(0,255,200,0.4)'}}>
                          TX: {log.hash}
                        </div>
                      </div>

                      {/* Time */}
                      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'0.62rem',color:'var(--muted)',flexShrink:0,whiteSpace:'nowrap'}}>
                        {log.time}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ════════════════ REPUTATION NFTs ════════════════ */}
          {activeNav==='nfts' && (
            <>
              <SectionHeader title="REPUTATION NFTs" sub="Your on-chain reputation badges earned through verified trades." />

              <div className={styles.kpiGrid}>
                {[
                  {emoji:'🏆',val:'4',    label:'NFTs Earned',   sub:'out of 12 total'},
                  {emoji:'⭐',val:'4.8',  label:'Trust Score',   sub:'based on trades'},
                  {emoji:'💎',val:'GOLD', label:'Current Tier',  sub:'750 XP achieved'},
                  {emoji:'🔥',val:'18',   label:'Trades Done',   sub:'all verified'},
                ].map(c=>(
                  <div key={c.label} className={styles.kpiCard}>
                    <span className={styles.kpiEmoji}>{c.emoji}</span>
                    <div className={styles.kpiVal}>{c.val}</div>
                    <span className={styles.kpiLabel}>{c.label}</span>
                    <div className={styles.kpiSub}>↑ {c.sub}</div>
                  </div>
                ))}
              </div>

              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16}}>
                {[
                  {emoji:'🛒',name:'First Trade',  desc:'Complete your first purchase',      earned:true,  color:'#00ffc8'},
                  {emoji:'🤖',name:'Agent Master', desc:'Deploy 3+ AI agents',               earned:true,  color:'#7b2fff'},
                  {emoji:'💎',name:'Diamond Hands',desc:'Hold 1000+ WUSD',                   earned:false, color:'#00d4ff'},
                  {emoji:'🔐',name:'Escrow Pro',   desc:'Complete 5 escrow contracts',       earned:true,  color:'#ffd93d'},
                  {emoji:'⚡',name:'Speed Trader', desc:'3 trades in one day',               earned:false, color:'#ff6b35'},
                  {emoji:'🏆',name:'Top Negotiator',desc:'Save 15%+ on a single trade',     earned:true,  color:'#ff4757'},
                  {emoji:'🌐',name:'Chain Native', desc:'100% on-chain transactions',        earned:false, color:'#00ffc8'},
                  {emoji:'🎯',name:'Zero Disputes', desc:'10 trades with no disputes',       earned:false, color:'#7b2fff'},
                ].map(nft=>(
                  <div key={nft.name} style={{
                    background: nft.earned?`${nft.color}0d`:'var(--surface)',
                    border:`1px solid ${nft.earned?nft.color:'var(--border)'}`,
                    borderRadius:8,padding:'20px 16px',textAlign:'center',
                    opacity: nft.earned?1:0.45,
                    transition:'transform 0.2s',cursor:'pointer',
                  }}
                    onMouseEnter={e=>e.currentTarget.style.transform='translateY(-4px)'}
                    onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}
                  >
                    <div style={{fontSize:'2.2rem',marginBottom:10}}>{nft.emoji}</div>
                    <div style={{fontWeight:700,fontSize:'0.85rem',color: nft.earned?nft.color:'var(--text)',marginBottom:5}}>{nft.name}</div>
                    <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'0.62rem',color:'var(--muted)',lineHeight:1.4}}>{nft.desc}</div>
                    {nft.earned && (
                      <div style={{marginTop:10,fontFamily:"'JetBrains Mono',monospace",fontSize:'0.6rem',color:nft.color,letterSpacing:'0.1em'}}>✓ EARNED</div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ════════════════ REWARDS ════════════════ */}
          {activeNav==='rewards' && (
            <>
              <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle} style={{color:'#ffd93d'}}>🎮 REWARDS & GAMES</h1>
                <p className={styles.pageSub}>Earn XP, spin for discounts, unlock mystery boxes.</p>
              </div>

              <div className={styles.rewardsGrid}>
                <div className={styles.panel}>
                  <div className={styles.panelTitle} style={{color:'#ffd93d'}}>🎰 SPIN THE WHEEL</div>
                  <div className={styles.spinWrap}>
                    <canvas ref={spinRef} width={220} height={220}
                      style={{borderRadius:'50%',border:'2px solid var(--border)',cursor:'pointer'}}
                      onClick={spinWheel}/>
                    <button className="btn-primary" onClick={spinWheel} disabled={spinning}>
                      {spinning?'⟳ SPINNING...':'🎰 SPIN TO WIN'}
                    </button>
                    {spinResult && <div className={styles.spinResult}>🎉 YOU WON: {spinResult}</div>}
                  </div>
                </div>

                <div className={styles.panel}>
                  <div className={styles.panelTitle} style={{color:'#ffd93d'}}>🏆 REWARD POINTS</div>
                  <div style={{display:'flex',justifyContent:'space-between',fontFamily:"'JetBrains Mono',monospace",fontSize:'0.72rem',marginBottom:6}}>
                    <span style={{color:'var(--muted)'}}>XP Progress</span>
                    <span style={{color:'#ffd93d'}}>{rewardXP} / 1000</span>
                  </div>
                  <div style={{background:'var(--surface2)',borderRadius:4,height:10,overflow:'hidden',marginBottom:14}}>
                    <div style={{height:'100%',width:`${rewardXP/10}%`,background:'linear-gradient(90deg,var(--neon),var(--cyan))',borderRadius:4,transition:'width 1s ease'}}/>
                  </div>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'0.68rem',color:'var(--muted)',marginBottom:14}}>
                    {1000-rewardXP} XP until GOLD tier 🥇
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:14}}>
                    {[{e:'🛒',l:'First Buy',done:true},{e:'🤖',l:'Deploy',done:true},{e:'🔐',l:'5 Escrows',done:false},{e:'💎',l:'1000 WUSD',done:false}].map(b=>(
                      <div key={b.l} style={{background:b.done?'rgba(0,255,200,0.08)':'var(--surface2)',border:`1px solid ${b.done?'var(--neon)':'var(--border)'}`,borderRadius:3,padding:'10px 6px',textAlign:'center',opacity:b.done?1:0.5}}>
                        <div style={{fontSize:'1.3rem'}}>{b.e}</div>
                        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'0.6rem',color:b.done?'var(--neon)':'var(--muted)'}}>{b.l}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{border:'1px solid #ffd93d',borderRadius:4,padding:14,textAlign:'center',cursor:'pointer',background:'linear-gradient(135deg,rgba(255,217,61,0.08),rgba(0,255,200,0.08))'}}
                    onClick={()=>{setSpinResult('🎁 Mystery: 25% OFF!');setRewardXP(x=>Math.min(1000,x+100))}}
                    onMouseEnter={e=>e.currentTarget.style.transform='scale(1.02)'}
                    onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}
                    style={{border:'1px solid #ffd93d',borderRadius:4,padding:14,textAlign:'center',cursor:'pointer',background:'linear-gradient(135deg,rgba(255,217,61,0.08),rgba(0,255,200,0.08))',transition:'transform 0.2s'}}
                  >
                    <div style={{fontSize:'2rem'}}>🎁</div>
                    <div style={{fontFamily:"'Bebas Neue',cursive",color:'#ffd93d',fontSize:'1rem',letterSpacing:'0.1em'}}>MYSTERY BOX</div>
                    <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'0.65rem',color:'var(--muted)',marginTop:3}}>Click to open for surprise discount</div>
                  </div>
                </div>
              </div>

              <div className={styles.panel} style={{marginTop:0}}>
                <div className={styles.panelTitle} style={{color:'#ffd93d'}}>⚡ DAILY DEALS</div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
                  {[
                    {name:'Flash Sale: MacBook Pro',disc:'15% OFF',emoji:'💻',expires:'02:34:18',color:'var(--neon)'},
                    {name:'Bundle Deal: Audio Setup',disc:'20% OFF',emoji:'🎧',expires:'05:12:44',color:'#7b2fff'},
                    {name:'Agent Boost: Double XP',  disc:'2X XP',  emoji:'🤖',expires:'11:58:02',color:'#ffd93d'},
                  ].map(d=>(
                    <div key={d.name} style={{background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:4,padding:14,borderTop:`2px solid ${d.color}`}}>
                      <div style={{fontSize:'1.5rem',marginBottom:6}}>{d.emoji}</div>
                      <div style={{fontWeight:700,fontSize:'0.82rem',marginBottom:4}}>{d.name}</div>
                      <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:'1.4rem',color:d.color,lineHeight:1,marginBottom:6}}>{d.disc}</div>
                      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'0.62rem',color:'var(--muted)'}}>⏰ {d.expires}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

        </main>
      </div>

      {/* Deploy Modal */}
      {showModal && (
        <div style={{position:'fixed',inset:0,background:'rgba(2,8,16,0.88)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center'}}
          onClick={e=>{if(e.target===e.currentTarget)setShowModal(false)}}>
          <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:8,padding:32,width:420,maxWidth:'90vw'}}>
            <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:'1.6rem',letterSpacing:'0.08em',color:'var(--neon)',marginBottom:22}}>DEPLOY NEW AGENT</div>
            {[
              {label:'AGENT NAME',       placeholder:'Nexus_Delta'},
              {label:'MAX BUDGET (WUSD)',placeholder:'500'},
              {label:'TARGET PRODUCT',   placeholder:'e.g. Samsung Galaxy S25'},
            ].map(f=>(
              <div key={f.label} style={{marginBottom:14}}>
                <label style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'0.62rem',color:'var(--muted)',letterSpacing:'0.1em',display:'block',marginBottom:5}}>{f.label}</label>
                <input style={{width:'100%',boxSizing:'border-box',background:'var(--surface2)',border:'1px solid var(--border)',color:'var(--text)',padding:'10px 14px',borderRadius:4,outline:'none',fontSize:'0.85rem'}}
                  placeholder={f.placeholder}/>
              </div>
            ))}
            <div style={{display:'flex',gap:10,marginTop:22}}>
              <button className="btn-primary" style={{flex:1}} onClick={()=>setShowModal(false)}>🚀 Deploy Agent</button>
              <button className="btn-secondary" onClick={()=>setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}