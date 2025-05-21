'use client'

import { useState,useEffect } from 'react'
import React from 'react'
import JoditViewer from '@/app/(client)/custom-components/JoditViewer'
import Image from 'next/image'
import { Post } from '@/dataTypes'
import { publicRequest } from '@/requestMethod'
import { useParams } from 'next/navigation'
import moment from 'moment'
import { Separator } from "@/components/ui/separator"
import { Loader, MessageSquare } from 'lucide-react'
import { ThumbsUp } from 'lucide-react'
import { RootState } from '@/redux/store'
import { useSelector } from 'react-redux'
import { User } from '@/dataTypes'
import CommentBox from '@/app/(client)/custom-components/CommentBox'
import { CommentType } from '@/dataTypes'
import Comment from '@/app/(client)/custom-components/Comment'
import { ReportCommentType } from '@/dataTypes'


const page = () => {
    const user = useSelector((state: RootState)=>state.user.currentUser as User)
    const {postId, slug} = useParams()
    const now = new Date()
    const [post, setPost] = useState<Post>()
    const [loading, setLoading] = useState<boolean>(false)
    const [newestPosts, setNewestPosts] = useState<Post[]>()
    const [showEmoji, setShowEmoji] = useState<boolean>(false);
    const [comments, setComments] = useState<CommentType[]>([])
    const [page, setPage] = useState<number>(1)
    const [limit, setLimit] = useState<number>(4)
    const [hasNext, setHasNext] = useState<boolean>(false)
    const type='thread'
    const [reportComments, setReportComments] = useState<string[]>()
    //fech post data
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

    //fet comments type thread
    useEffect(()=>{
        const getComments = async() =>{
            try {
                setLoading(true)
                const res = await publicRequest.get(`/comment/${postId}?page=${page}&limit=${limit}&type=${type}`)
                if(res.data){
                    res.data.comments.map((comment:CommentType)=>(
                        comments.push(comment)
                    ))
                    setHasNext(res.data.hasNext)
                }
            } catch(err) {
                console.log('fetch comments failed',err)
            } finally {
                setLoading(false)
            }
        }
        getComments()
    }, [page])

    //fetch reportComments of user by postId and userId
    useEffect(()=>{
        const getData = async() =>{
            try {
                const res = await publicRequest.get(`/report-comment?postId=${postId}&userId=${user._id}`)
                let tempArray:string[] = []
                if(res.data){
                    res.data.reportComments.map((r: ReportCommentType)=>{
                        tempArray.push(r.commentId as string)
                    })
                }
                setReportComments(tempArray)
            } catch(err) {
                console.log('get reportComments failed',err)
            }
        }
        getData()
    }, [])

    setTimeout(()=>{
        publicRequest.get(`/post/${post?._id}/increase-view`)
    }, 20000)

  return (
    <>
    {loading && 
        <div className='fixed top-0 z-20  w-screen h-screen bg-white opacity-50' >
            <div className='absolute inset-0 flex items-center justify-center'>
                <Loader className=' animate-spin w-14 h-14   '/>
            </div>
        </div>
    }
    <div className=' h-auto  '>
        <div className=' flex flex-col lg:flex-row h-auto p-2 mt-24 rounded-lg '>

            {/* content of post col */}
            <div className='w-full lg:w-2/3 flex flex-col px-2 mt- h-auto'>  
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
                <JoditViewer data={post?.content}  />


                <div className='flex flex-col my-20 space-y-2 '>
                    <div className='flex gap-5'>
                        <div className='flex'>
                            <img src="/icon-like.svg" className='w-6 h-6' alt="" />
                            <p>10</p>
                        </div>
                        <p className='text-gray-500'> 8 bình luận</p>
                    </div>
                    <Separator />
                    <div className='flex justify-around'>
                        <div className='flex w-1/3 justify-center items-center gap-2 p-4 rounded-lg hover:bg-blue-100 transition hover:cursor-pointer'>                       
                            <div
                                className="relative inline-block"
                                onMouseEnter={() => setShowEmoji(true)}
                                onMouseLeave={() => setShowEmoji(false)}
                            >
                                {/* Trigger Element */}
                                <div className="flex gap-2">
                                    <ThumbsUp className='w-6 h-6'  />
                                    <p>Thích</p>
                                </div>

                                {/* Options shown on hover */}
                                {showEmoji && (
                                    <div className="absolute w-60 -top-14  bg-white border rounded-xl shadow-lg p-2 flex gap-2">
                                        <span>
                                            <img src="/icon-like.svg" className='w-10 h-10 hover:scale-130 transition' alt="" />
                                        </span>
                                        <span>
                                            <img src="/icon-love.svg" className='w-10 h-10 hover:scale-130 transition' alt="" />
                                        </span>
                                        <span>
                                            <img src="/icon-fun.svg" className='w-10 h-10 hover:scale-130 transition' alt="" />
                                        </span>
                                        <span>
                                            <img src="/icon-sad.svg" className='w-10 h-10 hover:scale-130 transition' alt="" />
                                        </span>
                                        <span>
                                            <img src="/icon-wow.svg" className='w-10 h-10 hover:scale-130 transition' alt="" />
                                        </span>
                                    </div>
                                )}

                            </div>
                        </div>
                        <div className='flex w-1/3 justify-center items-center gap-2 p-4 rounded-lg hover:bg-blue-100 transition hover:cursor-pointer'>
                            <MessageSquare className='w-6 h-6 opacity-70'/>
                            <p className='text-gray-500'>Bình luận</p>
                        </div>
                        <div className='flex w-1/3 justify-center  items-center gap-2 p-4 rounded-lg hover:bg-blue-100 transition hover:cursor-pointer'>
                            <img src="/share.png" className='w-6 h-6 opacity-70' alt="" />
                            <p className='text-gray-500' >Chia sẽ</p>
                        </div>
                    </div>
                </div>

                {/* comment box */}
                <div className=''>
                    <CommentBox user={user} postId={postId as string} type={'thread'} refCommentIdTypeThread={null} closeBoxAfterComment={false} 
                                refCommentUserId={null} refCommentUsername={null} isReplied={false} setLoading={setLoading} />
                </div>
   
                {/* comment list */}
                <div>
                    {comments?.map((comment, index)=>(
                        // @ts-ignore
                        <Comment comment={comment } key={index} user={user} postId={postId} setLoading={setLoading} reportComments={reportComments} 
                            setReportComments={setReportComments} />
                    ))
                    }
                </div>

                {hasNext ?
                    <div 
                        onClick={()=>setPage(prev=>prev+1)}
                        className='w-full flex font-bold rounded-lg mt-10 hover:cursor-pointer transition hover:text-blue-500 justify-center items-center p-4
                        bg-gray-100 hover:bg-blue-100'>
                        Xem thêm bình luận
                    </div>
                    : 
                    ''
                }
               
            </div>


            {/* new post col */}
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

    
    </>
  )
}

export default page