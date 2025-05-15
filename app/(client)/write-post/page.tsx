'use client'
import React from 'react'
import { Textarea } from "@/components/ui/textarea"
import { useState, useEffect } from 'react'
import Jodit from '../custom-components/Jodit'
import { Loader } from 'lucide-react';
import toast from 'react-hot-toast'
import { categories } from '@/data'
import { useSelector } from 'react-redux'

import { publicRequest } from '@/requestMethod'
import { RootState } from '@/redux/store'
import { useDispatch } from 'react-redux'
import { setDraft } from '@/redux/draftRedux'
import { Input } from '@/components/ui/input'
import NextImage from 'next/image'

import { UploadSingleImage } from '../custom-components/UploadSingleImage'

const page = () => {
    const dispatch = useDispatch()
    const user = useSelector((state: RootState)=>state.user.currentUser)
    const [linkUrl, setLinkUrl] = useState<string>()
    const [shortDescription, setShortDescription] = useState<string>()
    const [title, setTitle] = useState<string>()
    const [content, setContent] = useState<string>()
    const [loading, setLoading] = useState<boolean>(false)
    const [image, setImage] = useState<string>()
    const [thumbnail, setThumbnail] = useState<string>()
    const [thumbnailFile, setThumbnailFile] = useState<File>()
    const [category, setCategory] = useState<string>('xe')
    const [postId, setPostId] = useState<string>()

    // add image to desc when choose image in RichtextEditor
    useEffect(()=>{
        image && setContent((prev)=>prev+`<div class='my-opacity'><img class='my-opacity'
          src="${image}"/></div>`)
    }, [image])

    const handleThumbnail = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if(file && file.size > 3000000){
            // toast.error('Kích thước ảnh quá lớn vui lòng chọn ảnh nhỏ hơn 3 MB')
            alert('Vui lòng chọn ảnh có kích thước nhỏ hơn 3 MB')
        }
        else if(file && file.size < 3000000) {
            setThumbnailFile(file)
            const imageBlob = URL.createObjectURL(file)
            setThumbnail(imageBlob)
        }
    }
    const removeThumbnail = () => {
        setThumbnail(undefined)
        setThumbnailFile(undefined)
    }
 
    const handleCategory = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setCategory(e.target.value)
    }

    const uploadThumbnail = async(value: string) => {
        if(thumbnailFile){
            try {
                if(postId && postId!==undefined){
                    const img_URL = await UploadSingleImage({imageFile: thumbnailFile, uploadPath:'post'})
                    updateMongo(img_URL, value)
                }else {
                    const img_URL = await UploadSingleImage({imageFile: thumbnailFile, uploadPath:'post'})
                    uploadToMongo(img_URL, value)             
                }
            } catch (err){
                console.log('error loading thumbnailFile to firebase', err)
            }  
        } else {
            if(postId && postId!==undefined ){
                updateMongo(thumbnail as string, value)
            }else {
                uploadToMongo(thumbnail as string, value)             
            }         
        }
    }

    const uploadToMongo = async(img: string, value: string) =>{
        const isPosted = value==='saved'?false:true
            try {
                    const res = await publicRequest.post('/post',{
                        title: title ,
                        shortDescription: shortDescription, 
                        content: content,
                        thumbnail: img,
                        category: category,
                        authorId: user?._id,
                        isPosted: isPosted,
                    })
                    if(res.data){
                        setPostId(res.data.post._id)
                        toast.success('Cập nhật thành công')
                    }
            } catch(err) {
                toast.error('Lỗi')
                console.log('err while upload to mongo',err)
            } finally {
                setLoading(false)
            }    
    }

    const updateMongo = async (img : string, value: string) => {
        const isPosted = value==='saved'?false:true
        try {
            const res = await publicRequest.put(`/post/${postId}`,{
                title: title ,
                shortDescription: shortDescription, 
                content: content,
                thumbnail: img,
                category: category,
                authorId: user?._id,
                isPosted: isPosted,      
            })
            if(res.data){
                setPostId(res.data.post._id)
                toast.success('cập nhật thành công')
            }
        } catch(err) {
            toast.error('Lỗi')
            console.log('err while update to mongo',err)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (value: string) => {
            if(title===undefined||title===''||thumbnail===undefined||content===undefined||content===''){
                alert('Vui lòng điền đầy đủ thông tin')
                return
            }
            setLoading(true)
            await uploadThumbnail(value)   
    }
    
    const saveDraftToStorage = async() => {
        dispatch(setDraft({
            _id: postId,
            title: title,
            shortDescription: shortDescription, 
            content: content,
            thumbnail: thumbnail,
            imgGallery: [],
            category: category,
            authorId: user?._id,
        }))
    }

    const handleDraft = async () => {
        setLoading(true)
        await saveDraftToStorage()
        window.open('/view-draft', '_blank')
        setLoading(false)
    }

    const handleLinkUrl = async () => {
       
        if(linkUrl&&linkUrl.trim().length>0){
            const img = new Image();
            img.src = linkUrl;
            img.onload = () => {
                setThumbnailFile(undefined)
                setThumbnail(linkUrl)
            }  
            img.onerror = () => {          
            }; 
        }
    }

  return (
    <>
    {loading && 
    <div className='fixed top-0 z-20  w-screen h-screen bg-white opacity-50' >
        <div className='absolute inset-0 flex items-center justify-center'>
            <Loader className=' animate-spin w-14 h-14   '/>
        </div>
    </div>
    }

    <div className=' px-2 md:px-8 lg:px-16 xl:px-32 mt-30 h-auto  space-y-10 '>
        <div className='flex flex-col '>
            <div className='text-gray-500'>Tiêu đề bài viết</div>
            <Textarea disabled={false} className='text-2xl lg:text-2xl h-auto' onChange={(e)=>setTitle(e.target.value)} placeholder="Tiêu đề bài viết" />
            {title && title?.length   > 90 ? <div className='text-red-500 mt-2'>Tiêu đề chỉ nên nhỏ hơn 90 chữ</div> : ''}
            <div className='text-right md:text-xl  text-gray-500'>
                {title?.length!==undefined ? title?.length : 0 }/90 kí tự
            </div>
        </div>

        <div className='flex flex-col space-y-4 '>
            <p className='text-gray-500'>Ảnh đại diện bài viết</p>
            <div className='flex gap-4 justify-center items-center'>
                <Input className='p-5' value={linkUrl} onChange={(e)=>setLinkUrl(e.target.value)} placeholder='Nhập link ảnh' />
                <button onClick={handleLinkUrl} className='p-2 text-white rounded-lg w-20 bg-blue-500 text-lg font-bold hover:bg-blue-600 transition hover:cursor-pointer'>OK</button>
            </div>
            {thumbnail ? '':
                <div className='text-center border-4 border-gray-200 border-dashed bg-gray-100 rounded-xl'>
                    <label className='hover:cursor-pointer p-2 ' 
                            htmlFor="thumbnail"
                    >
                        <div className='w-full  flex flex-col justify-center items-center '>
                            
                            <img src="/upload-image.png" className='w-12 h-12 opacity-50 ' alt="" />
                            <p className='text-lg text-gray-500 '>Thêm ảnh đại diện</p>
                        </div>

                        <input 
                            className='p-6 hidden border-gray-200 ' 
                            onChange={handleThumbnail} id='thumbnail' type='file'  />
                    </label>
                </div> 
            }
            {thumbnail && 
            <div className='w-full relative'>
                <NextImage alt='' width={1000} height={1000} src={thumbnail} className='w-full rounded-xl ' />
                <div className='absolute z-20 top-2 right-2 bg-gray-100 hover:bg-gray-300 transition rounded-xl opacity-70 p-4 hover:cursor-pointer' onClick={removeThumbnail}>
                    <img src="/x.png" className=' w-6 h-6 font-bold' alt="" />
                </div>

                {/* <div className='absolute inset-0 flex items-center justify-center  '>    */}
                <label className='hover:cursor-pointer  absolute inset-0 flex items-center justify-center' 
                        htmlFor="thumbnail"
                >
                    <div className='w-auto  flex justify-center items-center flex-col  rounded-xl bg-gray-100 hover:bg-gray-300 transition opacity-70 font-bold p-2 '>
                        <img src="/upload-image.png" className='w-12 h-12  ' alt="" />
                        <p className='text-lg text-gray-800    rounded-xl text-center'>Đổi ảnh đại diện</p>
                    </div>
                    <input 
                        className='p-6 hidden border-gray-200 ' 
                        onChange={handleThumbnail} id='thumbnail' type='file'  />
                </label>         
                {/* </div> */}
            </div>
            }
        </div>
        
        <div className='flex flex-col  w-35'>
            <p className='text-gray-500' >Category</p>
            <select className=' border-2 border-gray-200 rounded-lg p-1' onChange={handleCategory} value={category as string} >
                { categories.map((cat,index)=>(
                    <option key={index} value={cat.value}>{cat.title}</option>
                ))
            }
            </select>
        </div>

        <div className='flex flex-col '>
            <p className='text-gray-500'>Mô tả ngắn</p>
            <Textarea value={shortDescription} onChange={(e)=>setShortDescription(e.target.value)} />
            {shortDescription && shortDescription?.length   > 350 ? <div className='text-red-500 mt-2'>Mô tả ngắn chỉ nên nhỏ hơn 300 chữ</div> : ''}
            <div className='text-right text-xl  text-gray-500' >
                {shortDescription===undefined ? 0 : shortDescription?.length}/350 kí tự 
            </div>
        </div>

        <div className='flex flex-col mb-20'>
            <div className='text-gray-500'>Nội dung bài viết</div>
            <Jodit
                    content={content as string} 
                    setContent={setContent} 
                    setImage={setImage}  
                    setLoading={setLoading}               
                />
        </div>

        <div className='flex gap-4 mb-20 justify-end' >
            <button className='p-4  hover:cursor-pointer hover:bg-gray-100 transition font-bold rounded-xl' 
                    onClick = {handleDraft}
                    >
                Xem nháp
            </button>
            <button className='p-4 bg-gray-200 hover:cursor-pointer hover:bg-gray-300 transition font-bold rounded-xl' 
                    onClick={()=>handleSubmit('saved')}>
                Lưu bài viết
            </button>
            <button className='p-4 bg-blue-500 text-white font-bold rounded-xl hover:cursor-pointer hover:bg-blue-600 transition'
                    onClick={()=>handleSubmit('post')}>       
                Đăng bài
            </button>
        </div>

    </div>
    </>
  )
}

export default page