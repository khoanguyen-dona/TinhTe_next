'use client'
import React from 'react'
import { useEffect, useState } from 'react';
import { useSidebar } from '@/components/ui/sidebar';
import { Post } from '@/dataTypes';
import { publicRequest, userRequest } from '@/requestMethod';
import { ChevronLeft } from 'lucide-react';
import { ChevronRight } from 'lucide-react';
import { Loader } from 'lucide-react';
import { RootState } from '@/redux/store';
import {  useSelector } from 'react-redux';
import { PostsTable } from '@/app/(client)/custom-components/table/posts-table';
import toast from 'react-hot-toast';

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


const page = () => {
    const user = useSelector((state: RootState)=>state.user.currentUser)
    console.log(user)
    const {state} = useSidebar()
    const [posts, setPosts] = useState<Post[]|undefined>(undefined)
    const [page, setPage] = useState<number>(1)
    const [limit, setLimit] = useState<number>(10)
    const [loading, setLoading] = useState<boolean>(false)
    const [totalPage, setTotalPage] = useState<number>()
    const [reload, setReload] = useState<boolean>(false)
    useEffect(()=>{
        const getPosts = async ()=>{
            setLoading(true)
            const res = await publicRequest.get(`/post?page=${page}&limit=${limit}&isPosted=&isApproved=`)
            if (res.data){
                setPosts(res.data.posts)
                setTotalPage(res.data.totalPage)
                setLoading(false)
            }
        }
        getPosts()
    },[page, limit, reload])

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

    const handleApprove = async (postId: string, value: boolean) => {
        try{
          setLoading(true)
          const res = await userRequest.put(`/post/${postId}`,{
            isApproved: value
          })
          if(res.status===200){
            setReload(!reload)
            toast.success('Cập nhật thành công')
          }
        } catch(err){
          toast.error('Lỗi dây')
        } finally {
          setLoading(false)
        }
    }

    const handlePageLimit = async (number: number) =>{
      setLimit((number))
      setPage(1)
    } 

console.log('limit',limit)

    return (
        
        <div className='flex justify-center p-2 md:px-8  w-screen'> 
        
            {loading && 
          
                <div className={` fixed top-0  z-20 w-full h-full bg-white opacity-50 `} >
                    <div className='absolute inset-0 flex items-center justify-center'>
                        <Loader className=' animate-spin w-14 h-14   '/>
                    </div>
                </div>
               
            }

            <div className='w-full  h-auto  flex flex-col justify-center   space-y-10 mt-10' >
      

                    <div className='font-bold text-2xl text-center'>
                        Posts  
                    </div>

                    <div className='w-full' >
                        {posts!==undefined &&    
                            <PostsTable  data={posts} onDelete={handleDeletePost} handleApprove={handleApprove} />
                        }
                    </div>

                    <div className=' flex justify-end '>
                      <div className='flex items-center gap-2'>
                          <div>Page limit: </div>
                        
                          <Select onValueChange={(value)=>handlePageLimit(Number(value))} defaultValue={'10'} >
                            <SelectTrigger className="w-auto">
                              <SelectValue placeholder={limit}   />
                            </SelectTrigger>
                            <SelectContent >
                              <SelectItem value="10">10</SelectItem>
                              <SelectItem value='20'>20</SelectItem>
                              <SelectItem value="40">40</SelectItem>
                              <SelectItem value="50">50</SelectItem>
                              <SelectItem value="100">100</SelectItem>
                            </SelectContent>
                          </Select>

                      </div>                       
                    </div>

                    <div className='flex justify-center items-center gap-4 '>
                        <button disabled={page===1} >
                            <ChevronLeft  onClick={()=>setPage(prev=>prev-1)} className={`p-1 w-10 h-10  rounded-lg ${page===1?'opacity-20':'hover:text-blue-500 hover:cursor-pointer transition hover:bg-blue-100'}  `} />
                        </button>

                        {/* @ts-ignore */}
                        <Select onValueChange={(value)=>setPage(Number(value))} value={page} >
                          <SelectTrigger className="w-auto">
                            <SelectValue placeholder={page} />
                          </SelectTrigger>
                          <SelectContent>
                            {Array?.from({length: totalPage as number}, (_, index)=>(
                              // @ts-ignore
                              <SelectItem key={index} value={index+1}>{index+1}</SelectItem>   
                              ) )
                            }
                          </SelectContent>
                        </Select>

                        <button disabled={page===totalPage}>

                            <ChevronRight onClick={()=>setPage(prev=>prev+1)} className={`p-1 w-10 h-10 rounded-lg ${page===totalPage?'opacity-20':'hover:text-blue-500 hover:cursor-pointer transition hover:bg-blue-100'}  `}/>
                        </button>

                    </div>

            </div>
        </div>
    )
}

export default page