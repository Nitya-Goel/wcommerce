'use client'
import { useRef } from 'react'
import { useApp } from '@/context/AppContext'
import styles from './ProductCard.module.css'

export default function ProductCard({ product, onAgentNegotiate, delay = 0 }) {
  const { addToCart } = useApp()
  const cardRef = useRef(null)

  // ── Magnetic 3D tilt on hover ──
  function handleMouseMove(e) {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const cx = rect.width / 2
    const cy = rect.height / 2
    const rotX = ((y - cy) / cy) * -8
    const rotY = ((x - cx) / cx) * 8
    card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(10px)`
  }
  function handleMouseLeave() {
    const card = cardRef.current
    if (!card) return
    card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateZ(0)'
    card.style.transition = 'transform 0.5s cubic-bezier(0.23,1,0.32,1)'
  }
  function handleMouseEnter() {
    const card = cardRef.current
    if (!card) return
    card.style.transition = 'transform 0.1s ease'
  }

  return (
    <div
      ref={cardRef}
      className={`${styles.card} reveal`}
      style={{ animationDelay: `${delay}s` }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
    >
      <div className={styles.imgArea} style={{ background: product.imgBg }}>
        <div className={styles.cornerTL} /><div className={styles.cornerBR} />
        <div className={styles.badges}>
          {product.badges.map(b => (
            <span key={b} className={`badge ${b}`}>
              {b==='badge-ai'?'AI':b==='badge-hot'?'🔥 HOT':b==='badge-new'?'NEW':'WUSD'}
            </span>
          ))}
        </div>
        <div className={styles.emoji} style={{ filter: `drop-shadow(0 0 18px ${product.imgGlow})` }}>
          {product.emoji}
        </div>
        <div className={styles.scanLine} />
      </div>

      <div className={styles.info}>
        <div className={styles.category}>{product.category.toUpperCase()} · WEILCHAIN</div>
        <div className={styles.name}>{product.name}</div>
        <div className={styles.desc}>{product.desc}</div>
        <div className={styles.footer}>
          <div className={styles.price}>
            <div className={styles.priceVal}>{product.price} WUSD</div>
            <div className={styles.priceUsd}>≈ ${product.price}.00</div>
          </div>
          <div className={styles.actions}>
            <button className={styles.agentBtn} onClick={() => onAgentNegotiate?.(product)} title="Let Icarus negotiate">🤖</button>
            <button className={`${styles.buyBtn} ripple-btn`} onClick={() => addToCart(product)}>BUY</button>
          </div>
        </div>
        <div className={styles.meta}>
          <div className={styles.seller}>
            <div className={styles.sellerAvatar}>◈</div>
            {product.seller}
          </div>
          <div className={styles.rating}>★ {product.rating} <span style={{color:'var(--muted)'}}>({product.reviews})</span></div>
        </div>
      </div>
    </div>
  )
}