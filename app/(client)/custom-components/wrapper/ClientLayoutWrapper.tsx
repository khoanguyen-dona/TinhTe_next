'use client'
import "../../globals.css";
import  { Toaster } from 'react-hot-toast';
import Navbar from "../Navbar";
import Footer from "../Footer";
import { Provider } from "react-redux";
import { store } from "@/redux/store";
import { PersistGate } from "redux-persist/integration/react";
import '@fancyapps/ui/dist/fancybox/fancybox.css';
import { Fancybox } from "@fancyapps/ui";
import ChatBox from "../ChatBox";
import { SocketProvider } from "@/context/socketContext";
import { persistor } from "@/redux/store";



export default function ClientLayoutWrapper({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      
      <body className={` antialiased`}>
          <SocketProvider>
            <Provider store={store}>
              <PersistGate loading={null} persistor={persistor} >
                
                <div><Navbar /></div>


                <div className="flex justify-center">
                  <div className=" w-[1200px]">
                  {children}
                  </div>
                </div>

                <ChatBox />
                <Toaster 
                  position="top-right"
                  reverseOrder={false}
                  containerClassName="mt-14"
                />

                <div><Footer /></div>

              </PersistGate>
            </Provider >
          </SocketProvider>

      </body>
        
    </html>
  );
}
