'use client'

import DebtForm from './DebtForm'
import DebtList from './DebtList'
import LogoutButton from './LogoutButton'
import NotificationPermissionButton from './TestNotificationButton'
import Link from 'next/link'

interface HomeContentProps {
  initialDebts: any[]
}

export default function HomeContent({ initialDebts }: HomeContentProps) {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            📝 Ghi Nợ Sinh Hoạt
          </h1>
          <div className="flex gap-2">
            <Link href="/history" className="bg-purple-500 text-white px-3 py-2 rounded-lg hover:bg-purple-600 transition-colors" title="Lịch sử">
              📜
            </Link>
            <Link href="/stats" className="bg-indigo-500 text-white px-3 py-2 rounded-lg hover:bg-indigo-600 transition-colors" title="Thống kê">
              📊
            </Link>
            <Link href="/profile" className="bg-pink-500 text-white px-3 py-2 rounded-lg hover:bg-pink-600 transition-colors" title="Profile">
              👤
            </Link>
            <NotificationPermissionButton />
            <LogoutButton />
          </div>
        </div>
        
        <DebtForm />
        
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Danh sách nợ</h2>
          <DebtList initialDebts={initialDebts} />
        </div>
      </div>
    </div>
  )
}
