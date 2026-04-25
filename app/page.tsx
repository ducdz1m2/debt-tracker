import { createClient } from '@supabase/supabase-js'
import HomeContent from './components/HomeContent'
import AuthGuard from './components/AuthGuard'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function Home() {
  const { data: debts } = await supabase
    .from('debts')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  return (
    <AuthGuard>
      <HomeContent initialDebts={debts || []} />
    </AuthGuard>
  )
}
