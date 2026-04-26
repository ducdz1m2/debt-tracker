import HomeContent from './components/HomeContent'
import AuthGuard from './components/AuthGuard'

export default function Home() {
  return (
    <AuthGuard>
      <HomeContent initialDebts={[]} />
    </AuthGuard>
  )
}
