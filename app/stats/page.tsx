'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import AuthGuard from '../components/AuthGuard'
import LogoutButton from '../components/LogoutButton'
import Link from 'next/link'

interface Debt {
  id: string
  amount: number
  description: string
  debt_date: string
  debtor_name: string
  created_at: string
  created_by?: string
  status?: string
  deleted_at?: string
}

export default function StatsPage() {
  const [debts, setDebts] = useState<Debt[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [currentUsername, setCurrentUsername] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      const userId = localStorage.getItem('user_id')
      const username = localStorage.getItem('username')

      if (userId) {
        setCurrentUserId(userId)
        setCurrentUsername(username || null)

        const { data } = await supabase
          .from('debts')
          .select('*')
          .is('deleted_at', null)

        if (data) {
          // Filter to show only user's debts
          const filtered = data.filter(d => 
            d.assigned_to === userId || d.created_by === username
          )
          setDebts(filtered)
        }
      }
      setLoading(false)
    }

    loadData()
  }, [])

  // Calculate statistics
  const totalAmount = debts.reduce((sum, debt) => sum + (debt.amount || 0), 0)
  const pendingAmount = debts.filter(d => d.status === 'pending').reduce((sum, debt) => sum + (debt.amount || 0), 0)
  const confirmedAmount = debts.filter(d => d.status === 'confirmed').reduce((sum, debt) => sum + (debt.amount || 0), 0)
  const rejectedAmount = debts.filter(d => d.status === 'rejected').reduce((sum, debt) => sum + (debt.amount || 0), 0)

  // Group by debtor
  const byDebtor = debts.reduce((acc: any, debt: any) => {
    const name = debt.debtor_name || 'Unknown'
    if (!acc[name]) {
      acc[name] = { amount: 0, count: 0 }
    }
    acc[name].amount += debt.amount || 0
    acc[name].count += 1
    return acc
  }, {})

  // Group by status
  const byStatus = {
    pending: debts.filter(d => d.status === 'pending').length,
    confirmed: debts.filter(d => d.status === 'confirmed').length,
    rejected: debts.filter(d => d.status === 'rejected').length,
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                📊 Thống kê
              </h1>
              <Link href="/" className="text-blue-600 hover:underline text-sm">
                ← Quay lại trang chính
              </Link>
            </div>
            <LogoutButton />
          </div>
          
          {loading ? (
            <div className="text-center text-gray-500 py-8">Đang tải...</div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-gray-500 text-sm mb-2">Tổng số tiền</h3>
                  <p className="text-2xl font-bold text-blue-600">
                    {totalAmount.toLocaleString('vi-VN')} đ
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-gray-500 text-sm mb-2">Chờ xác nhận</h3>
                  <p className="text-2xl font-bold text-yellow-600">
                    {pendingAmount.toLocaleString('vi-VN')} đ
                  </p>
                  <p className="text-xs text-gray-400">{byStatus.pending} khoản</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-gray-500 text-sm mb-2">Đã xác nhận</h3>
                  <p className="text-2xl font-bold text-green-600">
                    {confirmedAmount.toLocaleString('vi-VN')} đ
                  </p>
                  <p className="text-xs text-gray-400">{byStatus.confirmed} khoản</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-gray-500 text-sm mb-2">Đã từ chối</h3>
                  <p className="text-2xl font-bold text-red-600">
                    {rejectedAmount.toLocaleString('vi-VN')} đ
                  </p>
                  <p className="text-xs text-gray-400">{byStatus.rejected} khoản</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* By Debtor */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4 text-gray-700">
                    Theo người nợ
                  </h2>
                  {Object.keys(byDebtor).length > 0 ? (
                    <div className="space-y-3">
                      {Object.entries(byDebtor)
                        .sort((a, b) => (b[1] as any).amount - (a[1] as any).amount)
                        .map(([name, data]: [string, any]) => (
                          <div key={name} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-800">{name}</p>
                              <p className="text-sm text-gray-500">{data.count} khoản nợ</p>
                            </div>
                            <p className="font-semibold text-blue-600">
                              {data.amount.toLocaleString('vi-VN')} đ
                            </p>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">Chưa có dữ liệu</p>
                  )}
                </div>

                {/* By Status */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4 text-gray-700">
                    Theo trạng thái
                  </h2>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">Chờ xác nhận</p>
                        <p className="text-sm text-gray-500">{byStatus.pending} khoản</p>
                      </div>
                      <p className="font-semibold text-yellow-600">
                        {pendingAmount.toLocaleString('vi-VN')} đ
                      </p>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">Đã xác nhận</p>
                        <p className="text-sm text-gray-500">{byStatus.confirmed} khoản</p>
                      </div>
                      <p className="font-semibold text-green-600">
                        {confirmedAmount.toLocaleString('vi-VN')} đ
                      </p>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">Đã từ chối</p>
                        <p className="text-sm text-gray-500">{byStatus.rejected} khoản</p>
                      </div>
                      <p className="font-semibold text-red-600">
                        {rejectedAmount.toLocaleString('vi-VN')} đ
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}
