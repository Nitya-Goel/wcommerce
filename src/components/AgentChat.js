'use client'
import { useState, useRef, useEffect } from 'react'
import styles from './AgentChat.module.css'

const RESPONSES = [
  "I found 3 matching listings. Best deal: DeFi Analytics at 45 WUSD. Want me to negotiate?",
  "Negotiating with seller agent... Proposing 38 WUSD (15% below ask). Awaiting counter-offer.",
  "Counter-offer received: 41 WUSD. Shall I accept and lock escrow?",
  "Escrow locked! 41 WUSD held until delivery confirmed. TX: 0x4f2a...8c1d",
  "Analyzing on-chain reputation scores... Top rated: SecureAI.eth (4.9 stars)",
]

export default function AgentChat({ initialProduct }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { type: 'ai', text: "Hello! I'm Icarus, your autonomous commerce agent. I can negotiate prices, lock WUSD escrows, and complete purchases on your behalf. What would you like to buy?" }
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [respIdx, setRespIdx] = useState(0)
  const msgsRef = useRef(null)

  useEffect(() => {
    if (initialProduct) {
      setOpen(true)
      addUserMsg(`Negotiate ${initialProduct.name} — listed at ${initialProduct.price} WUSD`)
      triggerAIResponse(`Starting negotiation for ${initialProduct.name}. Current ask: ${initialProduct.price} WUSD. I'll bid ${Math.round(initialProduct.price * 0.85)} WUSD first — that's 15% below ask. Shall I proceed?`)
    }
  }, [initialProduct])

  useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight
  }, [messages, typing])

  function addUserMsg(text) {
    setMessages(prev => [...prev, { type: 'user', text }])
  }

  function triggerAIResponse(customText) {
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      const text = customText || RESPONSES[respIdx % RESPONSES.length]
      setMessages(prev => [...prev, { type: 'ai', text }])
      setRespIdx(prev => prev + 1)
    }, 1500)
  }

  function send() {
    if (!input.trim()) return
    addUserMsg(input)
    setInput('')
    triggerAIResponse()
  }

  return (
    <div className={styles.panel}>
      {open && (
        <div className={styles.chat}>
          <div className={styles.header}>
            <div className={styles.avatar}>🤖</div>
            <div>
              <div className={styles.name}>Icarus Agent</div>
              <div className={styles.status}>Ready to negotiate</div>
            </div>
            <button className={styles.close} onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className={styles.messages} ref={msgsRef}>
            {messages.map((m, i) => (
              <div key={i} className={`${styles.msg} ${m.type === 'user' ? styles.userMsg : ''}`}>
                {m.type === 'ai' && <div className={styles.msgAvatar}>🤖</div>}
                <div>
                  <div className={m.type === 'ai' ? styles.bubbleAI : styles.bubbleUser}>{m.text}</div>
                  <div className={styles.time}>{m.type === 'ai' ? 'Icarus' : 'You'}</div>
                </div>
              </div>
            ))}
            {typing && (
              <div className={styles.msg}>
                <div className={styles.msgAvatar}>🤖</div>
                <div className={styles.typingBubble}>
                  <span /><span /><span />
                </div>
              </div>
            )}
          </div>

          <div className={styles.inputRow}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask Icarus to find or negotiate..."
            />
            <button onClick={send}>→</button>
          </div>
        </div>
      )}
      <button className={styles.toggle} onClick={() => setOpen(o => !o)}>🤖</button>
    </div>
  )
}