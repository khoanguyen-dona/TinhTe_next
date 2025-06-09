'use client'
import { Separator } from '@/components/ui/separator'
import { RootState } from '@/redux/store'
import { ChevronDown, CircleUserRound, Loader, SmilePlus, Volume2, VolumeX, X } from 'lucide-react'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from "@/components/ui/popover"
import { setGroupChatLoading, setGroupChatSound } from '@/redux/groupChatRedux'
import { Textarea } from '@/components/ui/textarea'
import { emoji } from '@/data'
import { UploadMultipleImage } from './UploadMultipleImage'
import { publicRequest, userRequest } from '@/requestMethod'
import { ChatType, MessageGroupChatType, MessageType, User } from '@/dataTypes'
import { Socket } from 'socket.io-client'
import Fancybox from './Fancybox'
import ReactTimeAgoUtil from '@/utils/ReactTimeAgoUtil'
import ThreeDotLoading from './ThreeDotLoading'
import Link from 'next/link'
import { setChatId, setChatPage, setChatState, setMessages, setSenderData, setUserStatus } from '@/redux/chatRedux'
import { addChatToChatList, setChatList, setChatListHasNext } from '@/redux/chatListRedux'


type Props = {
    userId: string|null,
    username: string|null,
    socket: Socket|null,
    avatar: string|'/user.png',
    messages: MessageGroupChatType[],
}

type onlineUserType = {
    avatar: string,
    userId: string,
    username: string
}

