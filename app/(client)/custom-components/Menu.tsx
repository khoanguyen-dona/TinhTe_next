import React from 'react'

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
    </div>
  )
}

export default Menu