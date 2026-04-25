'use client'

import { useState, useEffect } from 'react'

export default function TestNotificationButton() {
  const [permission, setPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const handleClick = () => {
    if (!('Notification' in window)) {
      alert('Browser không hỗ trợ thông báo')
      return
    }

    if (permission === 'default') {
      Notification.requestPermission().then(newPermission => {
        setPermission(newPermission)
        if (newPermission === 'granted') {
          new Notification('Thông báo đã bật!', { body: 'Bạn sẽ nhận được thông báo khi có khoản nợ mới.' })
        }
      })
    } else if (permission === 'granted') {
      new Notification('Test thông báo', { body: 'Thông báo đang hoạt động!' })
    } else {
      alert('Thông báo đã bị chặn. Vào browser settings để bật lại.')
    }
  }

  const getButtonText = () => {
    if (!('Notification' in window)) return '❌ Không hỗ trợ'
    if (permission === 'default') return '🔔 Bật thông báo'
    if (permission === 'granted') return '🔔 Test thông báo'
    return '🔕 Đã chặn'
  }

  const getButtonColor = () => {
    if (!('Notification' in window)) return 'bg-gray-500 hover:bg-gray-600'
    if (permission === 'default') return 'bg-blue-500 hover:bg-blue-600'
    if (permission === 'granted') return 'bg-green-500 hover:bg-green-600'
    return 'bg-red-500 hover:bg-red-600'
  }

  return (
    <button
      onClick={handleClick}
      className={`${getButtonColor()} text-white px-4 py-2 rounded-lg transition-colors`}
    >
      {getButtonText()}
    </button>
  )
}
