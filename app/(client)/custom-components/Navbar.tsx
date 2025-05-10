import React from 'react'
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import Image from 'next/image'
import { setUser } from '@/redux/userRedux'
import toast from 'react-hot-toast'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { useDispatch } from 'react-redux'
import { useRouter } from 'next/navigation'
import { User } from '@/dataTypes'
const Navbar = () => {
  const router = useRouter()
  const dispatch = useDispatch()
  const user:User|null = useSelector((state: RootState)=>state.user.currentUser)
 
  const handleLogout = () => {
      dispatch(setUser(null))
      router.push(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/logout`) 
  }

  return (
    <div className='fixed top-0 left-0 h-16 bg-gray-100 w-full  z-20 p-2 flex justify-between  items-center gap-10 px-5' >
        <a className='flex  items-center gap-2  ' href='/' >
            <img src="/favicon.png" className='w-12 h-12' alt="" />
            <p className='font-bold text-xl ' >TinhTe.vn</p>
        </a>

        <div className='hidden md:block'>
          <Input type="text" placeholder="Tìm" className='bg-gray-300 border-none rounded-full md:w-60 lg:w-96' />
        </div>

        <div className='flex flex-row items-center space-x-2' >
          <div className='hidden md:block bg-blue-500 p-2 px-4 text-white rounded-full hover:cursor-pointer hover:bg-blue-700 transition'>
            Viết bài 
          </div>

         {/* mail button */}
          <Popover>
            <PopoverTrigger asChild >
              <div className='bg-gray-300 p-2  rounded-full hover:bg-blue-300 hover:cursor-pointer transition' title='Tin nhắn'>
                <img src="/email.png"  className='w-8 h-8 text-gray-400 opacity-60' alt="" />
              </div>
            </PopoverTrigger>
            <PopoverContent>
              <div className='flex flex-col w-72 h-82 mr-2 bg-white fixed top-0 -right-20 sm:-right-2 shadow-2xl rounded-lg border-2 border-gray-200' >
                  <div className='p-2 text-lg flex justify-between'>
                    <p className='font-bold'>
                      Tin nhắn
                    </p>
                    <p className='text-blue-500 hover:text-blue-700 hover:cursor-pointer'>Xem tất cả</p>
                  </div>

                  <hr className='text-gray-300 border-b-1 w-full'/>

                  <div className='h-60   overflow-auto'>
                    <div className='p-2 hover:bg-gray-200 flex-col'>
                      <p>
                        Tin nhắn 1   
                      </p>
                      <p className='text-sm text-gray-400'>
                        7 ngày trước           
                      </p> 
                    </div>
                    <div className='p-2 hover:bg-gray-200 flex-col'>
                      <p>
                        Tin nhắn 1   
                      </p>
                      <p className='text-sm text-gray-400'>
                        7 ngày trước           
                      </p> 
                    </div>
                    <div className='p-2 hover:bg-gray-200 flex-col'>
                      <p>
                        Tin nhắn 1   
                      </p>
                      <p className='text-sm text-gray-400'>
                        7 ngày trước           
                      </p> 
                    </div>
                    <div className='p-2 hover:bg-gray-200 flex-col'>
                      <p>
                        Tin nhắn 1   
                      </p>
                      <p className='text-sm text-gray-400'>
                        7 ngày trước           
                      </p> 
                    </div>
                    <div className='p-2 hover:bg-gray-200 flex-col'>
                      <p>
                        Tin nhắn 1   
                      </p>
                      <p className='text-sm text-gray-400'>
                        7 ngày trước           
                      </p> 
                    </div>
                    <div className='p-2 hover:bg-gray-200 flex-col'>
                      <p>
                        Tin nhắn 1   
                      </p>
                      <p className='text-sm text-gray-400'>
                        7 ngày trước           
                      </p> 
                    </div>
                  </div>
                  <div className='h-10 flex rounded-b-lg justify-center items-center hover:cursor-pointer bg-gray-100
                     text-blue-500 hover:text-blue-600'>
                      Xem tất cả
                  </div>
              </div>
            </PopoverContent>
          </Popover>

          
          {/* notification button */}
          <Popover>
            <PopoverTrigger asChild >
              <div className='bg-gray-300 p-2  rounded-full hover:bg-blue-300 hover:cursor-pointer transition ' title='Thông báo'>
                <img src="/bell.png"  className='w-8 h-8 opacity-60' alt="" />
              </div>
            </PopoverTrigger>
            <PopoverContent>
            <div className='flex flex-col w-72 h-82 mr-2 bg-white fixed top-0 -right-10 sm:-right-2 shadow-2xl border-2 border-gray-200 rounded-lg '  >
                  <div className='p-2 text-lg flex justify-between'>
                    <p className='font-bold'>
                      Thông báo
                    </p>
                    <p className='text-blue-500 hover:text-blue-700 hover:cursor-pointer'>Đánh dấu đã đọc</p>
                  </div>

                  <hr className='text-gray-300 border-b-1 w-full'/>

                  <div className='h-60   overflow-auto'>
                    <div className='p-2 hover:bg-gray-200 flex-col'>
                      <p>
                        Tin nhắn 1   
                      </p>
                      <p className='text-sm text-gray-400'>
                        7 ngày trước           
                      </p> 
                    </div>
                    <div className='p-2 hover:bg-gray-200 flex-col'>
                      <p>
                        Tin nhắn 1   
                      </p>
                      <p className='text-sm text-gray-400'>
                        7 ngày trước           
                      </p> 
                    </div>
                    <div className='p-2 hover:bg-gray-200 flex-col'>
                      <p>
                        Tin nhắn 1   
                      </p>
                      <p className='text-sm text-gray-400'>
                        7 ngày trước           
                      </p> 
                    </div>
                    <div className='p-2 hover:bg-gray-200 flex-col'>
                      <p>
                        Tin nhắn 1   
                      </p>
                      <p className='text-sm text-gray-400'>
                        7 ngày trước           
                      </p> 
                    </div>
                    <div className='p-2 hover:bg-gray-200 flex-col'>
                      <p>
                        Tin nhắn 1   
                      </p>
                      <p className='text-sm text-gray-400'>
                        7 ngày trước           
                      </p> 
                    </div>
                    <div className='p-2 hover:bg-gray-200 flex-col'>
                      <p>
                        Tin nhắn 1   
                      </p>
                      <p className='text-sm text-gray-400'>
                        7 ngày trước           
                      </p> 
                    </div>
                  </div>
                  <div className='h-12 flex justify-center items-center hover:cursor-pointer bg-gray-100
                     text-blue-500 hover:text-blue-600'>
                      Xem tất cả
                  </div>
            </div>
            </PopoverContent>
          </Popover>

            {/* user button */}
          {user !== null ?
          <Popover>
            <PopoverTrigger asChild >
              <div className='bg-gray-300  p-1 rounded-full hover:bg-blue-300 hover:cursor-pointer transition '>
                {user!==null && user?.img!=='' ? <Image width={40} height={40} src={user?.img}  className='w-11 h-11 object-cover rounded-full' alt="" />
                :<img src="/user.png"  className='w-8 h-8 ' alt="" />}
              </div>
            </PopoverTrigger>
            <PopoverContent>
              <div className='flex flex-col w-48 h-auto mr-2 bg-white fixed top-0 -right-2 shadow-2xl border-2 border-gray-200 rounded-lg ' >
                <a href='/account' className='flex  items-center gap-2 hover:cursor-pointer hover:bg-blue-300 rounded-lg p-2 transition'>
                    <img src="/user.png" className='w-8 h-8' alt="" /> 
                    Thông tin cá nhân      
                </a>
                <div onClick={handleLogout}  className='flex  items-center gap-2  hover:cursor-pointer hover:bg-blue-300 p-2 rounded-lg transition'>
                  <img src="/power.png" className='w-8 h-8' alt="" />
                  Đăng xuất
                </div>
              </div>
            </PopoverContent>
          </Popover>
          : 
          <div className='bg-gray-300 rounded-full p-2 hover:bg-blue-300 transition ' title='Đăng nhập' >
            <a href="/login">
              <img src="/user.png" className='w-8 h-8'  alt="" />
            </a>
          </div>
          } 
        </div>
    </div>
  )
}

export default Navbar