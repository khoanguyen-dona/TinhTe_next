'use client'
import { CommentType, EmotionType } from '@/dataTypes'
import ReactTimeAgoUtil from '@/utils/ReactTimeAgoUtil'
import { Flag, Loader } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import CommentBox from './CommentBox'
import { User } from '@/dataTypes'
import Fancybox from './Fancybox'
import { publicRequest, userRequest } from '@/requestMethod'
import toast from 'react-hot-toast'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { Separator } from '@/components/ui/separator'



type Props = {
    commentId: string|null, // specific commentId appear on notification
    replyData: CommentType,
    user: User,
    postId: string,
    slug: string|null,
    setLoading: (value: boolean) => void,
    reportComments: string[],
    setReportComments: (value: string[]) => void
}

type commentEmotionType = {
    commentId: string,
    userId: User,
    type: EmotionType
}

const Reply = ({commentId, replyData, user, postId, slug, setLoading, reportComments, setReportComments }:Props) => {
    
    const [showEmoji, setShowEmoji] = useState<boolean>(false);
    const [openCommentBox, setOpenCommentBox] = useState<boolean>(false)
    const [loading2, setLoading2] = useState<boolean>(false)
    const [loadingEmotion, setLoadingEmotion] = useState<boolean>(false)
    const EmotionArray = ['like','love','fun','sad','wow']
    const [reload, setReload] = useState<boolean>(false)
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
    const scrollRef = useRef<HTMLDivElement |null>(null)

    //fetch emotions of comment
    useEffect(()=>{
        const getData = async () =>{
            try {
                const res = await publicRequest.get(`/comment-emotion/${replyData._id}`)
                if(res.data){
                    setCommentEmotions(res.data.emotion)
                    const tempArray:EmotionType[] = []
                    res.data.emotion.map((emotion:commentEmotionType)=>{
                        tempArray?.includes(emotion.type) ? '': tempArray.push(emotion.type)
                    })
                    setEmotionTypeOfComment(tempArray)
                }
            } catch(err){
                console.log('fetch commentEmotions failed',err)
            }
        }
        getData()
    },[reload])


    const handleReportComment = async () => {     
        try {
            if (user !== null){
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
            } else {
                toast.error('Đăng nhập để báo cáo')
            }
        } catch(err){
            toast.error('Lỗi')
        }
    }   

    //fetch emotion of user 
    useEffect(()=>{
        const getEmotion = async () => {
            try {                    
                const res = await publicRequest.get(`/comment-emotion/${replyData._id}?userId=${user._id}`)
                if(res.data.emotion.length>0){
                    setUserEmotion(res.data.emotion[0].type)
                }else{
                    setUserEmotion(undefined)
                }                                               
            } catch(err){   
                console.log('fetch user emotion failed',err)
            }
        }
        getEmotion()
    }, [reload])
 
    const handleEmotion = async (emotionType: string) => {
            try {
                if (user !== null ){
                    setLoadingEmotion(true)
                    const res = await userRequest.post(`/comment-emotion`,{
                        commentId: replyData._id,
                        userId: user._id,
                        type: emotionType
                    })
                    if(res.status===200){
                    setReload(!reload)
                    }
                } else {
                    toast.error('Đăng nhập để tương tác')
                }
            } catch(err){
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


    // scroll to bottom when  have commentIdTypeThread
    useEffect(() => {
        if(commentId!==null){
            scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [ commentId]);


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

            <div className='w-full '>
                <div ref={scrollRef} className={` flex flex-col  p-4   rounded-lg relative ${commentId===replyData._id?'bg-red-100':'bg-gray-100'} `}>
                    <div className='flex gap-5'>
                        <div className='text-blue-500 font-bold'>{replyData.userId.username }</div>
                        <div><ReactTimeAgoUtil date={replyData.createdAt} locale="vi-VN"/></div>
                    </div>
                    <div className='mt-3 flex gap-2 '>
                        <div className='text-blue-500'>
                            @ {replyData.refCommentUserId.username}
                        </div>
                        {replyData.content } 
                        <Dialog>
                            <DialogTrigger>
                                {commentEmotions && commentEmotions?.length>0 &&
                                    <div 
                                        onClick={()=>{
                                            calculateCount() 
                                            setCurrentEmotion('all')}
                                        }
                                        className='absolute -bottom-4 right-0 p-1 px-2 bg-white border-2 border-gray-100 shadow-lg rounded-full h-auto flex items-center hover:cursor-pointer hover:text-red-500'>
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
                                            {c.userId.img  ?
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
                                        <span key={index} onClick={()=>handleEmotion(emotionType)}>
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
            <CommentBox   user={user} postId={postId} slug={slug} type={'comment'} refCommentIdTypeThread={replyData.refCommentIdTypeThread} 
                            refCommentUsername={replyData.userId.username}  closeBoxAfterComment={true} 
                            refCommentUserId={replyData.userId._id} isReplied={false} setLoading={setLoading}/>
        </div>
    }


    </>
  )
}

export default Reply