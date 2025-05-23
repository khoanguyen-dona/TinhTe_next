// components/posts-table.tsx

'use client';

import { ColumnDef } from '@tanstack/react-table';
import { categories } from '@/data';
import { Post } from '@/dataTypes';// adjust to your Post type location
import { useState } from 'react';
import { DataTable } from '@/app/(client)/custom-components/table/data-table'; 
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import Image from 'next/image';
import { Check, SquarePen, Trash2, X } from 'lucide-react';
import { Ellipsis } from 'lucide-react';
import moment from 'moment';
import { RootState } from '@/redux/store';
import { useSelector } from 'react-redux';

interface PostsTableProps {
  data: Post[];
  onDelete: (id: string) => void;
  handleApprove: (id: string, value:boolean) => void;
}



export const PostsTable = ({ data, onDelete, handleApprove }: PostsTableProps) => {

    const user = useSelector((state: RootState)=>state.user.currentUser) 

  const columns: ColumnDef<Post>[] = [
    {
        accessorKey: "title",
        header: 'Tiêu đề',
        cell: ({row}) =>{
            return (             
                <textarea 
                    onClick={()=>{window.open(`/post/${row.original.title.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/(^-|-$)/g, '')}/${row.original._id}`,'_blank')}}  
                    readOnly 
                    className="resize-none w-80 h-20 border-none font-semibold hover:cursor-pointer hover:text-blue-500" value={row.getValue('title')} 
                />        
            )
        }
    },
    {
        accessorKey: "thumbnail",
        header: "Ảnh đại diện",
        cell: ({row}) => {
            return (
                <div className="w-30 h-20">
                <Image src={row?.original.thumbnail} className="object-cover w-full h-full rounded-lg" width={70} height={70} alt="" />
                </div>
            )
        }
    },
    {
        accessorKey: "category",
        header: "Category",
        cell: ({row})=>{
            return (
                    <div>
                {categories.map((category)=>(
                    category.value===row.original.category?category.title:''
                ))}
                </div>
            )
        }
    },
    {
        accessorKey: "view",
        header: "View"
    },
    {
        accessorKey: "isApproved",
        header: "Phê duyệt",
        cell: ({row}) => {
            return (
                row.getValue('isApproved')===true?
                <Check className='text-green-500 bg-green-100 p-1 rounded-lg w-10 h-10' />
                :
                <X className='w-10 h-10 text-red-500 p-1 bg-red-100 rounded-lg'/>            
            )
        }
    },
    {
        accessorKey: "isPosted",
        header: "Đăng bài",
        cell: ({row}) => {
            return (
                row.getValue('isPosted')===true?
                <Check className='text-green-500 bg-green-100 p-1 rounded-lg w-10 h-10' />
                :
                <X className='w-10 h-10 text-red-500 p-1 bg-red-100 rounded-lg'/>              
            )
        }
    },
    {
        id: 'action',
        header: 'Chỉnh sửa',
        cell: ({row}) => {
            return (
                <div className="flex justify-start items-center  gap-2">
                    <div className='flex justify-start w-auto items-center gap-1'>
                        <div title='Chỉnh sửa'>
                            <SquarePen onClick={()=>{window.open(`/edit-post/${row.original._id}`,'_blank')}} className='w-10 h-10 p-1  rounded-lg hover:bg-blue-100 text-blue-500 transition hover:cursor-pointer'  />
                        </div>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <div title='Xóa'>
                                    <Trash2 className='w-10 h-10 p-1 text-gray-600 hover:bg-gray-200 transition hover:cursor-pointer rounded-lg ' />
                                </div>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Bạn có chắc chắn muốn xóa bài viết này?</AlertDialogTitle>  
                                </AlertDialogHeader>          
                                <div className='flex justify-center gap-2'>                 
                                <AlertDialogCancel className=''>No</AlertDialogCancel>
                                <AlertDialogAction onClick={()=>onDelete(row.original._id)} className=''>Yes</AlertDialogAction>
                                </div>              
                            </AlertDialogContent>
                        </AlertDialog>
                        {

                        user?.isAdmin &&
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Ellipsis  className='p-1 w-10 h-10 rounded-lg hover:cursor-pointer hover:bg-gray-200' />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56 h-auto">
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <div className='p-2 hover:bg-blue-100 rounded-lg hover:cursor-pointer flex gap-2'>
                                        <Check className='text-green-500' /> Phê duyệt 
                                        </div>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                        <AlertDialogTitle>Bạn có chắc chắn muốn phê duyệt bài viết này?</AlertDialogTitle>  
                                        </AlertDialogHeader>          
                                        <div className='flex justify-center gap-2'>                 
                                        <AlertDialogCancel className=''>No</AlertDialogCancel>
                                        <AlertDialogAction onClick={()=>handleApprove(row.original._id,true)} className=''>Yes</AlertDialogAction>
                                        </div>              
                                    </AlertDialogContent>
                                </AlertDialog>

                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <div className='p-2 hover:bg-blue-100 rounded-lg hover:cursor-pointer flex gap-2'>
                                            <X className='text-red-500 '/> Bỏ phê duyệt
                                        </div>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                        <AlertDialogTitle>Bạn có chắc chắn muốn bỏ phê duyệt bài viết này?</AlertDialogTitle>  
                                        </AlertDialogHeader>          
                                        <div className='flex justify-center gap-2'>                 
                                        <AlertDialogCancel className=''>No</AlertDialogCancel>
                                        <AlertDialogAction onClick={()=>handleApprove(row.original._id,false)} className=''>Yes</AlertDialogAction>
                                        </div>              
                                    </AlertDialogContent>
                                </AlertDialog>

                            </DropdownMenuContent>
                        </DropdownMenu>
                        }   
                        
                    </div>
                </div>
            )
        }
    },
    {
        accessorKey: "createdAt",
        header: "Ngày tạo",
        cell: ({row}) => {
            return (
                moment(row.getValue('createdAt')).format('DD/MM/YY HH:mm:ss') 
            )
        }
    },

    {
        accessorKey: "updatedAt",
        header: "Ngày cập nhật",
        cell: ({row}) => {
            return (
                moment(row.getValue('updatedAt')).format('DD/MM/YY HH:mm:ss') 
            )
        }
    },
    {
        accessorKey: "authorId",
        header: "Tác giả",
        cell: ({row}) => {
            return (
                <div className="flex flex-col gap-2 justify-center items-center">
                    <Image alt='' width={40} height={40} className="w-10 h-10 object-cover rounded-full " src={row.original.authorId.img} />
                    <div className="font-bold">
                        {row.original.authorId.username}
                    </div>
                </div>
            )
        }
    },
  ];

  return <DataTable columns={columns} data={data} />;
};
