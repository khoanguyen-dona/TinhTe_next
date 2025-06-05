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
import { setChatId, setChatSound, setChatState, setUserLastAccess, setUserStatus } from '@/redux/chatRedux'
import { setChatLoading } from '@/redux/chatRedux'
import { MessageType } from '@/dataTypes'
import ReactTimeAgoUtil from '@/utils/ReactTimeAgoUtil'
import { CircleUserRound } from 'lucide-react'
import { ChevronDown } from 'lucide-react'
import { publicRequest, userRequest } from '@/requestMethod'
import { setMessages } from '@/redux/chatRedux'
import { User } from '@/dataTypes'
import { setChatPage } from '@/redux/chatRedux'
import { Socket, io } from 'socket.io-client'
import { useRef } from 'react'
import { ChatType } from '@/dataTypes'
import { addChatToChatList, setChatList, setChatListHasNext, updateChatList } from '@/redux/chatListRedux'
import { emoji } from '@/data'
import { UploadMultipleImage } from './UploadMultipleImage'
import Fancybox from './Fancybox'
import { addUserToOnlineUsers, setOnlineUsers } from '@/redux/userRedux'

type user = {
    userId: string,
    socketId: string
}

const ChatBox = () => {
    const dispatch = useDispatch()
    const [emojiState, setEmojiState] = useState<boolean>(false)
    const socket = useRef<Socket|null>(null)
    const currentUser: User|null = useSelector((state: RootState)=>state.user.currentUser)
    const isOpen: boolean = useSelector((state: RootState)=>state.chat.isOpen)
    const senderData: User|null = useSelector((state: RootState)=>state.chat.senderData)
    const messages: MessageType[]|MessageType|null = useSelector((state: RootState)=>state.chat.messages)
    const chatId: string|null = useSelector((state: RootState)=>state.chat.chatId)
    const chatList: ChatType[] = useSelector((state:RootState)=>state.chatList.currentChatList)
    const page: number = useSelector((state:RootState)=>state.chat.pageNumber)
    const sound: boolean = useSelector((state:RootState)=>state.chat.sound)
    const chatLoading: boolean = useSelector((state:RootState)=>state.chat.chatLoading)
    const messagelimit: number = 6
    const [text, setText] = useState<string>('')
    const [imageFiles, setImageFiles] = useState<File[]>([])
    const [previewImages, setPreviewImages] = useState<string[]>([])
    const [sendLoading, setSendLoading] = useState<boolean>(false)
    const [newMessages, setNewMessages ] = useState<MessageType[]>([])
    const [hasNext, setHasNext] = useState<boolean>(false)
    const [arrivalMessage, setArrivalMessage] = useState<MessageType>()
    const scrollRef = useRef<HTMLDivElement |null>(null)
    const userStatus: string = useSelector((state:RootState)=>state.chat.userStatus)   
    const lastAccess: string|Date|'' = useSelector((state:RootState)=>state.chat.lastAccess)
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [isSenderTyping, setIsSenderTyping] = useState<boolean>(false)
    const [userTyping, setUserTyping] = useState<boolean>(false)
    // const [users, setUsers] = useState<string[]>()
    const onlineUsers: string[]|[]|null = useSelector((state:RootState)=>state.user.onlineUsers)
    const [content, setContent] = useState<string>()


    // init socket
    useEffect(() => {
        socket.current = io(process.env.NEXT_PUBLIC_SOCKET_IO)
        socket.current.emit('addUser', {userId: currentUser?._id, username: currentUser?.username, lastAccess: new Date().toISOString()})
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
        // update userStatus when chatId changed
        socket.current.on('userStatus', (data:{status:'online'|'offline', lastAccess: string}) =>{
         
               
                console.log('status :',data)
                dispatch(setUserStatus(data.status))      
                dispatch(setUserLastAccess(data.lastAccess))         
            
        })

        //update users  when a user offline
        socket.current.on('userLeaving', (data:{userId: string}) => {
          
            const newUsers = onlineUsers?.filter((user: string)=>user!==data.userId)
            if(newUsers){
                console.log('newUsers',newUsers)
                dispatch(setOnlineUsers(newUsers))
            }
        })
        //update users when a user online
        socket.current.on('userJoining', (data:{userId:string})=>{
            console.log('userJoining event heard', data.userId)
                const findUser = onlineUsers.find(user=>user===data.userId)
                if(findUser){
                    return
                } else {
                    dispatch(addUserToOnlineUsers(data.userId))
                }
            }
        )
     

        // socket.current.on('typingStatus', (data: {chatId: string, status: boolean} ) =>{
        //     console.log('an event come:',data.chatId ,chatId)
        //     if(data.chatId==chatId ){
        //         console.log('setting Typing')
        //         setIsSenderTyping(data.status)
        //     }
        // } )
        
    }, []);
        console.log('lastAccess',lastAccess)

    // fetch online status of user 
    useEffect(()=>{
        socket.current?.emit('checkStatus', {userChecked_id: senderData?._id, userCheck_id: currentUser?._id})
    },[chatId])

    // fetch all online users first time
    useEffect(()=>{
        const getData = async() => {
            const res =await publicRequest.get('/redis/all-users')
            if(res.data){
                dispatch(setOnlineUsers(res.data.userIds))
            }
        }
        getData()
    },[])
   
    // check status of user when onlineUsers change
    useEffect(()=>{
        const findUser = onlineUsers?.find((user: string)=>user===senderData?._id)
        if(findUser){
            dispatch(setUserStatus('online'))
        } else{
            dispatch(setUserStatus('offline'))

        }
    },[onlineUsers])

    const playNotificationSound = () => {
        const audio = new Audio('/notify-sound.mp3');
        if(sound){
            audio.play()
        }
      };

    const handleClose = () =>{
        dispatch(setChatState(false))
        dispatch(setChatId(null))
    }

    // set messages
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

    // value of content depend on imagesFile.length and text==='' or not
    useEffect(()=>{
        if(text==='' && imageFiles.length>0){
            setContent('Đã gửi ảnh 🖼️')
        }else{
            setContent(text)
        }
    },[text,imageFiles])

    // send message
    const handleSendMessage = async () => {
        // setIsSenderTyping(false)     
        setEmojiState(false)
        try {
            setSendLoading(true)
            const imgGallery = await UploadMultipleImage({imageFiles:imageFiles,uploadPath:'message'})
            // create message in mongodb
            
            const res = await userRequest.post(`/message`,{
                chatId: chatId,
                sender: currentUser?._id,
                text: text,
                imgs: imgGallery
            })
            

             // update to chatList in mongodb       
                const res_updateChat = await userRequest.put(`/chat/${chatId}`,{
                    isReceiverSeen: false ,
                    lastMessage: content,
                    senderId: currentUser?._id           
                }) 
          

            if(res.data && res_updateChat.data ){
                setText('')
                setImageFiles([])
                setPreviewImages([])

                const existedChat = chatList.find((chat)=>chat._id===chatId)

                if(existedChat){
                    // update to current chat at local state
                    if(text===''&&imageFiles.length>0){
                        dispatch(updateChatList({chatId: chatId as string, 
                            newData:{
                                lastMessage : content,
                                isReceiverSeen : true,
                                senderId : currentUser?._id,
                                updatedAt: new Date()
                            }
                        }))
                    } else {                  
                        dispatch(updateChatList({chatId: chatId as string, 
                            newData:{
                                lastMessage : content,
                                isReceiverSeen : true,
                                senderId : currentUser?._id,
                                updatedAt: new Date()
                            }
                        }))
                    }
                // update new Chat to chatList at local
                } else {
                    if(text===''&&imageFiles.length>0){
                        dispatch(addChatToChatList({
                            _id: chatId,
                            members: [currentUser?._id,senderData?._id] ,
                            lastMessage: content,
                            senderId: currentUser?._id,
                            isReceiverSeen: true,
                            updatedAt: new Date,
                            createdAt: new Date()
                        } as ChatType))
                    }else {                    
                        dispatch(addChatToChatList({
                            _id: chatId,
                            members: [currentUser?._id,senderData?._id] ,
                            lastMessage: content,
                            senderId: currentUser?._id,
                            isReceiverSeen: true,
                            updatedAt: new Date,
                            createdAt: new Date()
                        } as ChatType))
                    }
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
                    imgs: imgGallery,
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
            await userRequest.put(`/chat/${chatId}`,{
                isReceiverSeen: true ,
            })
        }
    }

    const handleEmojiClick = (emoji: any) =>{
        setText(prev=>prev+emoji)   
    }

  

    const handleTyping = (e: string) => {
        setText(e)

        // setUserTyping(true)
        // if (userTyping === false) {
        //     socket.current?.emit("onTyping", {chatId: chatId,userId: senderData?._id});
        // }

        //  // Clear previous timeout
        // if (typingTimeoutRef.current) {
        //     clearTimeout(typingTimeoutRef.current);
        // }

        // // Set new timeout for "stop typing"
        // typingTimeoutRef.current = setTimeout(() => {
        //     setUserTyping(false)
        //     socket.current?.emit('stopTyping', {chatId: chatId,userId: senderData?._id}); // Notify others
        // }, 1500); // 1.5 seconds after last keypress
     
    }

     const handleImageGallery = async (e: React.ChangeEvent<HTMLInputElement>) =>{
            const files = e.target.files as FileList
            if(imageFiles?.length + files.length > 4){
                alert('Bạn chỉ được upload tối đa 4 ảnh mỗi lượt')
                return
            }
    
            if(files){
                for (const file of files ){     
                    if(file.size > 5000000){
                        // toast.error('Kích thước ảnh quá lớn vui lòng chọn ảnh nhỏ hơn 3 MB')
                        alert('Vui lòng chọn ảnh có kích thước nhỏ hơn 3 MB')
                    }
                    else if(file.size < 5000000) {
                        setImageFiles(prev=>[...prev,file])
                        const imageBlob = URL.createObjectURL(file)
                        setPreviewImages(prev=>[...prev,imageBlob])
                    }
                }                
            } 
         
    }

    const handleRemoveImage = (index:number) => {
        const imgs = previewImages.filter((image, i)=>i !== index)
        const files = imageFiles.filter((file, i) => i !== index)
        setPreviewImages(imgs)
        setImageFiles(files)
    }

  return (
    <>
    {isOpen &&
    <div className='fixed bottom-4 rounded-lg z-40 right-0 md:right-20 bg-white w-90 h-110 border-3 border-gray-100 shadow-2xl' onClick={handleSeen}>
        <div className='flex flex-col w-full  relative'>
            {/* tab info */}
            <div className='h-12  rounded-t-lg flex justify-between items-center px-2  '>
                <div  className='flex items-center justify-start hover:bg-blue-100 px-1 rounded-lg hover:cursor-pointer '>
                    <div className='relative '>
                        <Image src={senderData?.img as string||'/user.png'} width={40} height={40} className='w-8 h-8 object-cover rounded-full' alt='' />                      
                        <div className={`absolute  -bottom-1 -right-1 rounded-full w-3 h-3 opacity-70 ${userStatus==='online'?'bg-green-500 animate-ping':''} `} />
                        <div className={`absolute -bottom-1 -right-1 rounded-full w-3 h-3   ${userStatus==='online'?'bg-green-500':'bg-red-500'} `} />               

                    </div>
                    <Popover>
                        <PopoverTrigger asChild >
                            <div className='ml-2 rounded-md  flex flex-col'>
                                <div className='flex font-bold'>
                                    {senderData?.username.slice(0,16)}    
                                    {senderData?.verified &&
                                        <Check className='rounded-full mt-[3px] ml-1 text-white bg-blue-500 w-4 h-4 p-[1px]' />
                                    }  
                                    <ChevronDown className='opacity-50 ml-4' />                       
                                </div>
                                <div className='text-[12px] text-gray-400'>
                                    {lastAccess===null ? "":
                                        <ReactTimeAgoUtil date={new Date(lastAccess) as Date } locale='vi-VN'/>
                                    }
                                </div>
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
        
            {chatLoading? 
            <div className=' top-0 z-20  w-full h-80 bg-white opacity-20' >
                <div className='absolute inset-0 flex items-center justify-center'>
                    <Loader className=' animate-spin w-14 h-14   '/>
                </div>
            </div>
                :
            <div className='relative'>
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
                                <div className='flex  justify-end  '>  
                                    <div className='flex flex-col gap-2 max-w-50   '>    
                                        {message.text!=='' &&
                                            <span className='text-lg max-w-50 w-auto   h-auto  p-2 rounded-xl bg-blue-600 text-white '  key={index} >
                                            {message?.text}
                                            </span>
                                        }      
                                        {message?.imgs?.length>0 &&                                          
                                            <Fancybox
                                                options={{
                                                Carousel: {
                                                    infinite: false,
                                                },
                                                }}
                                            >
                                                <div className='flex flex-wrap justify-end gap-1 mt-2'>
                                                {
                                                message.imgs?.map((img,index)=>(
                                                    <a key={index} data-fancybox="gallery" href={img}>
                                                        <Image
                                                            className='rounded-lg object-cover w-20 h-20'
                                                            alt="image"
                                                            src={img}
                                                            width={80}
                                                            height={80}
                                                        />
                                                    </a>
                                                ))
                                                }
                                                </div>
                                            </Fancybox>
                                        }
                                    </div>
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
                                    <div className='flex flex-col gap-2 max-w-50'>
                                        {message?.text!=='' &&
                                            <div  className='text-lg max-w-50 w-auto h-auto  p-2 rounded-xl bg-gray-100' key={index} >
                                                {message?.text}
                                            </div>
                                        }
                                       {message?.imgs?.length>0 &&                                          
                                            <Fancybox
                                                options={{
                                                Carousel: {
                                                    infinite: false,
                                                },
                                                }}
                                            >
                                                <div className='flex flex-wrap  gap-1 mt-2'>
                                                {
                                                message.imgs?.map((img,index)=>(
                                                    <a key={index} data-fancybox="gallery" href={img}>
                                                        <Image
                                                            className='rounded-lg object-cover w-20 h-20'
                                                            alt="image"
                                                            src={img}
                                                            width={80}
                                                            height={80}
                                                        />
                                                    </a>
                                                ))
                                                }
                                                </div>
                                            </Fancybox>
                                        }
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

            {isSenderTyping &&         
                <div className='absolute bottom-0 left-0 flex justify-center items-center w-full bg-white opacity-70 h-7 shadow-xl gap-1'>
                    <div className='text-gray-500'>{senderData?.username} đang soạn tin</div>
                    <div className='h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s] mt-2'></div>
                    <div className='h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s] mt-2'></div>
                    <div className='h-2 w-2 bg-gray-500 rounded-full animate-bounce mt-2'></div>
                </div>
            }
            </div>
            }
            {/* writing  */}
            <div className='absolute -bottom-18 h-auto flex justify-between items-center px-2 py-4 border-t-2 gap-2 bg-white rounded-b-lg z-90' >
                {/* <Image src='/upload.png' alt='gửi ảnh' width={50} height={50} className='w-10 h-10  hover:bg-blue-100 p-1 rounded-lg hover:cursor-pointer' title='gửi ảnh'/> */}
                <label 
                    title='Thêm ảnh'
                    className='hover:bg-blue-100   rounded-lg p-1 hover:cursor-pointer flex flex-col w-12  transition  ' 
                    htmlFor="content-image"
                    >
                    <img
                        src='/upload.png'
                        alt='Thêm ảnh'
                        className='  w-12 hover:cursor-pointer object-cover   rounded-lg '        
                    />
                        
                    <input  className='hidden' type="file" multiple  accept='image/*' onChange={handleImageGallery} id='content-image' />
                </label> 
                <Textarea value={text}  onChange={(e)=>handleTyping(e.target.value)} className='bg-gray-200 w-50 rounded-lg resize-none text-2xl' />    
                {sendLoading ?
                    <Loader className='animate-spin opacity-50' />
                        :
                    <button disabled={text?.trim().length===0 && imageFiles.length===0 }>

                    <Image onClick={handleSendMessage} 
                        src='/paper-plane.png' width={50} height={50} 
                        className={`w-10 h-10 p-1 hover:bg-blue-100 object-cover rounded-lg  `} alt='' title='Gửi'
                        />  
                    </button>
                }                     
                <SmilePlus onClick={()=>setEmojiState(!emojiState)} className='w-10 h-10 hover:bg-blue-100 rounded-lg p-1 hover:cursor-pointer text-blue-500 '  /> 
            </div>
                     
             {emojiState &&
             <div className='absolute w-full rounded-lg h-30 bg-white shadow-md border-1 border-gray-100 bottom-1 left-0' >
                <div className='flex flex-wrap text-3xl justify-center items-center p-2 gap-1'>
                {emoji?.map((emo,index)=>(
                    <div 
                        onClick={()=>handleEmojiClick(emo.value as any)}
                        key={index} className='hover:scale-130 transition hover:cursor-pointer rounded-full hover:bg-blue-100 shadow-xl p-1' title={emo.type}>
                        {emo.value}
                    </div>
                ))}
                </div>
             </div>
            }
            {previewImages.length>0 &&
            <>
                <div className='absolute bottom-1 p-4 left-0 h-auto w-full z-20 '>
                    <div className='flex flex-wrap gap-2'>
                        {previewImages.map((image,index)=>(
                            <div className='relative'>
                                <Image key={index} src={image} alt='' className='w-18 h-18 rounded-lg object-cover' width={30} height={30} />
                                <X onClick={()=>handleRemoveImage(index)} className='absolute top-0 right-0 z-20 text-white bg-black rounded-md'/>
                            </div>
                        ))}
                    </div>
                </div>
                <div className={`absolute bottom-2 p-4 left-0 rounded-lg w-full bg-black opacity-60 h-24`}> 

                </div> 
            </>

            }
        </div>
    </div>
    }
    </>
  )
}

export default ChatBox
