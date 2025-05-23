'use client'
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Separator } from '@/components/ui/separator'
import PostItem from '../custom-components/PostItem'
import { publicRequest } from '@/requestMethod'
import { Post } from '@/dataTypes'
import { ChevronLeft, ChevronRight, Loader } from 'lucide-react'


const page = () => {
    const {category} = useParams()
    const [page, setPage] = useState<number>(1)
    const limit = 10
    const [posts, setPosts] = useState<Post[]>()
    const [totalPage, setTotalPage] = useState<number>()
    const [loading, setLoading] = useState<boolean>(false)
    // fetch all post base on category,limit,page
    useEffect(()=>{
        const getPosts = async () =>{
            try {
                setLoading(true)
                const res = await publicRequest(`/post?page=${page}&limit=${limit}&category=${category}`)
                if(res.data){
                    setPosts(res.data.posts)
                    setTotalPage(res.data.totalPage)
                }
            } catch(err){
                console.log('err fetching data',err)
            } finally {
                setLoading(false)
            }
        }
        getPosts()
    }, [page])

    const handleNext = () =>{
        setPage(prev=>prev+1)
    }
    console.log('pa',page)

  return (
    <div className='flex justify-center'>
    {loading && 
        <div className='fixed top-0 z-20  w-screen h-screen bg-white opacity-50' >
            <div className='absolute inset-0 flex items-center justify-center'>
            {/* <div className=' absolute flex items-center justify-center'> */}
                <Loader className=' animate-spin w-14 h-14   '/>
            </div>
        </div>
    }

    <div className='p-4 mt-24 h-auto w-full  flex flex-col '>
        <div className='font-bold text-2xl first-letter:uppercase'>
            {category}
        </div>
        {/*  */}
        <div className='flex bg-orange-300 p-1 rounded-md mt-10'>
            <div className='w-7/10'>Tiêu đề</div>
            <div className='w-1/10 '>Bình luận</div>
            <div className='w-1/10 '>Xem</div>
            <div className='w-1/10 '>Bình luận cuối</div>
        </div>
        {/* post item */}
        {posts?.map((post:Post,index)=>      
            <PostItem key={index} post={post} />
        )}
        {/* paginate */}
        <div className='flex justify-center items-center gap-5 mt-10 '>

            <button disabled={page===1?true:false}>
                <ChevronLeft                   
                    onClick={()=>setPage(prev=>prev-1)} 
                    className={`w-10 h-10 p-2 rounded-lg  ${page===1?'opacity-20':'hover:bg-blue-100 hover:cursor-pointer'} `}
                />
            </button>

            <select value={page} onChange={(e)=>setPage(parseInt(e.target.value))} className='border-1 border-gray-300 p-1 rounded-lg' id="">       
            {Array.from({length: totalPage as number}, (_, i)=>(
              <option key={i} value={i+1}>{i+1}</option>
            ))
            }
            </select>

            <button disabled={page===totalPage?true:false}>
                <ChevronRight 
                    onClick={handleNext}   
                    className={`w-10 h-10 p-2 rounded-lg  ${page===totalPage?'opacity-20':'hover:bg-blue-100 hover:cursor-pointer'} `}
                />
            </button>
        </div>
    </div>

    </div>
  )
}

export default page