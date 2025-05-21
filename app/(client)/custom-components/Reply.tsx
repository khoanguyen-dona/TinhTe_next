'use client'
import { CommentType } from '@/dataTypes'
import ReactTimeAgoUtil from '@/utils/ReactTimeAgoUtil'
import { Flag, Loader } from 'lucide-react'
import React, { useState } from 'react'
import Image from 'next/image'
import CommentBox from './CommentBox'
import { User } from '@/dataTypes'
import Fancybox from './Fancybox'
import { userRequest } from '@/requestMethod'
import toast from 'react-hot-toast'

type Props = {
    replyData: CommentType,
    user: User,
    postId: string,
    setLoading: (value: boolean) => void,
    reportComments: string[],
    setReportComments: (value: string[]) => void
}

const Reply = ({replyData, user, postId, setLoading, reportComments, setReportComments }:Props) => {
    
    const [showEmoji, setShowEmoji] = useState<boolean>(false);
    const [openCommentBox, setOpenCommentBox] = useState<boolean>(false)
    const [loading2, setLoading2] = useState<boolean>(false)



    const handleReportComment = async () => {
        
        try {
            setLoading2(true)
            const res = await userRequest.post(`/report-comment`,{
                commentId: replyData._id ,
                postId: postId , 
                userId: user._id,
            })
            if(res.data){
                setLoading2(false)
                if(res.data.unReport===true){       
                    const reports = reportComments.filter(id=>id!==replyData._id)
                    setReportComments(reports)
                }
                if(res.data.unReport===false){                    
                    reportComments.push(replyData._id)
                }
            }
        } catch(err){
            toast.error('Lỗi')
        }
    }   

  return (
    <>
    {/* <div className='flex gap-2  py-2 ml-12 border-l-2 pl-2  '> */}
    <div className='flex   py-2  pl-2  '>

            { replyData.userId.img ?
            <div className=' h-10 w-[50px]'>
                <Image width={30} height={30} className="w-10 h-10 object-cover rounded-full" src={replyData.userId.img  } alt="" />
            </div>
                :
                <Image width={30} height={30} className="w-10 h-10 object-cover rounded-full" src='/user.png' alt="" />
            }

            <div className='w-full'>
                <div className=' flex flex-col  p-4 bg-gray-100  rounded-lg'>
                    <div className='flex gap-5'>
                        <div className='text-blue-500 font-bold'>{replyData.userId.username }</div>
                        <div><ReactTimeAgoUtil date={replyData.createdAt} locale="vi-VN"/></div>
                    </div>
                    <div className='mt-3 flex gap-2'>
                        <div className='text-blue-500'>
                            @ {replyData.refCommentUserId.username}
                        </div>
                        {replyData.content } 
                    </div>

                    {/* display comment imgGallery with fancybox library */}                 
                    {replyData.imgGallery && replyData.imgGallery.length > 0  &&
                    <Fancybox
                        options={{
                        Carousel: {
                            infinite: false,
                        },
                        }}
                    >
                        <div className='flex gap-2 mt-2'>
                        {
                        replyData.imgGallery?.map((img,index)=>(
                            <a key={index} data-fancybox="gallery" href={img}>
                            <Image
                                className='rounded-lg object-cover w-28 h-28'
                                alt="image"
                                src={img}
                                width={100}
                                height={100}
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
                            className={`hover:text-red-500 hover:cursor-pointer ${reportComments?.includes(replyData._id)?'text-red-500':''} `} 
                            title='báo vi phạm'
                        >
                            <Flag />
                        </div>
                    }
                </div>
            </div>
    </div>
    
    {openCommentBox &&
        <div className='ml-16 mt-4'  >
            <CommentBox  user={user} postId={postId} type={'comment'} refCommentIdTypeThread={replyData.refCommentIdTypeThread} 
            refCommentUsername={replyData.userId.username}  closeBoxAfterComment={true} 
            refCommentUserId={replyData.userId._id} isReplied={false} setLoading={setLoading}/>
        </div>
    }


    </>
  )
}

export default Reply