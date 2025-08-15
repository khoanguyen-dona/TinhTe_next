// import "./globals.css";
import { Metadata } from 'next'; // Quan trọng: import Metadata

import ClientLayoutWrapper from "./custom-components/wrapper/ClientLayoutWrapper";

export const metadata: Metadata = {
  metadataBase: new URL(`${process.env.NEXT_PUBLIC_BROWSER_URL}`),
  title: 'TinhTe.vn - Mạng xã hội hỏi đáp, review thông tin công nghệ ', // Tiêu đề trang của bạn
  description: 'Mạng xã hội TinhTe.vn', // Mô tả trang web của bạn
  keywords: [ 'tinhte', 'donawebs.com', 'tinhte.donawebs.com','mạng xã hội' ],
  // verification: {
  //   google: 'google-site-verification: dasdassa'
  // },
  icons: { 
    icon: '/favicon.ico', // Đặt favicon.ico trong thư mục public/ của bạn
    // Hoặc nếu bạn có app/icon.png, bạn có thể dùng: icon: '/icon.png'
  },
  openGraph: {
    title: 'TinhTe.vn - Mạng xã hội hỏi đáp, review thông tin công nghệ',
    description: ' Mạng xã hội hỏi đáp, review thông tin công nghệ',
    images: ['/favicon.ico'], // Đặt og-image.jpg trong thư mục public/
  },
  twitter: { // Metadata cho chia sẻ trên Twitter
      card: 'summary_large_image', // Loại thẻ Twitter (summary, summary_large_image)
      title: 'TinhTe.vn - Mạng xã hội hỏi đáp, review thông tin công nghệ',
      description: ' Mạng xã hội hỏi đáp, review thông tin công nghệ',
      images:['/favicon.ico'],
    },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      
      <body className={` antialiased`}>
         <ClientLayoutWrapper>
            {children}
         </ClientLayoutWrapper>

      </body>
        
    </html>
  );
}





