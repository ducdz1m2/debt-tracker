'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface User {
  id: string
  username: string
  phone?: string
  avatar_url?: string
}

export default function DebtForm() {
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [debtDate, setDebtDate] = useState(new Date().toISOString().split('T')[0])
  const [assignedTo, setAssignedTo] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [currentUsername, setCurrentUsername] = useState<string | null>(null)

  useEffect(() => {
    const loadUserData = async () => {
      // Get user_id from localStorage
      const userId = localStorage.getItem('user_id')
      const username = localStorage.getItem('username')

      if (userId) {
        setCurrentUserId(userId)
        setCurrentUsername(username || null)

        // Load friends only
        const res = await fetch(`/api/friends/list?userId=${userId}`)
        const data = await res.json()
        if (data.friends) {
          // Deduplicate by ID
          const uniqueFriends = Array.from(new Map((data.friends as User[]).map((f: User) => [f.id, f])).values())
          setUsers(uniqueFriends)
        }
      }
    }

    loadUserData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!amount || !description || !debtDate || assignedTo.length === 0) {
      alert('Vui lòng điền đầy đủ thông tin')
      return
    }

    if (!currentUserId) {
      alert('Bạn cần đăng nhập để thêm nợ')
      return
    }

    setLoading(true)

    const totalAmount = parseFloat(amount)
    const splitAmount = totalAmount / assignedTo.length

    // Create debt records for each selected person
    const debtRecords = assignedTo.map(userId => {
      const user = users.find(u => u.id === userId)
      return {
        amount: splitAmount,
        description,
        debt_date: debtDate,
        debtor_name: user?.username || 'Unknown',
        created_by: currentUsername || 'Unknown',
        assigned_to: userId,
        status: 'pending',
      }
    })

    const { error } = await supabase
      .from('debts')
      .insert(debtRecords)

    if (error) {
      alert('Lỗi khi thêm nợ: ' + error.message)
    } else {
      // Reset form
      setAmount('')
      setDescription('')
      setAssignedTo([])
      setDebtDate(new Date().toISOString().split('T')[0])
      const message = assignedTo.length === 1
        ? 'Đã thêm nợ thành công! Đang chờ người nợ xác nhận.'
        : `Đã thêm ${assignedTo.length} khoản nợ thành công! Mỗi người nợ ${splitAmount.toLocaleString('vi-VN')}đ.`
      alert(message)
      window.location.reload()
    }

    setLoading(false)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">Thêm khoản nợ mới</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Số tiền (VNĐ)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Nhập số tiền"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Nội dung
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ví dụ: Trả tiền ăn, Mua đồ..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Gán cho người nợ (có thể chọn nhiều)
          </label>
          <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3">
            {users
              .filter(u => u.id !== currentUserId)
              .map(user => (
                <label key={user.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    value={user.id}
                    checked={assignedTo.includes(user.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setAssignedTo([...assignedTo, user.id])
                      } else {
                        setAssignedTo(assignedTo.filter(id => id !== user.id))
                      }
                    }}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm">{user.username}</span>
                </label>
              ))}
          </div>
          {assignedTo.length > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              Đã chọn {assignedTo.length} người. Mỗi người sẽ nợ {(parseFloat(amount || '0') / assignedTo.length).toLocaleString('vi-VN')}đ
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Ngày nợ
          </label>
          <input
            type="date"
            value={debtDate}
            onChange={(e) => setDebtDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
        >
          {loading ? 'Đang thêm...' : 'Thêm nợ'}
        </button>
      </form>
    </div>
  )
}
