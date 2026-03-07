'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import styles from './login.module.css'

export default function LoginPage() {
  const router = useRouter()
  const [isOn, setIsOn]         = useState(false)
  const [pullDist, setPullDist] = useState(0)
  const [snapping, setSnapping] = useState(false)
  const [burst, setBurst]       = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [shake, setShake]       = useState(false)
  const [mouse, setMouse]       = useState({ x: 0.5, y: 0.5 })
  const dragging = useRef(false)
  const startY   = useRef(0)

  useEffect(() => {
    const fn = e => setMouse({ x: e.clientX/window.innerWidth, y: e.clientY/window.innerHeight })
    window.addEventListener('mousemove', fn)
    return () => window.removeEventListener('mousemove', fn)
  }, [])

  const onDown = e => {
    e.currentTarget.setPointerCapture(e.pointerId)
    dragging.current = true; startY.current = e.clientY
  }
  const onMove = e => {
    if (!dragging.current) return
    setPullDist(Math.max(0, Math.min(90, e.clientY - startY.current)))
  }
  const onUp = () => {
    if (!dragging.current) return
    dragging.current = false
    if (pullDist > 30) {
      setSnapping(true)
      setPullDist(0)
      setTimeout(() => {
        setSnapping(false)
        const next = !isOn
        setIsOn(next)
        if (next) { setBurst(true); setTimeout(() => setBurst(false), 800) }
      }, 380)
    } else { setPullDist(0) }
  }

  const login = () => {
    if (!username || !password) { setShake(true); setTimeout(() => setShake(false), 550); return }
    setLoggedIn(true)
    setTimeout(() => router.push('/marketplace'), 1500)
  }

  const px = (mouse.x - 0.5) * 14
  const py = (mouse.y - 0.5) * 8

  return (
    <div className={`${styles.scene} ${isOn ? styles.on : styles.off}`}>

      {/* STARS */}
      <div className={`${styles.stars} ${isOn ? styles.fadeStars : ''}`}>
        {[...Array(40)].map((_,i) => (
          <span key={i} className={styles.star} style={{
            left: `${(i*41.3+13)%100}%`, top: `${(i*57.1+9)%80}%`,
            '--d': `${1.5+(i%6)*0.5}s`, '--dl': `${(i%8)*0.3}s`, '--s': `${1+(i%3)}px`
          }}/>
        ))}
      </div>

      {/* LIGHT RAYS when on */}
      {isOn && (
        <div className={styles.rays} style={{
          transform: `translate(${px*0.4}px, ${py*0.2}px)`
        }}/>
      )}
      {isOn && <div className={styles.floorReflect}/>}

      {/* ════ LAMP ════ */}
      <div className={styles.lampGroup} style={{
        transform: `translate(${-px*0.3}px, ${-py*0.15}px)`
      }}>
        {/* wire from ceiling */}
        <div className={styles.ceilWire}/>

        {/* Light cone */}
        <div className={`${styles.cone} ${isOn ? styles.coneOn : ''}`}/>

        {/* Shade */}
        <div className={`${styles.shade} ${isOn ? styles.shadeOn : ''}`}>
          {isOn && <div className={styles.bulbFlare}/>}
          {/* Face */}
          <div className={styles.face}>
            <div className={styles.eyes}>
              <div className={`${styles.eye} ${!isOn ? styles.eyeSleep : ''}`}>
                {isOn && <div className={styles.pupil}/>}
              </div>
              <div className={`${styles.eye} ${!isOn ? styles.eyeSleep : ''}`}>
                {isOn && <div className={styles.pupil}/>}
              </div>
            </div>
            {isOn
              ? <div className={styles.smile}/>
              : <div className={styles.sleepy}>～ ～</div>
            }
            {isOn && <><div className={styles.blush} style={{left:'18%'}}/><div className={styles.blush} style={{right:'18%'}}/></>}
          </div>
        </div>

        {/* Pole + Base */}
        <div className={styles.pole}/>
        <div className={styles.base}/>

        {/* ── STRING ── */}
        <div
          className={`${styles.stringGroup} ${snapping ? styles.snap : ''}`}
          style={{ transform: `translateY(${pullDist}px)` }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        >
          <div className={styles.thread}/>
          <div className={`${styles.bead} ${isOn ? styles.beadOn : ''}`}>
            <div className={styles.beadHighlight}/>
          </div>
          <div className={styles.pullLabel}>
            {pullDist > 10 ? '✓ release' : isOn ? '↑ pull off' : '↓ pull on'}
          </div>
        </div>

        {/* BURST */}
        {burst && [...Array(14)].map((_,i) => (
          <div key={i} className={styles.burst}
            style={{ '--a': `${(360/14)*i}deg`, '--r': `${55+Math.random()*35}px` }}
          />
        ))}
      </div>

      {/* ════ CARD ════ */}
      <div className={`${styles.card} ${isOn ? styles.cardOn : styles.cardOff} ${shake ? styles.shake : ''} ${loggedIn ? styles.cardWin : ''}`}>
        <div className={styles.cardBar}/>
        <div className={styles.cardShine}/>

        <div className={styles.brand}>
          <span className={styles.hex}>⬡</span>
          <span>W-Commerce</span>
          <span className={styles.brandX}>X</span>
        </div>
        <div className={styles.net}>WEILCHAIN · TESTNET · WUSD</div>

        {!loggedIn ? (<>
          <h2 className={styles.heading}>Welcome Back</h2>

          <div className={styles.field}>
            <label>WALLET / USERNAME</label>
            <div className={styles.row}>
              <span className={styles.ico}>◈</span>
              <input type="text" placeholder="0x… or handle"
                value={username} onChange={e => setUsername(e.target.value)}
                onKeyDown={e => e.key==='Enter' && login()}/>
            </div>
          </div>

          <div className={styles.field}>
            <label>PASSWORD</label>
            <div className={styles.row}>
              <span className={styles.ico}>⚿</span>
              <input type="password" placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key==='Enter' && login()}/>
            </div>
          </div>

          <button className={styles.loginBtn} onClick={login}>
            <div className={styles.btnFill}/>
            <span>ENTER MARKETPLACE</span>
            <span className={styles.arr}>→</span>
          </button>

          <div className={styles.or}><span>or</span></div>
          <button className={styles.guestBtn} onClick={() => router.push('/marketplace')}>
            Browse as Guest ↗
          </button>
        </>) : (
          <div className={styles.success}>
            <div className={styles.successOrb}>◈</div>
            <div className={styles.successTitle}>ACCESS GRANTED</div>
            <div className={styles.successSub}>Loading marketplace…</div>
            <div className={styles.progress}><div className={styles.fill}/></div>
          </div>
        )}
      </div>

      {/* OFF hint */}
      {!isOn && (
        <div className={styles.hint}>
          <span className={styles.hintDot}/>
          Drag the string downward to wake the lamp
        </div>
      )}
    </div>
  )
}