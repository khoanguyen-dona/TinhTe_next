'use client'
import { setChatList } from '@/redux/chatListRedux';
import { RootState } from '@/redux/store';
import { setAccessToken, setUser } from '@/redux/userRedux';
import { publicRequest } from '@/requestMethod';
import { Router } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { Check } from 'lucide-react';
import ThreeDotLoading from '../custom-components/ThreeDotLoading';
const page = () => {
   const dispatch = useDispatch()
    const user = useSelector((state:RootState)=>state.user.currentUser)
    const router = useRouter()
    useEffect(() => {
          
         // get chatList
         const getData = async() => {
            if(user===null){   
              try { 
                    const res_user = await publicRequest(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/user`,{withCredentials: true})
                    if(res_user.data){
                        dispatch(setUser(res_user.data.user))
                        dispatch(setAccessToken(res_user.data.accessToken))
                        dispatch(setChatList(res_user.data.chatList))
                        setTimeout(()=>{
                            window.location.href = '/'    
                        },1000)
                    }
                    
                    // router.push('/?googlaAuth=true')         
              }catch(err){
                    console.log('error while fetch user',err)
              } finally{  
                                
              } 
            }    
          }
          getData()
     
      }, [])
    
    
  return (
    <div className={` h-screen  flex justify-center items-center `}>

        <div className='flex flex-col p-4 gap-10 w-5/6  md:w-2/3 lg:w-1/2 xl:w-1/3 mt-0 h-auto bg-white rounded-xl border-2 border-gray-200 shadow-2xl' >
            <div className=' gap-2 bg-green-100 rounded-lg text-center p-4 flex justify-center items-center'>
                <Check className='text-white bg-green-500 p-1 w-8 h-8  rounded-full' />
                <h1 className='text-2xl text-green-500 font-bold text-center' >Đăng nhập thành công </h1>
            </div>       
            <div className='text-gray-400 text-xl font-bold flex gap-2 justify-center'>
              Đang chuyển hướng
              <ThreeDotLoading className={'w-4 h-4'} />
            </div>
                      
        </div>
    </div>
  )
}

export default page