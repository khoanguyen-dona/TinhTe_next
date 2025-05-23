import React from 'react'
import { categories } from '@/data'
import { MessagesSquare } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import CategoryItem from '../custom-components/CategoryItem'


const page = () => {
  return (
    <div className='p-4 w-full mt-24 h-auto  flex flex-col'>
        <div className='flex flex-col rounded-lg p-2 bg-orange-300'>
            <div className='font-bold'>
                Diễn đàn
            </div>
            <div >
                Tập hợp các forums của TinhTe
            </div>
        </div>

        {categories.map((category,index)=>(     
            <CategoryItem category={category} key={index} />
        ))
        }
       

    </div>
  )
}

export default page