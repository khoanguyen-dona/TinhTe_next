'use client'
import React, { useState } from 'react'
import { SendIcon } from 'lucide-react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"
  import { Button } from "@/components/ui/button"
  import { Textarea } from '@/components/ui/textarea'
import { User } from '@/dataTypes'
import { userRequest } from '@/requestMethod'
import { CommentType } from '@/dataTypes'
import toast from 'react-hot-toast'
import Comment from './Comment'
import CommentRed from './CommentRed'
import Image from 'next/image'

type Props = {
    user: User,
    postId: string
    type: 'thread'|'comment',
    refCommentIdTypeThread: string|null ,
    refCommentUserId: string|null,
    refCommentUsername: string|null,
    isReplied: boolean,
    setLoading: (value: boolean) => void,
    closeBoxAfterComment: boolean
}

type CommentRed = {
    avatar : string,
    content: string,
    username: string
}

const CommentBox = ({user, postId, type, refCommentIdTypeThread, refCommentUserId, refCommentUsername, isReplied, setLoading, closeBoxAfterComment }:Props) => {

    const [comment, setComment] = useState<string>()
    console.log('type :',type)
    const [data, setData] = useState<CommentRed[]>([])
    const [closeCommentBox, setCloseCommentBox] = useState<boolean>(false)
    const handleSendComment = async() => {
        setLoading(true)
        try {
            const res = await userRequest.post('/comment',{
                postId: postId ,
                content: comment ,
                userId: user._id,
                imgGalllery: [] ,
                type: type,
                refCommentIdTypeThread: refCommentIdTypeThread ,
                refCommentUserId: refCommentUserId ,
                isReplied: isReplied,
            })
            if(res.data){
                data.push({
                    avatar: user.img,
                    content: comment as string,
                    username: user.username
                })
                toast.success('Bình luận thành công')  
                setCloseCommentBox(true)     
            }
        } catch(err){
            toast.error('Lỗi')
        }finally{
            setLoading(false)
        }
    }
    console.log('com',comment)
  return (
    <div className='h-full -mt-4'>
        {
         closeBoxAfterComment && closeCommentBox ? '':
            <div className='flex  gap-2 h-50 '>
                <div className='w-[50px]'>
                <Image width={50} height={50} src={user?.img ? user?.img : '/user.png'} className='w-10 h-10 rounded-full object-cover' alt="" />
                </div>
                <div className='w-full h-auto p-2 flex flex-col border-2 rounded-lg'>
                    <Textarea spellCheck={false} value={comment} onChange={(e)=>setComment(e.target.value)} className='w-full h-50  bg-gray-200 border-none'   id="" />
                    <div className='flex justify-end gap-2 mt-2'>
                        <img src="/upload.png" className='w-14 hover:cursor-pointer p-1 hover:bg-blue-200 rounded-lg ' alt="" />
                        { user!==null ?
                            <button onClick={handleSendComment} className='px-6   rounded-lg text-white font-bold bg-blue-500 hover:bg-blue-600 flex justify-center items-center gap-2 hover:cursor-pointer' >
                                <SendIcon />
                                Gửi
                            </button> 
                            :
                            <AlertDialog>
                                <AlertDialogTrigger>
                                    <button className='px-6  py-4 rounded-lg text-white font-bold bg-blue-500 hover:bg-blue-600 flex justify-center items-center gap-2 hover:cursor-pointer' >
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
                                    <a href="/login">
                                        <div className='p-4 font-bold text-white bg-blue-500 hover:bg-blue-600 transition rounded-lg'>Đăng nhập</div>
                                    </a>
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
            data.map((c,index)=>(
                <CommentRed avatar={c.avatar} content={c.content}  username={c.username} refCommentUsername={refCommentUsername} key={index} imgGallery={[]} type={type} />
            ))
        }
    </div>
  )
}

export default CommentBox