'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

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
  const [assignedTo, setAssignedTo] = useState('')
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [currentUsername, setCurrentUsername] = useState<string | null>(null)
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  const supabase = createClient(supabaseUrl, supabaseKey)

  useEffect(() => {
    const loadUserData = () => {
      // Get user_id from localStorage
      const userId = localStorage.getItem('user_id')
      const username = localStorage.getItem('username')

      if (userId) {
        setCurrentUserId(userId)
        setCurrentUsername(username || null)
      }

      // Load all users
      supabase
        .from('users')
        .select('*')
        .then(({ data }) => {
          if (data) {
            setUsers(data)
          }
        })
    }

    loadUserData()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!amount || !description || !debtDate || !assignedTo) {
      alert('Vui lòng điền đầy đủ thông tin')
      return
    }

    if (!currentUserId) {
      alert('Bạn cần đăng nhập để thêm nợ')
      return
    }

    setLoading(true)

    const { error } = await supabase
      .from('debts')
      .insert({
        amount: parseFloat(amount),
        description,
        debt_date: debtDate,
        debtor_name: users.find(u => u.id === assignedTo)?.username || 'Unknown',
        created_by: currentUsername || 'Unknown',
        assigned_to: assignedTo,
        status: 'pending',
      })

    if (error) {
      alert('Lỗi khi thêm nợ: ' + error.message)
    } else {
      // Reset form
      setAmount('')
      setDescription('')
      setAssignedTo('')
      setDebtDate(new Date().toISOString().split('T')[0])
      alert('Đã thêm nợ thành công! Đang chờ người nợ xác nhận.')
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
            Gán cho người nợ
          </label>
          <select
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Chọn người nợ...</option>
            {users
              .filter(u => u.id !== currentUserId)
              .map(user => (
                <option key={user.id} value={user.id}>
                  {user.username}
                </option>
              ))}
          </select>
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
