
import React from 'react'

const page = () => {
   
    
  return (
    <div className={` h-screen bg-gray-200 flex justify-center items-center bg-no-repeat bg-cover bg-center
         bg-[url('https://img.freepik.com/free-photo/close-up-pretty-flowers-with-blurred-person-background_23-2147604837.jpg?size=626&ext=jpg')] `}>

        <div className='flex flex-col p-4 gap-10 w-5/6  md:w-2/3 lg:w-1/2 xl:w-1/3 mt-0 h-auto bg-white rounded-xl border-2 border-gray-200 shadow-2xl' >
            <div className='flex gap-2 bg-green-200 rounded-lg p-4'>
                <img src="/check.png" className='w-8 h-8 ' alt="" />
                <h1 className='text-2xl text-green-500 font-bold text-center' >Đăng kí tài khoản thành công</h1>
            </div>
            <p>Tài khoản của bạn đã được tạo thành công !</p>
            <div className='flex justify-center items-center'>
                <a href='/login'      
                   className='bg-blue-500 w-1/3 p-6 hover:cursor-pointer text-center hover:bg-blue-600 transition text-white rounded-lg font-bold text-lg'
                >
                    Đăng nhập
                </a>
            </div>
                      
        </div>
    </div>
  )
}

export default page