
import React, { useState, useRef, useMemo } from 'react';
import JoditEditor from 'jodit-react';
import toast from 'react-hot-toast';
import { UploadSingleImage } from './UploadSingleImage';

type Props = {
  content: string,
  setContent: (value: string) => void,
  setLoading: (value: boolean) => void , 
  setImage: (value: string) => void
}

const Jodit = ({content, setContent, setLoading, setImage}:Props) => {
  const editor = useRef(null);
	const config = useMemo(() => ({
			readonly: false,
			placeholder: 'Nhập nội dung ...',
      statusbar: false,
      // imageeditor: {
      //   closeAfterSave: true,
      //   crop: true,
      //   resize: false,
      //   width: 500
      // },
  }),[content])

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement >) => {
    const file = e.target.files?.[0] 
    if(file && file.size > 3000000){
      alert('Vui lòng chọn ảnh có kích thước nhỏ hơn 3 MB')
      return
    }
    if(file){
        try {
          setLoading(true)       
          const imgUrl = await UploadSingleImage({imageFile: file, uploadPath: 'post'})
          setImage(imgUrl)
            
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