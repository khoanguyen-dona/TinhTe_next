'use client'

import "./admin.css"
import  { Toaster } from 'react-hot-toast';
import Footer from "../(client)/custom-components/Footer";
import { Provider } from "react-redux";
import {store, persistor} from '../../redux/store'
import { PersistGate } from "redux-persist/integration/react";
import '@fancyapps/ui/dist/fancybox/fancybox.css';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import AppSidebar from "./admin-components/AppSidebar";

import { useRouter } from "next/navigation";


export default function RootLayout({ children }:Readonly<{ children: React.ReactNode }>) {

  const router = useRouter()

  if(localStorage as Storage !== undefined){

    const user = JSON.parse(localStorage.getItem('persist:root') as any)?.user;
    const currentUser = user && JSON.parse(user).currentUser
    
    if(currentUser?.isAdmin){

    } else {
        router.push('/admin-login')
    }
  }

  return (
   
    <html lang="en">

      <body className={`antialiased`}>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor} >      

            <SidebarProvider >
              <div className="absolute ">
                <AppSidebar  />     
              </div>
              <SidebarTrigger  className="fixed top-2 left-2  z-50 hover:cursor-pointer hover:bg-blue-100 bg-gray-200 p-4"/>    
              <main  >   
                  {children}                                              
              </main>                      
            </SidebarProvider>

            <div className="mt-10" >
              <Footer />
            </div>
          
            <Toaster 
              position="top-right"
              reverseOrder={false}
              containerClassName="mt-14"
            />

          </PersistGate>
        </Provider >
      </body>
      
    </html>
  
 
    
  );
}
