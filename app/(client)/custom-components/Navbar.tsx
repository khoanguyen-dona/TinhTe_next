import React, { useEffect, useState } from 'react'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import Image from 'next/image'
import { setUser } from '@/redux/userRedux'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { useDispatch } from 'react-redux'
import { useRouter } from 'next/navigation'
import { ChatType, NotificationType, User } from '@/dataTypes'
import ChatItem from './ChatItem'
import { userRequest } from '@/requestMethod'
import {  addChatToChatListAtTail, setChatList, setChatListHasNext } from '@/redux/chatListRedux'
import { setChatLoading, setMessages } from '@/redux/chatRedux'
import { setSenderData } from '@/redux/chatRedux'
import { setChatId } from '@/redux/chatRedux'
import { setChatState } from '@/redux/chatRedux'
import { setChatPage } from '@/redux/chatRedux'
import { setNotifyCount } from '@/redux/chatListRedux'
import { Loader, Search } from 'lucide-react'
import Link from 'next/link'
import { AlignJustify } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import ReactTimeAgoUtil from '@/utils/ReactTimeAgoUtil'
import { addNotificationAtTail, addToNotifications, setNotificationCount, setNotifications, setNotificationsHasNext, updateNotifications } from '@/redux/notificationRedux'
import { useSocket } from '@/context/socketContext'



