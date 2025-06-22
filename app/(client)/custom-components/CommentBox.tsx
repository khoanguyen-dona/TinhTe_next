'use client'
import React, { useState } from 'react'
import { SendIcon } from 'lucide-react'
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"

import { Textarea } from '@/components/ui/textarea'
import { User } from '@/dataTypes'
import { userRequest } from '@/requestMethod'
import toast from 'react-hot-toast'
import { CommentRedType } from './CommentRed'
import CommentRed from './CommentRed'
import Image from 'next/image'
import { X } from 'lucide-react'
import { UploadMultipleImage } from './UploadMultipleImage'
import { v4 as uuidv4 } from 'uuid';
import Link from 'next/link'
import { useSocket } from '@/context/socketContext'

type Props = {
  
    user: User,
    postId: string ,
    slug: string|null,
    type: 'thread'|'comment',
    refCommentIdTypeThread: string|null ,
    refCommentUserId: string|null,
    refCommentUsername: string|null,
    isReplied: boolean,
    setLoading: (value: boolean) => void,
    closeBoxAfterComment: boolean,
}



const CommentBox = ({ user, postId, slug, type, refCommentIdTypeThread, refCommentUserId, refCommentUsername, isReplied, setLoading, closeBoxAfterComment }:Props) => {

    const [comment, setComment] = useState<string>('')
    const [data, setData] = useState<CommentRedType[]>([])
    const [closeCommentBox, setCloseCommentBox] = useState<boolean>(false)
    const { socket} = useSocket()
    const [previewImages, setPreviewImages] = useState<string[]>([])
    const [imageFiles, setImageFiles] = useState<File[]>([])
    const uuid = uuidv4()

    const handleSendComment = async() => {
        setLoading(true)
        const imgGallery = await UploadMultipleImage({imageFiles:imageFiles,uploadPath:'comment'})
        sendDataToMongo(imgGallery)         
    }

    const sendDataToMongo = async (imgGallery: string[]) =>{
        try{
            const res = await userRequest.post('/comment',{
                postId: postId ,
                content: comment ,
                userId: user._id,
                imgGallery: imgGallery ,
                type: type,
                refCommentIdTypeThread: refCommentIdTypeThread ,
                refCommentUserId: refCommentUserId ,
                isReplied: isReplied,
            })
        

            // send to socket

            if(res.data ){
                data.push({
                    avatar: user.img,
                    content: comment as string,
                    username: user.username,
                    imgGallery: previewImages
                })
                toast.success('Bình luận thành công')  
                setCloseCommentBox(true)   
                
                //create notifi in mongo
                const res_notification =  await userRequest.post(`/notification`, {
                    userId: refCommentUserId ,
                    content: 'nhắc đến bạn trong 1 bình luận' ,
                    userIdRef: user._id ,
                    usernameRef: user.username,
                    commentId: res.data.comment._id ,
                    refCommentIdTypeThread: refCommentIdTypeThread ,
                    postSlug: slug,
                    postId: postId
                })

                //send to socket
                if(res_notification.data){
                    socket?.emit('pushNotification', {
                        receiverId: refCommentUserId,
                        data:{
                            _id : res_notification.data.notification._id,
                            userId: refCommentUserId ,
                            content: 'nhắc đến bạn trong 1 bình luận' ,
                            userIdRef: user._id ,
                            usernameRef: user.username,
                            isReceiverSeen: false,
                            commentId: res.data.comment._id ,
                            refCommentIdTypeThread: refCommentIdTypeThread ,
                            createdAt: new Date().toISOString(),
                            postSlug: slug ,
                            postId: postId
                        }
                    })
                }
            }

        } catch(err){
            toast.error('Lỗi')
        }finally{
            setLoading(false)
            setComment('')
            setPreviewImages([])
            setImageFiles([])
        }
    }

    const handleImageGallery = (e: React.ChangeEvent<HTMLInputElement>) =>{
        const files = e.target.files as FileList
        if(imageFiles.length+files.length > 5){
            alert('Bạn chỉ được upload tối đa 5 ảnh')
            return
        }

        if(files){
            for (const file of files ){     
                if(file.size > 3000000){
                    // toast.error('Kích thước ảnh quá lớn vui lòng chọn ảnh nhỏ hơn 3 MB')
                    alert('Vui lòng chọn ảnh có kích thước nhỏ hơn 3 MB')
                }
                else if(file.size < 3000000) {
                    setImageFiles(prev=>[...prev,file])
                    const imageBlob = URL.createObjectURL(file)
                    setPreviewImages(prev=>[...prev,imageBlob])
                }
            }

        } 
    }

    const handleRemoveImage = (index:number) => {
        const imgs = previewImages.filter((image, i)=>i !== index)
        const files = imageFiles.filter((file, i) => i !== index)
        setPreviewImages(imgs)
        setImageFiles(files)
    }


  return (
    <div className='h-full -mt-4'>
        {
         closeBoxAfterComment && closeCommentBox ? '':
            <div className='flex h-auto '>
                <div className='w-[50px]'>
                <Image width={30} height={30} src={user?.img ? user?.img : '/user.png'} className='w-10 h-10 rounded-full object-cover' alt="" />
                </div>
                <div className='w-full h-auto p-2 flex flex-col border-2 rounded-lg'>
                    <Textarea spellCheck={false} value={comment} onChange={(e)=>setComment(e.target.value)} 
                        className='w-full h-30  bg-gray-100 border-none'   id="" 
                    />
                    {/* preview images */}
                    <div className='flex flex-wrap mt-4 gap-2'>
                        {previewImages && previewImages.length>0 &&
                            previewImages.map((image,index)=>(
                                <div className='relative'>
                                    <X 
                                        size={30} onClick={()=>handleRemoveImage(index)}
                                        className='absolute top-0  right-0 bg-black text-gray-400 rounded-md  hover:text-red-500 transition hover:cursor-pointer'/>
                                    <Image width={30} height={30} src={image} className='w-30 h-30 object-cover rounded-lg' alt=''/>
                                </div>
                            ))

                        }    
                    </div>

                    <div className='flex justify-end gap-2 mt-2'>
                        {/* add images */}
                        <span className=' hover:cursor-pointer p-[1px] hover:bg-blue-200 rounded-lg' title='Thêm ảnh'>          
                            <label 
                                title='Thêm ảnh'
                                className='hover:text-blue-500   transition  ' 
                                htmlFor={`${uuid}`}
                            >
                                <img
                                    src='/upload.png'
                                    alt='Thêm ảnh'
                                    className='  h-full w-16 hover:cursor-pointer hover:bg-blue-200 px-2  rounded-lg '                             
                                />
                                <input  className='hidden' type="file" multiple accept='image/*' onChange={handleImageGallery} 
                                    id={`${uuid}`}/>
                            </label>
                        </span>
                        {/* send button */}
                        { user!==null ?
                            <button
                                disabled={comment.trim().length===0&&imageFiles.length===0} 
                                onClick={handleSendComment} className={`px-6   rounded-lg text-white font-bold bg-blue-500  flex 
                                justify-center items-center gap-2 hover:cursor-pointer ${comment.trim().length===0&&imageFiles.length===0?'opacity-40':'hover:bg-blue-600'}`} >
                                <SendIcon />
                                Gửi
                            </button> 
                            :
                            <AlertDialog>
                                <AlertDialogTrigger>
                                    <button className={`px-6  py-4 rounded-lg text-white font-bold bg-blue-500 hover:bg-blue-600 flex justify-center 
                                        items-center gap-2 hover:cursor-pointer  `} >
                                        <SendIcon  />
                                        Gửi
                                    </button> 
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Đăng nhập 1 lần, bình luận thả ga</AlertDialogTitle>                      
                                    </AlertDialogHeader>
                                    
                                    <div className='flex justify-center gap-2'>
                                    <AlertDialogCancel>Thoát</AlertDialogCancel>
                                    <Link href="/login">
                                        <div className='p-4 font-bold text-white bg-blue-500 hover:bg-blue-600 transition rounded-lg'>Đăng nhập</div>
                                    </Link>
                                    </div>
                            
                                </AlertDialogContent>
                            </AlertDialog>
                        }
                    </div>
                </div>
            </div>
        }

        {/* user've just comment */}
        {data && data.length>0 &&
            data.map((d,index)=>(
                <CommentRed avatar={d.avatar} content={d.content}  username={d.username} refCommentUsername={refCommentUsername} key={index} imgGallery={d.imgGallery} type={type} />
            ))
        }
    </div>
  )
}

export default CommentBox