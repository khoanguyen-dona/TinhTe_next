'use client'

import axios from "axios";
import Menu from "./custom-components/Menu";
// import { posts } from "@/data";

import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setUser } from "@/redux/userRedux";
import { publicRequest } from "@/requestMethod";
import { Post } from "@/dataTypes";
import JoditViewer from "./custom-components/JoditViewer";
import Image from "next/image";
import { Loader } from "lucide-react";

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
  const limit:number = 10
  // display notify when user redirected by googleAuth
  useEffect(() => {
    if(googleAuth==='true'){

      // Remove the query param from the URL after setting message
      //@ts-ignore
      router.replace("/", undefined, { shallow: true });
      toast.success('Đăng nhập thành công')
    }

    if(logout==='true'){

      // Remove the query param from the URL after setting message
      //@ts-ignore
      router.replace("/", undefined, { shallow: true });
      toast.success('Đăng xuất thành công')
    }

  }, [])

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

   //get data of user when redirect by googleAuth
   useEffect(()=> {
    if(user === null  ){
     
      axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/user`, {withCredentials: true})
      .then((res) => {
        dispatch(setUser(res.data.user))
      })
      .catch(() => dispatch(setUser(null)) );
  }
  }, [])

  console.log(page)
  return (  
    <div className=" px-2 md:px-8 2xl:px-32 mt-16">
      <Menu />
      <div className=" mt-10 flex gap-2">
        <div className="flex flex-col lg:flex-row md:gap-2">

          <div className="flex w-full lg:w-9/12 flex-col  md:flex-row md:gap-2 ">
            {/* 1st col */}
            <div className="flex flex-col md:flex-wrap h-auto  w-full md:w-8/12  ">
              <div className=" h-auto md:h-110 flex flex-col space-y-2" >
                <a  href={`/post/${posts?.[0].title.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/(^-|-$)/g, '') as string}/${posts?.[0]._id}`}>
                  <Image width={600} height={600} src={posts?.[0].thumbnail as string}  className="w-full h-90 object-cover rounded-lg" alt="" />
                  <h1 className="text-xl font-bold block lg:hidden hover:cursor-pointer hover:text-blue-500 transition ">{posts?.[0].title.split(/\s+/).slice(0, 20).join(' ')}</h1>
                  <h1 className="text-xl font-bold hidden lg:block hover:cursor-pointer hover:text-blue-500 transition">{posts?.[0].title.split(/\s+/).slice(0, 34).join(' ')}</h1>
                </a>
                <p className="text-sm ">{posts?.[0].authorId.username }</p>
              </div>
              <div  className="flex h-auto md:h-80 space-x-4 lg:space-x-2 mt-4">
                <div className=" w-1/2  space-y-2 " >
                  <a href={`/post/${posts?.[1].title.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/(^-|-$)/g, '')}/${posts?.[1]._id}`}>
                    <Image width={300} height={300} src={posts?.[1].thumbnail as string} className="w-full h-1/2 md:h-3/5 object-cover rounded-lg" alt="" />
                    <h1 className="font-semibold text-medium block lg:hidden hover:cursor-pointer hover:text-blue-500 transition" >{posts?.[1].title.split(/\s+/).slice(0, 15).join(' ')}...</h1>
                    <h1 className="font-semibold text-medium hidden lg:block hover:cursor-pointer hover:text-blue-500 transition">{posts?.[1].title.split(/\s+/).slice(0, 25).join(' ')}</h1>
                  </a>
                  <p className="text-sm">{posts?.[1].authorId.username}</p>
                </div>
                <div className=" w-1/2  space-y-2" >
                  <a  href={`/post/${posts?.[2].title.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/(^-|-$)/g, '')}/${posts?.[2]._id}`}>
                    <Image width={300} height={300} src={posts?.[2].thumbnail as string} className="w-full h-1/2  md:h-3/5 object-cover rounded-lg" alt="" />
                    <h1 className="font-semibold block lg:hidden hover:cursor-pointer hover:text-blue-500 transition" >{posts?.[2].title.split(/\s+/).slice(0, 15).join(' ')}...</h1>
                    <h1 className="font-semibold hidden lg:block hover:cursor-pointer hover:text-blue-500 transition" >{posts?.[2].title.split(/\s+/).slice(0, 25).join(' ')}</h1>
                  </a>
                  <p className="text-sm">{posts?.[2].authorId.username}</p>
                </div>
              </div>
            </div>
            {/* 2nd col */}
            <div className="flex h-auto w-full  md:flex-col md:w-4/12  gap-4">
              <div className="h-auto md:h-110  space-y-2 w-1/2 md:w-full mt-4 md:mt-0">
                  <a  href={`/post/${posts?.[3].title.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/(^-|-$)/g, '')}/${posts?.[3]._id}`}>
                    <Image width={300} height={300} src={posts?.[3].thumbnail as string} className="w-full h-1/2 md:h-2/5 object-cover rounded-lg" alt="" />
                    <h1 className="font-semibold block lg:hidden hover:cursor-pointer hover:text-blue-500 transition" >{posts?.[3].title.split(/\s+/).slice(0, 15).join(' ')}...</h1>
                    <h1 className="font-semibold hidden lg:block hover:cursor-pointer hover:text-blue-500 transition" >{posts?.[3].title.split(/\s+/).slice(0, 25).join(' ')}</h1>
                  </a>
                  <p className="text-sm">{posts?.[3].authorId.username}</p>
                  <p className="hidden md:block" >{posts?.[3].shortDescription.slice(0, 210)}...</p> 
              </div>
              <div className="h-auto md:h-80  space-y-2 mt-4 md:mt-0 w-1/2 md:w-full " >
                  <a  href={`/post/${posts?.[4].title.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/(^-|-$)/g, '')}/${posts?.[4]._id}`}>
                    <Image width={300} height={300} src={posts?.[4].thumbnail as string} className="w-full h-1/2 md:h-3/5 object-cover rounded-lg" alt="" />
                    <h1 className="font-semibold block lg:hidden hover:cursor-pointer hover:text-blue-500 transition" >{posts?.[4].title.split(/\s+/).slice(0, 16).join(' ')}</h1>
                    <h1 className="font-semibold hidden lg:block hover:cursor-pointer hover:text-blue-500 transition" >{posts?.[4].title.split(/\s+/).slice(0, 25).join(' ')}</h1>
                  </a>
                  <p className="text-sm ">{posts?.[4].authorId.username}</p>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-3/12 flex flex-col ">
            {/* Xem nhiều col */}
            <div className="flex flex-col">
              <div className="flex justify-between p-2">
                <div className="text-2xl font-bold " >Xem nhiều</div>
                <div className="text-blue-500 hover:cursor-pointer hover:text-blue-700 transition" >Xem tất cả</div>
              </div>
              {
                trendingPosts?.map((post, index)=>(
                  <a  href={`/post/${post.title.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/(^-|-$)/g, '')}/${post._id}`} className="flex gap-1  p-2" key={index}>
                    <div className="w-3/5 sm:w-4/5 lg:w-3/5" > 
                      <h1 className="font-semibold  block lg:hidden hover:cursor-pointer hover:text-blue-500 transition" >{post?.title.split(/\s+/).slice(0, 40).join(' ')}</h1>
                      <h1 className="font-semibold  hidden lg:block hover:cursor-pointer hover:text-blue-500 transition" >{post?.title.split(/\s+/).slice(0, 12).join(' ')}...</h1>
                    </div>
                    <div className="w-2/5 sm:w-1/5 lg:w-2/5  h-20  ">
                      <Image width={300} height={300} src={post?.thumbnail as string} className="object-cover h-full w-full rounded-md" alt="" />
                    </div>
                  </a>
                ))
              }
            </div>

          </div>

        </div> 
      </div>

      <div className="w-full lg:w-9/12 mb-10 ">
          {
            posts?.slice(5).map((p: Post, index)=>(
                <div key={index} className="flex  mt-0   hover:cursor-pointer">
                    <a  href={`/post/${p.title.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/(^-|-$)/g, '')}/${p._id}`} className="w-2/5 md:w-1/3 lg:w-1/4 p-2 " >
                      <Image width={200} height={200} src={p.thumbnail as string} className="object-cover h-24 sm:h-36 md:h-36 w-64 rounded-lg " alt="" />
                    </a>
                    <div className="w-3/5 md:w-2/3 lg:w-3/4 flex flex-col space-y-2 p-2" >
                      <a href={`/post/${p.title.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/(^-|-$)/g, '')}/${p._id}`}>
                        <h1 className="font-bold text-sm md:text-lg hover:text-blue-500  transition" >{p.title}</h1>
                      </a>
                      <p className="hidden sm:block md:hidden lg:block ">{p?.shortDescription.slice(0, 270)}...</p>
                      <p className="hidden md:block lg:hidden">{p?.shortDescription.slice(0, 180)}...</p>
                      <div className="flex  items-center gap-2 ">
                        <Image width={30} height={30} src={p.authorId.img as string } className="w-8 h-8 rounded-full " alt="" />
                        <p className=" hover:text-blue-500 transition">{p.authorId.username }</p>
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

  );
}
