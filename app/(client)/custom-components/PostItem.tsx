'use client'
import { Separator } from '@/components/ui/separator'
import { CommentType, Post } from '@/dataTypes'
import React, { useEffect, useState } from 'react'
import ReactTimeAgoUtil from '@/utils/ReactTimeAgoUtil'
import { publicRequest } from '@/requestMethod'
import Image from 'next/image'


type Props = {
    post: Post
}

const PostItem = ({post}:Props) => {

    const [commentCount, setCommentCount] = useState<number>()
    const [latestComment, setLatestComment] = useState<CommentType>()

    // find commentCount
    useEffect(()=>{
        const getCount = async() =>{
            try {
                const res = await publicRequest.get(`/comment/comment-count/${post._id}`)
                if(res.data){
                    setCommentCount(res.data.count)
                }
            } catch(err){
                console.log('fetch comment count failed',err)
            }
        }
        getCount()
    },[])

    //find latest comment
    useEffect(()=>{
        const getComment = async() =>{
            try {
                const res = await publicRequest.get(`/comment/latest-comment/${post._id}`)
                if(res.data){
                    setLatestComment(res.data.latestComment[0])
                }
            } catch(err){
                console.log('fetch comment count failed',err)
            }
        }
        getComment()
    },[])

    console.log('---lat com',latestComment)
  return (
    <>
    <div className='flex items-center p-2'>
            <div className='w-7/10 flex gap-2 items-center'>
                {post?.authorId.img ?
                <Image className='w-15 h-10 rounded-sm  object-cover' src={post?.thumbnail} width={50} height={30} alt='avatar'/>
                :
                <img src="/user.png" className='w-10 h-10 object-cover rounded-full' alt="" />
                }
                <div className='flex flex-col'>
                    <a className='font-bold hover:text-blue-500' href={`/post/${post?.title.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/(^-|-$)/g, '')}/${post._id} `}>
                        {post.title}
                    </a>
                    <div className='flex gap-2'>
                        <p className='text-blue-500'>
                            {post.authorId.username} 
                        </p>
                        <p className='text-gray-400'>
                            {post?.createdAt &&
                                <ReactTimeAgoUtil date={post.createdAt} locale='vi-VN' />
                            }
                        </p>

                    </div>
                </div>
            </div>
            {/* comment count */}
            <div className='w-1/10 p-2'>
                {commentCount}    
            </div>
            {/* views */}
            <div className='w-1/10 p-2'>
                {post.view}
            </div>
            {/* last comment */}
            <div className='w-1/10 flex flex-col '>
                <p className='font-bold'>{latestComment?.userId?.username}</p>
                {latestComment?.createdAt &&                   
                    <p className='text-gray-400'><ReactTimeAgoUtil date={latestComment?.createdAt} locale='vi-VN' /></p>
                 } 
            </div>
    </div>
    <Separator/>
    </>
  )
}

export default PostItem