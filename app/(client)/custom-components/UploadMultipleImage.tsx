import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL,
  } from "firebase/storage";
import app from '@/firebase'
import imageCompression from 'browser-image-compression'

type Props = {
  imageFiles: File[],
  uploadPath: string
}

export async function UploadMultipleImage({imageFiles, uploadPath}:Props):Promise<string[]>  {
        const now = new Date()
        const currentMonth = now.getMonth() + 1
        const currentYear = now.getFullYear()    
        const storage = getStorage(app)       
        const options = {
            maxSizeMB: 0.5,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
        }

        let array: string[] = [];

        for (const file of imageFiles) {
            try{
                const compressedFile = await imageCompression(file, options);
                const imageName = new Date().getTime() + file.name;
                const imageRef = ref(storage, `${uploadPath}/${currentMonth}-${currentYear}/${imageName}`);
                
                await uploadBytes(imageRef, compressedFile);
                const img_URL = await getDownloadURL(imageRef); 
                array.push(img_URL);
            } catch(err){
                console.log('error upload to firebase',err)
            }
        }
      
        return array;
}


