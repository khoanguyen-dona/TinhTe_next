'use client'
import Menu from "./custom-components/Menu";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setUser } from "@/redux/userRedux";
import { setChatList, setChatListHasNext } from "@/redux/chatListRedux";
import { publicRequest, userRequest } from "@/requestMethod";
import { MessageGroupChatType, Post } from "@/dataTypes";
import Link from "next/link";
import Image from "next/image";
import { Loader, SmilePlus } from "lucide-react";
import { Socket, io } from "socket.io-client";
import { useSocket } from "@/context/socketContext";
import { v4 as uuidv4 }from 'uuid'
import { Textarea } from "@/components/ui/textarea";
import { emoji } from "@/data";
import GroupChat from "./custom-components/GroupChat";
import { setNotifications, setNotificationsHasNext } from "@/redux/notificationRedux";
export default function Home() {
  const dispatch = useDispatch()
  const router = useRouter()
  const [loading, setLoading] = useState<boolean>(true)
  const searchParams = useSearchParams()
  const user = useSelector((state: RootState) => state.user.currentUser)
  const googleAuth = searchParams.get('googleAuth')
  const logout = searchParams.get('logout')
  const [trendingPosts, setTrendingPosts] = useState<Post[]>()
  const [posts, setPosts] = useState<Post[]>()
  const [page, setPage] = useState<number>(1)
  const [hasNext, setHasNext] = useState<boolean>()
  const limit:number = 10 // use for get posts 
  const notifyLimit:number = 10
  const chatListLimit = 10
  const { socket, isConnected} = useSocket()
  const uuid = Math.random().toString(36).substring(2,10)
  const [guestId, setGuestId] = useState<string>('')
  const [groupMessages, setGroupMessages] = useState<MessageGroupChatType[]>([])
  const accessToken = useSelector((state:RootState)=>state.user.accessToken)

  
  // setTimeout(()=>{
  //   window.location.reload()
  // },600000)

  // fetch notification
  useEffect(()=>{
    const getData = async() => {
      const res = await userRequest.get(`/notification/${user?._id}?limit=${notifyLimit}&page=1`)
      if(res.data){
        dispatch(setNotifications(res.data.notifications))
        dispatch(setNotificationsHasNext(res.data.hasNext))
      }
    }
    getData()
  }, [])

  // fetch group-chat-messages 
  useEffect(()=>{
    const getData = async() => {
      const tempArray: any = []
      try {
        const res_groupMessages = await publicRequest.get('/redis/group-messages')
        if(res_groupMessages.data){

          res_groupMessages.data.messages.map((message: any)=>{
              let objectMessage =  JSON.parse(message)
              tempArray.push(objectMessage)
          })
          setGroupMessages(tempArray)
          setGroupMessages(res_groupMessages.data.messages)
        }        
      } catch(err){
        console.log('fetching group chat messages failed',err)
      }
    }
    getData()
  }, [])

  // sent event to socket when user connected to page
  useEffect(()=>{
    if(user!==null){
      socket?.emit('addUser', {userId: user?._id, username: user?.username, avatar: user?.img , lastAccess: new Date().toISOString(), isGuest:'false' })
    } else {
      socket?.emit('addUser', {userId: `guest_${uuid}`, username: `guest_${uuid}`,avatar:'/user.png', lastAccess: new Date().toISOString(), isGuest:'true' })           
    }  
  }, [] )

  
  // display logout success when user logout
  useEffect(() => {
    if(logout==='true'){

      // Remove the query param from the URL after setting message
      //@ts-ignore
      router.replace("/", undefined, { shallow: true });
      toast.success('Đăng xuất thành công')
    }

  }, [])

  //set userId
  useEffect(()=>{
    if(user===null){
      setGuestId(`guest_${uuid}`)
    }
  },[])


  // get chatList 
    useEffect(()=>{
      
      const getData = async() => {   
          if(user!==null){         
            const res = await userRequest.get(`/chat/chat-list/${user?._id}?page=1&limit=${chatListLimit}`)
            dispatch(setChatListHasNext(res.data.hasNext))
            dispatch(setChatList(res.data.chatList))              
          }
      }      
      getData()
    },[])


  //  get post data first time
   useEffect(()=>{
    setLoading(true)
    const getPosts = async () => {
      try {
        const res = await publicRequest.get(`/post?page=${page}&limit=${limit}&isPosted=&isApproved=`)
        if(res.data){
          setPosts(res.data.posts)
        }
      } catch(err){
        console.log('fetch posts failed', err)
      } finally {
        setLoading(false)
      }
    }
    getPosts()
  }, [])

  //  get trending posts data
  useEffect(()=>{
    setLoading(true)
    const getPosts = async () => {
      try {
        const res = await publicRequest.get(`/post?page=1&limit=5&isPosted=&isApproved=&mostWatch=true`)
        if(res.data){
          setTrendingPosts(res.data.posts)
        }
      } catch(err){
        console.log('fetch posts failed', err)
      } finally {
        setLoading(false)
      }
    }
    getPosts()
  }, [])

  // get post data when clicked see more button
  useEffect(()=>{
    setLoading(true)
    const getPosts = async () => {
      try {
        const res = await publicRequest.get(`/post?page=${page}&limit=${limit}&isPosted=&isApproved=`)
        if(res.data){
          res.data.posts.map((c:Post)=>{
            posts?.push(c)
          })   
          setHasNext(res.data.hasNext)
        }  
      } catch(err){
        console.log('fetch posts failed', err)
      } finally {
        setLoading(false)
      }
    }
    getPosts()
  }, [page])




  return (  
    <div className="w-full px-2 md:px-8  mt-16 ">
      <Menu />
      <div className="w-full flex flex-col lg:flex-row">

        <div className=" mt-10 w-full lg:w-8/12 flex flex-col  gap-2 ">
          <div className="flex  flex-col lg:flex-row w-full  md:gap-2 ">

            <div className="flex w-full  flex-col  md:flex-row md:gap-2 ">
              {/* 1st col */}
              <div className="flex flex-col md:flex-wrap h-auto w-full md:w-8/12  ">
                <div className=" h-auto md:h-110 flex flex-col space-y-2" >
                  <Link  href={`/post/${posts?.[0].title.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/(^-|-$)/g, '') as string}/${posts?.[0]._id}`}>
                    {posts?.[0]?.thumbnail &&
                      <Image width={600} height={600} src={posts?.[0]?.thumbnail as string} blurDataURL={posts?.[0]?.thumbnail}  className="w-full h-90 object-cover rounded-lg" alt="" />
                    }
                    <h1 className="text-xl font-bold block lg:hidden hover:cursor-pointer hover:text-blue-500 transition ">{posts?.[0].title.split(/\s+/).slice(0, 20).join(' ')}</h1>
                    <h1 className="text-xl font-bold hidden lg:block hover:cursor-pointer hover:text-blue-500 transition">{posts?.[0].title.split(/\s+/).slice(0, 34).join(' ')}</h1>
                  </Link>
                  <Link href={`/profile/${posts?.[0].authorId._id}`} className="text-sm hover:text-blue-500">{posts?.[0].authorId?.username }</Link>
                </div>
                <div  className="flex h-auto md:h-80 space-x-4 lg:space-x-2 mt-4">
                  <div className=" w-1/2  space-y-2 " >
                    <Link href={`/post/${posts?.[1]?.title.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/(^-|-$)/g, '')}/${posts?.[1]?._id}`}>
                      {posts?.[1]?.thumbnail &&
                        <Image width={300} height={300} src={posts?.[1]?.thumbnail as string} className="w-full h-1/2 md:h-3/5 object-cover rounded-lg" alt="" />
                      }
                      <h1 className="font-semibold text-medium block lg:hidden hover:cursor-pointer hover:text-blue-500 transition" >{posts?.[1]?.title.split(/\s+/).slice(0, 15).join(' ')}...</h1>
                      <h1 className="font-semibold text-medium hidden lg:block hover:cursor-pointer hover:text-blue-500 transition">{posts?.[1]?.title.split(/\s+/).slice(0, 25).join(' ')}</h1>
                    </Link>
                    <Link href={`/profile/${posts?.[1]?.authorId._id}`} className="text-sm hover:text-blue-500 ">{posts?.[1]?.authorId?.username}</Link>
                  </div>
                  <div className=" w-1/2  space-y-2" >
                    <Link  href={`/post/${posts?.[2]?.title.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/(^-|-$)/g, '')}/${posts?.[2]?._id}`}>
                      {posts?.[2]?.thumbnail &&
                        <Image width={300} height={300} src={posts?.[2].thumbnail as string} className="w-full h-1/2  md:h-3/5 object-cover rounded-lg" alt="" />
                      }
                      <h1 className="font-semibold block lg:hidden hover:cursor-pointer hover:text-blue-500 transition" >{posts?.[2]?.title.split(/\s+/).slice(0, 15).join(' ')}...</h1>
                      <h1 className="font-semibold hidden lg:block hover:cursor-pointer hover:text-blue-500 transition" >{posts?.[2]?.title.split(/\s+/).slice(0, 25).join(' ')}</h1>
                    </Link>
                    <Link href={`/profile/${posts?.[2]?.authorId._id}`} className="text-sm hover:text-blue-500 ">{posts?.[2]?.authorId?.username}</Link>
                  </div>
                </div>
              </div>
              {/* 2nd col */}
              <div className="flex h-auto w-full  md:flex-col md:w-4/12  gap-4">
                <div className="h-auto md:h-110  space-y-2 w-1/2 md:w-full mt-4 md:mt-0">
                    <Link  href={`/post/${posts?.[3]?.title.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/(^-|-$)/g, '')}/${posts?.[3]?._id}`}>
                      {posts?.[3]?.thumbnail &&
                        <Image width={300} height={300} src={posts?.[3]?.thumbnail as string} className="w-full h-1/2 md:h-2/5 object-cover rounded-lg" alt="" />
                      }
                      <h1 className="font-semibold block lg:hidden hover:cursor-pointer hover:text-blue-500 transition" >{posts?.[3]?.title.split(/\s+/).slice(0, 15).join(' ')}...</h1>
                      <h1 className="font-semibold hidden lg:block hover:cursor-pointer hover:text-blue-500 transition" >{posts?.[3]?.title.split(/\s+/).slice(0, 25).join(' ')}</h1>
                    </Link>
                    <Link href={`/profile/${posts?.[3]?.authorId._id}`} className="text-sm hover:text-blue-500 ">{posts?.[3]?.authorId?.username}</Link>
                    <p className="hidden md:block" >{posts?.[3]?.shortDescription.slice(0, 210)}...</p> 
                </div>
                <div className="h-auto md:h-80  space-y-2 mt-4 md:mt-0 w-1/2 md:w-full " >
                    <Link  href={`/post/${posts?.[4]?.title.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/(^-|-$)/g, '')}/${posts?.[4]?._id}`}>
                      {posts?.[4]?.thumbnail &&
                        <Image width={300} height={300} src={posts?.[4]?.thumbnail as string} className="w-full h-1/2 md:h-3/5 object-cover rounded-lg" alt="" />
                      }
                      <h1 className="font-semibold block lg:hidden hover:cursor-pointer hover:text-blue-500 transition" >{posts?.[4].title.split(/\s+/).slice(0, 16).join(' ')}</h1>
                      <h1 className="font-semibold hidden lg:block hover:cursor-pointer hover:text-blue-500 transition" >{posts?.[4].title.split(/\s+/).slice(0, 25).join(' ')}</h1>
                    </Link>
                    <Link href={`/profile/${posts?.[4]?.authorId._id}`} className="text-sm hover:text-blue-500  ">{posts?.[4]?.authorId?.username}</Link>
                </div>
              </div>
            </div>

            

          </div> 

          <div className="lg:hidden  w-full  mt-10">
              <GroupChat socket={socket} username={user?.username as string} userId={user?._id||guestId} avatar={user?.img as string} messages={groupMessages} />
          </div>
          
          <div className="w-full   mb-10 ">
            {
              posts?.slice(5).map((p: Post, index)=>(
                  <div key={index} className="flex  mt-0   hover:cursor-pointer">
                      <Link  href={`/post/${p?.title.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/(^-|-$)/g, '')}/${p?._id}`} className="w-2/5 md:w-1/3 lg:w-1/4 p-2 " >
                        {p?.thumbnail &&
                          <Image width={150} height={150} src={p?.thumbnail as string} className="object-cover h-24 sm:h-36 md:h-36 w-64 rounded-lg " alt="" />
                        }
                      </Link>
                      <div className="w-3/5 md:w-2/3 lg:w-3/4 flex flex-col space-y-2 p-2" >
                        <Link href={`/post/${p?.title.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/(^-|-$)/g, '')}/${p?._id}`}>
                          <h1 className="font-bold text-sm md:text-lg hover:text-blue-500  transition" >{p?.title}</h1>
                        </Link>
                        <p className="hidden sm:block md:hidden lg:block ">{p?.shortDescription.slice(0, 235)}...</p>
                        <p className="hidden md:block lg:hidden">{p?.shortDescription.slice(0, 180)}...</p>
                        <div className="flex  items-center gap-2 ">
                          {p?.authorId?.img &&
                            <Image width={30} height={30} src={p?.authorId?.img as string } className="w-8 h-8 rounded-full " alt="" />
                          }
                          <Link href={`/profile/${p?.authorId._id}`} className=" hover:text-blue-500 transition">{p?.authorId?.username }</Link>
                        </div>
                      </div>
                  </div>
              ))
            }

            {/* Xem thêm button */}
            {hasNext ?
              <div onClick={()=>setPage((prev)=>prev+1)} className="flex justify-center items-center text-blue-500 mb-10 bg-blue-50 p-4 rounded-xl 
              text-xl font-bold transition hover:bg-blue-100 hover:cursor-pointer mt-20">
                {loading?<Loader className="animate-spin w-8 h-8 opacity-50" /> : 'Xem thêm ' }
              </div> : ''
            }
          </div>
        </div>
        
        <div className="w-full lg:w-4/12 flex flex-col mt-10 ">
            {/* Xem nhiều col */}
            <div className="flex flex-col">
              <div className="flex justify-between p-2">
                <div className="text-2xl font-bold " >Xem nhiều</div>
                <div className="text-blue-500 hover:cursor-pointer hover:text-blue-700 transition" >Xem tất cả</div>
              </div>
              {
                trendingPosts?.map((post, index)=>(
                  <Link  href={`/post/${post.title.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/(^-|-$)/g, '')}/${post._id}`} className="flex gap-1  p-2" key={index}>
                    <div className="w-3/5 sm:w-4/5 lg:w-3/5" > 
                      <h1 className="font-semibold  block lg:hidden hover:cursor-pointer hover:text-blue-500 transition" >{post?.title.split(/\s+/).slice(0, 40).join(' ')}</h1>
                      <h1 className="font-semibold  hidden lg:block hover:cursor-pointer hover:text-blue-500 transition" >{post?.title.split(/\s+/).slice(0, 12).join(' ')}...</h1>
                    </div>
                    <div className="w-2/5 sm:w-1/5 lg:w-2/5  h-20  ">
                      {post?.thumbnail &&
                        <Image width={300} height={300} src={post?.thumbnail as string} className="object-cover h-full w-full rounded-md" alt="" />
                      }
                    </div>
                  </Link>
                ))
              }
            </div>

            <div className="mt-20 ml-1 hidden lg:block">
              <GroupChat socket={socket} username={user?.username as string} userId={user?._id||guestId} avatar={user?.img as string} messages={groupMessages} />
            </div>
            
        </div>

      </div>

     
    </div>

  );
}
