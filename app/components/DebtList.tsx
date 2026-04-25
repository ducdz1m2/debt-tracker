'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

interface Debt {
  id: string
  amount: number
  description: string
  debt_date: string
  debtor_name: string
  created_at: string
}

interface DebtListProps {
  initialDebts: Debt[]
}

export default function DebtList({ initialDebts }: DebtListProps) {
  const [debts, setDebts] = useState<Debt[]>(initialDebts)

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa khoản nợ này?')) {
      return
    }

    const supabase = createClient()
    const { error } = await supabase.from('debts').delete().eq('id', id)

    if (error) {
      alert('Lỗi khi xóa: ' + error.message)
    } else {
      setDebts(debts.filter((debt) => debt.id !== id))
    }
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
          className="bg-white rounded-lg shadow-md p-4 flex justify-between items-center"
        >
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-lg text-blue-600">
                {debt.amount.toLocaleString('vi-VN')} đ
              </span>
              <span className="text-gray-500">|</span>
              <span className="text-gray-700">{debt.description}</span>
            </div>
            <div className="text-sm text-gray-500 mt-1">
              <span className="font-medium">{debt.debtor_name}</span> -{' '}
              {new Date(debt.debt_date).toLocaleDateString('vi-VN')}
            </div>
          </div>
          <button
            onClick={() => handleDelete(debt.id)}
            className="ml-4 bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors text-sm"
          >
            Xóa
          </button>
        </div>
      ))}
    </div>
  )
}
