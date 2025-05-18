'use client'
import React, { useEffect } from 'react'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,

  } from "@/components/ui/sidebar"
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { NavUser } from './NavUser'
import { useSidebar } from "@/components/ui/sidebar"
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { User } from '@/dataTypes'
// Menu items.
const items = [
    {
      title: "Home",
      url: "/admin",
      src: '/home.png'
    },
    {
      title: "Post",
      url: "/admin/posts",
      src: '/my-post.png',
    },
    {
      title: "User",
      url: "/admin/users",
      src: '/person.png',
    },
  ]
   
// const data = {
//     user:{
//         name:'dona',
//         email:'dona@gmail.com',
//         avatar: '/user.png'
//     }
// }

  export function AppSidebar() {
    const {
        state,
        open,
        setOpen,
        openMobile,
        setOpenMobile,
        isMobile,
        toggleSidebar,
    } = useSidebar()

    const user = useSelector((state: RootState)=>state.user.currentUser)
    const  pathname = usePathname()

    useEffect(()=>{
      setOpen(false)
    },[])

    return (
        <>
            <Sidebar  >
                <SidebarContent>
                <SidebarGroup className=''>
                    <SidebarGroupLabel className='flex justify-end'> TinhTe.vn</SidebarGroupLabel>
                    <SidebarGroupContent className='mt-10'>
                    <SidebarMenu>
                        {items.map((item) => (
                        <SidebarMenuItem key={item.title} onClick={()=>setOpen(false)} >
                            <SidebarMenuButton asChild isActive={item.url===pathname}>
                            <a  href={item.url}  >
                                <img src={item.src} className={`${state==='expanded'?'w-6 h-6':'w-4 h-4'}  object-cover `} alt="" />
                            
                                <span className='text-lg'>{item.title}</span>
                            </a>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                </SidebarContent>

                <SidebarFooter>
                    <NavUser user={user as User} />
                </SidebarFooter>
            </Sidebar>
           
            
        </>
    )
  }

export default AppSidebar

