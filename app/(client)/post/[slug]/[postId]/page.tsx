'use client'

import { useState,useEffect, useRef } from 'react'
import React from 'react'
import JoditViewer from '@/app/(client)/custom-components/JoditViewer'
import Image from 'next/image'
import { Post } from '@/dataTypes'
import { publicRequest, userRequest } from '@/requestMethod'
import { useParams, useSearchParams} from 'next/navigation'
import moment from 'moment'
import { Separator } from "@/components/ui/separator"
import { Loader, MessageSquare } from 'lucide-react'
import { ThumbsUp } from 'lucide-react'
import { RootState } from '@/redux/store'
import { useDispatch, useSelector } from 'react-redux'
import { User } from '@/dataTypes'
import CommentBox from '@/app/(client)/custom-components/CommentBox'
import { CommentType } from '@/dataTypes'
import Comment from '@/app/(client)/custom-components/Comment'
import { ReportCommentType } from '@/dataTypes'
import { EmotionType } from '@/dataTypes'
import toast from 'react-hot-toast'
import PostMetadata from '@/app/(client)/custom-components/postMetadata'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { setChatList } from '@/redux/chatListRedux'
import Link from 'next/link'

// import { useSocket } from '@/context/socketContext'

type postEmotionType = {
    postId: string,
    userId: User,
    type: EmotionType
}




