import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import DebtForm from './components/DebtForm'
import DebtList from './components/DebtList'
import AuthGuard from './components/AuthGuard'
import LogoutButton from './components/LogoutButton'
import TestNotificationButton from './components/TestNotificationButton'

export default async function Home() {
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
            <h1 className="text-3xl font-bold text-gray-800">
              📝 Ghi Nợ Sinh Hoạt
            </h1>
            <div className="flex gap-2">
              <TestNotificationButton />
              <LogoutButton />
            </div>
          </div>
          
          <DebtForm />
          
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Danh sách nợ</h2>
            <DebtList initialDebts={debts || []} />
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
