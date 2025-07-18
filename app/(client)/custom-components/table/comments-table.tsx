// components/posts-table.tsx

'use client';

import { ColumnDef } from '@tanstack/react-table';

import { CommentType, Post } from '@/dataTypes';// adjust to your Post type location
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
import moment from 'moment';
import { Check, Divide, SquarePen, Trash2, UserCog, X } from 'lucide-react';
import { Ellipsis } from 'lucide-react';
import { User } from '@/dataTypes';
import { UserRole } from '@/dataTypes';



interface CommentsTableProps {
  data: CommentType[];
  handleDelete: (id: string) => void;

}

export const CommentsTable = ({ data, handleDelete }: CommentsTableProps) => {

  const columns: ColumnDef<CommentType>[] = [
    {
        accessorKey: "_id",
        header:()=> <div className='font-bold'>Comment ID</div>
    },
    {
        accessorKey: "userId",
        header:()=> <div className='font-bold'>Author</div>,
        cell: ({row}) => {
            return (
                //@ts-ignore
                row.original.userId.username           
            )
        }
    },
    {
        accessorKey: "content",
        header:()=> <div className='font-bold w-60 md:w-100 xl:w-200 '>Nội dung</div>,
        cell: ({row}) => {
            return (     
                <textarea className='w-60 md:w-100 xl:w-200 h-20 resize-none border-none flex justify-center  items-center' readOnly value={row.original.content} />               
     
            )
        }
    },
    {
        id: 'action',
        header:()=> <div className='font-bold'>Chỉnh sửa</div>,
        cell: ({row}) => {
            return (
                <div className="flex justify-start items-center  gap-2  ">
                    <div className='flex justify-start w-auto items-center gap-1'>
                       
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
                                    <AlertDialogAction onClick={()=>handleDelete(row.original._id)} className=''>Yes</AlertDialogAction>
                                </div>              
                            </AlertDialogContent>
                        </AlertDialog>
                        
                    </div>
                </div>
            )
        }
    },
    {
        accessorKey: "createdAt",
        header:()=> <div className='font-bold'>Ngày tạo</div>,
        cell: ({row}) => {
            return (
                moment(row.getValue('createdAt')).format('DD/MM/YY HH:mm:ss') 
            )
        }
    },
     
  ];

  return <DataTable columns={columns} data={data} />;
};