const GroupChat = ({userId, username, socket, avatar, messages}:Props) => {

    const chatList = useSelector((state:RootState)=>state.chatList.currentChatList)
    const currentUser = useSelector((state:RootState)=>state.user.currentUser)
    const chatLoading: boolean = useSelector((state:RootState)=>state.groupChat.loading)
    const sound: boolean = useSelector((state:RootState)=>state.groupChat.sound)
    const dispatch = useDispatch()
    const [text, setText] = useState<string>('')
    const [previewImages, setPreviewImages] = useState<string[]>([])
    const [imageFiles, setImageFiles] = useState<File[]>([])
    const [sendLoading, setSendLoading] = useState<boolean>(false)
    const [emojiState, setEmojiState] = useState<boolean>()
    const [newMessages, setNewMessages] = useState<MessageGroupChatType[]>([])
    const scrollRef = useRef<HTMLDivElement |null>(null)
    const uuid = Math.random().toString(36).substring(2,10)
    const [onlineUsers, setOnlineUsers] = useState<onlineUserType[]>([])
    const [mailLoading,setMailLoading] = useState<boolean>(false)

    // take event from groupChat
    useEffect(()=>{
        socket?.on('getGroupMessage', (data: MessageGroupChatType) =>{
            console.log('data',data)
            setNewMessages(prev=>[...prev,data])
        } )

        socket?.on('userLeaving', ( data: {userId: string} ) => {   
            setOnlineUsers(prevUsers=>{
                const newUsers = prevUsers.filter((user: onlineUserType)=> user.userId!==data.userId)
                return newUsers
            })
        })

        socket?.on('userJoining', ( data:{userId: string, username: string, avatar: string} ) => {
            setOnlineUsers(prevUsers=>{
                const isExist = prevUsers.find((user: onlineUserType)=> user.userId===data.userId)
                if(isExist){
                    return prevUsers
                } else {
                    return [data,...prevUsers]
                }
            })   
        })
    },[socket])

    //fetch onlineUsers
    useEffect(()=>{
        const getData = async() => {
          try {
            dispatch(setGroupChatLoading(true))
            const res_onlineUsers = await publicRequest.get('/redis/all-users')
            if(res_onlineUsers.data){
              setOnlineUsers(res_onlineUsers.data.onlineUsers)
              dispatch(setGroupChatLoading(false))
            }
          }catch(err){  
            console.log('fetch onlineUsers failed',err)
          }
        } 
        getData()
      },[])

    // parse  to json
    useEffect(()=>{
        let tempArray:any = []

        messages.map((message: any)=>{
            let objectMessage =  JSON.parse(message)
            tempArray.push(objectMessage)
        })

        setNewMessages(tempArray)
    },[messages])


    const handleTyping = (text: string) => {
        setText(text)
    }

    const handleEmojiClick = (emoji: any)=>{
        setText(prev=>prev+emoji)
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

     // send message
    const handleSendMessage = async () => {
        // setIsSenderTyping(false)     
        setEmojiState(false)
        try {
            setSendLoading(true)
            const imgGallery = await UploadMultipleImage({imageFiles:imageFiles,uploadPath:'group-chat'})
         
               
            // push message to current messages at localStorage
            const sentMessage=({
                _id: Math.random().toString(36).substring(2,10),
                avatar: avatar,
                username: userId,
                chatId: 'groupChat',
                sender: userId,                    
                text: text,
                imgs: imgGallery,
                createdAt: new Date()
            });

            if(newMessages?.length>0) {
                setNewMessages(prev=>[...prev, sentMessage as MessageGroupChatType])
            } else{
                setNewMessages([sentMessage as MessageGroupChatType])
            }
        

            //  send to socket
            socket?.emit("sendGroupMessage", {
                id: Math.random().toString(36).substring(2,10),
                chatId: 'groupChat',
                avatar: avatar, 
                username: username||userId,
                sender: userId,
                imgs: imgGallery,
                text: text,
                createdAt: new Date().toISOString()                  
            })
                
            
            
        } catch(err){
            console.log('send message failed',err)
        } finally {
            setText('')
            setImageFiles([])
            setPreviewImages([])
            setSendLoading(false)
        }
    }

    // scroll to bottom when  new messages come
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [newMessages]);

    
    const handleOpenChatBox = async (userId: string) => {
        
        //find info of senderData
        const sender = await publicRequest.get(`/user/${userId}`)

        // find chat between 2 user
        const res = await userRequest.get(`/chat?user1=${currentUser?._id}&user2=${userId}`) 
            
        // if existed ,go find chatId in out localStorage then set chatBox state
        if(res.data.chat !== null && sender.data){
    
            const chat = chatList.find((chat:ChatType)=>chat._id===res.data.chat._id)
            if(chat){
                const res_messages = await userRequest.get(`/message?chatId=${chat._id}&page=1&limit=6`)
                // dispatch(setUserStatus('offline'))
                dispatch(setChatId(chat._id))
                dispatch(setChatPage(1))                
                dispatch(setMessages(res_messages.data.messages))                
                dispatch(setChatState(true))
                dispatch(setChatId(chat?._id))
                dispatch(setSenderData(sender.data.user))

            //if not exists in local storage we push chat to our local storage chatList then set chatBox state
            } else {
                const res_messages = await userRequest.get(`/message?chatId=${res.data.chat._id}&page=1&limit=6`)
                // dispatch(setUserStatus('offline'))
                dispatch(setChatPage(1))
                dispatch(setMessages(res_messages.data.messages))
                dispatch(setChatState(true))
                dispatch(setChatId(res.data.chat._id))
                dispatch(setSenderData(sender.data.user))
                dispatch(addChatToChatList(res.data.chat))                   
            }               
        }

        //if not exists we create a chat then response the chatId
        if(res.data.chat === null && sender.data){
    
            setMailLoading(true)
            const createChat = await userRequest.post(`/chat`,{
                members:[currentUser?._id, userId],
                lastMessage:'',
                senderId:'',
                isReceiverSeen: true
            })

            //get new chatId then insert to localStorage chatList , and set state for LocalStorage chatBox             
            if(createChat?.data){        
                const getChatList = async() => {                
                    const res = await userRequest.get(`/chat/chat-list/${currentUser?._id}`)
                    if(res.data){
                        // dispatch(setUserStatus('offline'))
                        setMailLoading(false)
                        dispatch(setChatListHasNext(res.data.hasNext))
                        dispatch(setChatList(res.data.chatList))
                        dispatch(setChatPage(1))
                        dispatch(setMessages([]))
                        dispatch(setChatState(true))
                        dispatch(setChatId(createChat.data.chat._id))
                        dispatch(setSenderData(sender.data.user))
                    }
                }
                getChatList()
        
            }
        }
    
        }


  return (

    <div className="w-auto h-132 md:h-170 border-2 border-gray-100 rounded-lg mb-4 md:mb-0 ">
        {/* tab info */}
        <div className='h-12 bg-gray-100 rounded-t-lg flex justify-between items-center px-2  '>
            <div  className='flex items-center justify-start hover:bg-blue-200  p-1 px-1 rounded-lg hover:cursor-pointer transition'>
                <div className='relative '>
                    <Image src={'/user.png'} width={40} height={40} className='w-8 h-8 object-cover rounded-full' alt='' />                                                                         
                </div>
                <Popover>
                    <PopoverTrigger asChild >
                        <div className='ml-2 rounded-md  flex flex-col'>
                            <div className='flex  '>
                                
                                ({onlineUsers.length}) Người tham gia 
                                <ChevronDown className='opacity-50 ml-4' />                       
                            </div>
                            <div className='text-[12px] text-gray-400'>
                            
                            </div>
                        </div>
                    </PopoverTrigger>
                    <PopoverContent className='z-10 w-full  '>
                        <div className='flex flex-col  w-full max-h-100 overflow-auto'>
                            {onlineUsers.map((user: onlineUserType, index)=>(   
                                                                                             
                                <>
                                    {user.username.slice(0,5) === 'guest' 
                                        ?                              
                                    <div key={index}   className='flex gap-2 hover:bg-blue-100 w-full p-2 rounded-lg '>
                                        <div>
                                            <Image src={user.avatar as any||'/user.png'} width={20} height={20} alt='' className='w-8 h-8 object-cover rounded-full' />
                                        </div>
                                        <div>
                                            {user.username}
                                        </div>
                                    </div>
                                    :                              
                                    <Popover>
                                        <PopoverTrigger className='border-none outline-none'>
                                            <div key={index}  className={`flex gap-2 hover:bg-blue-100 w-full p-2 rounded-lg hover:cursor-pointer `}>
                                                <div>
                                                    <Image src={user.avatar as any||'/user.png'} width={20} height={20} alt='' className='w-8 h-8 object-cover rounded-full' />
                                                </div>
                                                <div>
                                                    {user.username}
                                                </div>
                                            </div>
                                        </PopoverTrigger>
                                        <PopoverContent>
                                            <Link href={`/profile/${user.userId}`}   className='flex items-center gap-2 hover:bg-blue-100 w-full p-2 rounded-lg hover:cursor-pointer'>
                                                <div>
                                                    <Image src='/user.png' width={20} height={20} alt='' className='w-8 h-8 object-cover rounded-full' />
                                                </div>
                                                <div>
                                                    Xem trang cá nhân
                                                </div>
                                            </Link>
                                            {currentUser?._id === user.userId ? '': 
                                            <div onClick={()=>handleOpenChatBox(user.userId)} key={index}  className={`flex items-center gap-2 hover:bg-blue-100
                                             w-full p-2 rounded-lg hover:cursor-pointer ${mailLoading?'opacity-40':''} `}>
                                                <div>
                                                    <Image src='/email.png' width={20} height={20} alt='' className='w-8 h-8  opacity-60 ' />
                                                </div>
                                                <div className='flex gap-2' >
                                                    Nhắn tin
                                                    {mailLoading && <Loader className='animate-spin w-6 h-6'/>}
                                                </div>
                                            </div>
                                            }

                                        </PopoverContent>
                                    </Popover>                     
                                } 
                                </>                                                                                                             
                            ))}
                        </div>
                    </PopoverContent>
                </Popover>
                
                
            </div>              
            <div className='flex items-center'>
                {sound ?
                    <div title='Tắt âm thanh'>
                        <Volume2 onClick={()=>dispatch(setGroupChatSound(!sound))} className='text-gray-600 p-1 rounded-full hover:bg-blue-100 w-8 h-8 hover:cursor-pointer' />
                    </div>
                    :
                    <div title='Mở âm thanh'>
                        <VolumeX onClick={()=>dispatch(setGroupChatSound(!sound))} className='text-gray-600 p-1 rounded-full hover:bg-blue-100 w-8 h-8 hover:cursor-pointer' />
                    </div>

                }
                {/* <X onClick={handleClose} className='text-blue-500 hover:bg-blue-100 rounded-full p-1 w-8 h-8 hover:cursor-pointer ' /> */}
            </div>
        </div>   
        <Separator />   

        {/* content  */}

        {chatLoading? 
        <div className=' top-0   w-full h-90 md:h-120 relative ' >
            <div className='absolute inset-0 flex items-center justify-center'>
                <ThreeDotLoading className={'w-6 h-6 '} />
            </div>
        </div>
        :
        <div className='relative ' >
            <div className='h-90 md:h-120   overflow-y-auto space-y-2 p-2 ' >           
                    {newMessages?.length>0 && newMessages?.map((message: MessageGroupChatType,index)=>(                       
                        <div className='' >
                            {message?.sender === userId ?                    
                                <div  className='flex  flex-col '>
                                    <div className='flex  gap-1 '>  
                                
                                        <Image alt='' src={message.avatar||'/user.png'} width={40} height={40} className='w-8 h-8 rounded-full object-cover' />
                                        <div className='flex flex-col'>                                     
                                            <div className='flex flex-col  bg-blue-500 rounded-lg p-2 '>    
                                    
                                                <span className='h-auto rounded-xl  text-white '  key={index} >
                                                    <span className='font-bold mr-2'>Bạn:                                                         
                                                    </span>
                                                    {message?.text}
                                                </span>
                                       
                                                {message?.imgs?.length>0 &&                                          
                                                    <Fancybox
                                                        options={{
                                                        Carousel: {
                                                            infinite: false,
                                                        },
                                                        }}
                                                    >
                                                        <div className='flex flex-col   rounded-lg gap-1 '>
                                                            {/* <span className='font-bold text-white'>Bạn: </span> */}
                                                            <div className='flex flex-wrap gap-1'>
                                                                {
                                                                    message.imgs?.map((img,index)=>(
                                                                        <a key={index} data-fancybox="gallery" href={img}>
                                                                            <Image
                                                                                className='rounded-lg object-cover w-16 h-16'
                                                                                alt="image"
                                                                                src={img}
                                                                                width={80}
                                                                                height={80}
                                                                            />
                                                                        </a>
                                                                    ))
                                                                }
                                                            </div>
                                                        </div>
                                                    </Fancybox>
                                                }
                                            </div>
                                            <div className='text-[12px]   text-gray-400'>
                                                <ReactTimeAgoUtil  date={message?.createdAt as Date} locale='vi-VN'/>                                                                
                                            </div>   
                                        </div>                           
                                    </div>
                                </div>
                                :
                                <div className='flex flex-col'> 
                                    <div className='flex  gap-1 '>
                                    
                                        <Image src={message?.avatar||'/user.png'} className='w-8 h-8 rounded-full object-cover ' alt='' width={40} height={40} />
                                 
                                        <div className=' flex flex-col  bg-gray-200 p-2 rounded-lg'>
                                
                                            <div  className='  w-auto h-auto   rounded-xl ' key={index} >                                                
                                                    <span className='font-bold mr-2'>
                                                        {message.username ? 
                                                        message.username.slice(0,15) 
                                                        : 
                                                        userId?.slice(0,15)}:                                                                                            
                                                    </span>
                                                    {message?.text}                                          
                                            </div>
                                     
                                            {message?.imgs?.length>0 &&                                          
                                                <Fancybox
                                                    options={{
                                                    Carousel: {
                                                        infinite: false,
                                                    },
                                                    }}
                                                >
                                                    <div className='flex flex-wrap  gap-1 '>
                                                    {
                                                    message.imgs?.map((img,index)=>(
                                                        <a key={index} data-fancybox="gallery" href={img}>
                                                            <Image
                                                                className='rounded-lg object-cover w-16 h-16'
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
                                    <div className='text-[12px] text-gray-400 ml-10'>
                                        <ReactTimeAgoUtil date={message?.createdAt as Date } locale='vi-VN'/>
                                    </div>
                                </div>                                               
                            }                                           
                        </div>                     
                    ))}           
            </div>


            {emojiState &&
                <div className='absolute w-full rounded-lg z-20 h-30 bg-white shadow-xl border-1 border-gray-100 bottom-0 ' >
                    <div className='flex flex-wrap text-3xl justify-center items-center mt-4 gap-1'>
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
                <div className='absolute bottom-1 h-24  w-full z-50  p-4 ' >
                    <div className='flex justify-center flex-wrap gap-2 '>
                        {previewImages.map((image,index)=>(
                            <div className='relative'>
                                <Image key={index} src={image} alt='' className='w-18 h-18 rounded-lg object-cover' width={30} height={30} />
                                <X onClick={()=>handleRemoveImage(index)} className='absolute top-0 right-0 hover:cursor-pointer text-white bg-black rounded-md'/>
                            </div>
                        ))}
                    </div>
                </div>
                <div className={`absolute bottom-0 p-4 left-0 rounded-lg w-full bg-black opacity-80 z-10 h-24`}> 

                </div> 
            </>
             } 

        </div>
        }
        

        {/* writing  */}
        <div className=' w-full h-30 md:h-38   flex flex-col justify-between items-center px-2 py-2  border-t-2 gap-2  rounded-b-lg z-90 bg-gray-100' >      
            
            <div className='flex w-full gap-3 h-20 justify-center items-center '>       
                <Textarea value={text}  onChange={(e)=>handleTyping(e.target.value)} className='bg-gray-200 h-14 md:h-20 w-full  rounded-lg resize-none text-2xl' />    
                {sendLoading ?
                    <Loader className='animate-spin opacity-50' />
                        :
                    <button disabled={text?.trim().length===0 && imageFiles.length===0 } className='w-14 h-14' >
                        <Image onClick={handleSendMessage} 
                            src='/paper-plane.png' width={50} height={50} 
                            className={`w-10 h-10 p-1 hover:bg-blue-100 object-cover rounded-lg  `} alt='' title='Gửi'
                        />  
                    </button>
                }  
             </div>  
           
            <div className='flex  gap-2'>             
                <label 
                    title='Thêm ảnh'
                    className='hover:bg-blue-100   rounded-lg p-1 hover:cursor-pointer flex flex-col w-10  transition  ' 
                    htmlFor={uuid}
                    >
                    <img
                        src='/upload.png'
                        alt='Thêm ảnh'
                        className='  w-10 hover:cursor-pointer object-cover   rounded-lg '        
                    />
                        
                    <input  className='hidden' type="file" multiple  accept='image/*' onChange={handleImageGallery} id={uuid} />
                </label>                  
                <SmilePlus onClick={()=>setEmojiState(!emojiState)} className='w-10 h-10  hover:bg-blue-100 rounded-lg p-1 hover:cursor-pointer text-blue-500 '  /> 
            </div>
          
        </div>
            
       
        
</div>
  )
}

export default GroupChat