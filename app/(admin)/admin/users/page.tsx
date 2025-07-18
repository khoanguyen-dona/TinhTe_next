'use client'
import React from 'react'
import { useEffect, useState } from 'react';
import { useSidebar } from '@/components/ui/sidebar';
import {  User } from '@/dataTypes';
import {  userRequest } from '@/requestMethod';
import { ChevronLeft } from 'lucide-react';
import { ChevronRight } from 'lucide-react';
import { Loader } from 'lucide-react';
import { RootState } from '@/redux/store';
import {  useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { UserRole } from '@/dataTypes';
import { UsersTable } from '@/app/(client)/custom-components/table/users-table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


const page = () => {
    const user = useSelector((state: RootState)=>state.user.currentUser)
    console.log(user)
    // const {state} = useSidebar()
    const [users, setUsers] = useState<User[]|undefined>(undefined)
    const [page, setPage] = useState<number>(1)
    const [limit, setLimit] = useState<number>(10)
    const [loading, setLoading] = useState<boolean>(false)
    const [totalPage, setTotalPage] = useState<number>()
    const [reload, setReload] = useState<boolean>(false)
    
     

    useEffect(()=>{
        const getUsers = async ()=>{
            setLoading(true)
            const res = await userRequest.get(`/user?page=${page}&limit=${limit}&isAdmin=&isReporter=`)
            if (res.data){
                setUsers(res.data.users)
                setTotalPage(res.data.totalPage)
                setLoading(false)
            }
        }
        getUsers()
    },[page, limit, reload])
 

    const handleDeleteUser = async (userId: string) => {
        try{
          setLoading(true)
          const res = await userRequest.delete(`/user/${userId}`)
          if(res.status===200){
            setReload(!reload)
            toast.success('Xóa thành công')
          }
        } catch(err){
          toast.error('Lỗi')
        } finally {
          setLoading(false)
        }
    }

    const handleRoleChange = async (userId: string, role: UserRole ,value: boolean) => {    
        setLoading(true)      
        if(role==='Admin'){
            try{
                const res = await userRequest.put(`/user/${userId}`,{
                    isAdmin: value
                })
                if(res.status===200){
                    setReload(!reload)
                    toast.success('Cập nhật thành công')
                }
            } catch(err){
                toast.error('Lỗi ')
            } finally {
                setLoading(false)
            }
        }
        if(role==='Reporter'){
            try{
                const res = await userRequest.put(`/user/${userId}`,{
                    isReporter: value
                })
                if(res.status===200){
                    setReload(!reload)
                    toast.success('Cập nhật thành công')
                }
            } catch(err){
                toast.error('Lỗi ')
            } finally {
                setLoading(false)
            }
        }
            
    }

    const handlePageLimit = async (number: number) =>{
        setLimit((number))
        setPage(1)
      } 

    return (
        
        <div className='flex justify-center px-2 md:px-8  w-screen'> 
        
            {loading && 
          
                <div className={` fixed top-0  z-20 w-full h-full bg-white opacity-50 `} >
                    <div className='absolute inset-0 flex items-center justify-center'>
                        <Loader className=' animate-spin w-14 h-14   '/>
                    </div>
                </div>
               
            }

            <div className='w-full  h-auto  flex flex-col justify-center   space-y-10 mt-10' >
      

                    <div className='font-bold text-2xl text-center'>
                        Users  
                    </div>

                    {/* <div className=''>

                    </div> */}

                    <div className='w-full' >
                        {users!==undefined &&    
                            <UsersTable  data={users} handleDeleteUser={handleDeleteUser} handleRoleChange={handleRoleChange} />
                        }
                    </div>

                    <div className=' flex justify-end '>
                      <div className='flex items-center gap-2'>
                          <div>Page limit: </div>
                        
                          <Select onValueChange={(value)=>handlePageLimit(Number(value))} defaultValue={'10'} >
                            <SelectTrigger className="w-auto">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="10">10</SelectItem>
                              <SelectItem value='20'>20</SelectItem>
                              <SelectItem value="40">40</SelectItem>
                              <SelectItem value="50">50</SelectItem>
                              <SelectItem value="100">100</SelectItem>
                            </SelectContent>
                          </Select>

                      </div>                       
                    </div>

                    <div className='flex justify-center items-center gap-4 '>
                        <button disabled={page===1} >
                            <ChevronLeft  onClick={()=>setPage(prev=>prev-1)} className={`p-1 w-10 h-10  rounded-lg ${page===1?'opacity-20':'hover:text-blue-500 hover:cursor-pointer transition hover:bg-blue-100'}  `} />
                        </button>

                            {/* @ts-ignore */}
                        <Select onValueChange={(value)=>setPage(Number(value))} value={page} >
                          <SelectTrigger className="w-auto">
                            <SelectValue placeholder={page} />
                          </SelectTrigger>
                          <SelectContent>
                            {Array?.from({length: totalPage as number}, (_, index)=>(
                              // @ts-ignore
                              <SelectItem key={index} value={index+1}>{index+1}</SelectItem>   
                              ) )
                            }
                          </SelectContent>
                        </Select>
                        
                        <button disabled={page===totalPage}>
                            <ChevronRight onClick={()=>setPage(prev=>prev+1)} className={`p-1 w-10 h-10 rounded-lg ${page===totalPage?'opacity-20':'hover:text-blue-500 hover:cursor-pointer transition hover:bg-blue-100'}  `}/>
                        </button>
                    </div>

            </div>
        </div>
    )
}

export default page