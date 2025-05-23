'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import { Loader } from 'lucide-react'
import { DataTable } from '@/app/(client)/custom-components/table/data-table'
// import { columns } from '@/app/(admin)/admin/posts/columns'
import toast from 'react-hot-toast'
import { publicRequest, userRequest } from '@/requestMethod'
import { RootState } from '@/redux/store'
import { useSelector } from 'react-redux'
import { Post } from '@/dataTypes'
import { ChevronLeft } from 'lucide-react'
import { ChevronRight } from 'lucide-react'
import { PostsTable } from '../../custom-components/table/posts-table'
const page = () => {
    const user = useSelector((state: RootState)=>state.user.currentUser)
    const [loading, setLoading] = useState<boolean>()
    const [posts, setPosts] = useState<Post[]>()
    const [reload, setReload] = useState<boolean>(false)
    const [page, setPage] = useState<number>(1)
    const [totalPage, setTotalPage] = useState<number>()
    const limit:number = 10
    console.log(posts)
    console.log('date',new Date())
    //fetch post by userId
    useEffect(()=>{ 
      const getPosts = async () =>{
        setLoading(true)
        try {
          const res = await publicRequest.get(`/post?userId=${user?._id}&page=${page}&limit=${limit}`)
          if(res.data){
            console.log('data',res.data)
            setPosts(res.data.posts)
            setTotalPage(res.data.totalPage)
          }
        } catch(err){ 
          console.log('loading post failed', err)
        } finally {
          setLoading(false)
        }
      }
      getPosts()
    },[reload, page])

  
    const handlePrev = () => {
      setPage((prev)=>prev-1)
    }

    const handleNext = () => {
      setPage((prev)=>prev+1)
    }

    const handleDeletePost = async (postId: string) => {
      try{
        setLoading(true)
        const res = await userRequest.delete(`/post/${postId}`)
        if(res.status===200){
          setReload(!reload)
          toast.success('Xóa thành công')
        }
      } catch(err){
        toast.error('Lỗi')
      } finally {
        setLoading(false)
      }
  }

  const handleApprove =() =>{

  }

  return (
    <div className='flex justify-center '>
    {loading && 
    <div className='fixed top-0 z-20  w-screen h-screen bg-white opacity-50' >
        <div className='absolute inset-0 flex items-center justify-center'>
            <Loader className=' animate-spin w-14 h-14   '/>
        </div>
    </div>
    }

    <div className=' px-2 md:px-8 w-full  mt-30 mb-30 h-auto flex flex-col justify-center items-center '>
      
      <div className='text-center font-bold text-2xl mb-10'>Bài đăng của tôi</div>
      <div>
        
          {posts!==undefined &&    
              <PostsTable data={posts} onDelete={handleDeletePost} handleApprove={handleApprove} />
          }
      </div>

      {/* pagination */}
      <div className='flex justify-center items-center gap-10 mt-10'>
        <button disabled={page===1}>
          <ChevronLeft  onClick={handlePrev} className={`w-10 h-10  ${page===1?'opacity-20':'hover:cursor-pointer hover:text-blue-500 hover:bg-blue-100 rounded-lg'} `}/>
        </button>
        <div className='text-xl justify-center items-center flex gap-2'>
          <select value={page} onChange={(e)=>setPage(parseInt(e.target.value))} className='border-1 border-gray-300 p-1 rounded-lg' id="">
            {/* @ts-ignore */}
            {Array.from({length: totalPage}, (_, i)=>(
              <option key={i} value={i+1}>{i+1}</option>
            ))
            }
          </select>
        </div>
        <button disabled={page===totalPage}>
          <ChevronRight onClick={handleNext} className={`w-10 h-10 ${page===totalPage?'opacity-20':'hover:bg-blue-100 hover:text-blue-500 rounded-lg hover:cursor-pointer'}`}/>
        </button>
      </div>

    </div>
    </div>
  )
}

export default page