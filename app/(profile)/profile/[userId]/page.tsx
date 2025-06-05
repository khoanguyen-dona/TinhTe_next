'use client'
import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { publicRequest, userRequest } from '@/requestMethod'
import { ChatType, MessageType, Post, User } from '@/dataTypes'
import Image from 'next/image'
import { Check, Loader, MessageSquare } from 'lucide-react'
import { Send } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import ReactTimeAgoUtil from '@/utils/ReactTimeAgoUtil'
import moment from 'moment';
import { RootState } from '@/redux/store'
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'
import { setChatId, setChatLoading, setChatPage, setChatState, setMessages, setSenderData, setUserStatus } from '@/redux/chatRedux'
import { setChatList, setChatListHasNext, updateChatList } from '@/redux/chatListRedux'
import { addChatToChatList } from '@/redux/chatListRedux'
import { Socket,io } from 'socket.io-client'
import Link from 'next/link'

const page = () => {
    const dispatch = useDispatch()
    const currentUser = useSelector((state: RootState)=>state.user.currentUser)
    const chatList = useSelector((state: RootState)=>state.chatList.currentChatList)
    const {userId} = useParams()
    const [loading, setLoading]= useState<boolean>(false)
    const [mailLoading,setMailLoading] = useState<boolean>(false)
    const [user, setUser] = useState<User>()
    const [page, setPage] = useState<number>(1)
    const [hasNext, setHasNext] = useState<boolean>()
    const [totalPost, setTotalPost] = useState<number>()
    const [commentCount, setCommentCount] = useState<number>()
    const [postCount, setPostCount] = useState<number>()
    const limit = 5
    const [posts, setPosts] = useState<Post[]>([])


    // fetch user info
    useEffect(() =>{
        const getUser = async () => {
            const res = await publicRequest.get(`/user/${userId}`)
            if(res.data){
                setUser(res.data.user)
            }
        }
        getUser()
    },[])

    // fetch user comment number
    useEffect(() =>{
        const getCommentNumber = async () => {
            const res = await publicRequest.get(`/comment/comment-count/user/${userId}`)
            if(res.data){
                setCommentCount(res.data.count)
            }
        }
        getCommentNumber()
    },[])

    // fetch post data
    useEffect(()=>{
        const getUserPost = async () => {
            try {
                setLoading(true)
                const res = await publicRequest.get(`/post?userId=${userId}&page=${page}&limit=${limit}`)
                if(res.data){
                    res.data.posts.map((post: Post )=>{
                        posts.push(post)
                })  
                    setTotalPost(res.data.totalPosts)
                    setHasNext(res.data.hasNext)
                }
            } catch(err){
                console.log('fetch user post failed',err)
            } finally {
                setLoading(false)
            }
        }
        getUserPost()
    }, [page])

    // fetch post-emotion count 
    useEffect(()=>{
        const getPostEmotionCount = async()=>{
            try {
                const res = await publicRequest.get(`/post-emotion/emotion-count/${userId}`)
                if(res.data){
                    setPostCount(res.data.emotionCount)
                }
            } catch(err){
                console.log('get post-emotion count failed',err)
            }
        }
        getPostEmotionCount()
    },[])

     // fetch comment-emotion count 
     useEffect(()=>{
        const getCount = async()=>{
            try {
                const res = await publicRequest.get(`/comment-emotion/emotion-count/${userId}`)
                if(res.data){
                    setCommentCount(res.data.emotionCount)
                }
            } catch(err){
                console.log('get post-emotion count failed',err)
            }
        }
        getCount()
    },[])

    console.log('chatList',chatList)

    const handleOpenChatBox = async  () => {
        console.log('clicked')

        // find chat between 2 user
        const res = await userRequest.get(`/chat?user1=${currentUser?._id}&user2=${userId}`) 

        // if existed ,go find chatId in out localStorage then set chatBox state
        if(res.data.chat !== null){
            console.log('1')
            const chat = chatList.find((chat:ChatType)=>chat._id===res.data.chat._id)
            if(chat){
                const messages: MessageType[] = await userRequest.get(`/message?chatId=${chat._id}&page=1&limit=6`)
                dispatch(setChatPage(1))
                dispatch(setMessages(messages))
                dispatch(setChatState(true))
                dispatch(setSenderData(user as User))
                dispatch(setChatId(chat?._id))

            //if not exists in local storage we push chat to our local storage chatList then set chatBox state
            } else {
                const messages: MessageType[]|MessageType = await userRequest.get(`/message?chatId=${res.data.chat._id}&page=1&limit=6`)
                dispatch(addChatToChatList(res.data.chat))
                dispatch(setChatPage(1))
                dispatch(setMessages(messages))
                dispatch(setChatState(true))
                dispatch(setSenderData(user as User))
                dispatch(setChatId(res.data.chat._id))
            }
            
        }

        //if not exists we create a chat then response the chatId
        if(res.data.chat === null){
            setMailLoading(true)
            const createChat = await userRequest.post(`/chat`,{
                members:[currentUser?._id, userId],
                lastMessage:'',
                senderId:'',
                isReceiverSeen: true
            })
            //get new chatId then insert to localStorage chatList , and set state for LocalStorage chatBox
            
            if(createChat.data){        
                const getChatList = async() => {                
                    const res = await userRequest.get(`/chat/chat-list/${currentUser?._id}?page=1&limit=3`)
                    if(res.data){
                        dispatch(setUserStatus("offline"))
                        setMailLoading(false)
                        dispatch(setChatListHasNext(res.data.hasNext))
                        dispatch(setChatList(res.data.chatList))
                        dispatch(setChatPage(1))
                        dispatch(setMessages([]))
                        dispatch(setChatState(true))
                        dispatch(setChatId(createChat.data.chat._id))
                        dispatch(setSenderData(user as User))
                    }
                }
                getChatList()
        
            }
        }

    }

    // console.log('comment count',commentCount)
    // console.log("postcount",postCount)
  return (
    <div className='flex flex-col   mt-16 h-auto w-full'>
        {/* user info */}
        <div className={`flex flex-col justify-center items-center bg-red-100  py-8 px-2  bg-no-repeat bg-cover bg-center
         bg-[url('https://img.freepik.com/free-photo/close-up-pretty-flowers-with-blurred-person-background_23-2147604837.jpg?size=626&ext=jpg')] `}>
            <div className='relative'>
                <Image width={100} height={100} src={user?.img as string||'/user.png'} className='w-30 h-30 object-cover rounded-full' alt='avatar' />
                {
                    user?.isAdmin ?
                    <div className='absolute -bottom-4 left-5 p-1 px-2 bg-orange-300 rounded-lg font-bold text-white  text-center '>Admin</div>
                    : user?.isReporter ?
                    <div className='absolute -bottom-4 left-5 p-1 px-2 bg-orange-300 rounded-lg font-bold text-white  text-center '>Reporter</div>
                    : ''
                }
             
            </div>
            <div className='font-bold flex text-xl gap-2 mt-10'>
                <div>
                    {user?.username}
                </div>
                {
                    user?.verified &&
                    <Check className='w-6 h-6 text-white p-1 bg-green-500 rounded-full' />
                }
            </div>
            <div className='flex justify-center items-center gap-4 mt-10' >
                <div className='flex gap-1'>
                    <div className=''>Bài đã đăng:</div>
                    <div className='font-bold'>{totalPost}</div>
                </div>
                <div className='flex gap-1'>
                    <div className=''>Ngày tham gia:</div>
                    <div className='font-bold'>{moment(user?.createdAt).format('DD-MM-YYYY')}</div>
                </div>
            </div>
            <div className='flex justify-center items-center gap-4' >
                <div className='flex gap-1'>
                    <div className=''>Lượt bình luận:</div>
                    <div className='font-bold'>{commentCount}</div>
                </div>
                <div className='flex gap-1'>
                    <div className=''>Lượt thả cảm xúc:</div>
                    {commentCount && postCount &&
                        <div className='font-bold'>{commentCount+postCount}</div>
                    }
                </div>
            </div>
            <div className='flex justify-center items-center mt-10 bg-gray-200 opacity-70 p-4 rounded-lg '>
                {user?.description}
            </div>
        </div>

        <div className='flex justify-center h-auto  '>
            <div className='  w-[1200px]'>
                <div className='flex justify-end'>
                    <div 
                        onClick={handleOpenChatBox}
                         className='bg-blue-100 gap-1 p-2 mt-2 rounded-lg text-blue-500 flex justify-center items-center hover:cursor-pointer font-semibold'>
                        {mailLoading ?
                             <Loader className='animate-spin' />
                             :
                            <MessageSquare className='w-5 h-5 font-bold' />
                        }
                        Nhắn tin
                    </div>
                </div>
                <Separator className='mt-2' />
                {/* các bài viết gần đây */}
                <div className='flex flex-col mt-2'>
                    <div className='font-bold text-xl mb-20 text-center'>
                        Các bài viết gần đây
                    </div>
                    {
                        posts.length===0 &&
                        <div className='flex justify-center items-center p-2 bg-gray-100 mb-20'>
                            Không có bài viết nào !
                        </div>
                    }
                    {posts?.map((post,index)=>(
                        <div className='w-full flex space-y-2' key={index}>
                            <div className='w-[200px]'>
                                <Image src={post?.thumbnail} className='w-40 h-30 rounded-lg object-cover' alt='post thumbnail' width={100} height={70} />
                            </div>
                            <Link  className='w-full flex flex-col ' 
                                href={`/post/${post.title.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/(^-|-$)/g, '')}/${post._id}`}  >
                                <div className='font-bold text-xl hover:text-blue-500'>{post?.title}</div>
                                <div>{post?.shortDescription}...</div>
                                <div className='text-gray-400 text-sm'>
                                    <ReactTimeAgoUtil date={post?.createdAt} locale='vi-VN' />
                                </div>
                            </Link>
                        </div>
                        ))
                    }
                    { hasNext ?
                        <div 
                            onClick={()=>setPage((prev)=>prev+1)}
                            className='bg-blue-100 font-bold p-3  mb-20 mt-20 text-blue-500 hover:bg-blue-200 transition rounded-lg hover:cursor-pointer gap-2 flex justify-center items-center'>
                            {loading &&
                                <Loader className='animate-spin' />
                            }
                            Xem thêm
                        </div>
                        :''

                    }
                </div>
            </div>
        </div>
        
    </div>
  )
}

export default page