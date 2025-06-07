'use client'
import { Geist, Geist_Mono } from "next/font/google";
import "./profile.css";
import  { Toaster } from 'react-hot-toast';
import Navbar from "../(client)/custom-components/Navbar";
import Footer from "../(client)/custom-components/Footer";
import { Provider } from "react-redux";
import {store, persistor} from '../../redux/store'
import { PersistGate } from "redux-persist/integration/react";
import '@fancyapps/ui/dist/fancybox/fancybox.css';
import { Fancybox } from "@fancyapps/ui";
import ChatBox from "../(client)/custom-components/ChatBox";
import { SocketProvider } from "@/context/socketContext";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor} >
            <SocketProvider>
            
            <div><Navbar /></div>
              {children}
            <ChatBox />
            <Toaster 
              position="top-right"
              reverseOrder={false}
              containerClassName="mt-14"
            />

            <div><Footer /></div>

            </SocketProvider>
          </PersistGate>
        </Provider >
      </body>
        
    </html>
  );
}
