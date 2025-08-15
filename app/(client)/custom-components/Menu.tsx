import React from 'react'
import Link from 'next/link'
const Menu = () => {
  return (
    <div className='flex gap-5 font-semibold text-lg text-gray-600  ' >
        <div className='hover:cursor-pointer text-blue-500'>
            Home
        </div>
        <Link href='/xe' className='hover:cursor-pointer'>
            Xe
        </Link>
        <Link href='dien-thoai' className='hover:cursor-pointer'>
            Điện thoại
        </Link>
        <Link href='/forums'>
            Forums
        </Link>
    </div>
  )
}

export default Menu