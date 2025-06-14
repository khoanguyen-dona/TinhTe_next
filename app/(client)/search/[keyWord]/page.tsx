'use client'

import { Separator } from "@/components/ui/separator";
import { useParams } from "next/navigation";
import { Check, Divide, FileText, Loader, SearchX } from "lucide-react";
import { Users } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { publicRequest, userRequest } from "@/requestMethod";
import { ChatType, MessageType, Post, User } from "@/dataTypes";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { setSearchType } from "@/redux/searchRedux";
import { setChatId, setChatPage, setChatState, setMessages, setSenderData, setUserStatus } from "@/redux/chatRedux";
import { addChatToChatList, setChatList, setChatListHasNext } from "@/redux/chatListRedux";
import Link from "next/link";

export default function Search() {
    const dispatch = useDispatch()
    const currentUser = useSelector((state:RootState)=>state.user.currentUser)
    const chatList = useSelector((state:RootState)=>state.chatList.currentChatList)
    const findType = useSelector((state:RootState)=>state.search.searchType)
    const {keyWord}= useParams()
    const decodedKeyWord = decodeURIComponent(keyWord as string)
    const limit = 10
    const [page, setPage] = useState<number>(1)
    const [users, setUsers] = useState<User[]>([])
    const [posts, setPosts] = useState<Post[]>([])
    const [hasNext, setHasNext] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false)
    const [mailLoading,setMailLoading] = useState<boolean>(false)


    //fetch first time and when switch type
    useEffect(()=>{ 


        if(findType==='user'){
            const getUsers = async() => {
                try{
                    setLoading(true)
                    const res = await publicRequest.get(`/user/username/${decodedKeyWord}?page=${page}&limit=${limit}`)
                    if(res.data){
                        setHasNext(res.data.hasNext)
                        setUsers(res.data.users)
                        setLoading(false)            
                    }
                } catch(err) {
                    console.log('fetch users 1st time failed',err)
                }
            }
            getUsers()
        }

        if(findType==='post'){
            const getPosts = async() => {
                try{
                    console.log('fetch post!')
                    setLoading(true)
                    const res = await publicRequest.get(`/post/post-title/${decodedKeyWord}?page=${page}&limit=${limit}`)
                    if(res.data){
                        setHasNext(res.data.hasNext)
                        setPosts(res.data.posts)
                        setLoading(false)
                    }
                } catch(err){
                    console.log('fetch posts 1st time failed',err)
                }
            }
            getPosts()
        }

    },[findType])

    //fetch when page change
    useEffect(()=>{ 


        if(findType==='user'){
            const getUsers = async() => {
                try{
                    setLoading(true)
                    const res = await publicRequest.get(`/user/username/${decodedKeyWord}?page=${page}&limit=${limit}`)
                    if(res.data){
                        setLoading(false)            
                        setHasNext(res.data.hasNext)
                        res.data.users.map((user:User)=>{
                            users.push(user)
                        })
                    }
                } catch(err) {
                    console.log('fetch users 1st time failed',err)
                }
            }
            getUsers()
        }

        if(findType==='post'){
            const getPosts = async() => {
                try{
                    setLoading(true)
                    const res = await publicRequest.get(`/post/post-title/${decodedKeyWord}?page=${page}&limit=${limit}`)
                    if(res.data){
                        setLoading(false)
                        setHasNext(res.data.hasNext)
                        res.data.posts.map((post:Post)=>{
                            posts.push(post)
                        })
                    }
                } catch(err){
                    console.log('fetch posts 1st time failed',err)
                }
            }
            getPosts()
        }

    },[page])

    //switch page set page back to 1
    useEffect(()=>{
        setPage(1)
    },[findType])

    const handleSeeMore = () => {
        setPage(page+1)
    }
 

    const handleOpenChatBox = async (userId:string) => {
        
            //find info of senderData
            const sender = await publicRequest.get(`/user/${userId}`)
            setMailLoading(true)
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
                    setMailLoading(false)

    
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
                    setMailLoading(false)

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
    <div className='flex justify-center'>
    {/* loader */}
    {loading && 
        <div className='fixed top-0 z-20  w-screen h-screen bg-white opacity-50' >
            <div className='absolute inset-0 flex items-center justify-center'>
                <Loader className=' animate-spin w-14 h-14   '/>
            </div>
        </div>
    }
    {/*  content */}
    <div className="w-full min-h-screen px-2 md:px-8  mt-16 flex flex-col md:flex-row ">
        <div className=" w-full md:w-1/4  flex flex-col p-4">
            <div className="font-bold text-sm lg:text-xl">Kết quả tìm kiếm cho:</div>
            <div className="font-bold text-blue-500 text-2xl mb-2 text-center">
                {decodedKeyWord}
            </div>
            <Separator/>
            <div className="flex flex-col space-y-3 mt-2">
                <div className="text-2xl ">Bộ lọc</div>
                <div className={`flex items-center transition text-lg p-2 gap-2 rounded-lg hover:cursor-pointer ${findType==='post'?'bg-blue-100':''} `} 
                    onClick={()=>dispatch(setSearchType('post'))}>
                        <FileText className={` p-2 w-10 h-10 transition rounded-full ${findType==='post'?'bg-blue-500 text-white':'bg-gray-200'} `} />
                        <p>Bài viết</p>
                </div>
                <div className={`flex items-center transition text-lg p-2 gap-2 rounded-lg hover:cursor-pointer ${findType==='user'?'bg-blue-100':''} `}  
                    onClick={()=>dispatch(setSearchType('user'))}>
                        <Users  className={` p-2 w-10 h-10 transition rounded-full ${findType==='user'?'bg-blue-500 text-white':'bg-gray-200'} `} />
                        <p>User </p>
                </div>
            </div>
        </div>
        <div className=" w-full md:w-3/4  p-4 flex flex-col">
            <div className="text-2xl font-bold first-letter:uppercase mb-4">{findType}</div>
            
            {/* <div className="flex flex-col w-full"> */}
            {findType==='user' &&  users?.length>0 &&
                users?.map((user,index)=>(   
                <div key={index} className={`w-full h-30  flex items-center gap-2 p-2 border-1 rounded-lg mt-1 ${user._id===currentUser?._id?'hidden':''} `}>
                    <div className="w-25 relative">
                        <Image 
                            width={80} height={80} alt='avatar' className="w-20 h-20 rounded-full object-cover"
                            src={user?.img||'/user.png'} 
                        />
                        {user?.isAdmin ?
                            <div className="absolute -bottom-4 left-2 text-white bg-blue-500 px-2 rounded-lg">Admin</div>
                            :
                        user?.isReporter ?
                            <div className="absolute -bottom-4 left-0 text-white bg-blue-500 px-2 rounded-lg">Reporter</div>
                            : ''
                        }
                    </div>
                    <div className="flex justify-between w-full">
                        <div className="flex flex-col ">
                            <Link href={`/profile/${user._id}`} className="font-bold text-lg hover:cursor-pointer hover:text-blue-500 flex gap-2">{user?.username}
                                {user?.verified && <Check className="bg-blue-500 text-white p-1 rounded-full"/>}
                            </Link>
                            <div className="flex items-center justify-center gap-2">
                                <div>Ngày tham gia:</div>
                                <div className=" text-gray-400">{moment(user?.createdAt).format('DD-MM-YYYY')}</div>
                            </div>
                        </div>
                        <div>
                            <button 
                                disabled={mailLoading||user._id===currentUser?._id}
                                onClick={()=>handleOpenChatBox(user?._id)}
                                className={`p-4 bg-blue-50 text-blue-500 font-bold rounded-lg hover:cursor-pointer hover:bg-blue-100 flex gap-2 
                                ${mailLoading?'opacity-50':''} ${user._id===currentUser?._id?'hidden':''} `}>
                                {mailLoading && <Loader className="animate-spin"/>}Nhắn tin
                            </button>
                        </div>
                    </div>
                </div>
                ))
            }
            {findType==='user'&& users?.length===0 &&
                <div className="bg-gray-200 p-4 rounded-lg flex items-center gap-2"><SearchX className="w-10 h-10"/>Không có kết quả nào !</div>
            }
        

            {findType==='post' &&  posts?.length>0 &&
                posts?.map((post:Post,index)=>(                             
                <div key={index} className="w-full  mt-1 flex flex-col md:flex-row items-center gap-2 p-4 border-2 rounded-lg">
                    <div className="w-full md:w-50">
                        <Image 
                            width={80} height={80} alt='avatar' className="w-full md:w-50  h-50 md:h-30  rounded-lg object-cover"
                            src={post?.thumbnail||`/user.png`} 
                        />
                    </div>
                    <div className="flex justify-between items-center w-full">
                        <div className="flex flex-col ">
                            <Link href={`/post/${post?.title?.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/(^-|-$)/g, '') as string}/${post?._id}`} 
                                className="font-bold text-lg hover:cursor-pointer hover:text-blue-500">{post?.title?.slice(0,70)}...</Link>
                            <div>{post?.shortDescription?.slice(0,190)}...</div>
                            <div className=" flex justify-between items-center  ">
                                <div className="flex items-center gap-2">
                                    <Image width={10} height={10} className="w-8 h-8 rounded-full object-cover" alt='avatar' src={post?.authorId?.img||'/user.png'}/>
                                    <Link href={`/profile/${post?.authorId._id}`} className=" hover:cursor-pointer hover:text-blue-500">{post?.authorId?.username}</Link>
                                </div>
                                <div>
                                    <div className=" text-gray-400">{moment(post?.createdAt).format('DD-MM-YYYY, hh:mm a')}</div>
                                </div>

                            </div>
                        </div>
                        
                    </div>
                </div>
            )) 
            }
            {
                findType==='post' && posts?.length===0 &&
                <div className="bg-gray-200 p-4 rounded-lg flex items-center gap-2"><SearchX className="w-10 h-10"/>Không có kết quả nào !</div>
            }
            {hasNext &&
                <div onClick={handleSeeMore} className="w-full p-4 bg-blue-100 text-blue-500 hover:bg-blue-200 text-center mt-10 rounded-lg">Xem thêm</div>
            }

        </div>

   
    </div>
    </div>
  );
}
