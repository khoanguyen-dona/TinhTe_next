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
import { useState } from 'react'
import { publicRequest } from '@/requestMethod'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { Loader } from 'lucide-react';
import { useDispatch } from 'react-redux'
import { setAccessToken, setUser } from '@/redux/userRedux'

const formSchema = z.object({
    email: z.string().email('This is not a email').min(4).max(50),
    password: z.string().min(4).max(100)
  })

const page = () => {
    const dispatch = useDispatch()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [seePassword, setSeePassword] = useState<true|false>(false)
  
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password:''
        },
    })
     
    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true)
        try {
            const res = await publicRequest.post('/auth/login',{
                email: values.email,
                password: values.password
            })
            if(res.data){        
                dispatch(setUser(res.data.data))
                dispatch(setAccessToken(res.data.accessToken))
                toast.success("Đăng nhập thành công")
                router.push('/admin')
            }
        } catch(err){
            toast.error('Lỗi, vui lòng thử lại')           
            console.log('err while handle submit',err)
        } finally {
            setLoading(false)
        }
    }
    const handleLoginWithGoogle = () => {
        setLoading(true)
        window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/google`
    }

  return (
    <div className={` h-screen 200 flex justify-center items-center `}>
        <Form {...form}>
            <div className='flex flex-col p-4 gap-8 w-5/6  md:w-2/3 lg:w-1/2 xl:w-1/3 mt-0 h-auto bg-white rounded-xl border-2 border-gray-200 shadow-2xl'>
                <div className='font-bold text-center text-2xl'>Đăng nhập</div>
                <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Input className='p-6  border-gray-200 '  placeholder="Email" {...field} />
                            </FormControl>
                            <FormMessage className='text-red-500'/>
                        </FormItem>                     
                      
                    )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                        <FormItem>
                            <FormControl >
                                <div className='relative'>
                                    <Input className='p-6  border-gray-200' type={seePassword?'password':'text'} placeholder="Password" {...field} />
                                    {seePassword?
                                    <img src="/hidden.png" onClick={()=>setSeePassword(!seePassword)} className='opacity-50 w-6 h-6 absolute top-3 right-2' alt="" />
                                    :<img src="/eye.png" onClick={()=>setSeePassword(!seePassword)}  className='opacity-50 w-6 h-6 absolute top-3 right-2' alt="" />}
                                </div>
                            </FormControl>
                            <FormMessage className='text-red-500' />
                        </FormItem>                     
                    )}
                    />
                    <Button 
                        disabled={loading} type="submit" 
                        className='bg-blue-500 text-white w-full p-6 text-lg font-bold hover:bg-blue-600 hover:cursor-pointer'>
                        {loading && <Loader  className='animate-spin'/>}
                        Đăng nhập
                        </Button>

                </form>
                

            </div>
        </Form>
    </div>
  )
}

export default page