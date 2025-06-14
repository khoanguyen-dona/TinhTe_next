'use client'
import React from 'react'
import { useEffect, useState } from 'react';
import { useSidebar } from '@/components/ui/sidebar';

const page = () => {
  const {state} = useSidebar()
  console.log(state)
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);

    handleResize(); // initial width
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className= 'flex justify-center p-2 md:px-8  w-screen '  >
      <div className='w-full  h-auto  flex flex-col justify-center items-center  space-y-10 mt-10 bg-red-100'>
        <div className='text-2xl'>
          Home 
        </div>
      </div>
    </div>
  )
}

export default page