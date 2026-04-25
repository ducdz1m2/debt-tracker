# Debt Tracker - Quản lý Nợ

Ứng dụng quản lý nợ cho nhóm bạn, giúp theo dõi các khoản nợ giữa các thành viên một cách dễ dàng.

## Tính năng

### 🔐 Authentication
- **Đăng ký tài khoản**: Tạo tài khoản với username và password
- **Đăng nhập**: Đăng nhập với username/password
- **Đăng xuất**: Xóa session và logout
- **Profile**: Chỉnh sửa thông tin cá nhân (số điện thoại, avatar, đổi mật khẩu)

### 💰 Quản lý Nợ
- **Thêm khoản nợ mới**: Tạo khoản nợ với thông tin:
  - Số tiền
  - Nội dung
  - Người nợ (gán cho thành viên khác)
  - Ngày nợ
- **Danh sách nợ**: Xem tất cả các khoản nợ với thông tin chi tiết
- **Trạng thái nợ**:
  - `Chờ xác nhận` - Khoản nợ mới được tạo
  - `Đã xác nhận` - Người nợ đã xác nhận khoản nợ
  - `Đã từ chối` - Người nợ đã từ chối khoản nợ
- **Xác nhận/Từ chối**: Người được gán nợ có thể xác nhận hoặc từ chối khoản nợ
- **Thanh toán**: Đánh dấu khoản nợ đã thanh toán (soft delete)

### 🔔 Thông báo
- **Notification**: Nhận thông báo khi có khoản nợ mới được gán cho bạn
- **Auto-refresh**: Danh sách nợ tự động cập nhật mỗi 10 giây

### 🎨 Giao diện
- **Dark/Light mode**: Chuyển đổi chế độ tối/sáng
- **Responsive**: Tương thích với mọi thiết bị
- **Loading indicator**: Hiển thị trạng thái tải dữ liệu

## Tech Stack

- **Frontend**: Next.js 13 (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Custom authentication (username/password) với localStorage
- **Icons**: Lucide React

## Cài đặt

1. Clone repository:
```bash
git clone https://github.com/ducdz1m2/debt-tracker.git
cd debt-tracker
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Tạo file `.env.local` và thêm các biến môi trường:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
```

4. Chạy development server:
```bash
npm run dev
```

5. Mở [http://localhost:3000](http://localhost:3000) trên trình duyệt

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Debts Table
```sql
CREATE TABLE debts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  debt_date DATE NOT NULL,
  debtor_name TEXT NOT NULL,
  created_by TEXT,
  assigned_to UUID,
  status TEXT DEFAULT 'pending',
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Deploy

Ứng dụng được deploy trên [Vercel](https://vercel.com).

## License

MIT
