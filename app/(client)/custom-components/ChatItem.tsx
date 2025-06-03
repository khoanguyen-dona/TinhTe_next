'use client'
import { ChatType, User } from '@/dataTypes'
import { publicRequest, userRequest } from '@/requestMethod'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import ReactTimeAgoUtil from '@/utils/ReactTimeAgoUtil'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from "@/components/ui/popover"
import { useDispatch } from 'react-redux'
import { setChatPage, setChatState, setSenderData, setUserStatus } from '@/redux/chatRedux'
import { setMessages } from '@/redux/chatRedux'
import { setChatId } from '@/redux/chatRedux'
// import { setChatPage } from '@/redux/chatRedux'
import { RootState } from '@/redux/store'
import { useSelector } from 'react-redux'
import { setChatLoading } from '@/redux/chatRedux'
import { updateChatList } from '@/redux/chatListRedux'

type Props ={
    chat: ChatType,
    userId: string,
}

const ChatItem = ({chat, userId}: Props) => {
    const chatId = useSelector((state:RootState)=>state.chat.chatId)
    const senderId = chat?.members?.find(memberId=>memberId!==userId)
    const chatList = useSelector((state:RootState)=>state.chatList.currentChatList)
    const [senderInfo, setSenderInfo] = useState<User>()
    const dispatch = useDispatch()
    const limit = 10
    const page = 1
    
    // console.log('senderInfo',senderInfo)
    // console.log('chat',chat)

    // get info of sender
    useEffect(()=>{
        const getSenderInfo = async() =>{
            try {
                const res = await publicRequest.get(`/user/${senderId}`)
                if(res.data){
                    setSenderInfo(res.data.user)
                }
            } catch(err){
                console.log('fetch sender data failed', err)
            }
        }
        getSenderInfo()
    },[senderId])

    const handleClick = async () =>{
        if(chat._id===chatId ){
            // updated chat state field: isReceiverSeen? , set it to true in localState
            dispatch(updateChatList({chatId: chat._id as string, 
                newData:{
                    isReceiverSeen : true,      
                }
            }))
            const findChat = chatList.find((chat)=>chat._id===chatId)
            // updated chat state field: isReceiverSeen? , set it to true in mongodb
            if(findChat?.isReceiverSeen===false){
                await userRequest.put(`/chat/${chat._id}`,{
                    isReceiverSeen: true ,
                })
            }
            return
        }else{      
            dispatch(setChatState(true))
            dispatch(setChatId(chat._id))
            dispatch(setUserStatus(false))
            dispatch(setChatPage(1))
            dispatch(setChatLoading(true))
            dispatch(setSenderData(senderInfo as User))
            const res = await userRequest.get(`/message?chatId=${chat._id}&page=${page}&limit=${limit}`)
            if(res.data){
                dispatch(setChatLoading(false))
                dispatch(setMessages(res.data.messages))
            }
            // updated chat state field: isReceiverSeen? , set it to true in localState
            dispatch(updateChatList({chatId: chat._id as string, 
                newData:{
                    isReceiverSeen : true,      
                }
            }))
            // updated chat state field: isReceiverSeen? , set it to true in mongodb
            await userRequest.put(`/chat/${chat._id}`,{
                isReceiverSeen: true ,
            })
        }
    }

  return (
    <>
    <div className={`p-2 hover:bg-gray-200 flex-col hover:cursor-pointer relative ${senderId!==userId&&chat?.isReceiverSeen===false?'bg-red-100 p-2':''} `} onClick={handleClick}>
        <p className='flex justify-start items-center gap-2'>
            <Image src={senderInfo?.img||'/user.png'} width={30} height={30} className='w-8 h-8 rounded-full object-cover' alt='sender avatar' />
            <div className='flex flex-col'>
            {senderInfo?.username}
            <div className='flex gap-1 text-sm'>
                {chat?.senderId === userId && <div>Bạn:</div> }
                <div className=''>{chat?.lastMessage?.slice(0,30)}</div>   
            </div>
            </div>
        </p>
        <p className='text-sm text-gray-400'>
            <ReactTimeAgoUtil date={chat?.updatedAt} locale='vi-VN' />           
        </p> 

      
    </div> 
    </>
  )
}

export default ChatItem