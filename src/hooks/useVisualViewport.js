import { useState, useEffect } from 'react'

export function useVisualViewport() {
  const vv = typeof window !== 'undefined' ? window.visualViewport : null
  const [size, setSize] = useState({
    height: vv?.height ?? (typeof window !== 'undefined' ? window.innerHeight : 600),
    offsetTop: vv?.offsetTop ?? 0,
  })

  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    const update = () => setSize({ height: vv.height, offsetTop: vv.offsetTop })
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
    }
  }, [])

  return size
}
