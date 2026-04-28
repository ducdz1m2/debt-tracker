import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Chính sách bảo mật - Debt Tracker",
  description: "Chính sách bảo mật của Debt Tracker. Tìm hiểu cách chúng tôi bảo vệ dữ liệu cá nhân của bạn.",
  keywords: ["chính sách bảo mật", "privacy policy", "bảo mật", "debt tracker"],
};

export default function PrivacyPage() {
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

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Chính sách bảo mật</h1>
        
        <div className="bg-white rounded-xl shadow-md p-8 space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Thu thập thông tin</h2>
            <p className="text-gray-600">
              Chúng tôi chỉ thu thập thông tin cần thiết để cung cấp dịch vụ, bao gồm: tên đăng nhập, 
              họ tên, số điện thoại (tùy chọn), và địa chỉ (tùy chọn). Chúng tôi không thu thập 
              thông tin tài chính nhạy cảm như số thẻ tín dụng.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Sử dụng thông tin</h2>
            <p className="text-gray-600">
              Thông tin của bạn được sử dụng để: cung cấp dịch vụ quản lý nợ, kết nối với bạn bè, 
              và gửi thông báo về hoạt động tài khoản. Chúng tôi không bán hoặc chia sẻ thông tin 
              với bên thứ ba vì mục đích quảng cáo.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Bảo mật dữ liệu</h2>
            <p className="text-gray-600">
              Dữ liệu được lưu trữ trên Supabase với mã hóa SSL. Mật khẩu được hash bằng bcrypt. 
              Chúng tôi áp dụng các biện pháp bảo mật tiêu chuẩn ngành để bảo vệ dữ liệu của bạn.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Quyền của người dùng</h2>
            <p className="text-gray-600">
              Bạn có quyền: xem, chỉnh sửa, hoặc xóa thông tin cá nhân của mình. Liên hệ với chúng tôi 
              để thực hiện các yêu cầu này.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Thay đổi chính sách</h2>
            <p className="text-gray-600">
              Chúng tôi có thể cập nhật chính sách này theo thời gian. Thay đổi sẽ được thông báo 
              trên ứng dụng.
            </p>
          </section>

          <p className="text-gray-500 text-sm pt-4 border-t">
            Cập nhật lần cuối: 28/04/2026
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
