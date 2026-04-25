'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AuthGuard from '../components/AuthGuard'
import LogoutButton from '../components/LogoutButton'
import Link from 'next/link'

interface User {
  id: string
  username: string
  avatar_url?: string
}

export default function FriendsPage() {
  const [friends, setFriends] = useState<User[]>([])
  const [pendingRequests, setPendingRequests] = useState<User[]>([])
  const [sentRequests, setSentRequests] = useState<User[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const loadData = async () => {
      const userId = localStorage.getItem('user_id')
      if (!userId) return

      // Load friends
      const friendsRes = await fetch(`/api/friends/list?userId=${userId}`)
      const friendsData = await friendsRes.json()
      if (friendsData.friends) {
        setFriends(friendsData.friends)
      }

      // Load pending requests (received)
      const pendingRes = await fetch(`/api/friends/pending?userId=${userId}`)
      const pendingData = await pendingRes.json()
      if (pendingData.requests) {
        setPendingRequests(pendingData.requests)
      }

      // Load sent requests
      const sentRes = await fetch(`/api/friends/sent?userId=${userId}`)
      const sentData = await sentRes.json()
      if (sentData.requests) {
        setSentRequests(sentData.requests)
      }

      // Load all users for adding friends
      const { supabase } = await import('@/lib/supabaseClient')
      const { data: users } = await supabase.from('users').select('*')
      if (users) {
        setAllUsers(users.filter((u: User) => u.id !== userId))
      }
    }

    loadData()
  }, [])

  const handleAddFriend = async (friendId: string) => {
    const userId = localStorage.getItem('user_id')
    if (!userId) return

    setLoading(true)
    try {
      const res = await fetch('/api/friends/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, friendId }),
      })

      const data = await res.json()
      if (res.ok) {
        alert('Đã gửi lời mời kết bạn!')
        // Refresh sent requests
        const sentRes = await fetch(`/api/friends/sent?userId=${userId}`)
        const sentData = await sentRes.json()
        if (sentData.requests) {
          setSentRequests(sentData.requests)
        }
      } else {
        alert(data.error || 'Lỗi gửi lời mời')
      }
    } catch (error) {
      alert('Lỗi server')
    }
    setLoading(false)
  }

  const handleAcceptFriend = async (friendId: string) => {
    const userId = localStorage.getItem('user_id')
    if (!userId) return

    setLoading(true)
    try {
      const res = await fetch('/api/friends/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, friendId }),
      })

      const data = await res.json()
      if (res.ok) {
        alert('Đã chấp nhận lời mời kết bạn!')
        // Refresh all data
        const friendsRes = await fetch(`/api/friends/list?userId=${userId}`)
        const friendsData = await friendsRes.json()
        if (friendsData.friends) {
          setFriends(friendsData.friends)
        }
        const pendingRes = await fetch(`/api/friends/pending?userId=${userId}`)
        const pendingData = await pendingRes.json()
        if (pendingData.requests) {
          setPendingRequests(pendingData.requests)
        }
      } else {
        alert(data.error || 'Lỗi chấp nhận lời mời')
      }
    } catch (error) {
      alert('Lỗi server')
    }
    setLoading(false)
  }

  const friendIds = friends.map(f => f.id)
  const pendingIds = pendingRequests.map(p => p.id)
  const sentIds = sentRequests.map(s => s.id)

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">👥 Bạn bè</h1>
              <Link href="/" className="text-blue-600 hover:underline text-sm">
                ← Quay lại trang chính
              </Link>
            </div>
            <LogoutButton />
          </div>

          {/* Pending Requests */}
          {pendingRequests.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Lời mời kết bạn</h2>
              <div className="space-y-3">
                {pendingRequests.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.username} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">👤</div>
                      )}
                      <span className="font-medium">{user.username}</span>
                    </div>
                    <button
                      onClick={() => handleAcceptFriend(user.id)}
                      disabled={loading}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-400"
                    >
                      Chấp nhận
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Friends */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Thêm bạn mới</h2>
            <div className="space-y-3">
              {allUsers
                .filter(u => !friendIds.includes(u.id) && !pendingIds.includes(u.id) && !sentIds.includes(u.id))
                .map(user => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.username} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">👤</div>
                      )}
                      <span className="font-medium">{user.username}</span>
                    </div>
                    <button
                      onClick={() => handleAddFriend(user.id)}
                      disabled={loading}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400"
                    >
                      Kết bạn
                    </button>
                  </div>
                ))}
              {allUsers.filter(u => !friendIds.includes(u.id) && !pendingIds.includes(u.id) && !sentIds.includes(u.id)).length === 0 && (
                <p className="text-gray-500 text-center py-4">Không có người dùng nào để kết bạn</p>
              )}
            </div>
          </div>

          {/* Sent Requests */}
          {sentRequests.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Lời mời đã gửi</h2>
              <div className="space-y-3">
                {sentRequests.map(user => (
                  <div key={`sent-${user.id}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.username} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">👤</div>
                      )}
                      <span className="font-medium">{user.username}</span>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">Đang chờ phản hồi</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Friends List */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Danh sách bạn bè</h2>
            <div className="space-y-3">
              {friends.map(user => (
                <div key={user.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.username} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">👤</div>
                  )}
                  <span className="font-medium">{user.username}</span>
                </div>
              ))}
              {friends.length === 0 && (
                <p className="text-gray-500 text-center py-4">Chưa có bạn bè nào</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
