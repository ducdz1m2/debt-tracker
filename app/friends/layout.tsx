import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bạn bè - Debt Tracker",
  description: "Quản lý danh sách bạn bè và kết nối với người dùng khác để theo dõi nợ chung. Gửi lời mời kết bạn và chấp nhận lời mời.",
  keywords: ["bạn bè", "kết bạn", "friend list", "kết nối", "social debt tracking"],
};

export default function FriendsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
