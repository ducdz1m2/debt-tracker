import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Debt Tracker - Quản lý nợ miễn phí",
  description: "Ứng dụng quản lý nợ miễn phí giúp bạn theo dõi các khoản nợ, chia sẻ với bạn bè và quản lý tài chính cá nhân hiệu quả.",
  keywords: ["quản lý nợ", "debt tracker", "theo dõi nợ", "quản lý tài chính", "miễn phí"],
  openGraph: {
    title: "Debt Tracker - Quản lý nợ miễn phí",
    description: "Ứng dụng quản lý nợ miễn phí giúp bạn theo dõi các khoản nợ hiệu quả.",
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="container mx-auto px-4 py-8">
        <nav className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">💰 Debt Tracker</h1>
          <div className="space-x-4">
            <Link href="/about" className="text-gray-600 hover:text-blue-600">Giới thiệu</Link>
            <Link href="/features" className="text-gray-600 hover:text-blue-600">Tính năng</Link>
            <Link href="/" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Đăng nhập</Link>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Quản lý nợ <span className="text-blue-600">đơn giản</span> và <span className="text-green-600">hiệu quả</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Theo dõi các khoản nợ, chia sẻ với bạn bè, và quản lý tài chính cá nhân của bạn một cách dễ dàng. 
            Hoàn toàn miễn phí!
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/" className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition-colors">
              Bắt đầu ngay
            </Link>
            <Link href="/features" className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-50 transition-colors">
              Tìm hiểu thêm
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">Theo dõi nợ</h3>
            <p className="text-gray-600">Quản lý tất cả các khoản nợ một cách có tổ chức và dễ dàng theo dõi.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-semibold mb-2">Chia sẻ với bạn bè</h3>
            <p className="text-gray-600">Kết nối với bạn bè và quản lý nợ chung một cách minh bạch.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-4xl mb-4">📈</div>
            <h3 className="text-xl font-semibold mb-2">Thống kê chi tiết</h3>
            <p className="text-gray-600">Xem báo cáo và thống kê chi tiết về tình hình tài chính của bạn.</p>
          </div>
        </div>
      </main>

      <footer className="container mx-auto px-4 py-8 text-center text-gray-500">
        <p>&copy; 2026 Debt Tracker. Miễn phí và bảo mật.</p>
      </footer>
    </div>
  );
}
