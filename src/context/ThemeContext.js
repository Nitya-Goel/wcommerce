'use client'
import { createContext, useContext, useState, useEffect } from 'react'
const ThemeContext = createContext(null)
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark')
  useEffect(() => {
    const saved = localStorage.getItem('wc-theme') || 'dark'
    setTheme(saved)
    document.documentElement.setAttribute('data-theme', saved)
  }, [])
  function toggleTheme(e) {
    const next = theme === 'dark' ? 'light' : 'dark'
    const x = e?.clientX ?? window.innerWidth/2
    const y = e?.clientY ?? window.innerHeight/2
    const r = Math.hypot(Math.max(x, window.innerWidth-x), Math.max(y, window.innerHeight-y)) * 1.1
    const el = document.createElement('div')
    el.style.cssText = `position:fixed;inset:0;z-index:99999;pointer-events:none;background:${next==='light'?'#f5f0e8':'#020810'};clip-path:circle(0px at ${x}px ${y}px);transition:clip-path 0.65s cubic-bezier(.4,0,.2,1);`
    document.body.appendChild(el)
    requestAnimationFrame(() => requestAnimationFrame(() => { el.style.clipPath = `circle(${r}px at ${x}px ${y}px)` }))
    setTimeout(() => {
      setTheme(next); localStorage.setItem('wc-theme', next)
      document.documentElement.setAttribute('data-theme', next)
      el.remove()
    }, 340)
  }
  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}
export const useTheme = () => useContext(ThemeContext)