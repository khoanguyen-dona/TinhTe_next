'use client'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from "@/components/ui/popover"
import { Check, Loader, X } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { SmilePlus } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { setChatState } from '@/redux/chatRedux'
import { setChatLoading } from '@/redux/chatRedux'
import { MessageType } from '@/dataTypes'
import ReactTimeAgoUtil from '@/utils/ReactTimeAgoUtil'
import { CircleUserRound } from 'lucide-react'
import { ChevronDown } from 'lucide-react'
import { userRequest } from '@/requestMethod'
import { setMessages } from '@/redux/chatRedux'
import { User } from '@/dataTypes'
import { setChatPage } from '@/redux/chatRedux'
// import { useSocket } from '@/context/socketContext'
import { Socket, io } from 'socket.io-client'
import { useRef } from 'react'
import { ChatType } from '@/dataTypes'
import { addChatToChatList, setChatList, updateChatList } from '@/redux/chatListRedux'
// import { useSocket } from '@/context/socketContext'
const ChatBox = () => {
    const dispatch = useDispatch()
 
    const socket = useRef<Socket|null>(null)
    const currentUser = useSelector((state: RootState)=>state.user.currentUser)
    const isOpen: boolean = useSelector((state: RootState)=>state.chat.isOpen)
    const senderData = useSelector((state: RootState)=>state.chat.senderData)
    const messages = useSelector((state: RootState)=>state.chat.messages)
    const chatId = useSelector((state: RootState)=>state.chat.chatId)
    const chatList = useSelector((state:RootState)=>state.chatList.currentChatList)
    const page = useSelector((state:RootState)=>state.chat.pageNumber)
    const limit = 4
    const [text, setText] = useState<string>()
    const [sendLoading, setSendLoading] = useState<boolean>(false)
    const [newMessages, setNewMessages ] = useState<MessageType[]>([])
    const [hasNext, setHasNext] = useState<boolean>(true)
    const [arrivalMessage, setArrivalMessage] = useState<MessageType>()
    const scrollRef = useRef<HTMLDivElement |null>(null)

    // init socket
    useEffect(() => {
        socket.current = io(process.env.NEXT_PUBLIC_SOCKET_IO)
        socket.current.emit('addUser', currentUser?._id)
        socket.current.on("getMessage", (data:any) => {
            console.log('heard a event')
            setArrivalMessage({
                _id: '',
                chatId: data?.chatId,
                sender: data?.sender,
                imgs: data?.imgs,
                text: data?.text,
                createdAt: new Date()  ,
                updatedAt: '',
            });

            // if chatId not exists in our chatId we set chatList to our localStorage chatList
            const chat = chatList?.find((chat)=>chat?._id===data?.chatId)        
            if(chat===undefined){
                const findChatList = async() => {
                    const res = await userRequest.get(`/chat/chat-list/${currentUser?._id}`)
                    dispatch(setChatList(res?.data?.chatList))
                }
                findChatList()
            }
        })
    }, []);
 

    console.log('socket',socket)

    const playNotificationSound = () => {
        const audio = new Audio('/notify-sound.mp3');
        audio.play()
      };

    const handleClose = () =>{
        dispatch(setChatState(false))
    }

    useEffect(()=>{
        setNewMessages(messages as MessageType[])
    },[messages])

  
    // push new message to current messages
    useEffect(()=>{
        if(arrivalMessage as MessageType && arrivalMessage?.chatId === chatId){
            setNewMessages(prev=>[...prev,arrivalMessage])
            playNotificationSound()
        } 

        // update state of Chat in local
        dispatch(updateChatList({chatId: arrivalMessage?.chatId as string, 
            newData:{
                lastMessage : arrivalMessage?.text,
                isReceiverSeen : false,
                senderId : arrivalMessage?.sender,
                updatedAt: new Date()
            }
        }))

    }, [arrivalMessage])

    // load previous message
    const handleLoadMessage = () => {
        dispatch(setChatPage(page+1))
    }

    // add new messages to localStorage messages
    useEffect(()=>{
        const getMessage = async () =>{
            const res = await userRequest.get(`/message?chatId=${chatId}&page=${page}&limit=${limit}`)
            if(res.data && newMessages.length>0){          
                res.data.messages.reverse().map((message: MessageType)=>{
                    setNewMessages(prev=>[message,...prev])
                })
                setHasNext(res.data.hasNext)
            }
        }
        getMessage()
    },[page])

    const handleSendMessage = async () => {
        try {
            setSendLoading(true)
            // create message in mongodb
            const res = await userRequest.post(`/message`,{
                chatId: chatId,
                sender: currentUser?._id,
                text: text,
                imgs:[]
            })

            // update to chatList in mongodb
            const res1 = await userRequest.put(`/chat/${chatId}`,{
                isReceiverSeen: false ,
                lastMessage: text,
                senderId: currentUser?._id
            })

            if(res.data && res1.data){
                setText('')
                // update to current chatId at local state
                dispatch(updateChatList({chatId: chatId as string, 
                    newData:{
                        lastMessage : text,
                        isReceiverSeen : true,
                        senderId : currentUser?._id,
                        updatedAt: new Date()
                    }
                }))

                // push message to current messages localStorage
                const sentMessage=({
                    _id: res.data.data._id,
                    chatId: res.data.data.chatId,
                    sender: res.data.data.sender,
                    imgs: res.data.data.imgs,
                    text: res.data.data.text,
                    createdAt: new Date()  ,
                    updatedAt: '',
                });

                if(newMessages?.length>0) {
                    setNewMessages(prev=>[...prev,sentMessage])
                } else{
                    setNewMessages([sentMessage])
                }
                setSendLoading(false)

                // send to socket
                socket?.current?.emit("sendMessage", {
                    chatId: chatId,
                    sender: currentUser?._id,
                    receiverId: senderData?._id,
                    imgs: [],
                    text: text,                  
                })


                
              

            }
        } catch(err){
            console.log('send message failed',err)
        }
    }
 
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'auto' });
      }, [newMessages]);

    // updated chat state field: isReceiverSeen? , set it to true in local state
    const handleSeen = async () => {
        dispatch(updateChatList({chatId: chatId as string, 
            newData:{
                isReceiverSeen : true,      
            }
        }))

        // updated chat state field: isReceiverSeen? , set it to true in mongodb
        const chat = chatList?.find((chat)=>chat?._id===chatId) 
        // if chat.isReceiverSeen === false we will send request to update the chat to true,if not will not send request
        if(chat?.isReceiverSeen===false){
            console.log('send a requetst')
            await userRequest.put(`/chat/${chatId}`,{
                isReceiverSeen: true ,
            })
        }
    }

  return (
    <>
    {isOpen &&
    <div className='fixed bottom-4 rounded-lg z-40 right-0 md:right-20 bg-white w-90 h-110 border-3 border-gray-100 shadow-2xl' onClick={handleSeen}>
        <div className='flex flex-col w-full  relative'>
            {/* tab info */}
            <div className='h-12  rounded-t-lg flex justify-between items-center px-2  '>
                <div  className='flex items-center  hover:bg-blue-100 p-1 rounded-lg hover:cursor-pointer '>
                    <Image src={senderData?.img as string||'/user.png'} width={40} height={40} className='w-8 h-8 object-cover rounded-full' alt='' />
                    <Popover>
                        <PopoverTrigger asChild >
                            <div className='p-2 rounded-md font-bold'>
                                {senderData?.username.slice(0,16)}                           
                            </div>
                        </PopoverTrigger>
                        <PopoverContent className='z-50 w-full '>
                            <div className='flex flex-col  w-full'>
                                <a href={`/profile/${senderData?._id} `}  className='flex gap-2 hover:bg-blue-100 w-full p-2 rounded-lg hover:cursor-pointer'>
                                    <div>
                                        <CircleUserRound />
                                    </div>
                                    <div>
                                        Thông tin tài khoản
                                    </div>
                                </a>
                            </div>
                        </PopoverContent>
                    </Popover>
                    {senderData?.verified &&
                        <Check className='rounded-full text-white bg-blue-500 w-4 h-4 p-[1px]' />
                    }  
                    <ChevronDown className='opacity-50 ml-4' />
                </div>              
                <div className=''>
                    <X onClick={handleClose} className='text-blue-500 hover:bg-blue-100 rounded-full p-1 w-8 h-8 hover:cursor-pointer ' />
                </div>
            </div>   
            <Separator />   

            {/* content  */}
            <div className=' h-80 w-88  overflow-auto space-y-4 p-2 ' >
                    {hasNext ?
                        <div 
                            onClick={handleLoadMessage}
                            className='flex justify-center items-center hover:bg-blue-100 hover:cursor-pointer text-blue-500 bg-gray-100 rounded-lg text-sm p-2 ' >
                        Xem tin cũ hơn
                        </div>
                        : ''
                    }
              
                    {newMessages?.length>0 && newMessages?.map((message: MessageType,index)=>(
                        
                        <div ref={scrollRef}  >
                        {message?.sender === currentUser?._id ?
                            <div className='ml-30'>
                                <div className='w-50 h-auto  p-2 rounded-xl bg-blue-700 text-white '  key={index} >
                                    {message?.text}
                                </div>
                                <div className='text-sm text-gray-400'>
                                    <ReactTimeAgoUtil date={message?.createdAt as Date} locale='vi-VN'/>
                                </div>
                            </div>
                            :
                            <div className='flex flex-col'> 
                                <div className='flex items-center'>
                                    <div className='w-10'>
                                        <Image src={senderData?.img||'/user.png'} className='w-8 h-8 rounded-full object-cover' alt='' width={40} height={40} />
                                    </div>
                                    <div  className='w-50 h-auto  p-2 rounded-xl bg-gray-100' key={index} >
                                        {message?.text}
                                    </div>
                                </div>                  
                                <div className='text-sm text-gray-400 ml-10'>
                                    <ReactTimeAgoUtil date={message?.createdAt as Date } locale='vi-VN'/>
                                </div>
                            </div>
                        }                  
                       </div>

                    ))}           
            </div>

            {/* writing  */}
            <div className='absolute -bottom-18 h-auto flex justify-between items-center px-2 py-4 border-t-2 gap-2 bg-white rounded-b-lg' >
                <Image src='/upload.png' alt='gửi ảnh' width={50} height={50} className='w-10 h-10  hover:bg-blue-100 p-1 rounded-lg hover:cursor-pointer' title='gửi ảnh'/>
                <Textarea value={text}  onChange={(e)=>setText(e.target.value as string)} className='bg-gray-200 w-50 rounded-lg resize-none ' />    
                {sendLoading ?
                    <Loader className='animate-spin opacity-50' />
                        :
                    <button disabled={text?.trim().length===0 }>

                    <Image onClick={handleSendMessage} 
                        src='/paper-plane.png' width={50} height={50} 
                        className={`w-10 h-10 p-1 hover:bg-blue-100 object-cover rounded-lg  `} alt='' title='Gửi'
                        />  
                    </button>
                }     
                <SmilePlus className='w-10 h-10 hover:bg-blue-100 rounded-lg p-1 hover:cursor-pointer text-blue-500'  />
            </div>
        </div>
    </div>
    }
    </>
  )
}

export default ChatBox
