// components/posts-table.tsx

'use client';

import { ColumnDef } from '@tanstack/react-table';

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
import moment from 'moment';
import { Check, Divide, SquarePen, Trash2, UserCog, X } from 'lucide-react';
import { Ellipsis } from 'lucide-react';
import { User } from '@/dataTypes';
import { UserRole } from '@/dataTypes';



interface UsersTableProps {
  data: User[];
  handleDeleteUser: (id: string) => void;
  handleRoleChange: (id: string, role: UserRole, value: boolean) => void;
}

export const UsersTable = ({ data, handleDeleteUser, handleRoleChange }: UsersTableProps) => {

  const columns: ColumnDef<User>[] = [
    {
        accessorKey: "_id",
        header:()=> <div className='font-bold'>ID</div>
    },
    {
        accessorKey: "username",
        header:()=> <div className='font-bold'>Username</div>,
    },
    {
        accessorKey: "img",
        header:()=> <div className='font-bold'>Ảnh đại diện</div>,
        cell: ({row}) => {
            return (
                <div className="w-10 h-10">
                <Image src={row?.original.img||'/user.png'} className="object-cover w-full h-full rounded-full" width={50} height={50} alt="" />
                </div>
            )
        }
    }, 
    {
        accessorKey: "isAdmin",
        header:()=> <div className='font-bold'>Admin</div>,
        cell: ({row}) => {
            return (
                row.getValue('isAdmin')===true?
                <Check className='text-green-500 bg-green-100 p-1 rounded-lg w-10 h-10' />
                :
                <X className='w-10 h-10 text-red-500 p-1 bg-red-100 rounded-lg'/>            
            )
        }
    },
    {
        accessorKey: "isReporter",
        header:()=> <div className='font-bold'>Reporter</div>,
        cell: ({row}) => {
            return (
                row.getValue('isReporter')===true?
                <Check className='text-green-500 bg-green-100 p-1 rounded-lg w-10 h-10' />
                :
                <X className='w-10 h-10 text-red-500 p-1 bg-red-100 rounded-lg'/>              
            )
        }
    },
    {
        id: 'action',
        header:()=> <div className='font-bold'>Chỉnh sửa</div>,
        cell: ({row}) => {
            return (
                <div className="flex justify-start items-center  gap-2">
                    <div className='flex justify-start w-auto items-center gap-1'>
                       
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <div title='Xóa'>
                                    <Trash2 className='w-10 h-10 p-1 text-gray-600 hover:bg-gray-200 transition hover:cursor-pointer rounded-lg ' />
                                </div>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Bạn có chắc chắn muốn xóa user này?</AlertDialogTitle>  
                                </AlertDialogHeader>          
                                <div className='flex justify-center gap-2'>                 
                                <AlertDialogCancel className=''>No</AlertDialogCancel>
                                <AlertDialogAction onClick={()=>handleDeleteUser(row.original._id)} className=''>Yes</AlertDialogAction>
                                </div>              
                            </AlertDialogContent>
                        </AlertDialog>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <div title='Đổi role'>
                                    <UserCog  className='p-1 w-10 h-10 text-blue-500 rounded-lg hover:cursor-pointer hover:bg-blue-100' />
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56 h-auto">
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <div className='p-2 hover:bg-blue-100 rounded-lg hover:cursor-pointer flex gap-2'>
                                            {row.original.isReporter ?
                                                <>
                                                    <X className='text-red-500'/> Bỏ quyền Reporter 
                                                </>
                                            :
                                                <>
                                                    <Check className='text-green-500'/> Cấp quyền Reporter 
                                                </>
                                            }
                                        </div>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                        {row.original.isReporter ?
                                            <AlertDialogTitle>Bạn có chắc chắn muốn bỏ quyền Reporter cho user này?</AlertDialogTitle>  
                                            :
                                            <AlertDialogTitle>Bạn có chắc chắn muốn cấp quyền Reporter cho user này?</AlertDialogTitle>  
                                        }
                                        </AlertDialogHeader>          
                                        <div className='flex justify-center gap-2'>                 
                                        <AlertDialogCancel className=''>No</AlertDialogCancel>
                                        <AlertDialogAction onClick={()=>handleRoleChange(row.original._id,'Reporter',!row.original.isReporter) } className=''>Yes</AlertDialogAction>
                                        </div>              
                                    </AlertDialogContent>
                                </AlertDialog>

                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <div className='p-2 hover:bg-blue-100 rounded-lg hover:cursor-pointer flex gap-2'>
                                        {row.original.isAdmin ?
                                                <>
                                                    <X className='text-red-500'/> Bỏ quyền Admin 
                                                </>
                                            :
                                                <>
                                                    <Check className='text-green-500'/> Cấp quyền Admin 
                                                </>
                                            }
                                        </div>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                        {row.original.isAdmin ?
                                            <AlertDialogTitle>Bạn có chắc chắn muốn bỏ quyền Admin cho user này?</AlertDialogTitle>
                                            :  
                                            <AlertDialogTitle>Bạn có chắc chắn muốn cấp quyền Admin cho user này?</AlertDialogTitle>
                                        }
                                        </AlertDialogHeader>          
                                        <div className='flex justify-center gap-2'>                 
                                        <AlertDialogCancel className=''>No</AlertDialogCancel>
                                        <AlertDialogAction onClick={()=>handleRoleChange(row.original._id,'Admin',!row.original.isAdmin)} className=''>Yes</AlertDialogAction>
                                        </div>              
                                    </AlertDialogContent>
                                </AlertDialog>

                            </DropdownMenuContent>
                        </DropdownMenu>

                        
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

    {
        accessorKey: "updatedAt",
        header:()=> <div className='font-bold'>Ngày cập nhật</div>,
        cell: ({row}) => {
            return (
                moment(row.getValue('updatedAt')).format('DD/MM/YY HH:mm:ss') 
            )
        }
    },
     
  ];

  return <DataTable columns={columns} data={data} />;
};
