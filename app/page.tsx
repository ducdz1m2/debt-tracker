import type { Metadata } from "next";
import HomeContent from './components/HomeContent'
import AuthGuard from './components/AuthGuard'

export const metadata: Metadata = {
  title: "Trang chủ - Debt Tracker",
  description: "Quản lý các khoản nợ của bạn một cách dễ dàng. Thêm, theo dõi và thanh toán nợ với bạn bè và nhóm.",
  keywords: ["trang chủ", "quản lý nợ", "debt tracker", "theo dõi nợ"],
};

export default function Home() {
  return (
    <AuthGuard>
      <HomeContent initialDebts={[]} />
    </AuthGuard>
  )
}
