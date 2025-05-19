import React from 'react'
import Image from 'next/image'
import ReactTimeAgoUtil from '@/utils/ReactTimeAgoUtil'

export type CommentRedType = {
    avatar : string,
    content: string,
    username: string
}

type Props = {
    avatar : string,
    content: string,
    username: string,
    imgGallery: string[] ,
    type: 'thread'|'comment',
    refCommentUsername: string|null
}

const CommentRed = ({avatar, content, username, imgGallery, type, refCommentUsername}:Props) => {
  return (
    <div className={`flex gap-2 py-2  pl-2  ${type==='comment'?'border-l-2':''} `}>
        { avatar ?
            <div className='w-[50px]'>
                <Image width={40} height={40} className="w-10 h-10 object-cover rounded-full" src={avatar} alt="" />
            </div>
            :
            <div className='w-[50px]'>
                <Image width={40} height={40} className="w-10 h-10 object-cover rounded-full" src='/user.png' alt="" />
            </div>
        }

        <div className='w-full '>
            <div className=' flex flex-col  p-4 bg-red-100  rounded-lg'>
                <div className='flex gap-5'>
                    <div className='text-blue-500 font-bold'>{username }</div>
                    <div><ReactTimeAgoUtil date={new Date()} locale="vi-VN"/></div>
                </div>
                <div className='mt-3 flex gap-2'>
                    <div className='flex gap-2 text-blue-500'>
                        <div>@</div>
                        <div>{refCommentUsername}</div>
                    </div>
                    {content} 
                </div>
            </div>

            <div className='flex gap-6 mt-2'>
                    
            </div>

            
        </div>
        
    </div>
  )
}

export default CommentRed