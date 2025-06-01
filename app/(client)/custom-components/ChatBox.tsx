'use client'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from "@/components/ui/popover"
import { Check, Loader, Volume2, VolumeX, X } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { SmilePlus } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { setChatSound, setChatState, setUserStatus } from '@/redux/chatRedux'
import { setChatLoading } from '@/redux/chatRedux'
import { MessageType } from '@/dataTypes'
import ReactTimeAgoUtil from '@/utils/ReactTimeAgoUtil'
import { CircleUserRound } from 'lucide-react'
import { ChevronDown } from 'lucide-react'
import { userRequest } from '@/requestMethod'
import { setMessages } from '@/redux/chatRedux'
import { User } from '@/dataTypes'
import { setChatPage } from '@/redux/chatRedux'
import { Socket, io } from 'socket.io-client'
import { useRef } from 'react'
import { ChatType } from '@/dataTypes'
import { addChatToChatList, setChatList, setChatListHasNext, updateChatList } from '@/redux/chatListRedux'
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { Dot } from 'lucide-react'



const ChatBox = () => {
    const dispatch = useDispatch()
    const [emojiState, setEmojiState] = useState<boolean>(false)
    const socket = useRef<Socket|null>(null)
    const currentUser = useSelector((state: RootState)=>state.user.currentUser)
    const isOpen: boolean = useSelector((state: RootState)=>state.chat.isOpen)
    const senderData = useSelector((state: RootState)=>state.chat.senderData)
    const messages = useSelector((state: RootState)=>state.chat.messages)
    const chatId = useSelector((state: RootState)=>state.chat.chatId)
    const chatList = useSelector((state:RootState)=>state.chatList.currentChatList)
    const page = useSelector((state:RootState)=>state.chat.pageNumber)
    const sound: boolean = useSelector((state:RootState)=>state.chat.sound)
    const messagelimit = 6
    const [text, setText] = useState<string>('')
    const [sendLoading, setSendLoading] = useState<boolean>(false)
    const [newMessages, setNewMessages ] = useState<MessageType[]>([])
    const [hasNext, setHasNext] = useState<boolean>(false)
    const [arrivalMessage, setArrivalMessage] = useState<MessageType>()
    const scrollRef = useRef<HTMLDivElement |null>(null)
    // const [senderStatus,setSenderStatus] = useState<boolean>(false)
    const userStatus = useSelector((state:RootState)=>state.chat.userStatus)
   

    // init socket
    useEffect(() => {
        socket.current = io(process.env.NEXT_PUBLIC_SOCKET_IO)
        socket.current.emit('addUser', currentUser?._id)
        socket.current.on("getMessage", (data:any) => {
            console.log('heard a event')
            
            // if data.chatId not exists in our chatList localStorage we set new chatList to our localStorage chatList
            const chat = chatList?.find((chat)=>chat?._id===data?.chatId)        
            if(chat===undefined){
                const findChatList = async() => {
                    const res = await userRequest.get(`/chat/chat-list/${currentUser?._id}?page=1&limit=3`)
                    dispatch(setChatList(res?.data?.chatList))
                    dispatch(setChatListHasNext(res.data.hasNext))
                    setArrivalMessage({
                        _id: '',
                        chatId: data?.chatId,
                        sender: data?.sender,
                        imgs: data?.imgs,
                        text: data?.text,
                        createdAt: new Date()  ,
                        updatedAt: '',
                    });
                }
                findChatList()
            // if chat already exist in chatList local ,no need to get new chatList
            } else{
                setArrivalMessage({
                    _id: '',
                    chatId: data?.chatId,
                    sender: data?.sender,
                    imgs: data?.imgs,
                    text: data?.text,
                    createdAt: new Date()  ,
                    updatedAt: '',
                });
            }
        })

        socket.current.on('userStatus', (data:{status:string}) =>{
            console.log('heard status event',data.status)
            if(data.status==='online'){
                dispatch(setUserStatus(true))
                
            }
        })
    }, []);
    console.log(userStatus)
    const playNotificationSound = () => {
        const audio = new Audio('/notify-sound.mp3');
        if(sound){
            audio.play()
        }
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

        // update state of Chat if it already exists in local
        if(arrivalMessage){
            const chat = chatList.find((chat)=>chat._id===arrivalMessage.chatId)
            if(chat){   
                dispatch(updateChatList({chatId: arrivalMessage?.chatId as string, 
                    newData:{
                        lastMessage : arrivalMessage?.text,
                        isReceiverSeen : false,
                        senderId : arrivalMessage?.sender,
                        updatedAt: new Date()
                    }
                }))
            }
        }

    }, [arrivalMessage])

    // load previous message
    const handleLoadMessage = () => {
        dispatch(setChatPage(page+1))
    }

    // add new messages to localStorage messages
    useEffect(()=>{
        const getMessage = async () =>{
            const res = await userRequest.get(`/message?chatId=${chatId}&page=${page}&limit=${messagelimit}`)
            if(res.data && newMessages.length){          
                res.data.messages.reverse().map((message: MessageType)=>{
                    setNewMessages(prev=>[message,...prev])
                })
                setHasNext(res.data.hasNext)
            }
        }
        getMessage()
    },[page])

    // send message
    const handleSendMessage = async () => {
        setEmojiState(false)
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
             const res_updateChat = await userRequest.put(`/chat/${chatId}`,{
                isReceiverSeen: false ,
                lastMessage: text,
                senderId: currentUser?._id
            }) 

            if(res.data && res_updateChat.data ){
                setText('')

                const existedChat = chatList.find((chat)=>chat._id===chatId)

                if(existedChat){
                    // update to current chat at local state
                    dispatch(updateChatList({chatId: chatId as string, 
                        newData:{
                            lastMessage : text,
                            isReceiverSeen : true,
                            senderId : currentUser?._id,
                            updatedAt: new Date()
                        }
                    }))
                // update new Chat to chatList at local
                } else {
                    dispatch(addChatToChatList({
                        _id: chatId,
                        members: [currentUser?._id,senderData?._id] ,
                        lastMessage: text,
                        senderId: currentUser?._id,
                        isReceiverSeen: true,
                        updatedAt: new Date,
                        createdAt: new Date()

                    } as ChatType))
                }

                // push message to current messages at localStorage
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

                //  send to socket
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
 
    // scroll to bottom when  new messages come
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

    const handleEmojiClick = (e: EmojiClickData) =>{
        setText(prev=>prev+e.emoji)
    }

    // fetch online status of user 
    useEffect(()=>{
        socket.current?.emit('checkStatus', {userChecked_id: senderData?._id, userCheck_id: currentUser?._id})
    },[senderData?._id])

  return (
    <>
    {isOpen &&
    <div className='fixed bottom-4 rounded-lg z-40 right-0 md:right-20 bg-white w-90 h-110 border-3 border-gray-100 shadow-2xl' onClick={handleSeen}>
        <div className='flex flex-col w-full  relative'>
            {/* tab info */}
            <div className='h-12  rounded-t-lg flex justify-between items-center px-2  '>
                <div  className='flex items-center  hover:bg-blue-100 p-1 rounded-lg hover:cursor-pointer '>
                    <div className='relative '>
                        <Image src={senderData?.img as string||'/user.png'} width={40} height={40} className='w-8 h-8 object-cover rounded-full' alt='' />                      
                        <div className={`absolute -bottom-1 -right-1 rounded-full w-3 h-3  ${userStatus?'bg-green-500':'bg-red-500'} `} />               
                    </div>
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
                <div className='flex items-center'>
                    {sound ?
                        <div title='Tắt âm thanh'>
                            <Volume2 onClick={()=>dispatch(setChatSound(!sound))} className='text-gray-600 p-1 rounded-full hover:bg-blue-100 w-8 h-8 hover:cursor-pointer' />
                        </div>
                        :
                        <div title='Mở âm thanh'>
                            <VolumeX onClick={()=>dispatch(setChatSound(!sound))} className='text-gray-600 p-1 rounded-full hover:bg-blue-100 w-8 h-8 hover:cursor-pointer' />
                        </div>

                    }
                    <X onClick={handleClose} className='text-blue-500 hover:bg-blue-100 rounded-full p-1 w-8 h-8 hover:cursor-pointer ' />
                </div>
            </div>   
            <Separator />   

            {/* content  */}
            <div className=' h-80   overflow-auto space-y-4 p-2 ' >
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
                            <div className='flex  flex-col '>
                                <div className='flex justify-end  '>                             
                                    <span className='text-lg max-w-50 w-auto   h-auto  p-2 rounded-xl bg-blue-600 text-white '  key={index} >
                                        {message?.text}
                                    </span>
                                </div>
                                <div className='text-sm flex justify-end text-gray-400'>
                                    <ReactTimeAgoUtil date={message?.createdAt as Date} locale='vi-VN'/>
                                </div>
                            </div>
                            :
                            <div className='flex flex-col'> 
                                <div className='flex items-center'>
                                    <div className='w-10'>
                                        <Image src={senderData?.img||'/user.png'} className='w-8 h-8 rounded-full object-cover' alt='' width={40} height={40} />
                                    </div>
                                    <div  className='text-lg max-w-50 w-auto h-auto  p-2 rounded-xl bg-gray-100' key={index} >
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
            <div className='absolute -bottom-18 h-auto flex justify-between items-center px-2 py-4 border-t-2 gap-2 bg-white rounded-b-lg z-90' >
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
                <SmilePlus onClick={()=>setEmojiState(!emojiState)} className='w-10 h-10 hover:bg-blue-100 rounded-lg p-1 hover:cursor-pointer text-blue-500 '  /> 
            </div>
            
            <div className='h-[0px]'>
                    <EmojiPicker  onEmojiClick={handleEmojiClick} open={emojiState} height={500} width={360} className='z-10 absolute -left-0 -top-130 ' /> 
             </div>
            
        </div>
    </div>
    }
    </>
  )
}

export default ChatBox
