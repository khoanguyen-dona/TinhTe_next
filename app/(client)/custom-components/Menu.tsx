import React from 'react'
import Link from 'next/link'
const Menu = () => {
  return (
    <div className='flex gap-5 font-semibold text-lg text-gray-600  ' >
        <div className='hover:cursor-pointer text-blue-500'>
            Home
        </div>
        <div className='hover:cursor-pointer'>
            Audio
        </div>
        <div className='hover:cursor-pointer'>
            Xe
        </div>
        <div className='hover:cursor-pointer'>
            Điện thoại
        </div>
        <Link href='/forums'>
            Forums
        </Link>
    </div>
  )
}

export default Menu