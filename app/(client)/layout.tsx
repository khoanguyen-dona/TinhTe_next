// import "./globals.css";
// import { Metadata } from 'next'; // Quan trọng: import Metadata

import ClientLayoutWrapper from "./custom-components/wrapper/ClientLayoutWrapper";

// export const metadata: Metadata = {
//   title: 'TinhTe.vn - Mạng xã hội hỏi đáp, review thông tin công nghệ ', // Tiêu đề trang của bạn
//   description: 'Mạng xã hội TinhTe.vn', // Mô tả trang web của bạn
//   icons: { // Cấu hình Favicon
//     icon: '/favicon.ico', // Đặt favicon.ico trong thư mục public/ của bạn
//     // Hoặc nếu bạn có app/icon.png, bạn có thể dùng: icon: '/icon.png'
//   },
//   // Thêm các metadata khác nếu cần (Open Graph, Twitter Cards, v.v.)
//   openGraph: {
//     title: 'TinhTe.vn - Mạng xã hội hỏi đáp, review thông tin công nghệ',
//     description: ' Mạng xã hội hỏi đáp, review thông tin công nghệ',
//     images: ['/favicon.ico'], // Đặt og-image.jpg trong thư mục public/
//   },
// };

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





