'use client'
import { useApp } from '@/context/AppContext'
import { useRouter } from 'next/navigation'
import styles from './CartDrawer.module.css'

export default function CartDrawer({ open, onClose }) {
  const { cart, cartTotal, removeFromCart, clearCart } = useApp()
  const router = useRouter()

  function checkout() {
    onClose()
    router.push('/checkout')
  }

  return (
    <>
      <div className={`${styles.overlay} ${open ? styles.open : ''}`} onClick={onClose} />
      <div className={`${styles.drawer} ${open ? styles.open : ''}`}>
        <div className={styles.head}>
          <h2>Cart <span>({cart.length} items)</span></h2>
          <button onClick={onClose}>✕</button>
        </div>
        <div className={styles.items}>
          {cart.length === 0 ? (
            <div className={styles.empty}>Your cart is empty.</div>
          ) : (
            cart.map(item => (
              <div key={item.id} className={styles.item}>
                <div className={styles.itemEmoji}>{item.emoji}</div>
                <div className={styles.itemInfo}>
                  <div className={styles.itemName}>{item.name}</div>
                  <div className={styles.itemPrice}>{item.price} WUSD × {item.qty}</div>
                </div>
                <button onClick={() => removeFromCart(item.id)}>✕</button>
              </div>
            ))
          )}
        </div>
        <div className={styles.footer}>
          <div className={styles.total}>
            <span>Total</span>
            <span className={styles.totalVal}>{cartTotal} WUSD</span>
          </div>
          <button className={styles.checkoutBtn} onClick={checkout} disabled={cart.length === 0}>
            ◈ Pay with WUSD →
          </button>
        </div>
      </div>
    </>
  )
}