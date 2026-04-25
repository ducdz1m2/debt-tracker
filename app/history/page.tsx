import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import AuthGuard from '../components/AuthGuard'
import LogoutButton from '../components/LogoutButton'
import NotificationPermissionButton from '../components/TestNotificationButton'
import Link from 'next/link'

export default async function HistoryPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: debts } = await supabase
    .from('debts')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                📜 Lịch sử
              </h1>
              <Link href="/" className="text-blue-600 hover:underline text-sm">
                ← Quay lại trang chính
              </Link>
            </div>
            <div className="flex gap-2">
              <NotificationPermissionButton />
              <LogoutButton />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Tất cả khoản nợ (kể cả đã ẩn)
            </h2>
            
            {debts && debts.length > 0 ? (
              <div className="space-y-3">
                {debts.map((debt: any) => (
                  <div
                    key={debt.id}
                    className={`p-4 rounded-lg border ${
                      debt.deleted_at ? 'bg-gray-100 border-gray-300 opacity-60' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-semibold text-lg text-blue-600">
                            {debt.amount.toLocaleString('vi-VN')} đ
                          </span>
                          <span className="text-gray-500">|</span>
                          <span className="text-gray-700">{debt.description}</span>
                          {debt.status === 'pending' && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">Chờ xác nhận</span>
                          )}
                          {debt.status === 'confirmed' && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Đã xác nhận</span>
                          )}
                          {debt.status === 'rejected' && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">Đã từ chối</span>
                          )}
                          {debt.deleted_at && (
                            <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded text-xs">Đã thành toán</span>
                          )}
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
                        <div className="text-xs text-gray-400 mt-1">
                          Ngày tạo: {new Date(debt.created_at).toLocaleString('vi-VN')}
                          {debt.deleted_at && (
                            <span className="ml-2">
                              - thanh toán vào: {new Date(debt.deleted_at).toLocaleString('vi-VN')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                Chưa có khoản nợ nào
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
