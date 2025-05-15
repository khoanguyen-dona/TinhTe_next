'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import { Loader } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import ReactTimeAgoUtil from '@/utils/ReactTimeAgoUtil'
import moment from 'moment'
import toast from 'react-hot-toast'
import { publicRequest, userRequest } from '@/requestMethod'
import { RootState } from '@/redux/store'
import { useSelector } from 'react-redux'
import { Post } from '@/dataTypes'
import Image from 'next/image'
import { SquarePen } from 'lucide-react'
import { X } from 'lucide-react'
import { Check } from 'lucide-react'
import { Trash2 } from 'lucide-react'
import { ChevronLeft } from 'lucide-react'
import { ChevronRight } from 'lucide-react'
const page = () => {
    const user = useSelector((state: RootState)=>state.user.currentUser)
    const [loading, setLoading] = useState<boolean>()
    const [posts, setPosts] = useState<Post>()
    const [reload, setReload] = useState<boolean>(false)
    const [page, setPage] = useState<number>(1)
    const [totalPage, setTotalPage] = useState<number>()
    const limit:number = 10
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

    const handleDeletePost = async (postId: string) => {
        try{
          setLoading(true)
          const res = await userRequest.delete(`/post/${postId}`)
          if(res.status===200){
            toast.success('Xóa thành công')
            setReload(!reload)
          }
        } catch(err){
          toast.error('Lỗi')
        } finally {
          setLoading(false)
        }
    }
    const handlePrev = () => {
      setPage((prev)=>prev-1)
    }

    const handleNext = () => {
      setPage((prev)=>prev+1)
    }
  return (
    <>
    {loading && 
    <div className='fixed top-0 z-20  w-screen h-screen bg-white opacity-50' >
        <div className='absolute inset-0 flex items-center justify-center'>
            <Loader className=' animate-spin w-14 h-14   '/>
        </div>
    </div>
    }

    <div className=' px-2 md:px-8  mt-30 mb-30 h-auto flex flex-col justify-center items-center '>
      
      <div className='text-center font-bold text-2xl mb-10'>Bài đăng của tôi</div>
      <Table className='border-1 border-gray-200 '>
        <TableHeader>
          <TableRow className='border-gray-200' >       
            <TableHead className='text-blue-500 font-bold w-auto'>Ảnh</TableHead>
            <TableHead className="text-blue-500 font-bold w-20">Tiêu đề</TableHead>
            <TableHead className='text-blue-500 font-bold'>Danh mục</TableHead>
            <TableHead className="text-blue-500 font-bold">lượt xem</TableHead>
            <TableHead className="text-blue-500 font-bold">Phê duyệt</TableHead>
            <TableHead className="text-blue-500 font-bold">Đăng bài</TableHead>
            <TableHead className="text-blue-500 font-bold">Chỉnh sửa</TableHead>
            <TableHead className="text-blue-500 font-bold">Ngày tạo</TableHead>
            <TableHead className="text-blue-500 font-bold">Ngày cập nhật</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className=''>
          {/* @ts-ignore */}
          {posts?.map((post: Post) => (
            <TableRow className='border-gray-200 ' key={post._id}>

              <TableCell className='w-auto'>
                <Image alt='thumbnail' width={100} height={100} src={post?.thumbnail} className='w-30 h-20 object-cover rounded-lg' />
              </TableCell> 
              <div className='w-80 flex justify-start items-center p-2 font-semibold'>
                {post?.title}        
              </div> 
          
              <TableCell>{post.category}</TableCell>
              <TableCell className="">{post.view}</TableCell>
              <TableCell className="">
                {post.isApproved===false?
                <X className='w-10 h-10 text-red-500 p-1 bg-red-100 rounded-lg'/>:<Check className='text-green-500 bg-green-100 p-1 rounded-lg w-10 h-10' />}

              </TableCell>
              <TableCell className="">
              {post.isPosted===false?
                <X className='w-10 h-10 text-red-500 p-1 bg-red-100 rounded-lg'/>:<Check className='text-green-500 bg-green-100 p-1 rounded-lg w-10 h-10' />}

              </TableCell>

              <TableCell className="">
                <div className='flex justify-start w-auto items-center gap-1'>
                  <div title='Chỉnh sửa'>
                    <SquarePen onClick={()=>{window.open(`/edit-post/${post._id}`,'_blank')}} className='w-10 h-10 p-1  rounded-lg hover:bg-blue-100 text-blue-500 transition hover:cursor-pointer'  />
                  </div>
                  <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Trash2 className='w-10 h-10 p-1 text-gray-600 hover:bg-gray-200 transition hover:cursor-pointer rounded-lg ' />
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Bạn có chắc chắn muốn xóa bài viết này?</AlertDialogTitle>  
                    </AlertDialogHeader>          
                    <div className='flex justify-center gap-2'>                 
                      <AlertDialogCancel className=''>No</AlertDialogCancel>
                      <AlertDialogAction onClick={()=>handleDeletePost(post._id)} className=''>Yes</AlertDialogAction>
                    </div>              
                  </AlertDialogContent>
                </AlertDialog>

                </div>  
              </TableCell>

              <TableCell className="  ">
                  {moment(post.createdAt).format('DD/MM/YY HH:mm:ss')}          
              </TableCell>

              <TableCell className=" ">        
                  {moment(post.updatedAt).format('DD/MM/YY HH:mm:ss')}           
              </TableCell>
            </TableRow>
          ))}
        </TableBody>    
      </Table>
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
          / {totalPage}
        </div>
        <button disabled={page===totalPage}>
          <ChevronRight onClick={handleNext} className={`w-10 h-10 ${page===totalPage?'opacity-20':'hover:bg-blue-100 hover:text-blue-500 rounded-lg hover:cursor-pointer'}`}/>
        </button>
      </div>

    </div>
    </>
  )
}

export default page