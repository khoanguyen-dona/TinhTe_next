import React from 'react'

const ThreeDotLoading = ({className}:any) => {
  return (
    <div className={`flex justify-center items-center gap-2  `}> 
      <div className={` bg-gray-500 rounded-full shadow-lg animate-bounce [animation-delay:-0.3s] mt-2 ${className}`}></div>
      <div className={` bg-gray-500 rounded-full shadow-lg animate-bounce [animation-delay:-0.15s] mt-2 ${className} `}></div>
      <div className={` bg-gray-500 rounded-full shadow-lg animate-bounce mt-2 ${className}`}></div>
    </div>
  )
}

export default ThreeDotLoading