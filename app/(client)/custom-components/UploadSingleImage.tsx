import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL,
  } from "firebase/storage";
import app from '@/firebase'
import imageCompression from 'browser-image-compression'

type Props = {
  imageFile: File,
  uploadPath: string
}

export async function UploadSingleImage({imageFile, uploadPath}:Props):Promise<string>  {
        const now = new Date()
        const currentMonth = now.getMonth() + 1
        const currentYear = now.getFullYear()    
        const storage = getStorage(app)       
        const options = {
            maxSizeMB: 0.5,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
        }
    
        const compressedFile = await imageCompression(imageFile, options);
        let imageName = new Date().getTime() + imageFile.name 
        let imageRef = ref(storage, `${uploadPath}/${currentMonth}-${currentYear}/${imageName}`)
      
        await uploadBytes(imageRef, compressedFile)
        const img_URL = await getDownloadURL(imageRef)           
        return img_URL;
}


