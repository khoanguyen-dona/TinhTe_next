'use client'
import { CommentType, User } from '@/dataTypes';
import { Flag } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import ReactTimeAgoUtil from '@/utils/ReactTimeAgoUtil';
import Image from 'next/image';
import CommentBox from './CommentBox';
import Reply from './Reply';
import { ReplyIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { publicRequest, userRequest } from '@/requestMethod';
import { ChevronUp } from 'lucide-react';
import Fancybox from './Fancybox';
type Props = {
    comment: CommentType,
    user: User,
    postId: string,
    setLoading: (value:boolean) => void,
    reportComments: string[],
    setReportComments: (value: string[])=> void
}
import { Loader } from 'lucide-react';

const Comment = ({comment, user, postId, setLoading, reportComments, setReportComments}:Props) => {

    const [showEmoji, setShowEmoji] = useState<boolean>(false);
    const [openCommentBox, setOpenCommentBox] = useState<boolean>(false)
    const limit = 4
    const [page, setPage] = useState<number>(1)
    const [replies, setReplies] = useState<CommentType[]>([])
    const [hasNext, setHasNext] = useState<boolean>(false)
    const [showReplies, setShowReplies] = useState<boolean>(false)
    const [fetchedAll, setFetchedAll] = useState<boolean>(false)
    const [totalReplies, setTotalReplies]= useState<number>()
    const [loading2, setLoading2] = useState<boolean>(false)

    const fetchReply = async () => {
        if(fetchedAll){
            setShowReplies(true)
        } else {
            setShowReplies(true)
            try {
                setLoading(true)
                const res = await publicRequest.get(`comment/refCommentId/${comment._id}?limit=${limit}&page=${page}`)
                if(res.data){ 
                    res.data.comments.map((comment: CommentType)=>(
                        replies.push(comment)
                    ))
                    setHasNext(res.data.hasNext)
                    setTotalReplies(res.data.totalReplies)
                }
                setPage((prev)=>prev+1)
            } catch(err){
                toast.error('Lỗi')
            } finally {
                setLoading(false)
            }
        }
    }

    // fetch number of replies
    useEffect(()=>{
        const getTotalReplies = async () => {
            try {   
                const res = await publicRequest.get(`/comment/refCommentId/${comment._id}/replyNumber`)
                if(res.data){
                    setTotalReplies(res.data.totalReplies)
                }
            } catch(err){
                console.log('err fetch replies number',err)
            }finally{

            }
        }
        getTotalReplies()
    }, [])

    const handleCloseReplies = async () => {
        setShowReplies(false)
        setFetchedAll(true)
    }

    const handleReportComment = async () => {
        
        try {
            setLoading2(true)
            const res = await userRequest.post(`/report-comment`,{
                commentId: comment._id ,
                postId: postId , 
                userId: user._id,
            })
            if(res.data){
                setLoading2(false)
                if(res.data.unReport===true){       
                    const reports = reportComments.filter(id=>id!==comment._id)
                    setReportComments(reports)
                }
                if(res.data.unReport===false){                    
                    reportComments.push(comment._id)
                }
            }
        } catch(err){
            toast.error('Lỗi')
        }
    }

  return (
    <>
        <div className='flex gap-2 mt-6'>
            { comment.userId.img ?
                <Image width={30} height={30} className="w-10 h-10 object-cover rounded-full" src={comment.userId.img} alt="" />
                :
                <Image width={30} height={30} className="w-10 h-10 object-cover rounded-full" src='/user.png' alt="" />
            }

            <div className='w-full'>
                <div className=' flex flex-col  p-4 bg-gray-100  rounded-lg'>
                    <div className='flex gap-5'>
                        <div className='text-blue-500 font-bold'>{comment.userId.username }</div>
                        <div><ReactTimeAgoUtil date={comment.createdAt} locale="vi-VN"/></div>
                    </div>
                    <div className='mt-3'>
                        {comment.content} 
                    </div>

                    {/* display comment imgGallery with fancybox library */}                 
                    {comment.imgGallery && comment.imgGallery.length > 0  &&
                    <Fancybox
                        options={{
                        Carousel: {
                            infinite: false,
                        },
                        }}
                    >
                        <div className='flex gap-2 mt-2'>
                        {
                        comment.imgGallery?.map((img,index)=>(
                            <a key={index} data-fancybox="gallery" href={img}>
                            <Image
                                className='rounded-lg object-cover w-28 h-28'
                                alt="image"
                                src={img}
                                width={50}
                                height={50}
                            />
                            </a>
                        ))
                        }
                        </div>
                    </Fancybox>
                    }

                </div>
                <div className='flex gap-6 mt-2'>
                    <div className='flex justify-center items-center'>
                        <div
                            className="relative inline-block"
                            onMouseEnter={() => setShowEmoji(true)}
                            onMouseLeave={() => setShowEmoji(false)}
                        >
                            {/* Trigger Element */}
                            <div className="flex gap-2 hover:text-red-500 hover:cursor-pointer">
                                <p className=''>Thích</p>
                            </div>

                            {/* Options shown on hover */}
                            {showEmoji && (
                                <div className="absolute w-60 -top-14  bg-white border rounded-xl shadow-lg p-2 flex gap-2">
                                    <span>
                                        <img src="/icon-like.svg" className='w-10 h-10 hover:scale-130 transition hover:cursor-pointer' alt="" />
                                    </span>
                                    <span>
                                        <img src="/icon-love.svg" className='w-10 h-10 hover:scale-130 transition hover:cursor-pointer' alt="" />
                                    </span>
                                    <span>
                                        <img src="/icon-fun.svg" className='w-10 h-10 hover:scale-130 transition hover:cursor-pointer' alt="" />
                                    </span>
                                    <span>
                                        <img src="/icon-sad.svg" className='w-10 h-10 hover:scale-130 transition hover:cursor-pointer' alt="" />
                                    </span>
                                    <span>
                                        <img src="/icon-wow.svg" className='w-10 h-10 hover:scale-130 transition hover:cursor-pointer' alt="" />
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div  onClick={()=>setOpenCommentBox(!openCommentBox)} className='flex hover:text-red-500 hover:cursor-pointer'>
                        <p>Trả lời</p>
                    </div>
                    {loading2 ? <Loader className='animate-spin text-gray-500'/> :
                        <div onClick={handleReportComment} 
                            className={`hover:text-red-500 hover:cursor-pointer ${reportComments?.includes(comment._id)?'text-red-500':''} `} 
                            title='báo vi phạm'
                        >
                            <Flag />
                        </div>
                    }
                </div>

                {/* {comment.isReplied && */}
                {totalReplies!== undefined && totalReplies!==0 &&

                <div className='flex justify-start' onClick={fetchReply}>
                    <div className='flex  rounded-full px-3 py-1  items-center text-sm text-blue-500 hover:cursor-pointer ml-5 mt-2 hover:bg-blue-100'>
                        <ReplyIcon className='rotate-180' />
                        <div className='flex gap-1'>
                            <div>
                                {totalReplies}
                            </div>
                            phản hồi
                        </div>
                    </div>
                </div>
                }
            </div>
        </div>


        {openCommentBox &&
            <div className='ml-12 mt-6 border-l-2 pl-2 '  >
                <CommentBox  user={user} postId={postId} type={'comment'} refCommentIdTypeThread={comment._id} closeBoxAfterComment={true} 
                refCommentUserId={comment.userId._id} refCommentUsername={comment.userId.username} isReplied={false} setLoading={setLoading}/>
            </div>
        }

        {/* reply comments */}
        {showReplies &&
            <div className='border-l-2 ml-12'>
            {replies.length>0 && replies.map((reply,index)=>(
                <Reply replyData={reply} key={index} user={user} postId={postId} setLoading={setLoading} reportComments={reportComments} 
                        setReportComments={setReportComments} />
            ))}
            </div>
        }
        
        {hasNext &&
            <div className='flex justify-start' onClick={fetchReply}>
                <div className='text-sm px-3 py-1 rounded-full text-blue-500 ml-26 mt-2 hover:cursor-pointer hover:bg-blue-100'>
                    Xem thêm
                </div>
            </div>
        }
        {showReplies && !hasNext &&
            <div className='flex justart' onClick={handleCloseReplies} >
                <div className='text-sm px-3 py-1 rounded-full text-blue-500 ml-26 mt-2 hover:cursor-pointer hover:bg-blue-100 flex justify-center items-center'> 
                    Thu gọn
                    <ChevronUp />
                </div>
            </div>

        }

    </>
  )
}

export default Comment