'use client'

import { useState,useEffect } from 'react'
import React from 'react'
import JoditViewer from '@/app/(client)/custom-components/JoditViewer'
import Image from 'next/image'
import { Post } from '@/dataTypes'
import { publicRequest } from '@/requestMethod'
import { useParams } from 'next/navigation'
import moment from 'moment'



const page = () => {
    const {postId, slug} = useParams()
    const now = new Date()
    const date = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()} ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
    const [post, setPost] = useState<Post>()
    const [loading, setLoading] = useState<boolean>(false)
    const [newestPosts, setNewestPosts] = useState<Post[]>()

    useEffect(()=>{
        const getPost = async() =>{
            try{
                setLoading(true)
                const res = await publicRequest.get(`/post/${postId}`)
                if(res.data){
                    setPost(res.data.post)
                }
            } catch(err){
                console.log('fetch data failed',err)
            } finally {
                setLoading(false)
            }
        }
        getPost()
    }, [])

    //fetch newestPost 
    useEffect(()=>{
        const getData = async()=>{
            try{
                setLoading(true)
                const res = await publicRequest.get(`/post?page=1&limit=5&isApproved=&isPosted=`)
                if(res.data){
                    setNewestPosts(res.data.posts)
                }
            } catch(err){
                console.log('fetch newest posts failed',err)
            } finally {
                setLoading(false)
            }
        }
        getData()
    },[])

    setTimeout(()=>{
        publicRequest.get(`/post/${post?._id}/increase-view`)
    }, 20000)

  return (
    <div className=' h-auto  '>
        <div className=' flex flex-col lg:flex-row h-auto p-2 mt-24 rounded-lg '>

            <div className='w-full lg:w-2/3 flex flex-col px-2 mt-20'>  
                <div className='text-2xl md:text-3xl font-bold  '>{post?.title}</div>
                <div className='flex gap-2 mt-10 '>
                    {
                        post?.authorId.img  ?
                        <Image width={20} height={20} src={post?.authorId.img as string} className='w-12 h-12 rounded-full ' alt="" />
                        : <img src='/user.png' className='w-12 h-12 rounded-full ' alt="" />
                    }
                    <div className='flex flex-col'>
                        <div className='text-blue-500 font-bold'>{post?.authorId.username}</div>
                        <div className='font-mono'>{moment(post?.createdAt).format('DD/MM/YYYY HH:mm:ss')}</div>
                    </div>
                </div>
                <div className=''>
                    <Image width={600} height={600} src={post?.thumbnail as string} className='w-full object-cover h-60 sm:h-100 md:h-130 mt-4 rounded-xl ' alt="" />
                </div>
                <JoditViewer data={post?.content} />
            </div>
            <div className='w-full lg:w-1/3 flex flex-col  mt-4 lg:mt-20 p-2 space-y-4'>
                <p className='text-2xl  '>Bài mới</p>
                {
                newestPosts?.map((post:Post)=>(
                    <div className='flex gap-2 '>
                        <a href={`/post/${post.title.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/(^-|-$)/g, '')}/${post._id}`} className='w-2/5  hover:cursor-pointer'>
                            <Image width={150} height={100} src={post.thumbnail} className='object-cover w-full h-24 sm:h-36 md:h-48 lg:h-24  rounded-lg' alt='' />
                        </a>
                        <div className='w-3/5 flex flex-col space-y-2 '> 
                            <a href={`/post/${post.title.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/(^-|-$)/g, '')}/${post._id}`} className='font-bold hover:text-blue-500 hover:cursor-pointer hidden md:block'>{post.title}</a>
                            <a href={`/post/${post.title.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/(^-|-$)/g, '')}/${post._id}`} className='font-bold hover:text-blue-500 hover:cursor-pointer block md:hidden'>{post.title.slice(0,65)}...</a>
                            <p className='hidden md:block lg:hidden '>{post.shortDescription.slice(0,220)}...</p>
                            <div className=' lg:hidden flex  gap-2 justify-start items-center hover:text-blue-500 hover:cursor-pointer'>
                                <Image width={20} height={20} src={post.authorId.img} className='object-cover rounded-full w-6 h-6 md:w-8 md:h-8' alt='' />
                                <p className='text-sm md:text-medium'>{post.authorId.username}</p>
                            </div> 
                        </div> 
                    </div>
                ))
                }
            </div>
        </div>
     </div>
  )
}

export default page