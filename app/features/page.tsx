import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Tính năng - Debt Tracker",
  description: "Khám phá tất cả tính năng của Debt Tracker: quản lý nợ, thống kê, kết bạn, và nhiều hơn nữa.",
  keywords: ["tính năng", "features", "quản lý nợ", "debt tracker", "thống kê"],
};

export default function FeaturesPage() {
  const features = [
    {
      icon: "📝",
      title: "Quản lý khoản nợ",
      description: "Thêm, sửa, xóa các khoản nợ dễ dàng. Ghi chú chi tiết về từng khoản nợ bao gồm số tiền, mô tả, ngày nợ và người nợ."
    },
    {
      icon: "📊",
      title: "Thống kê chi tiết",
      description: "Xem báo cáo tổng quan về tình hình nợ. Thống kê theo trạng thái, theo người nợ, và xu hướng theo thời gian."
    },
    {
      icon: "👥",
      title: "Kết nối bạn bè",
      description: "Kết bạn với người dùng khác để theo dõi nợ chung. Gửi và nhận lời mời kết bạn dễ dàng."
    },
    {
      icon: "🔔",
      title: "Thông báo real-time",
      description: "Nhận thông báo ngay lập tức khi có thay đổi về nợ hoặc lời mời kết bạn mới."
    },
    {
      icon: "🔒",
      title: "Bảo mật cao",
      description: "Dữ liệu được mã hóa và lưu trữ an toàn. Chỉ bạn và người được授权 mới có thể xem thông tin nợ."
    },
    {
      icon: "📱",
      title: "Responsive Design",
      description: "Sử dụng trên mọi thiết bị: desktop, tablet, và mobile. Giao diện tự động điều chỉnh phù hợp."
    },
    {
      icon: "🌐",
      title: "Tiếng Việt",
      description: "Giao diện hoàn toàn bằng tiếng Việt, dễ dàng sử dụng cho người Việt Nam."
    },
    {
      icon: "💰",
      title: "Miễn phí 100%",
      description: "Tất cả tính năng đều miễn phí. Không có giới hạn số lượng khoản nợ hay người dùng."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/landing" className="text-2xl font-bold text-gray-800">💰 Debt Tracker</Link>
          <nav className="space-x-4">
            <Link href="/landing" className="text-gray-600 hover:text-blue-600">Trang chủ</Link>
            <Link href="/about" className="text-gray-600 hover:text-blue-600">Giới thiệu</Link>
            <Link href="/" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Đăng nhập</Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Tính năng nổi bật</h1>
          <p className="text-xl text-gray-600">
            Debt Tracker cung cấp đầy đủ tính năng bạn cần để quản lý nợ hiệu quả
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/" className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition-colors inline-block">
            Bắt đầu sử dụng ngay
          </Link>
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
