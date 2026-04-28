import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Giới thiệu - Debt Tracker",
  description: "Tìm hiểu về Debt Tracker - ứng dụng quản lý nợ miễn phí, an toàn và dễ sử dụng cho cá nhân và nhóm.",
  keywords: ["giới thiệu", "about", "debt tracker", "quản lý nợ"],
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/landing" className="text-2xl font-bold text-gray-800">💰 Debt Tracker</Link>
          <nav className="space-x-4">
            <Link href="/landing" className="text-gray-600 hover:text-blue-600">Trang chủ</Link>
            <Link href="/features" className="text-gray-600 hover:text-blue-600">Tính năng</Link>
            <Link href="/" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Đăng nhập</Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Giới thiệu về Debt Tracker</h1>
        
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Debt Tracker là gì?</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Debt Tracker là ứng dụng quản lý nợ miễn phí được thiết kế để giúp cá nhân và nhóm bạn bè 
            theo dõi các khoản nợ một cách dễ dàng và minh bạch. Với giao diện thân thiện và 
            các tính năng mạnh mẽ, bạn có thể quản lý tài chính cá nhân hiệu quả hơn.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Tại sao chọn Debt Tracker?</h2>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span><strong>Miễn phí hoàn toàn:</strong> Không có phí ẩn, không giới hạn tính năng</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span><strong>Bảo mật cao:</strong> Dữ liệu được mã hóa và bảo vệ an toàn</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span><strong>Dễ sử dụng:</strong> Giao diện trực quan, không cần hướng dẫn phức tạp</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span><strong>Real-time:</strong> Cập nhật thông tin nợ ngay lập tức</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-semibold mb-4">Liên hệ</h2>
          <p className="text-gray-600">
            Nếu bạn có câu hỏi hoặc góp ý, vui lòng liên hệ với chúng tôi qua email.
          </p>
        </div>
      </main>

      <footer className="bg-white border-t mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-gray-500">
          <p>&copy; 2026 Debt Tracker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