const Navbar = () => {
  const router = useRouter()
  const dispatch = useDispatch()
  const mailNotiCount:number = useSelector((state:RootState)=>state.chatList.notifyCount)
  const notificationCount:number = useSelector((state:RootState)=>state.notification.notificationCount)
  const notificationHasNext: boolean = useSelector((state:RootState)=>state.notification.hasNext)
  const user:User|null = useSelector((state: RootState)=>state.user.currentUser)
  const chatList: ChatType[] = useSelector((state: RootState)=>state.chatList.currentChatList)
  const notifications: NotificationType[] = useSelector((state: RootState)=>state.notification.currentNotifications)
  const chatListHasNext = useSelector((state: RootState)=>state.chatList.hasNext)
  const [keyWord,setKeyWord] = useState<string>()
  const [page, setPage] = useState<number>(2)
  const chatListLimit = 1
  const [open, setOpen] = useState<boolean>(false)
  const [sheetStatus, setSheetStatus] = useState<boolean>(false)
  const [openNotify, setOpenNotify] = useState<boolean>(false)
  const [openChatList, setOpenChatList] = useState<boolean>(false)
  const notificationLimit = 10
  const [notificationPage, setNotificationPage] = useState<number>(2)
  const [mailLoading, setMailLoading] = useState<boolean>(false)
  const [notifyLoading, setNotifyLoading] = useState<boolean>(false)
  const {socket } = useSocket()

  const handleLogout = () => {
    dispatch(setUser(null))
    dispatch(setChatList([]))
    dispatch(setChatPage(1))
    dispatch(setChatId(null))
    dispatch(setNotifyCount(0))
    dispatch(setNotifications([]))
    dispatch(setSenderData(null))
    dispatch(setChatState(false))
    dispatch(setMessages(null))
    localStorage.removeItem('accessToken')
    dispatch(setChatLoading(false))
    router.push(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/logout`) 
  }

  useEffect(()=>{
      socket?.on('getNotification', (data: NotificationType)=>{
          const findNotification = notifications.find((notification:NotificationType)=>notification._id===data._id)
          if(findNotification){
            return
          } else {
            dispatch(addToNotifications(data))
          }
      })
      return () => {
        socket?.off('getNotification');
      }

  },[socket])

   //calculate notificationCount for mail 
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
 
  //calculate notificationCount for notification
  useEffect(()=>{
      const calculate = () => {
          let number = 0 
          try {
            notifications && notifications.length>0 && notifications?.map((notification)=>{
              notification?.isReceiverSeen === false  ? number+=1 : ''
              })
              
          } catch(err){
            console.log('calculate failed',err)
          } finally {
            dispatch(setNotificationCount(number))
          }
      }
      calculate()
  },[notifications])
  
  const handleSearch = () => {
    if(keyWord && keyWord?.length>0){
      setSheetStatus(false)
      router.push(`/search/${keyWord}`)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if(e.key==='Enter' && keyWord && keyWord.length>0 ){
      setSheetStatus(false)
      router.push(`/search/${keyWord}`)
    }
  }

  // handle see more chat list
  const handleSeeMore = () => {
      const getChatList = async() => {
        setMailLoading(true)
        const res = await userRequest.get(`/chat/chat-list/${user?._id}?page=${page}&limit=${chatListLimit}`)
        if(res.data){
          res.data.chatList.map((chat:ChatType)=>{
            dispatch(addChatToChatListAtTail(chat))
          })
          dispatch(setChatListHasNext(res.data.hasNext))
          setMailLoading(false)
        }
      }
      if(user!==null){
        getChatList()
        setPage(page+1)
      }
  }

  const  handleSeenNotification = async (notificationId: string) => {
        
        // update data in local
        dispatch(updateNotifications({
          notifyId: notificationId,
          newData: {
            isReceiverSeen: true
          }
        }))

        const findNotification = notifications.find((notification:NotificationType)=>notification._id===notificationId)
        if(findNotification?.isReceiverSeen === true){
            return
        } else {
            // update data in mongodb
            await userRequest.put(`/notification/${notificationId}`,{
              isReceiverSeen: true
            })

            
        }
  }

  // handle see more notification
  const handleSeeMoreNotification = async() => {
      setNotifyLoading(true)
      const res = await userRequest.get(`/notification/${user?._id}?limit=${notificationLimit}&page=${notificationPage}`)
      if(res.data){
        res.data.notifications.map((notification:NotificationType)=>{
          dispatch(addNotificationAtTail(notification))
        })
        dispatch(setNotificationsHasNext(res.data.hasNext))
        setNotifyLoading(false)
      }
      setNotificationPage(prev=>prev+1)
  }
  

  return (
    <div className='fixed top-0 left-0 h-16 bg-gray-100 w-full   z-50  flex justify-between  items-center gap-2 md:gap-10 px-5' >

        
        <Sheet open={sheetStatus} onOpenChange={setSheetStatus} >
          <SheetTrigger> 
            <AlignJustify className='hover:cursor-pointer md:hidden  bg-gray-300 p-2 w-10 h-10 rounded-md' />
          </SheetTrigger>
          <SheetContent side='left' className='w-full ' >
            <SheetHeader>
              <SheetTitle >
                <a href='/' className='flex items-center gap-2 hover:cursor-pointer'  >
                  <img src="/favicon.png" className='w-8    md:w-12 h-8 md:h-12' alt="" />
                  <div className='text-2xl'>
                    TinhTe.vn            
                  </div>
                </a>                 
              </SheetTitle>
              <SheetDescription>
                <div className='flex flex-col mt-10'>
                  <div className=' flex items-center bg-gray-200 rounded-full '  >
                    <input onKeyDown={handleKeyPress} onChange={(e)=>setKeyWord(e.target.value)} value={keyWord} type="text" placeholder="Tìm kiếm" className=' border-none p-2 focus:outline-none  w-full' />
                    <Search onClick={handleSearch} className=' hover:cursor-pointer hover:bg-blue-500 hover:text-white  rounded-full p-2 w-10 h-10 transition' />
                  </div>
                  <Link onClick={()=>setSheetStatus(false)} href='/write-post' className='p-2 rounded-md text-black text-xl font-bold mt-4 hover:cursor-pointer' >
                    Đăng bài
                  </Link>
                </div>
              </SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
        <a className='flex  items-center gap-2  ' href='/' >     
              <img src="/favicon.png" className='w-8 hidden md:block  md:w-12 h-8 md:h-12' alt="" />
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
          <Popover  open={openChatList} onOpenChange={setOpenChatList}  >
            <PopoverTrigger asChild >
           
              <div
                  onClick={()=>dispatch(setChatState(false))} 
                 className='bg-gray-300 p-2  rounded-full hover:bg-blue-300 hover:cursor-pointer transition relative' title='Tin nhắn'>
                <img src="/email.png"  className='w-8 h-8 text-gray-400 opacity-60' alt="" />
                {mailNotiCount>0 &&
                <>
                  <div className='absolute bg-red-500 rounded-full top-0 w-6 h-6 -right-2 p-[1px] text-center text-white'>{mailNotiCount}</div>
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
                      <div onClick={()=>setOpenChatList(false)}>
                        <ChatItem  chat={chat} key={index} userId={user?._id as string} />  
                      </div>        
                      ))
                    }    
                    {chatListHasNext &&
                      <div onClick={handleSeeMore} className='p-2 justify-center  bg-blue-50 text-blue-500 hover:cursor-pointer hover:bg-blue-100 flex gap-2'>
                        {mailLoading && <Loader className='animate-spin' />}
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
          <Popover open={openNotify} onOpenChange={setOpenNotify}  >
            <PopoverTrigger asChild >
              <div className='bg-gray-300 p-2  rounded-full hover:bg-blue-300 hover:cursor-pointer transition relative' title='Thông báo'>
                <img src="/bell.png"  className='w-8 h-8 opacity-60' alt="" />
                {notificationCount>0 &&
                <>
                  <div className='absolute bg-red-500 rounded-full top-0 w-6 h-6 -right-2 p-[1px] text-center text-white'>{notificationCount}</div>
                  <div className='bg-red-500 absolute top-0 animate-ping rounded-full -right-2 z-40 w-6 h-6  opacity-75'></div>
                </>
                }
              </div>
            </PopoverTrigger>
            <PopoverContent>
            <div className='flex flex-col w-72 h-150 mr-2 bg-white fixed top-0 -right-10 sm:-right-2 shadow-2xl border-2 border-gray-200 rounded-lg '  >
                  <div className='p-2 text-lg flex justify-between'>
                    <p className='font-bold'>
                      Thông báo
                    </p>
                    {/* <p className='text-blue-500 hover:text-blue-700 hover:cursor-pointer'>Đánh dấu đã đọc</p> */}
                  </div>

                  <hr className='text-gray-300 border-b-1 w-full'/>

                  <div className='h-140   overflow-auto'>
                    {notifications?.map((notification: NotificationType, index)=>(
                    <>
                      <div onClick={()=>setOpenNotify(false)} className={`hover:bg-gray-100  p-2 ${notification.isReceiverSeen?'':'bg-red-100'} `}>
                        <Link href={`/post/${notification.postSlug}/${notification.postId}?commentId=${notification.commentId}&refCommentIdTypeThread=${notification.refCommentIdTypeThread} `} 
                              key={index} className={`  flex-col hover:cursor-pointer  `} 
                              onClick={()=>handleSeenNotification(notification?._id)}>
                          <div className='flex  items-center gap-2'>
                            <div className=' flex flex-col w-2/5'>
                              <p className='font-bold'>
                                {notification?.usernameRef?.slice(0,15)}
                              </p>
                              <p className='text-sm text-gray-400'>
                                <ReactTimeAgoUtil date={notification?.createdAt as Date} locale='vi-VN'  />           
                              </p> 
                            </div>
                            <div className='text-[15px] flex items-center w-3/5'>
                              {notification?.content}   
                            </div>
                          </div>
                          
                        </Link>
                      </div>
                      <hr />
                    </>
                      ))              
                    }
                    {
                      notificationHasNext &&
                      <div onClick={handleSeeMoreNotification} className='text-blue-500 flex bg-blue-50 hover:bg-blue-100 p-2 justify-center items-center hover:cursor-pointer'>
                        {notifyLoading && <Loader className='animate-spin' />}
                        Xem thêm                      
                      </div>
                    }
                  </div>
                  {/* <div className='h-12 flex justify-center items-center hover:cursor-pointer bg-gray-100
                     text-blue-500 hover:text-blue-600'>
                      Xem tất cả
                  </div> */}
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