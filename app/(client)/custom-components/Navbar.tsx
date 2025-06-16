import React, { KeyboardEventHandler, useEffect, useState } from 'react'
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import Image from 'next/image'
import { setAccessToken, setUser } from '@/redux/userRedux'
import toast from 'react-hot-toast'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { useDispatch } from 'react-redux'
import { useRouter } from 'next/navigation'
import { ChatType, User } from '@/dataTypes'
import ChatItem from './ChatItem'
import { userRequest } from '@/requestMethod'
import { addChatToChatList, addChatToChatListAtTail, setChatList, setChatListHasNext } from '@/redux/chatListRedux'
import { setMessages } from '@/redux/chatRedux'
import { setSenderData } from '@/redux/chatRedux'
import { setChatId } from '@/redux/chatRedux'
import { setChatState } from '@/redux/chatRedux'
import { setChatPage } from '@/redux/chatRedux'
import { setNotifyCount } from '@/redux/chatListRedux'
import { Loader, Search } from 'lucide-react'
import Link from 'next/link'
const Navbar = () => {
  const router = useRouter()
  const dispatch = useDispatch()
  const notiCount:number|null = useSelector((state:RootState)=>state.chatList.notifyCount)
  const user:User|null = useSelector((state: RootState)=>state.user.currentUser)
  const chatList: ChatType[] = useSelector((state: RootState)=>state.chatList.currentChatList)
  const chatListHasNext = useSelector((state: RootState)=>state.chatList.hasNext)
  const [keyWord,setKeyWord] = useState<string>()
  const [loading, setLoading] = useState<boolean>(false)
  const [page, setPage] = useState<number>(2)
  const chatListLimit = 10
  const [open, setOpen] = useState<boolean>(false)

  const handleLogout = () => {
    dispatch(setUser(null))
    dispatch(setChatList([]))
    dispatch(setChatPage(1))
    dispatch(setChatId(null))
    dispatch(setNotifyCount(0))
    dispatch(setSenderData(null))
    dispatch(setChatState(false))
    dispatch(setMessages(null))
    dispatch(setAccessToken(null))

    router.push(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/logout`) 
  }

 
  //calculate notifyCOunt
  useEffect(()=>{
      const calculate = () => {
          let number = 0 
          try {
              chatList && chatList.length>0 && chatList?.map((chat)=>{
                chat?.isReceiverSeen === false && user?._id !== chat?.senderId ? number+=1 : ''
              })
              
          } catch(err){
            console.log('calculate failed',err)
          } finally {
            dispatch(setNotifyCount(number))
          }
      }
      calculate()
  },[chatList])
  
  const handleSearch = () => {
    if(keyWord && keyWord?.length>0){
      router.push(`/search/${keyWord}`)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if(e.key==='Enter' && keyWord && keyWord.length>0 ){
      router.push(`/search/${keyWord}`)
    }
  }

  const handleSeeMore = () => {
      const getChatList = async() => {
        const res = await userRequest.get(`/chat/chat-list/${user?._id}?page=${page}&limit=${chatListLimit}`)
        if(res.data){
          res.data.chatList.map((chat:ChatType)=>{
            dispatch(addChatToChatListAtTail(chat))
          })
          dispatch(setChatListHasNext(res.data.hasNext))
        }
      }
      getChatList()
      setPage(page+1)
  }
  

  return (
    <div className='fixed top-0 left-0 h-16 bg-gray-100 w-full  z-50 p-2 flex justify-between  items-center gap-10 px-5' >
        <a className='flex  items-center gap-2  ' href='/' >
            <img src="/favicon.png" className='w-8  md:w-12 h-8 md:h-12' alt="" />
            <p className='font-bold text-lg md:text-xl ' >TinhTe.vn</p>
        </a>

        <div className='hidden md:flex items-center bg-white rounded-full '  >
          <input onKeyDown={handleKeyPress} onChange={(e)=>setKeyWord(e.target.value)} value={keyWord} type="text" placeholder="Tìm" className=' border-none p-2 focus:outline-none  md:w-60 lg:w-96' />
          <Search onClick={handleSearch} className=' hover:cursor-pointer hover:bg-blue-500 hover:text-white  rounded-full p-2 w-10 h-10 transition' />
        </div>

        <div className='flex flex-row items-center space-x-2' >
          <Link href='/write-post' className='hidden md:block bg-blue-500 p-3 px-2 w-[80px] text-center text-white rounded-full hover:cursor-pointer hover:bg-blue-700 transition'  >
            Viết bài 
          </Link>

         {/* mail button */}
          <Popover>
            <PopoverTrigger asChild >
           
              <div className='bg-gray-300 p-2  rounded-full hover:bg-blue-300 hover:cursor-pointer transition relative' title='Tin nhắn'>
                <img src="/email.png"  className='w-8 h-8 text-gray-400 opacity-60' alt="" />
                {notiCount>0 &&
                <>
                  <div className='absolute bg-red-500 rounded-full top-0 w-6 h-6 -right-2 p-[1px] text-center text-white'>{notiCount}</div>
                  <div className='bg-red-500 absolute top-0 animate-ping rounded-full -right-2 z-40 w-6 h-6  opacity-75'></div>
                  </>
                }
              </div>
          
            </PopoverTrigger>
            <PopoverContent>
              <div className='flex flex-col w-72 h-150 mr-2 bg-white fixed top-0 -right-20 sm:-right-2 shadow-2xl rounded-lg border-2 border-gray-200' >
                  <div className='p-2 text-lg flex justify-between'>
                    <p className='font-bold'>
                      Tin nhắn
                    </p>
                    {/* <p className='text-blue-500 hover:text-blue-700 hover:cursor-pointer'>Xem tất cả</p> */}
                  </div>

                  <hr className='text-gray-300 border-b-1 w-full'/>

                  <div className='h-140   overflow-auto'>
                    <>                  
                    {chatList && chatList?.length>0 && chatList?.map((chat: ChatType,index)=>(            
                      <ChatItem chat={chat} key={index} userId={user?._id as string} />  
                      ))
                    }    
                    {chatListHasNext &&
                      <div onClick={handleSeeMore} className='p-2 justify-center  bg-blue-50 text-blue-500 hover:cursor-pointer hover:bg-blue-100 flex gap-2'>
                      {loading && <Loader className='animate-spin' />}
                      Xem thêm
                    </div>
                    }
                    </>                                        
                  </div>
                  {/* <div className='h-10 flex rounded-b-lg justify-center items-center hover:cursor-pointer bg-gray-100
                     text-blue-500 hover:text-blue-600'>
                      Xem tất cả
                  </div> */}
              </div>
            </PopoverContent>
          </Popover>

          
          {/* notification button */}
          <Popover   >
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
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild >
              <div className='bg-gray-300  p-1 rounded-full hover:bg-blue-300 hover:cursor-pointer transition '>
                {user!==null && user?.img!=='' ? 
                  <Image width={80} height={80} src={user?.img}  className='w-11 h-11 object-cover rounded-full' alt="" />
                  :
                  <img src="/user.png"  className='w-10 h-10 ' alt="" />}
              </div>
            </PopoverTrigger>
            <PopoverContent>
              <div className='flex flex-col w-48 h-auto mr-2 bg-white fixed top-0 -right-2 shadow-2xl border-2 border-gray-200 rounded-lg ' >
                <Link onClick={()=>setOpen(false)} href='/account' className='flex  items-center gap-2 hover:cursor-pointer hover:bg-blue-300 rounded-lg p-2 transition'>
                    <img src="/user.png" className='w-8 h-8' alt="" /> 
                    Thông tin cá nhân      
                </Link>
                <Link onClick={()=>setOpen(false)} href='/account/my-post' className='flex  items-center gap-2 hover:cursor-pointer hover:bg-blue-300 rounded-lg p-2 transition'>
                    <img src="/my-post.png" className='w-8 h-8' alt="" /> 
                    Bài đăng của tôi      
                </Link>
                <div onClick={handleLogout}  className='flex  items-center gap-2  hover:cursor-pointer hover:bg-blue-300 p-2 rounded-lg transition'>
                  <img src="/power.png" className='w-8 h-8' alt="" />
                  Đăng xuất
                </div>
              </div>
            </PopoverContent>
          </Popover>
          : 
          <div className='bg-gray-300 rounded-full p-1 hover:bg-blue-300 transition' title='Đăng nhập' >
            <Link href="/login">
              <img src="/user.png" className='w-10 h-10'  alt="" />
            </Link>
          </div>
          } 
        </div>
    </div>
  )
}

export default Navbar