// import "./globals.css";
import { Metadata } from 'next'; // Quan trọng: import Metadata

import AdminLayoutWrapper from "./admin-components/AdminLayoutWrapper";

export const metadata: Metadata = {
  robots:{
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false
    },
    nocache: true,
    noarchive: true
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      
      <body className={` antialiased`}>
         <AdminLayoutWrapper>
            {children}
         </AdminLayoutWrapper>

      </body>
        
    </html>
  );
}





