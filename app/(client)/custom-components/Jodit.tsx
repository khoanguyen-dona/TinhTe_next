
import React, { useState, useRef, useMemo } from 'react';
import JoditEditor from 'jodit-react';
import {
  getStorage,
  ref,
  deleteObject,
  uploadBytesResumable,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import app from '@/firebase'
import toast from 'react-hot-toast';
import imageCompression from 'browser-image-compression';


type Props = {
  content: string,
  setContent: (value: string) => void,
  setLoading: (value: boolean) => void , 
  setImage: (value: string) => void
}

const Jodit = ({content, setContent, setLoading, setImage}:Props) => {
  const editor = useRef(null);
	const storage= getStorage(app)

  const now = new Date();

  const currentMonth = now.getMonth() + 1; // Months are zero-based (0 = Jan, 11 = Dec)
  const currentYear = now.getFullYear();

	const config = useMemo(() => ({
			readonly: false,
			placeholder: 'Nhập nội dung ...',
      statusbar: false,
      imageeditor: {
        closeAfterSave: true,
        crop: true,
        resize: false,
        width: 500
      }

  }),[content])
  
  // const handleImage = async (e: React.ChangeEvent<HTMLInputElement >) => {

  //       const file = e.target.files?.[0]
  //       if(file && file.size > 3000000){
  //         alert('Vui lòng chọn ảnh có kích thước nhỏ hơn 3 MB')

  //         return
  //       }
  //       if(file){
  //           let imageName = new Date().getTime() + file.name 
  //           let imageRef = ref(storage, `post/${currentMonth}-${currentYear}/${imageName}`)
  //           try {
  //               setLoading(true)
  //               await uploadBytes(imageRef, file)
  //               const img_URL = await getDownloadURL(imageRef)
  //               console.log(img_URL)
  //               setImage(img_URL)
                
  //           } catch (err){
  //               toast.error('lỗi')
  //               console.log('error loading file to firebase', err)
  //           }  finally {
  //               setLoading(false)
  //           }  
  //       } 
  // }

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement >) => {
    const file = e.target.files?.[0] 
    if(file && file.size > 3000000){
      alert('Vui lòng chọn ảnh có kích thước nhỏ hơn 3 MB')
      return
    }
    if(file){
        const options = {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        }
        const compressedFile = await imageCompression(file, options);
        let imageName = new Date().getTime() + file.name 
        let imageRef = ref(storage, `post/${currentMonth}-${currentYear}/${imageName}`)
        try {
            setLoading(true)
            await uploadBytes(imageRef, compressedFile)
            const img_URL = await getDownloadURL(imageRef)
            console.log(img_URL)
            setImage(img_URL)
            
        } catch (err){
            toast.error('lỗi')
            console.log('error loading file to firebase', err)
        }  finally {
            setLoading(false)
        }  
    } 
}

	return (
  <div className='flex flex-col    gap-2 ' >
    <div className='w-full border-1' >
		  <JoditEditor
        ref={editor}
        value={content}
        config={config}
        tabIndex={1} // tabIndex of textarea
        onBlur={newContent => setContent(newContent)} // preferred to use only this option to update the content for performance reasons
        onChange={newContent =>{}}
      />
    </div>

    <div className='flex flex-col justify-end' >
      <label 
        title='Thêm ảnh'
        className='hover:bg-blue-100   rounded-lg p-1 hover:cursor-pointer flex flex-col w-12  transition  ' 
        htmlFor="content-image"
        >
          <img
              src='/upload.png'
              alt='Thêm ảnh'
              className='  w-12 hover:cursor-pointer object-cover   rounded-lg '        
          />
            
            <input  className='hidden' type="file"  accept='image/*' onChange={handleImage} id='content-image' />
        </label>  
    
    </div>

  </div>
	);
}

export default Jodit