'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface Debt {
  id: string
  amount: number
  description: string
  debt_date: string
  debtor_name: string
  created_at: string
  created_by?: string
  status?: string
  assigned_to?: string
  deleted_at?: string
}

interface DebtListProps {
  initialDebts: Debt[]
}

export default function DebtList({ initialDebts }: DebtListProps) {
  const [debts, setDebts] = useState<Debt[]>(initialDebts)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [currentUsername, setCurrentUsername] = useState<string | null>(null)
  const [previousDebtIds, setPreviousDebtIds] = useState<Set<string>>(new Set(initialDebts.map(d => d.id)))
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadUser = () => {
      // Get user_id from localStorage
      const userId = localStorage.getItem('user_id')
      const username = localStorage.getItem('username')

      if (userId) {
        setCurrentUserId(userId)
        setCurrentUsername(username || null)
      }
      
      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission()
      }
    }
    loadUser()

    // Polling để auto-refresh danh sách nợ mỗi 10 giây
    const interval = setInterval(async () => {
      setLoading(true)
      const { data: updatedDebts } = await supabase
        .from('debts')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (updatedDebts) {
        // Kiểm tra khoản nợ mới được gán cho current user
        const newDebts = updatedDebts.filter(d => !previousDebtIds.has(d.id))
        const assignedToMe = newDebts.filter(d => d.assigned_to === currentUserId && d.status === 'pending')
        
        if (assignedToMe.length > 0 && 'Notification' in window && Notification.permission === 'granted') {
          assignedToMe.forEach(debt => {
            new Notification('Khoản nợ mới!', {
              body: `${debt.debtor_name} nợ ${debt.amount.toLocaleString('vi-VN')}đ - ${debt.description}`,
              icon: '/favicon.ico'
            })
          })
        }
        
        setDebts(updatedDebts)
        setPreviousDebtIds(new Set(updatedDebts.map(d => d.id)))
      }
      setLoading(false)
    }, 10000)

    return () => clearInterval(interval)
  }, [supabase, currentUserId, previousDebtIds])

  const handleHide = async (id: string) => {
    if (!confirm('Bạn có chắc muốn đánh dấu khoản nợ này là đã thanh toán?')) {
      return
    }

    const { error } = await supabase
      .from('debts')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      alert('Lỗi khi đánh dấu: ' + error.message)
    } else {
      setDebts(debts.filter((debt) => debt.id !== id))
      alert('Đã đánh dấu thành thanh toán!')
    }
  }

  const handleConfirm = async (id: string) => {
    const { error } = await supabase
      .from('debts')
      .update({ status: 'confirmed' })
      .eq('id', id)

    if (error) {
      alert('Lỗi khi xác nhận: ' + error.message)
    } else {
      setDebts(debts.map(d => d.id === id ? { ...d, status: 'confirmed' } : d))
      alert('Đã xác nhận khoản nợ!')
    }
  }

  const handleReject = async (id: string) => {
    const { error } = await supabase
      .from('debts')
      .update({ status: 'rejected' })
      .eq('id', id)

    if (error) {
      alert('Lỗi khi từ chối: ' + error.message)
    } else {
      setDebts(debts.map(d => d.id === id ? { ...d, status: 'rejected' } : d))
      alert('Đã từ chối khoản nợ!')
    }
  }

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">Chờ xác nhận</span>
      case 'confirmed':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Đã xác nhận</span>
      case 'rejected':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">Đã từ chối</span>
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
        Đang tải...
      </div>
    )
  }

  if (debts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
        Chưa có khoản nợ nào
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {debts.map((debt) => (
        <div
          key={debt.id}
          className="bg-white rounded-lg shadow-md p-4"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-semibold text-lg text-blue-600">
                  {debt.amount.toLocaleString('vi-VN')} đ
                </span>
                <span className="text-gray-500">|</span>
                <span className="text-gray-700">{debt.description}</span>
                {getStatusBadge(debt.status)}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                <span className="font-medium">{debt.debtor_name}</span> -{' '}
                {new Date(debt.debt_date).toLocaleDateString('vi-VN')}
                {debt.created_by && (
                  <span className="ml-2 text-purple-600">
                    (bởi {debt.created_by})
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {debt.status === 'pending' && debt.assigned_to === currentUserId && (
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => handleConfirm(debt.id)}
                className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition-colors text-sm"
              >
                Xác nhận
              </button>
              <button
                onClick={() => handleReject(debt.id)}
                className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors text-sm"
              >
                Từ chối
              </button>
            </div>
          )}
          
          {debt.created_by === currentUsername && (
            <button
              onClick={() => handleHide(debt.id)}
              className="mt-3 bg-gray-500 text-white px-3 py-1 rounded-lg hover:bg-gray-600 transition-colors text-sm"
            >
              Thanh toán
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
