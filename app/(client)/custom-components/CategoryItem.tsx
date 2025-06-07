'use client'
import { Separator } from '@/components/ui/separator'
import { publicRequest } from '@/requestMethod'
import React, { useEffect, useState } from 'react'
import { Post } from '@/dataTypes'
type Props = {
    category: {
        title: string,
        value: string
    }
}
import  ReactTimeAgoUtil from '@/utils/ReactTimeAgoUtil'
import Link from 'next/link'

const CategoryItem = ({category}:Props) => {

    const [postNumber, setPostNumber] = useState<number>()
    const [commentNumber, setCommentNumber] = useState<number>()
    const [latestPost, setLatestPost] = useState<Post>()

    // get post number
    useEffect(()=>{
        const getThreadNumber = async () => {
            try {
                const res = await publicRequest.get(`/post/post-number/${category.value}`)
                if(res.data){
                    setPostNumber(res.data.totalPosts)
                }
            } catch(err){
                console.log('fetch thread number failed',err)
            }
        }
        getThreadNumber()
    }, [])
    // get comment number

    // get latest post
    useEffect(()=>{
        const getLatestPost = async () => {
            try {
                const res = await publicRequest.get(`/post/latest-post/${category.value}`)
                if(res.data){
                    setLatestPost(res.data.latestPost[0])
                }
            } catch(err){
                console.log('fetch thread number failed',err)
            }
        }
        getLatestPost()
    }, [])

  return (
    <>
        <div  className='flex mt-5 items-center hover:cursor-pointer  '>
                <div className='w-12'>
                    <img src='/chat.png' className='w-8 h-8 text-blue-500' />
                </div>
                <div className='flex justify-center items-center  w-full'>       
                    <div className='flex flex-col w-2/6 md:w-1/2'>
                        <Link href={`/${category.value}`} className='font-bold hover:text-blue-500'>{category.title}</Link>
                        <div className='flex '>
                            <div className='flex gap-1'>
                                <p className='text-gray-400'>Chủ đề:</p>
                                <p>{postNumber}</p>
                            </div>
                            {/* <div className='flex gap-2'>
                                <p className='text-gray-400'>Bình luận:</p>
                                <p>123452</p>
                            </div> */}
                        </div>
                    </div>
                    <div className='w-4/6 md:w-1/2  bg-blue-50 md:flex flex-col rounded-lg px-4 py-1'>
                        <div className='flex gap-2'>
                            <p>Mới nhất:</p>
                            <Link  href={`/post/${latestPost?.title.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/(^-|-$)/g, '') as string}/${latestPost?._id}`}>
                                <p className='text-blue-500'  >{latestPost?.title.slice(0,50)}...</p>
                            </Link>                       
                        </div>
                        <div className='flex gap-2'>
                            <p title='tác giả' className='text-blue-500'>{latestPost?.authorId?.username as string}</p>
                            <p className='text-gray-500'>
                                { latestPost?.createdAt &&
                                    <ReactTimeAgoUtil date={latestPost?.createdAt as Date} locale='vi-VN'/>
                                }

                            </p>
                        </div>
                    </div>                  
                </div>
        </div>
        <Separator className='mt-2' />
    </>
  )
}

export default CategoryItem