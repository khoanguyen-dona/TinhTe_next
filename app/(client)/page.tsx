'use client'

import axios from "axios";
import Menu from "./custom-components/Menu";
import { posts } from "@/data";
import { trendingPosts } from "@/data";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setUser } from "@/redux/userRedux";

export default function Home() {
  const dispatch = useDispatch()
  const router = useRouter()
  const searchParams = useSearchParams()
  const user = useSelector((state: RootState) => state.user.currentUser)
  const googleAuth = searchParams.get('googleAuth')
  const logout = searchParams.get('logout')
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


  return (  
    <div className=" px-2 md:px-8 2xl:px-32 mt-16">
      <Menu />
      <div className=" mt-10 flex gap-2">
        <div className="flex flex-col lg:flex-row md:gap-2">

          <div className="flex w-full lg:w-9/12 flex-col  md:flex-row md:gap-2 ">
            {/* 1st col */}
            <div className="flex flex-col md:flex-wrap h-auto  w-full md:w-8/12  ">
              <div className=" h-auto md:h-110 flex flex-col space-y-2" >
                <img src={posts[0].thumbnail}  className="w-full  rounded-lg" alt="" />
                <h1 className="text-xl font-bold block lg:hidden hover:cursor-pointer hover:text-blue-500 transition ">{posts[0].title.split(/\s+/).slice(0, 20).join(' ')}</h1>
                <h1 className="text-xl font-bold hidden lg:block hover:cursor-pointer hover:text-blue-500 transition">{posts[0].title.split(/\s+/).slice(0, 34).join(' ')}</h1>
                <p className="text-sm ">{posts[0].author}</p>
              </div>
              <div  className="flex h-auto md:h-80 space-x-4 lg:space-x-2 mt-4">
                <div className=" w-1/2  space-y-2 " >
                  <img src={posts[1].thumbnail} className="w-full h-1/2 md:h-3/5 object-cover rounded-lg" alt="" />
                  <h1 className="font-semibold text-medium block lg:hidden hover:cursor-pointer hover:text-blue-500 transition" >{posts[1].title.split(/\s+/).slice(0, 15).join(' ')}...</h1>
                  <h1 className="font-semibold text-medium hidden lg:block hover:cursor-pointer hover:text-blue-500 transition">{posts[1].title.split(/\s+/).slice(0, 25).join(' ')}</h1>
                  <p className="text-sm">{posts[1].author}</p>
                </div>
                <div className=" w-1/2  space-y-2" >
                  <img src={posts[2].thumbnail} className="w-full h-1/2  md:h-3/5 object-cover rounded-lg" alt="" />
                  <h1 className="font-semibold block lg:hidden hover:cursor-pointer hover:text-blue-500 transition" >{posts[2].title.split(/\s+/).slice(0, 15).join(' ')}...</h1>
                  <h1 className="font-semibold hidden lg:block hover:cursor-pointer hover:text-blue-500 transition" >{posts[2].title.split(/\s+/).slice(0, 25).join(' ')}</h1>
                  <p className="text-sm">{posts[2].author}</p>
                </div>
              </div>
            </div>
            {/* 2nd col */}
            <div className="flex h-auto w-full  md:flex-col md:w-4/12  gap-4">
              <div className="h-auto md:h-110  space-y-2 w-1/2 md:w-full mt-4 md:mt-0">
                  <img src={posts[3].thumbnail} className="w-full h-1/2 md:h-2/5 object-cover rounded-lg" alt="" />
                  <h1 className="font-semibold block lg:hidden hover:cursor-pointer hover:text-blue-500 transition" >{posts[3].title.split(/\s+/).slice(0, 15).join(' ')}...</h1>
                  <h1 className="font-semibold hidden lg:block hover:cursor-pointer hover:text-blue-500 transition" >{posts[3].title.split(/\s+/).slice(0, 25).join(' ')}</h1>

                  <p className="text-sm">{posts[3].author}</p>
                  <p className="hidden md:block" >{posts[3].content.split(/\s+/).slice(0, 34).join(' ')}...</p> 
              </div>
              <div className="h-auto md:h-80  space-y-2 mt-4 md:mt-0 w-1/2 md:w-full " >
                  <img src={posts[4].thumbnail} className="w-full h-1/2 md:h-3/5 object-cover rounded-lg" alt="" />
                  <h1 className="font-semibold block lg:hidden hover:cursor-pointer hover:text-blue-500 transition" >{posts[4].title.split(/\s+/).slice(0, 16).join(' ')}</h1>
                  <h1 className="font-semibold hidden lg:block hover:cursor-pointer hover:text-blue-500 transition" >{posts[4].title.split(/\s+/).slice(0, 25).join(' ')}</h1>
                  <p className="text-sm ">{posts[4].author}</p>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-3/12 flex flex-col ">
            {/* trending col */}
            <div className="flex flex-col">
              <div className="flex justify-between p-2">
                <div className="text-2xl font-bold " >Trending</div>
                <div className="text-blue-500 hover:cursor-pointer hover:text-blue-700 transition" >Xem tất cả</div>
              </div>
              {
                trendingPosts.map((post, index)=>(
                  <div className="flex gap-1  p-2" key={index}>
                    <div className="w-3/5 sm:w-4/5 lg:w-3/5" > 
                      <h1 className="font-semibold  block lg:hidden hover:cursor-pointer hover:text-blue-500 transition" >{post?.title.split(/\s+/).slice(0, 40).join(' ')}</h1>
                      <h1 className="font-semibold  hidden lg:block hover:cursor-pointer hover:text-blue-500 transition" >{post?.title.split(/\s+/).slice(0, 12).join(' ')}...</h1>
                    </div>
                    <div className="w-2/5 sm:w-1/5 lg:w-2/5  h-20  ">
                      <img src={post?.thumbnail} className="object-cover h-full w-full rounded-md" alt="" />
                    </div>
                  </div>
                ))
              }
            </div>

          </div>

        </div> 
      </div>

      <div className="w-full lg:w-9/12  ">
          {
            posts.slice(5).map((post, index)=>(
                <div key={index} className="flex gap-2 mt-0 p-2 hover:cursor-pointer">
                    <div className="w-1/4 h-4" >
                      <img src={post.thumbnail} className="object-cover h-36 w-64 rounded-lg " alt="" />
                    </div>
                    <div className="w-3/4 flex flex-col space-y-2" >
                      <h1 className="font-bold  hover:text-blue-500  transition" >{post.title}</h1>
                      <p>{post.content.split(/\s+/).slice(0, 50).join(' ')}...</p>
                      <div className="flex  items-center gap-2 ">
                        <img src="/user.png" className="w-8 h-8 " alt="" />
                        <p className=" hover:text-blue-500 transition">{post.author}</p>
                      </div>
                    </div>
                </div>
            ))
          }
      </div>
      {/* Xem thêm button */}
      <div className="flex justify-center items-center mb-10 bg-gray-200 p-4 rounded-xl text-xl font-bold transition hover:bg-gray-300 hover:cursor-pointer mt-4">
          Xem thêm ...
      </div>
    </div>

  );
}
