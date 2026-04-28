import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hồ sơ - Debt Tracker",
  description: "Quản lý thông tin cá nhân của bạn. Cập nhật tên, số điện thoại, địa chỉ và avatar. Đổi mật khẩu để bảo mật tài khoản.",
  keywords: ["hồ sơ", "profile", "thông tin cá nhân", "cập nhật tài khoản", "đổi mật khẩu"],
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
