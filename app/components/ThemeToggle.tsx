'use client'

import { useState, useEffect } from 'react'

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Check localStorage and system preference
    const saved = localStorage.getItem('theme')
    if (saved === 'dark') {
      setIsDark(true)
      document.body.style.backgroundColor = '#0a0a0a'
      document.body.style.color = '#ededed'
    } else if (saved === 'light') {
      setIsDark(false)
      document.body.style.backgroundColor = '#ffffff'
      document.body.style.color = '#171717'
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDark(true)
      document.body.style.backgroundColor = '#0a0a0a'
      document.body.style.color = '#ededed'
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    
    if (newTheme) {
      document.body.style.backgroundColor = '#0a0a0a'
      document.body.style.color = '#ededed'
      localStorage.setItem('theme', 'dark')
    } else {
      document.body.style.backgroundColor = '#ffffff'
      document.body.style.color = '#171717'
      localStorage.setItem('theme', 'light')
    }
  }

  return (
    <button
      onClick={toggleTheme}
      className="bg-yellow-500 text-white px-3 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
      title={isDark ? 'Chế độ sáng' : 'Chế độ tối'}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  )
}
