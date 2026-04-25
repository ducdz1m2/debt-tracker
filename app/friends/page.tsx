'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AuthGuard from '../components/AuthGuard'
import LogoutButton from '../components/LogoutButton'
import Link from 'next/link'

interface User {
  id: string
  username: string
  full_name?: string
  avatar_url?: string
}

export default function FriendsPage() {
  const [friends, setFriends] = useState<User[]>([])
  const [pendingRequests, setPendingRequests] = useState<User[]>([])
  const [sentRequests, setSentRequests] = useState<User[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  useEffect(() => {
    const loadData = async () => {
      const userId = localStorage.getItem('user_id')
      const username = localStorage.getItem('username')
      if (!userId) return

      setCurrentUserId(userId)

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

  // Separate useEffect for realtime subscription
  useEffect(() => {
    if (!currentUserId) return

    const setupRealtime = async () => {
      const { supabase } = await import('@/lib/supabaseClient')
      const channelName = `friends-changes-${currentUserId}`

      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'friends'
          },
          async (payload) => {
            // Refresh data on any change
            const friendsRes = await fetch(`/api/friends/list?userId=${currentUserId}`)
            const friendsData = await friendsRes.json()
            if (friendsData.friends) {
              setFriends(friendsData.friends)
            }
            const pendingRes = await fetch(`/api/friends/pending?userId=${currentUserId}`)
            const pendingData = await pendingRes.json()
            if (pendingData.requests) {
              setPendingRequests(pendingData.requests)
            }
            const sentRes = await fetch(`/api/friends/sent?userId=${currentUserId}`)
            const sentData = await sentRes.json()
            if (sentData.requests) {
              setSentRequests(sentData.requests)
            }

            // Show notifications for important events
            if (payload.eventType === 'INSERT') {
              const newFriend = payload.new as any
              // Notify when someone sends a friend request to current user
              if (newFriend.friend_id === currentUserId && newFriend.status === 'pending') {
                if ('Notification' in window && Notification.permission === 'granted') {
                  // Get sender's username
                  const { data: sender } = await supabase
                    .from('users')
                    .select('username')
                    .eq('id', newFriend.user_id)
                    .single()
                  new Notification('Lời mời kết bạn mới!', {
                    body: `${sender?.username || 'Một người dùng'} muốn kết bạn với bạn`,
                    icon: '/favicon.ico'
                  })
                }
              }
            } else if (payload.eventType === 'UPDATE') {
              const updatedFriend = payload.new as any
              const oldFriend = payload.old as any
              // Notify when someone accepts friend request
              if (updatedFriend.user_id === currentUserId && oldFriend.status === 'pending' && updatedFriend.status === 'accepted') {
                if ('Notification' in window && Notification.permission === 'granted') {
                  const { data: accepter } = await supabase
                    .from('users')
                    .select('username')
                    .eq('id', updatedFriend.friend_id)
                    .single()
                  new Notification('Đã kết bạn thành công!', {
                    body: `${accepter?.username || 'Một người dùng'} đã chấp nhận lời mời kết bạn`,
                    icon: '/favicon.ico'
                  })
                }
              }
            }
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }

    const cleanup = setupRealtime()
    return () => {
      cleanup.then(cleanupFn => cleanupFn?.())
    }
  }, [currentUserId])

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

  const handleDeleteFriend = async (friendId: string) => {
    const userId = localStorage.getItem('user_id')
    if (!userId) return

    if (!confirm('Bạn có chắc muốn xóa bạn bè? Lịch sử nợ sẽ vẫn được giữ lại.')) {
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/friends/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, friendId }),
      })

      const data = await res.json()
      if (res.ok) {
        alert('Đã xóa bạn bè!')
        // Refresh friends list
        const friendsRes = await fetch(`/api/friends/list?userId=${userId}`)
        const friendsData = await friendsRes.json()
        if (friendsData.friends) {
          setFriends(friendsData.friends)
        }
      } else {
        alert(data.error || 'Lỗi xóa bạn bè')
      }
    } catch (error) {
      alert('Lỗi server')
    }
    setLoading(false)
  }

  // Deduplicate arrays by ID
  const uniqueFriends = Array.from(new Map(friends.map(f => [f.id, f])).values())
  const uniquePending = Array.from(new Map(pendingRequests.map(p => [p.id, p])).values())
  const uniqueSent = Array.from(new Map(sentRequests.map(s => [s.id, s])).values())

  const friendIds = uniqueFriends.map(f => f.id)
  const pendingIds = uniquePending.map(p => p.id)
  const sentIds = uniqueSent.map(s => s.id)

  // Filter users based on search term
  const filteredUsers = allUsers.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
    const notInLists = !friendIds.includes(user.id) && !pendingIds.includes(user.id) && !sentIds.includes(user.id)
    return matchesSearch && notInLists
  })

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
          {uniquePending.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Lời mời kết bạn</h2>
              <div className="space-y-3">
                {uniquePending.map(user => (
                  <div key={`pending-${user.id}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.full_name || user.username} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">👤</div>
                      )}
                      <div>
                        <span className="font-medium">{user.full_name || user.username}</span>
                        <span className="text-gray-500 text-sm ml-2">@{user.username}</span>
                      </div>
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
            <div className="mb-4">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm người dùng..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="space-y-3">
              {filteredUsers.map(user => (
                <div key={`add-${user.id}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.full_name || user.username} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">👤</div>
                    )}
                    <div>
                      <span className="font-medium">{user.full_name || user.username}</span>
                      <span className="text-gray-500 text-sm ml-2">@{user.username}</span>
                    </div>
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
              {filteredUsers.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  {searchTerm ? 'Không tìm thấy người dùng nào' : 'Không có người dùng nào để kết bạn'}
                </p>
              )}
            </div>
          </div>

          {/* Sent Requests */}
          {uniqueSent.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Lời mời đã gửi</h2>
              <div className="space-y-3">
                {uniqueSent.map(user => (
                  <div key={`sent-${user.id}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.full_name || user.username} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">👤</div>
                      )}
                      <div>
                        <span className="font-medium">{user.full_name || user.username}</span>
                        <span className="text-gray-500 text-sm ml-2">@{user.username}</span>
                      </div>
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
              {uniqueFriends.map(user => (
                <div key={`friend-${user.id}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.full_name || user.username} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">👤</div>
                    )}
                    <div>
                      <span className="font-medium">{user.full_name || user.username}</span>
                      <span className="text-gray-500 text-sm ml-2">@{user.username}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteFriend(user.id)}
                    disabled={loading}
                    className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors text-sm disabled:bg-gray-400"
                  >
                    Xóa
                  </button>
                </div>
              ))}
              {uniqueFriends.length === 0 && (
                <p className="text-gray-500 text-center py-4">Chưa có bạn bè nào</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
