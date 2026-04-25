'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function DebtForm() {
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [debtDate, setDebtDate] = useState(new Date().toISOString().split('T')[0])
  const [debtorName, setDebtorName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!amount || !description || !debtDate || !debtorName) {
      alert('Vui lòng điền đầy đủ thông tin')
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase
      .from('debts')
      .insert({
        amount: parseFloat(amount),
        description,
        debt_date: debtDate,
        debtor_name: debtorName,
      })

    if (error) {
      alert('Lỗi khi thêm nợ: ' + error.message)
    } else {
      // Reset form
      setAmount('')
      setDescription('')
      setDebtorName('')
      setDebtDate(new Date().toISOString().split('T')[0])
      alert('Đã thêm nợ thành công!')
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
            Người nợ
          </label>
          <input
            type="text"
            value={debtorName}
            onChange={(e) => setDebtorName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Tên người nợ"
            required
          />
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
