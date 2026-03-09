'use client'
import { useRef, useEffect } from 'react'
import { useApp } from '@/context/AppContext'
import styles from './ProductCard.module.css'

// Load GSAP + MorphSVG once
function useGSAP() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.__gsapLoaded) return
    const s1 = document.createElement('script')
    s1.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.4.0/gsap.min.js'
    s1.onload = () => {
      const s2 = document.createElement('script')
      s2.src = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/16327/MorphSVGPlugin3.min.js'
      s2.onload = () => {
        window.gsap.registerPlugin(window.MorphSVGPlugin)
        window.__gsapLoaded = true
      }
      document.head.appendChild(s2)
    }
    document.head.appendChild(s1)
  }, [])
}

function AddToCartBtn({ product, onAdd }) {
  const btnRef = useRef(null)

  function handleClick(e) {
    e.preventDefault()
    const button = btnRef.current
    if (!button || button.classList.contains('atc-active')) return
    const gsap = window.gsap
    if (!gsap || !window.MorphSVGPlugin) {
      // fallback if GSAP not loaded yet
      onAdd(product)
      return
    }

    button.classList.add('atc-active')
    onAdd(product)

    const morph = button.querySelector('.atc-morph path')
    const shirt = button.querySelectorAll('.atc-shirt svg > path')

    gsap.to(button, {
      keyframes: [
        { '--atc-bg-scale': .97, duration: .15 },
        { '--atc-bg-scale': 1, delay: .125, duration: 1.2, ease: 'elastic.out(1, .6)' }
      ]
    })

    gsap.to(button, {
      keyframes: [
        { '--atc-shirt-scale': 1, '--atc-shirt-y': '-42px', '--atc-cart-x': '0px', '--atc-cart-scale': 1, duration: .4, ease: 'power1.in' },
        { '--atc-shirt-y': '-40px', duration: .3 },
        { '--atc-shirt-y': '16px', '--atc-shirt-scale': .9, duration: .25, ease: 'none' },
        { '--atc-shirt-scale': 0, duration: .3, ease: 'none' }
      ]
    })

    gsap.to(button, { '--atc-shirt-second-y': '0px', delay: .835, duration: .12 })

    gsap.to(button, {
      keyframes: [
        { '--atc-cart-clip': '12px', '--atc-cart-clip-x': '3px', delay: .9, duration: .06 },
        { '--atc-cart-y': '2px', duration: .1 },
        { '--atc-cart-tick-offset': '0px', '--atc-cart-y': '0px', duration: .2 },
        { '--atc-cart-x': '52px', '--atc-cart-rotate': '-15deg', duration: .2 },
        {
          '--atc-cart-x': '104px', '--atc-cart-rotate': '0deg', duration: .2,
          onComplete() {
            button.style.setProperty('--atc-text-o', 0)
            button.style.setProperty('--atc-text-x', '0px')
            button.style.setProperty('--atc-cart-x', '-104px')
          }
        },
        {
          '--atc-text-o': 1, '--atc-text-x': '12px',
          '--atc-cart-x': '-48px', '--atc-cart-scale': .75,
          duration: .25,
          onComplete() { button.classList.remove('atc-active') }
        }
      ]
    })

    gsap.to(button, { keyframes: [{ '--atc-text-o': 0, duration: .3 }] })

    if (morph) {
      gsap.to(morph, {
        keyframes: [
          { morphSVG: 'M0 12C6 12 20 10 32 0C43.9024 9.99999 58 12 64 12V13H0V12Z', duration: .25, ease: 'power1.out' },
          { morphSVG: 'M0 12C6 12 17 12 32 12C47.9024 12 58 12 64 12V13H0V12Z', duration: .15, ease: 'none' }
        ]
      })
    }

    if (shirt?.length) {
      gsap.to(shirt, {
        keyframes: [
          { morphSVG: 'M4.99997 3L8.99997 1.5C8.99997 1.5 10.6901 3 12 3C13.3098 3 15 1.5 15 1.5L19 3L23.5 8L20.5 11L19 9.5L18 22.5C18 22.5 14 21.5 12 21.5C10 21.5 5.99997 22.5 5.99997 22.5L4.99997 9.5L3.5 11L0.5 8L4.99997 3Z', duration: .25, delay: .25 },
          { morphSVG: 'M4.99997 3L8.99997 1.5C8.99997 1.5 10.6901 3 12 3C13.3098 3 15 1.5 15 1.5L19 3L23.5 8L20.5 11L19 9.5L18.5 22.5C18.5 22.5 13.5 22.5 12 22.5C10.5 22.5 5.5 22.5 5.5 22.5L4.99997 9.5L3.5 11L0.5 8L4.99997 3Z', duration: .85, ease: 'elastic.out(1, .5)' },
          { morphSVG: 'M4.99997 3L8.99997 1.5C8.99997 1.5 10.6901 3 12 3C13.3098 3 15 1.5 15 1.5L19 3L22.5 8L19.5 10.5L19 9.5L17.1781 18.6093C17.062 19.1901 16.778 19.7249 16.3351 20.1181C15.4265 20.925 13.7133 22.3147 12 23C10.2868 22.3147 8.57355 20.925 7.66487 20.1181C7.22198 19.7249 6.93798 19.1901 6.82183 18.6093L4.99997 9.5L4.5 10.5L1.5 8L4.99997 3Z', duration: 0, delay: 1.25 }
        ]
      })
    }
  }

  return (
    <button ref={btnRef} className={styles.atcBtn} onClick={handleClick}>
      <span>ADD TO CART</span>

      {/* morph wave */}
      <svg className="atc-morph" viewBox="0 0 64 13" style={{
        width:64,height:13,position:'absolute',
        left:'50%',top:-12,marginLeft:-32,
        pointerEvents:'none',
        fill:'var(--atc-morph-fill)',
        transition:'fill 0.25s'
      }}>
        <path d="M0 12C6 12 17 12 32 12C47.9024 12 58 12 64 12V13H0V12Z"/>
      </svg>

      {/* shirt */}
      <div className="atc-shirt" style={{
        pointerEvents:'none',position:'absolute',
        left:'50%',margin:'-12px 0 0 -12px',top:0,
        transformOrigin:'50% 100%',
        transform:'translateY(var(--atc-shirt-y)) scale(var(--atc-shirt-scale))'
      }}>
        <svg viewBox="0 0 24 24" style={{width:24,height:24,display:'block',fill:'var(--neon)',strokeLinecap:'round',strokeLinejoin:'round'}}>
          <path d="M4.99997 3L8.99997 1.5C8.99997 1.5 10.6901 3 12 3C13.3098 3 15 1.5 15 1.5L19 3L22.5 8L19.5 10.5L19 9.5L17.1781 18.6093C17.062 19.1901 16.778 19.7249 16.3351 20.1181C15.4265 20.925 13.7133 22.3147 12 23C10.2868 22.3147 8.57355 20.925 7.66487 20.1181C7.22198 19.7249 6.93798 19.1901 6.82183 18.6093L4.99997 9.5L4.5 10.5L1.5 8L4.99997 3Z"/>
          <g style={{fill:'var(--bg)'}}>
            <path d="M16.3516 9.65383H14.3484V7.83652H14.1742V9.8269H16.5258V7.83652H16.3516V9.65383Z"/><path d="M14.5225 6.01934V7.66357H14.6967V7.4905H14.8186V7.66357H14.9928V6.01934H14.8186V7.31742H14.6967V6.01934H14.5225Z"/><path d="M14.1742 5.67319V7.66357H14.3484V5.84627H16.3516V7.66357H16.5258V5.67319H14.1742Z"/><path d="M15.707 9.48071H15.8812V9.28084L16.0032 9.4807V9.48071H16.1774V7.83648H16.0032V9.14683L15.8812 8.94697V7.83648H15.707V9.48071Z"/><path d="M15.5852 6.01931H15.1149V6.19238H15.5852V6.01931Z"/><path d="M15.707 6.01934V7.66357H15.8812V7.46371L16.0032 7.66357H16.1774V6.01934H16.0032V7.32969L15.8812 7.12984V6.01934H15.707Z"/><path d="M15.411 7.31742H15.2891V6.53857H15.411V7.31742ZM15.1149 7.66357H15.2891V7.4905H15.411V7.66357H15.5852V6.3655H15.1149V7.66357Z"/><path d="M14.5225 8.69756L14.8186 9.18291V9.30763H14.6967V9.13455H14.5225V9.48071H14.9928V9.13456V9.13455L14.6967 8.64917V8.00956H14.8186V8.6586H14.9928V7.83648H14.5225V8.69756Z"/><path d="M15.411 9.30763H15.2891V8.00956H15.411V9.30763ZM15.1149 9.48071H15.5852V7.83648H15.1149V9.48071Z"/>
          </g>
        </svg>
        {/* second shirt (slides up inside) */}
        <svg viewBox="0 0 24 24" style={{
          width:24,height:24,display:'block',
          fill:'var(--bg)',
          position:'absolute',top:0,left:0,
          strokeLinecap:'round',strokeLinejoin:'round',
          clipPath:'polygon(0 var(--atc-shirt-second-y), 24px var(--atc-shirt-second-y), 24px 24px, 0 24px)'
        }}>
          <path d="M4.99997 3L8.99997 1.5C8.99997 1.5 10.6901 3 12 3C13.3098 3 15 1.5 15 1.5L19 3L22.5 8L19.5 10.5L19 9.5L17.1781 18.6093C17.062 19.1901 16.778 19.7249 16.3351 20.1181C15.4265 20.925 13.7133 22.3147 12 23C10.2868 22.3147 8.57355 20.925 7.66487 20.1181C7.22198 19.7249 6.93798 19.1901 6.82183 18.6093L4.99997 9.5L4.5 10.5L1.5 8L4.99997 3Z" style={{fill:'var(--neon)'}}/>
          <g style={{fill:'var(--bg)'}}>
            <path d="M16.3516 9.65383H14.3484V7.83652H14.1742V9.8269H16.5258V7.83652H16.3516V9.65383Z"/><path d="M14.5225 6.01934V7.66357H14.6967V7.4905H14.8186V7.66357H14.9928V6.01934H14.8186V7.31742H14.6967V6.01934H14.5225Z"/><path d="M14.1742 5.67319V7.66357H14.3484V5.84627H16.3516V7.66357H16.5258V5.67319H14.1742Z"/><path d="M15.707 9.48071H15.8812V9.28084L16.0032 9.4807V9.48071H16.1774V7.83648H16.0032V9.14683L15.8812 8.94697V7.83648H15.707V9.48071Z"/><path d="M15.5852 6.01931H15.1149V6.19238H15.5852V6.01931Z"/><path d="M15.707 6.01934V7.66357H15.8812V7.46371L16.0032 7.66357H16.1774V6.01934H16.0032V7.32969L15.8812 7.12984V6.01934H15.707Z"/><path d="M15.411 7.31742H15.2891V6.53857H15.411V7.31742ZM15.1149 7.66357H15.2891V7.4905H15.411V7.66357H15.5852V6.3655H15.1149V7.66357Z"/><path d="M14.5225 8.69756L14.8186 9.18291V9.30763H14.6967V9.13455H14.5225V9.48071H14.9928V9.13456V9.13455L14.6967 8.64917V8.00956H14.8186V8.6586H14.9928V7.83648H14.5225V8.69756Z"/><path d="M15.411 9.30763H15.2891V8.00956H15.411V9.30763ZM15.1149 9.48071H15.5852V7.83648H15.1149V9.48071Z"/>
          </g>
        </svg>
      </div>

      {/* cart */}
      <div className="atc-cart" style={{
        pointerEvents:'none',position:'absolute',
        left:'50%',top:10,marginLeft:-18,
        transform:'translate(var(--atc-cart-x), var(--atc-cart-y)) rotate(var(--atc-cart-rotate)) scale(var(--atc-cart-scale))'
      }}>
        <svg viewBox="0 0 36 26" style={{width:36,height:26,display:'block',strokeLinecap:'round',strokeLinejoin:'round'}}>
          <path d="M1 2.5H6L10 18.5H25.5L28.5 7.5L7.5 7.5" style={{fill:'none',stroke:'var(--neon)',strokeWidth:2}}/>
          <path d="M11.5 25C12.6046 25 13.5 24.1046 13.5 23C13.5 21.8954 12.6046 21 11.5 21C10.3954 21 9.5 21.8954 9.5 23C9.5 24.1046 10.3954 25 11.5 25Z" style={{fill:'none',stroke:'var(--neon)',strokeWidth:1.5}}/>
          <path d="M24 25C25.1046 25 26 24.1046 26 23C26 21.8954 25.1046 21 24 21C22.8954 21 22 21.8954 22 23C22 24.1046 22.8954 25 24 25Z" style={{fill:'none',stroke:'var(--neon)',strokeWidth:1.5}}/>
          <path d="M14.5 13.5L16.5 15.5L21.5 10.5" style={{fill:'none',stroke:'var(--neon3)',strokeWidth:2,strokeDasharray:'10px',strokeDashoffset:'var(--atc-cart-tick-offset)'}}/>
        </svg>
      </div>
    </button>
  )
}

