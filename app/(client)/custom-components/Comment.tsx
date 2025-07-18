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


import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"


type Props = {
    commentIdTypeThread: string|null ,
    commentId: string|null // use to find specific commentId when click on notify button
    fetchAllReply: boolean, // if the commentId we find in reply we will set to true to fetch all reply
    comment: CommentType, // commentData
    user: User,
    postId: string,
    slug: string|null ,
    setLoading: (value:boolean) => void,
    reportComments: string[],
    setReportComments: (value: string[])=> void
}
import { Loader } from 'lucide-react';
import { EmotionType } from '@/dataTypes';
import { Separator } from '@/components/ui/separator';


type commentEmotionType = {
    commentId: string,
    userId: User,
    type: EmotionType
}

const Comment = ({commentIdTypeThread, commentId, fetchAllReply, comment, user, postId, slug, setLoading, reportComments, setReportComments}:Props) => {
    const [reload, setReload] = useState<boolean>(false)
    const EmotionArray = ['like','love','fun','sad','wow']
    const [showEmoji, setShowEmoji] = useState<boolean>(false);
    const [openCommentBox, setOpenCommentBox] = useState<boolean>(false)
    const [hasNext, setHasNext] = useState<boolean>(false)
    const [showReplies, setShowReplies] = useState<boolean>(false)
    const [fetchedAll, setFetchedAll] = useState<boolean>(false)
    const [loadingFlag, setLoadingFlag] = useState<boolean>(false)
    const [loadingEmotion, setLoadingEmotion] = useState<boolean>(false)
    const limit = 4
    const [page, setPage] = useState<number>(1)
    const [replies, setReplies] = useState<CommentType[]>([])
    const [totalReplies, setTotalReplies]= useState<number>()
    const [userEmotion, setUserEmotion] = useState<EmotionType>() //emotion that user have in this comment
    const [commentEmotions, setCommentEmotions] = useState<commentEmotionType[]>() // data of emotions in this comment
    const [emotionTypeOfComment, setEmotionTypeOfComment] = useState<EmotionType[]>() //type of emotions have in this comment eg..[like,love,fun]
    const [currentEmotion, setCurrentEmotion] = useState<EmotionType|'all'>() // current emotion user choose from
    const [currentCommentEmotions, setCurrentCommentEmotions] = useState<commentEmotionType[]>()  //current emotions data base on type of emotion

    const [likeCount, setLikeCount] = useState<number>()
    const [loveCount, setLoveCount] = useState<number>()
    const [funCount, setFunCount] = useState<number>()
    const [sadCount, setSadCount] = useState<number>()
    const [wowCount, setWowCount] = useState<number>()


    //fetch emotions of comment
    useEffect(()=>{
        const getData = async () =>{
            try {
                const res = await publicRequest.get(`/comment-emotion/${comment._id}`)
                if(res.data){
                    setCommentEmotions(res.data.emotion)
                    const tempArray:EmotionType[] = []
                    res.data.emotion.map((emotion:commentEmotionType)=>{
                        tempArray?.includes(emotion.type) ? '': tempArray.push(emotion.type)
                    })
                    setEmotionTypeOfComment(tempArray)
                    setCurrentCommentEmotions(res.data.emotion)
                }
            } catch(err){
                console.log('fetch commentEmotions failed',err)
            }
        }
        getData()
    },[reload])

    //fetch all reply
    useEffect(()=> {
        const getData = async () => {
            try{
                const res = await publicRequest.get(`/comment/refCommentId/${comment._id}?limit=999&page=1`)
                if(res.data){
                    setReplies(res.data.comments)
                    setShowReplies(true)
                    setFetchedAll(true)
                }
            }catch(err){
                console.log('fetch get all reply failed',err)
            }
        }
        if(fetchAllReply){
            getData()
        }
    },[fetchAllReply, commentIdTypeThread, commentId])


    // fetch replyData
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

    //fetch emotion of user 
    useEffect(()=>{
        const getEmotion = async () => {
            try {
                const res = await publicRequest.get(`/comment-emotion/${comment._id}?userId=${user._id}`)
                if(res.data.emotion.length>0){
                    setUserEmotion(res.data.emotion[0].type)
                } else{
                    setUserEmotion(undefined)
                }
            } catch(err){   
                console.log('fetch user emotion failed',err)
            }
        }
        getEmotion()
    }, [reload])
    console.log('user emo',userEmotion)

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
    }, [commentIdTypeThread])

    const handleCloseReplies = async () => {
        setShowReplies(false)
        setFetchedAll(true)
    }

    const handleReportComment = async () => {
        
        try {
            if ( user !== null ){
                setLoadingFlag(true)
                const res = await userRequest.post(`/report-comment`,{
                    commentId: comment._id ,
                    postId: postId , 
                    userId: user._id,
                })
                if(res.data){
                    setLoadingFlag(false)
                    if(res.data.unReport===true){       
                        const reports = reportComments.filter(id=>id!==comment._id)
                        setReportComments(reports)
                    }
                    if(res.data.unReport===false){                    
                        reportComments.push(comment._id)
                    }
                }
            } else {
                toast.error('Đăng nhập để báo cáo')
            }
        } catch(err){
            toast.error('Lỗi')
        }
    }

    const handleEmotion = async (emotionType: EmotionType) => {
        try {
            if(user!==null){
                setLoadingEmotion(true)
                const res = await userRequest.post(`/comment-emotion`,{
                    commentId: comment._id,
                    userId: user._id,
                    type: emotionType
                })
                if(res.status==200){
                    setReload(!reload)
                }
            } else {
                toast.error('Đăng nhập để tương tác')
            }
        } catch(err){
            toast.error('Lỗi')
            console.log('post emotion failed', err)
        } finally {
            setLoadingEmotion(false)
        }
    }
   
    const calculateCount = async () => {
        let tempLikeCount = 0
        let tempLoveCount = 0
        let tempFunCount = 0
        let tempSadCount = 0
        let tempWowCount = 0

        if(commentEmotions){   
            for(const c of commentEmotions ){
                c.type==='like'? tempLikeCount+=1 :
                c.type==='love'? tempLoveCount+=1 :
                c.type==='fun'? tempFunCount+=1 :
                c.type==='sad'? tempSadCount+=1 :
                c.type==='wow'? tempWowCount+=1 :''
            }
        }
        setLikeCount(tempLikeCount)
        setLoveCount(tempLoveCount)
        setFunCount(tempFunCount)
        setSadCount(tempSadCount)
        setWowCount(tempWowCount)
    }

    //fetch currentEmotions
    useEffect(()=>{
        const getEmotions = async () => {
        let tempArray:commentEmotionType[] = []

        try {
            if(currentEmotion==='all'){
            setCurrentCommentEmotions(commentEmotions)
            } else {    
            commentEmotions?.map((com:commentEmotionType)=>(
                com.type===currentEmotion? tempArray.push(com):''
            ))
            setCurrentCommentEmotions(tempArray)
            }
        } catch(err){
            console.log('err while fetching current emotions',err)
        } 
        }
        getEmotions()
    },[currentEmotion])

     


  return (
    <>
        <div className={`flex gap-2 mt-6  `}>
            { typeof comment.userId === 'object' ?
                <Image width={30} height={30} className="w-10 h-10 object-cover rounded-full" src={comment.userId.img } alt="" />
                :
                <Image width={30} height={30} className="w-10 h-10 object-cover rounded-full" src='/user.png' alt="" />
            }

            <div className='w-full'>
                <div className={` flex flex-col  p-4  rounded-lg relative bg-gray-100 `}>
                    <div className='flex gap-5'>
                        { typeof comment.userId === 'object' &&
                            <div className='text-blue-500 font-bold'>{comment.userId.username }</div>
                        }
                        <div><ReactTimeAgoUtil date={comment.createdAt} locale="vi-VN"/></div>
                    </div>
                    <div className='mt-3 '>
                        {comment.content}                          
                        <Dialog>
                            <DialogTrigger>
                                {commentEmotions && commentEmotions?.length>0 &&
                                    <div 
                                        onClick={()=>{
                                            calculateCount
                                            setCurrentEmotion('all')
                                        }}
                                        className='absolute -bottom-4 right-0 p-1 px-2 bg-white border-2 border-gray-100 shadow-lg rounded-full h-auto flex items-center hover:cursor-pointer hover:text-red-500'
                                    >
                                            {emotionTypeOfComment?.map((emo)=>(
                                                    EmotionArray.includes(emo) && <img className='w-6 h-6' src={`/icon-${emo}.svg`} />
                                                )
                                            )
                                            }
                                            <div className='ml-2 text-xl'>{commentEmotions?.length}</div>
                                    </div>
                                }
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle className='flex font-medium items-center'>
                                    <div className='flex justify-center items-center'>
                                        <div className={`flex gap-1 hover:cursor-pointer hover:text-blue-500  p-3 transition ${currentEmotion==='all'?'border-blue-500 text-blue-500  border-b-3':''} `} 
                                            onClick={()=>setCurrentEmotion('all')}>
                                            <p>Tất cả</p>
                                            <p>({commentEmotions?.length})</p>
                                        </div>
                                        {commentEmotions && commentEmotions?.length>0 &&
                                        <div className=' p-1 bg-white   h-auto flex items-center '>
                                            {emotionTypeOfComment?.map((emo)=>(
                                                    EmotionArray.includes(emo) &&
                                                    <div 
                                                        onClick={()=>setCurrentEmotion(emo)}
                                                        className={`flex justify-center items-center  hover:cursor-pointer hover:text-blue-500  p-2  transition
                                                            ${currentEmotion===emo?'border-b-3 text-blue-500 border-blue-500':''} `}>
                                                        <img className='w-6 h-6' src={`/icon-${emo}.svg`} />
                                                        {   emo==='like'?<div>{likeCount}</div> :
                                                            emo==='love'?<div>{loveCount}</div> :
                                                            emo==='fun'?<div>{funCount}</div> :
                                                            emo==='sad'?<div>{sadCount}</div> :
                                                            emo==='wow'?<div>{wowCount}</div> :''                                                       
                                                        } 
                                                      
                                                    </div> 
                                                )
                                            )
                                            }                                              
                                        </div>
                                        }
                                    </div>
                                    </DialogTitle>
                                    <Separator />
                                    <DialogDescription className='overflow-auto h-80 '>
                                       {currentCommentEmotions?.map((c:commentEmotionType,index)=>(
                                        <div className='flex gap-4  items-center  space-y-2 relative' key={index}>
                                            {c.userId.img ?
                                                <Image  width={50} height={50} className='w-12 h-12 object-cover rounded-full' src={c.userId.img} alt='avatar' />
                                                :
                                                <Image  width={50} height={50} className='w-12 h-12 object-cover rounded-full' src='/user.png' alt='avatar' />
                                            }
                                            <p className='text-black'>{c.userId.username}</p>
                                            <img src={`/icon-${c.type}.svg`} className='absolute bottom-0 -left-0 w-6 h-6  ' alt="" />
                                        </div>
                                       ))

                                       }
                                    </DialogDescription>
                                </DialogHeader>
                            </DialogContent>
                        </Dialog>                    
                        
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
                            {
                            loadingEmotion ? 
                            <div className='flex justify-end items-center'>
                                <Loader className='animate-spin text-gray-500 '/>
                            </div>
                            :                           
                            <div className="flex gap-2 hover:text-red-500 hover:cursor-pointer">
                                {userEmotion !== undefined && EmotionArray.includes(userEmotion) ?
                                    <div className='font-bold text-red-500 first-letter:uppercase'>
                                        {
                                            userEmotion==='like'?<p onClick={()=>handleEmotion('like')}>Thích</p>
                                            :userEmotion==='love'?<p onClick={()=>handleEmotion('love')}>Yêu</p>
                                            :userEmotion==='fun'?<p onClick={()=>handleEmotion('fun')}>Vui</p>
                                            :userEmotion==='sad'?<p onClick={()=>handleEmotion('sad')}>Buồn</p>
                                            :userEmotion==='wow'?<p onClick={()=>handleEmotion('wow')}>Wow</p>: ''
                                        }
                                        </div>
                                    :<p className='' onClick={()=>handleEmotion('like')}>Thích</p>
                                }
                            </div>
                            }

                            {/* Options shown on hover */}
                            {showEmoji && (
                            <div className="absolute w-60 -top-13  bg-white border rounded-xl shadow-lg p-2 flex gap-2">
                                {EmotionArray.map((emotionType, index)=>(
                                    <span key={index} onClick={()=>handleEmotion(emotionType as EmotionType)}>
                                        <img src={`/icon-${emotionType}.svg`} className='w-10 h-10 hover:scale-130 transition hover:cursor-pointer' alt="" />
                                    </span>
                                
                                ))}
                            </div>
                            )}

                        </div>
                    </div>
                    <div  onClick={()=>setOpenCommentBox(!openCommentBox)} className='flex hover:text-red-500 hover:cursor-pointer'>
                        <p>Trả lời</p>
                    </div>
                    {loadingFlag ? <Loader className='animate-spin text-gray-500'/> :
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
                { typeof comment.userId === 'object' &&
                    <CommentBox  user={user} postId={postId} slug={slug} type={'comment'} refCommentIdTypeThread={comment._id} closeBoxAfterComment={true} 
                    refCommentUserId={comment.userId._id} refCommentUsername={comment.userId.username} isReplied={false} setLoading={setLoading}/>
                }
            </div>
        }

        {/* reply comments */}
        {showReplies &&
            <div className='border-l-2 ml-12'>
            {replies.length>0 && replies.map((reply,index)=>(
                <>
                    {
                        commentId===reply._id ?
                    
                        
                            <Reply commentId={commentId} replyData={reply} key={index} user={user} postId={postId} slug={slug} setLoading={setLoading} reportComments={reportComments} 
                                    setReportComments={setReportComments} />
                      
                        :
                      
                            <Reply commentId={null} replyData={reply} key={index} user={user} postId={postId} slug={slug} setLoading={setLoading} reportComments={reportComments} 
                                    setReportComments={setReportComments} />
                    
                    }
                </>
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