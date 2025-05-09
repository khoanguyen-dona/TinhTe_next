'use client'
import React from 'react'
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useState } from 'react'
import { publicRequest } from '@/requestMethod'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { Loader } from 'lucide-react';
import { useDispatch } from 'react-redux'
import { setUser } from '@/redux/userRedux'
import { RootState } from '@/redux/store'
import { useSelector } from 'react-redux'
import { User } from '@/dataTypes'

import {
    getStorage,
    ref,
    uploadBytes,
    uploadBytesResumable,
    getDownloadURL,
    deleteObject,
  } from "firebase/storage";
import app from '@/firebase'
import Image from 'next/image'

const form1Schema = z.object({
    username: z.string().min(4).max(100),
    img: z.string().min(0).max(100),

  })

const form2Schema = z.object({
    password: z.string().min(4).max(100),
    password1: z.string().min(4).max(100),
    password2: z.string().min(4).max(100),

})

const page = () => {

    const storage = getStorage(app)
    const dispatch = useDispatch()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [password, setPassword] = useState<string>('')
    const [password1, setPassword1] = useState<string>('')
    const [password2, setPassword2] = useState<string>('')
    const [seePassword, setSeePassword] = useState<true|false>(true)
    const user: User|null = useSelector((state: RootState)=>state.user.currentUser)

    const [imageFile, setImageFile] = useState<File|''>('')
    const [previewImage, setPreviewImage] = useState<string|''>(user?.img as string)

    const form1 = useForm<z.infer<typeof form1Schema>>({
        resolver: zodResolver(form1Schema),
        defaultValues: {
            username: user?.username as string, 
            img: '',
        },
    })
    const form2 = useForm<z.infer<typeof form2Schema>>({
        resolver: zodResolver(form2Schema),
        defaultValues: {
            password: '',
            password1: '',
            password2: ''
        },
    })
     

    const handleAvatar = (e: React.ChangeEvent<HTMLInputElement > ) => {
        const file = e.target.files?.[0] 
        if(file){
            setImageFile(file)    
            const image_URL = URL.createObjectURL(file)
            setPreviewImage(image_URL)
        }
    }

    // handle update user 
    async function onSubmit(values: z.infer<typeof form1Schema>) {
        console.log('cliked')
        
        //remove avatar img in firebase
        const handleRemoveAvatar = async () =>{
            const imageRef = ref(storage, user?.img)
            try {
                await deleteObject(imageRef)
            } catch(err){
                console.log('err delete image in firebase',err)
            }
        }

        // update data in mongodb
        const handleUpdateUser = async (imgUrl: string|'') => {
            try {
                if(imgUrl !== ''){
                    const res = await publicRequest.put(`/user/${user?._id}`,{
                        username: values.username,
                        img: imgUrl
                    })
                    if(res.data){        
                        dispatch(setUser(res.data.data))
                        toast.success("Cập nhật thành công")
                        router.push('/account')
                    }
                    await handleRemoveAvatar()
                } else {
                    const res = await publicRequest.put(`/user/${user?._id}`,{
                        username: values.username,
                    })
                    if(res.data){        
                        dispatch(setUser(res.data.data))
                        toast.success("Cập nhật thành công")
                        router.push('/account')
                    }
                }
                
            } catch(err){
                toast.error('Lỗi')           
                console.log('err while handle submit',err)
            } finally {
                setLoading(false)
            }
        }
    
        // upload image to firebase
        const uploadImageToFirebase =  async() => {
            setLoading(true)
            if(imageFile !== '' && imageFile !==undefined && imageFile instanceof File){
                let imageName = new Date().getTime() + imageFile.name
                let imageRef = ref(storage, `avatar/${imageName}`)
                try{
                    await uploadBytes(imageRef, imageFile)
                    const downloadURL = await getDownloadURL(imageRef)
                    await handleUpdateUser(downloadURL as string)
                } catch (err){
                    toast.error('error uploading avatar to firebase')
                    console.log('error uploading avatar to firebase', err)
                }
            } else {
                try{
                  handleUpdateUser('')
                } catch(err){
                  toast.success('Lỗi')
                  console.log('error uploading avatar to firebase', err)
                }
            }
        }
        await uploadImageToFirebase()     
    }

    // update password
    async function updatePassword(values: z.infer<typeof form2Schema>) {
        if(password1 !== password2){
            toast.error('Lỗi')
        } else {      
            setLoading(true)
            try {
                const res = await publicRequest.put(`/user/${user?._id}/update-password`,{
                    password: values.password,
                    password1: values.password1,
                    password2: values.password2,             
                })
                if(res.status===200){        
                    toast.success("Cập nhật thành công")
                    router.push('/account')
                    setPassword('')
                    setPassword1('')
                    setPassword2('')

                } else {
                    toast.error(res.data.message)

                }
            } catch(err){
                toast.error('Sai mật khẩu')           
                console.log('err while handle submit',err)
            } finally {
                setLoading(false)
            }
        }
    }
    console.log('img File',imageFile)
    console.log('previewImage',previewImage)
   

  return (
    <div className={` h-220 bg-white flex flex-col justify-center items-center
        `}>
        <Form {...form1}>
            <div className='flex flex-col p-4 gap-8 w-5/6  md:w-2/3 lg:w-1/2 xl:w-1/3 mt-0 h-auto '>
                <div className='font-bold text-center text-2xl'>Tài khoản</div>
                <form onSubmit={form1.handleSubmit(onSubmit)} className='space-y-8'>
                    <FormField
                            control={form1.control}
                            name="img"
                            render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    
                                    <>
                                        <p className='text-sm text-gray-500  text-left' >Ảnh đại diện </p>

                                        <div className='text-center'>
                                            <label className=' w-1/4  rounded-lg border-2 border-blue-200  font-semibold hover:bg-blue-200  hover:cursor-pointer p-2 transition' 
                                                    htmlFor="thumbnail">
                                                Chọn ảnh
                                                {/* <input  className='hidden' type="file" id='thumbnail' onChange={handleAvatar} /> */}
                                                <Input 
                                                    className='p-6 hidden border-gray-200 ' 
                                                    onChangeCapture={handleAvatar} id='thumbnail' type='file'  placeholder="chọn" {...field} />
                                            </label>
                                        </div>
                                        
                                        {previewImage  && 
                                            <div className='relative flex justify-center  ' >       
                                                <Image width={100} height={100} 
                                                    className='w-32 h-32 mt-3 border-2 rounded-full  object-cover  ' alt='avatar' src={previewImage }  />                                                                   
                                            </div>                                                      
                                        } 
                                    </>
                                </FormControl>
                                <FormMessage className='text-red-500'/>
                            </FormItem>                     
                        
                    )}
                    />
                    <FormField
                        control={form1.control}
                        name="username"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel className='text-gray-500'>Username</FormLabel>
                            <FormControl>
                                <Input className='p-6  border-gray-200 '    placeholder="" {...field} />
                            </FormControl>
                            <FormMessage className='text-red-500'/>
                        </FormItem>                     
                      
                    )}
                    />
                    <div className='space-y-1 '>
                        <div className='text-gray-500 text-sm'>Email</div>
                        <div className='p-3 border-1 bg-gray-200 border-gray-200 rounded-lg' >{user?.email}</div>
                    </div>
                    
                    <Button 
                        disabled={loading} type="submit" 
                        className='bg-blue-500 text-white w-full p-6 text-lg font-bold hover:bg-blue-600 hover:cursor-pointer'>
                        {loading && <Loader  className='animate-spin'/>}
                        Cập nhật
                    </Button>
                </form>               
            </div>
        </Form>

        <Dialog>
            <DialogTrigger asChild>
                <Button variant='outline' className='hover:cursor-pointer hover:bg-blue-200 font-semibold border-blue-200 p-5 mt-10 text-lg '>
                    Đổi mật khẩu
                </Button>
            </DialogTrigger>
            <DialogContent className="">
                <DialogHeader>
                    <DialogTitle className='text-center'>Đổi mật khẩu</DialogTitle> 
                </DialogHeader>

                <Form {...form2}>
                    <div className='flex flex-col p-4 gap-8 w-full mt-0 h-auto '>

                        <form onSubmit={form2.handleSubmit(updatePassword)} className='space-y-8'>
                            <FormField
                                control={form2.control}
                                name="password"
                                render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <div className='relative'>
                                            <Input 
                                                type={seePassword?'password':'text'}
                                                className='p-6  border-gray-200 ' 
                                                onChangeCapture={(e)=>setPassword(e.currentTarget.value)}   
                                                placeholder="password cũ" {...field} 
                                            />
                                            {seePassword?
                                                <img src="/hidden.png" onClick={()=>setSeePassword(!seePassword)} className='opacity-50 w-6 h-6 absolute top-3 right-2' alt="" />
                                                :<img src="/eye.png" onClick={()=>setSeePassword(!seePassword)}  className='opacity-50 w-6 h-6 absolute top-3 right-2' alt="" />
                                            }
                                        </div>
                                    </FormControl>
                                    <FormMessage className='text-red-500'/>
                                </FormItem>                     
                            
                            )}
                            />
                             <FormField
                                control={form2.control}
                                name="password1"
                                render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <div className='relative'>
                                            <Input
                                                type={seePassword?'password':'text'}
                                                className='p-6  border-gray-200 ' 
                                                onChangeCapture={(e)=>setPassword1(e.currentTarget.value)}   
                                                placeholder="password mới" {...field} 
                                            />
                                            {seePassword?
                                                <img src="/hidden.png" onClick={()=>setSeePassword(!seePassword)} className='opacity-50 w-6 h-6 absolute top-3 right-2' alt="" />
                                                :<img src="/eye.png" onClick={()=>setSeePassword(!seePassword)}  className='opacity-50 w-6 h-6 absolute top-3 right-2' alt="" />}
                                        </div>
                                    </FormControl>
                                    {password1!==password2 && <div className='text-red-500'>Password phải giống nhau</div>}
                                    <FormMessage className='text-red-500'/>
                                </FormItem>                     
                            
                            )}
                            />
                             <FormField
                                control={form2.control}
                                name="password2"
                                render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <div className='relative'>
                                            <Input 
                                                type={seePassword?'password':'text'}
                                                className='p-6  border-gray-200 ' 
                                                onChangeCapture={(e)=>setPassword2(e.currentTarget.value)}   
                                                placeholder="Nhập lại password mới" {...field} />
                                            {seePassword?
                                                <img src="/hidden.png" onClick={()=>setSeePassword(!seePassword)} className='opacity-50 w-6 h-6 absolute top-3 right-2' alt="" />
                                                :<img src="/eye.png" onClick={()=>setSeePassword(!seePassword)}  className='opacity-50 w-6 h-6 absolute top-3 right-2' alt="" />}
                                        </div>
                                    </FormControl>
                                    {password1!==password2 && <div className='text-red-500'>Password phải giống nhau</div>}
                                    <FormMessage className='text-red-500'/>
                                </FormItem>                     
                            
                            )}
                            />
                                          
                            <Button 
                                disabled={loading||password1!==password2||password===''||password1===''||password2===''} type="submit" 
                                className='bg-blue-500 text-white w-full p-6 text-lg font-bold hover:bg-blue-600 hover:cursor-pointer'>
                                {loading && <Loader  className='animate-spin'/>}
                                Cập nhật
                            </Button>
                        </form>               
                    </div>
                </Form>              
            </DialogContent>
        </Dialog>
    </div>
  )
}

export default page