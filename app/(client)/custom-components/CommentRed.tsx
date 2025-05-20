import React from 'react'
import Image from 'next/image'
import ReactTimeAgoUtil from '@/utils/ReactTimeAgoUtil'
import Fancybox from './Fancybox'

export type CommentRedType = {
    avatar : string,
    content: string,
    username: string,
    imgGallery: string[]
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
    <div className={`flex  py-2  mt-4  ${type==='comment'?' pl-2 -ml-2 ':''} `}>
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
                    {
                        refCommentUsername ?
                        <div className='flex gap-2 text-blue-500'>
                            <div>@</div>
                            <div>{refCommentUsername}</div>
                        </div>
                        : ''
                    }
                    {content} 
                </div>

                {/* display comment imgGallery with fancybox library */}                 
                {imgGallery && imgGallery.length > 0  &&
                  <Fancybox
                    options={{
                      Carousel: {
                        infinite: false,
                      },
                    }}
                  >
                    <div className='flex gap-2 mt-2'>
                    {
                      imgGallery?.map((img,index)=>(
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
                    
            </div>

            
        </div>
        
    </div>
  )
}

export default CommentRed