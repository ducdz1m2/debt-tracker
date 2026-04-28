import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Debt Tracker - Quản lý nợ cá nhân và nhóm bạn",
  description: "Ứng dụng quản lý nợ miễn phí giúp bạn theo dõi các khoản nợ, chia sẻ với bạn bè và quản lý tài chính cá nhân hiệu quả. Dễ sử dụng, an toàn và bảo mật.",
  keywords: ["quản lý nợ", "debt tracker", "theo dõi nợ", "nợ cá nhân", "nợ nhóm", "quản lý tài chính", "debt management", "thanh toán nợ", "lịch sử nợ"],
  authors: [{ name: "Debt Tracker Team" }],
  creator: "Debt Tracker",
  publisher: "Debt Tracker",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://debt-tracker-jade.vercel.app'),
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "https://debt-tracker-jade.vercel.app",
    title: "Debt Tracker - Quản lý nợ cá nhân và nhóm bạn",
    description: "Ứng dụng quản lý nợ miễn phí giúp bạn theo dõi các khoản nợ, chia sẻ với bạn bè và quản lý tài chính cá nhân hiệu quả.",
    siteName: "Debt Tracker",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Debt Tracker - Quản lý nợ",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Debt Tracker - Quản lý nợ cá nhân và nhóm bạn",
    description: "Ứng dụng quản lý nợ miễn phí giúp bạn theo dõi các khoản nợ, chia sẻ với bạn bè và quản lý tài chính cá nhân hiệu quả.",
    images: ["/og-image.png"],
    creator: "@debttracker",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "EnAVy6zluorHXEDNxqKTVb1QxR6Et0YCG2Fiy-_1WQ4",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Debt Tracker',
    description: 'Ứng dụng quản lý nợ miễn phí giúp bạn theo dõi các khoản nợ, chia sẻ với bạn bè và quản lý tài chính cá nhân hiệu quả.',
    url: 'https://debt-tracker-jade.vercel.app',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'Theo dõi nợ cá nhân',
      'Quản lý nợ nhóm',
      'Thống kê chi tiết',
      'Kết nối với bạn bè',
      'Báo cáo tài chính',
    ],
    inLanguage: 'vi',
    author: {
      '@type': 'Organization',
      name: 'Debt Tracker Team',
    },
  };

  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
