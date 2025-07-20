import React from 'react'

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
        <h1 className="text-3xl font-bold text-red-600 mb-4">404 - Bài viết không tìm thấy</h1>
        <p className="text-gray-700">Xin lỗi, bài viết bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
    </div>
  )
}

export default NotFound