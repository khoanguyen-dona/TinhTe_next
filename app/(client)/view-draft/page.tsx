'use client'
import { RootState } from '@/redux/store'
import React from 'react'
import { useSelector } from 'react-redux'
import JoditViewer from '../custom-components/JoditViewer'
import { User } from '@/dataTypes'
import Image from 'next/image'
const page = () => {
    const now = new Date()
    const date = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()} ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
    const user: User|null = useSelector((state: RootState)=>state.user.currentUser)
    const draft = useSelector((state: RootState)=>state.draft.currentDraft)
  return (
    <div className='flex flex-col px-2 md:px-8  xl:px-82  mt-30 h-auto '>
        <div className='text-2xl text-gray-500 text-center'>Bản Nháp</div>
        <div className='text-2xl md:text-3xl font-bold mt-10'>{draft?.title}</div>
        <div className='flex gap-2 mt-10'>
            {
                user && user.img ?
                <Image width={20} height={20} src={user?.img} className='w-12 h-12 rounded-full ' alt="" />
                : <img src='/user.png' className='w-12 h-12 rounded-full ' alt="" />
            }
            <div className='flex flex-col'>
                <div className='text-blue-500 font-bold'>{user?.username}</div>
                <div className='font-mono'>{date}</div>
            </div>
        </div>
        <div className='px-2'>
            <img src={draft?.thumbnail} className='w-full mt-4 rounded-xl ' alt="" />
        </div>
        <JoditViewer data={draft?.content} />

    </div>
  )
}

export default page