export default function ProductCard({ product, onAgentNegotiate, delay = 0 }) {
  const { addToCart } = useApp()
  const cardRef = useRef(null)
  useGSAP()

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
          {(product.badges || []).map(b => (
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
        <div className={styles.category}>{(product.category || '').toUpperCase()} · WEILCHAIN</div>
        <div className={styles.name}>{product.name}</div>
        <div className={styles.desc}>{product.desc || product.description}</div>
        <div className={styles.footer}>
          <div className={styles.price}>
            <div className={styles.priceVal}>{product.priceWUSD || product.price} WUSD</div>
            <div className={styles.priceUsd}>≈ ${product.priceWUSD || product.price}.00</div>
          </div>
          <div className={styles.actions}>
            <button className={styles.agentBtn} onClick={() => onAgentNegotiate?.(product)} title="Let agent negotiate">🤖</button>
          </div>
        </div>

        {/* Animated Add to Cart button */}
        <AddToCartBtn product={product} onAdd={addToCart} />

        <div className={styles.meta}>
          <div className={styles.seller}>
            <div className={styles.sellerAvatar}>◈</div>
            {product.seller}
          </div>
          <div className={styles.rating}>★ {product.rating} <span style={{color:'var(--muted)'}}>({product.reviews || product.reviewCount})</span></div>
        </div>
      </div>
    </div>
  )
}