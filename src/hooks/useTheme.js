import { useState, useEffect } from 'react'

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme)
}

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('wordible_theme')
    return saved || 'system'
  })

  useEffect(() => {
    if (theme === 'system') {
      document.documentElement.removeAttribute('data-theme')
    } else {
      applyTheme(theme)
    }
    if (theme !== 'system') localStorage.setItem('wordible_theme', theme)
    else localStorage.removeItem('wordible_theme')
  }, [theme])

  // Listen for system changes when in 'system' mode
  useEffect(() => {
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {} // CSS handles it, just need the listener for re-renders
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  function toggle() {
    setTheme(t => {
      const sys = getSystemTheme()
      if (t === 'system') return sys === 'dark' ? 'light' : 'dark'
      if (t === 'dark') return 'light'
      return 'dark'
    })
  }

  const resolved = theme === 'system' ? getSystemTheme() : theme
  return { theme: resolved, toggle }
}