const postPage = () => {
    const searchParams = useSearchParams()
    const commentId = searchParams.get('commentId')
    const commentIdTypeThread = searchParams.get('refCommentIdTypeThread')
    const commentIdRef = useRef(commentId)
    const commentIdTypeThreadRef = useRef(commentIdTypeThread)
    
    const sectionRef = useRef<HTMLDivElement>(null);
    const scrollToSection = () => {
        sectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    
    const dispatch = useDispatch()
    const [reload, setReload] = useState<boolean>(false)
    const EmotionArray = ['like','love','fun','sad','wow']
    const user = useSelector((state: RootState)=>state.user.currentUser as User)
    const {postId, slug} = useParams()
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
    const [totalComments, setTotalComments] = useState<number>()
    const [emotionLoading ,setEmotionLoading] = useState<boolean>(false)
    const [userEmotion, setUserEmotion] = useState<EmotionType>() // emotion that user have in this post
    const [postEmotions,setPostEmotions] = useState<postEmotionType[]>() // emotion data related to this post 
    const [emotionTypeOfPost, setEmotionTypeOfPost] = useState<EmotionType[]>() //type of emotions have in this post eg..[like,love,fun]
    const [currentEmotion, setCurrentEmotion] = useState<EmotionType|'all'>() // current emotion user choose from
    const [currentPostEmotions, setCurrentPostEmotions] = useState<postEmotionType[]>() //current emotions data base on type of emotion
    const [commentTypeThreadRef, setCommentTypeThreadRef] = useState<CommentType|null>(null)

    const [likeCount, setLikeCount] = useState<number>()
    const [loveCount, setLoveCount] = useState<number>()
    const [funCount, setFunCount] = useState<number>()
    const [sadCount, setSadCount] = useState<number>()
    const [wowCount, setWowCount] = useState<number>()

    // update value of commentId through commentIdRef
    useEffect(()=>{
        commentIdRef.current=commentId
    },[commentId])

    // update value of commentIdTypeThread through commentIdTypeThreadRef
    useEffect(()=>{
        commentIdTypeThreadRef.current=commentIdTypeThread
    },[commentIdTypeThread])

     
    useEffect(()=>{
        const getData = async() => {
            try {
                const res = await publicRequest.get(`/comment/commentId/${commentIdTypeThread}`)
                if(res.data){
                    setCommentTypeThreadRef(res.data.comment)
                }
            } catch(err){
                console.log('get commentIdTypeThread failed',err)
            }
        }
        getData()
    },[commentIdTypeThread,commentId])


    //fetch user emotion
    useEffect(()=>{
       
        const getUserEmotion = async() =>{
            try {
                const res = await publicRequest.get(`/post-emotion/${postId}?userId=${user._id}`)
                if(res.data.emotion.length >0 ){
                    setUserEmotion(res.data.emotion[0].type)
                } else {
                    setUserEmotion(undefined)
                }
            } catch(err){
                console.log('fetch user emotion failed',err)
            }
        }
        getUserEmotion()
       
    },[reload])

    //fetch all emotion of this post
    useEffect(()=>{
        const getData = async () =>{
            try {
                const res = await publicRequest.get(`/post-emotion/${postId}`)
                if(res.data){
                    setPostEmotions(res.data.emotion)
                    const tempArray:EmotionType[] = []
                    res.data.emotion.map((emotion:postEmotionType)=>{
                        tempArray?.includes(emotion.type) ? '': tempArray.push(emotion.type)
                    })
                    setEmotionTypeOfPost(tempArray)
                    setCurrentPostEmotions(res.data.emotion)
                }
            } catch(err){
                console.log('fetch commentEmotions failed',err)
            }
        }
        getData()
    },[reload])

    //handlelike
    const handleEmotion = async (value: EmotionType) =>{
        try {
            if (user !== null){
                setEmotionLoading(true)
                const res = await userRequest.post(`/post-emotion`,{
                    postId: postId,
                    userId: user._id,
                    type: value
                })
                if(res.data){
                    setReload(!reload)
                }
            } else {
                toast.error('Đăng nhập để tương tác')
            }
        } catch(err){
            toast.error('Lỗi')
            console.log('post emotion failed',err)
        } finally {
            setEmotionLoading(false)
        }
    }



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

    //fetch total Comments
    useEffect(()=>{
        const getTotalComments = async () =>{
            const res = await publicRequest.get(`/comment/${postId}`)
            if(res.data){
                setTotalComments(res.data.totalComments)
            }
        }
        getTotalComments()
    },[])

    const calculateCount = async () => {
        let tempLikeCount = 0
        let tempLoveCount = 0
        let tempFunCount = 0
        let tempSadCount = 0
        let tempWowCount = 0

        if(postEmotions){   
            for(const c of postEmotions ){
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
        let tempArray: postEmotionType[] = []

        try {
            if(currentEmotion==='all'){
            setCurrentPostEmotions(postEmotions)
            } else {    
            postEmotions?.map((com:postEmotionType)=>(
                com.type===currentEmotion? tempArray.push(com):''
            ))
            setCurrentPostEmotions(tempArray)
            }
        } catch(err){
            console.log('err while fetching current emotions',err)
        } 
        }
        getEmotions()
    },[currentEmotion])


    setTimeout(()=>{
        publicRequest.get(`/post/${post?._id}/increase-view`)
    }, 20000)

    
    

  return (
    <>
        <PostMetadata postTitle={post?.title as string} postDesc={post?.shortDescription as string} 
        postImg={post?.thumbnail as string} />
        <div className='flex justify-center'>
        {loading && 
            <div className='fixed top-0 z-20  w-screen h-screen bg-white opacity-50' >
                <div className='absolute inset-0 flex items-center justify-center'>
                    <Loader className=' animate-spin w-14 h-14   '/>
                </div>
            </div>
        }
        <div className=' h-auto w-full  '>
            <div className=' flex flex-col lg:flex-row h-auto p-2 mt-24 rounded-lg '>

                {/* content of post col */}
                <div className='w-full lg:w-2/3 flex flex-col px-2 mt- h-auto'>  
                    <div className='text-2xl md:text-3xl font-bold  '>{post?.title}</div>
                    <div className='flex gap-2 mt-10 '>
                        {
                            post?.authorId?.img  ?
                            <Image width={20} height={20} src={post?.authorId?.img as string||'/user.png'} className='w-12 h-12 rounded-full ' alt="" />
                            : <img src='/user.png' className='w-12 h-12 rounded-full ' alt="" />
                        }
                        <div className='flex flex-col'>
                            <Link href={`/profile/${post?.authorId?._id}`} className='text-blue-500 font-bold'>{post?.authorId.username}</Link>
                            <div className='font-mono'>{moment(post?.createdAt).format('DD/MM/YYYY HH:mm:ss')}</div>
                        </div>
                    </div>
                    <div className=''>
                        <Image width={800} height={800} src={post?.thumbnail as string}  className='w-full object-cover h-60 sm:h-100 md:h-130 mt-4 rounded-xl ' alt="" />
                    </div>
                    <JoditViewer data={post?.content}  />


                    <div className='flex flex-col my-20 space-y-2  '>
                        <div className='flex gap-5 items-center'>                       
                            <Dialog>
                                <DialogTrigger>
                                    {postEmotions && postEmotions?.length>0 ?
                                        <div 
                                            onClick={()=>{
                                                calculateCount
                                                setCurrentEmotion('all')
                                            }}
                                            className='  p-1 px-2     flex items-center hover:cursor-pointer hover:text-red-500'>
                                                {emotionTypeOfPost?.map((emo)=>(
                                                        EmotionArray.includes(emo) && <img className='w-6 h-6' src={`/icon-${emo}.svg`} />
                                                    )
                                                )
                                                }
                                                <div className='ml-2 '>{postEmotions?.length}</div>
                                        </div>
                                        :
                                        <div className='flex gap-2 items-center p-1 px-2 '>
                                            <img src='/icon-like.svg' className='w-6 h-6' />
                                            <p>0</p>
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
                                                <p>({postEmotions?.length})</p>
                                            </div>
                                            {postEmotions && postEmotions?.length>0 &&
                                            <div className=' p-1 bg-white   h-auto flex items-center '>
                                                {emotionTypeOfPost?.map((emo)=>(
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
                                        {currentPostEmotions?.map((c:postEmotionType,index)=>(
                                            <div className='flex gap-4  items-center  space-y-2 relative' key={index}>
                                                {c?.userId?.img ?
                                                    <Image  width={50} height={50} className='w-12 h-12 object-cover rounded-full' src={c?.userId?.img||'/user.png'} alt='avatar' />
                                                    :
                                                    <Image  width={50} height={50} className='w-12 h-12 object-cover rounded-full' src='/user.png' alt='avatar' />
                                                }
                                                <p className='text-black'>{c?.userId?.username}</p>
                                                <img src={`/icon-${c.type}.svg`} className='absolute bottom-0 -left-0 w-6 h-6  ' alt="" />
                                            </div>
                                        ))

                                        }
                                        </DialogDescription>
                                    </DialogHeader>
                                </DialogContent>
                            </Dialog>  
                            <div>-</div>
                            <p className='text-gray-500 '> {totalComments} bình luận</p>
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
                                    {
                                        emotionLoading ? 
                                        <div className='flex justify-end items-center'>
                                            <Loader className='animate-spin text-gray-500 '/>
                                        </div>
                                        :     
                                        <div>                          
                                        {
                                            EmotionArray.includes(userEmotion as EmotionType) ? 
                                                <div className='text-red-500 font-bold first-letter:uppercase '> {
                                                    userEmotion==='like'?<p onClick={()=>handleEmotion('like')} className='flex items-center'><img src='/icon-like.svg' className='w-8 h-8' />Thích</p>
                                                    :userEmotion==='love'?<p onClick={()=>handleEmotion('love')} className='flex items-center'><img src='/icon-love.svg' className='w-8 h-8' />Yêu</p>
                                                    :userEmotion==='fun'?<p onClick={()=>handleEmotion('fun')} className='flex items-center gap-1'><img src='/icon-fun.svg' className='w-8 h-8' />Vui</p>
                                                    :userEmotion==='sad'?<p onClick={()=>handleEmotion('sad')} className='flex items-center gap-1 '><img src='/icon-sad.svg' className='w-8 h-8' />Buồn</p>
                                                    :userEmotion==='wow'?<p onClick={()=>handleEmotion('wow')} className='flex items-center gap-1'><img src='/icon-wow.svg' className='w-8 h-8' />Wow</p>: ''
                                                }</div>
                                                :
                                                <div onClick={()=>handleEmotion('like' as EmotionType)}>Thích</div>
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
                            <div onClick={scrollToSection} className='flex w-1/3 justify-center items-center gap-2 p-4 rounded-lg hover:bg-blue-100 transition hover:cursor-pointer'>
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
                    <div ref={sectionRef} className=''>
                        <CommentBox  user={user} postId={postId as string} slug={decodeURIComponent(slug as string)}  type={'thread'} refCommentIdTypeThread={null} closeBoxAfterComment={false} 
                                    refCommentUserId={null} refCommentUsername={null} isReplied={false} setLoading={setLoading} />
                    </div>

                    {/* commentTypeThreadRef */}
                    {commentTypeThreadRef !== null && user!==null && commentId !== commentIdTypeThread && commentId!==null &&

                        <div  >
                            <Comment commentIdTypeThread={commentIdTypeThreadRef.current} commentId={commentIdRef.current} fetchAllReply={true}  comment={commentTypeThreadRef as CommentType }  user={user as User} postId={postId as string} slug={decodeURIComponent(slug as string)} setLoading={setLoading} reportComments={reportComments as string[]} 
                            setReportComments={setReportComments} />
                        </div>
                    }

                    {/* comment list */}
                    <div>
                        {comments?.map((comment, index)=>(
                            // @ts-ignore
                            <>
                            {comment._id === commentIdTypeThread ?  '':
                                <Comment commentIdTypeThread={null} commentId={null} fetchAllReply={false}  comment={comment } key={index} user={user} postId={postId as string} slug={decodeURIComponent(slug as string)} setLoading={setLoading} 
                                reportComments={reportComments as string[]} setReportComments={setReportComments} />
                            }
                            </>
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
                            <Link href={`/post/${post.title.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/(^-|-$)/g, '')}/${post._id}`} className='w-2/5  hover:cursor-pointer'>
                                <Image width={150} height={100} src={post?.thumbnail} className='object-cover w-full h-24 sm:h-36 md:h-48 lg:h-24  rounded-lg' alt='' />
                            </Link>
                            <div className='w-3/5 flex flex-col space-y-2 '> 
                                <Link href={`/post/${post.title.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/(^-|-$)/g, '')}/${post._id}`} className='font-bold hover:text-blue-500 hover:cursor-pointer hidden md:block'>{post.title}</Link>
                                <Link href={`/post/${post.title.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/(^-|-$)/g, '')}/${post._id}`} className='font-bold hover:text-blue-500 hover:cursor-pointer block md:hidden'>{post.title.slice(0,65)}...</Link>
                                <p className='hidden md:block lg:hidden '>{post?.shortDescription.slice(0,220)}...</p>
                                <div className=' lg:hidden flex  gap-2 justify-start items-center hover:text-blue-500 hover:cursor-pointer'>
                                    <Image width={20} height={20} src={post?.authorId?.img||'/user.png'} className='object-cover rounded-full w-6 h-6 md:w-8 md:h-8' alt='' />
                                    <p className='text-sm md:text-medium'>{post?.authorId?.username}</p>
                                </div> 
                            </div> 
                        </div>
                    ))
                    }
                </div>
            </div>
        </div>

        
        </div>
    </>
  )
}

export default postPage