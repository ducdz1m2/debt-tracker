import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thống kê - Debt Tracker",
  description: "Xem thống kê chi tiết về các khoản nợ của bạn. Theo dõi tổng số tiền, trạng thái nợ và xu hướng theo tháng.",
  keywords: ["thống kê", "báo cáo nợ", "analytics", "debt statistics", "xu hướng nợ"],
};

export default function StatsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
