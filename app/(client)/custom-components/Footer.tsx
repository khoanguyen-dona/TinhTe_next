import React from 'react'

const Footer = () => {
  return (
  <div className='w-full text-[12px]  '>
    <div className=' flex flex-col h-64   ' >
      <div className='flex flex-wrap gap-10 p-6  justify-center  font-semibold bg-blue-500 text-white' >
          <div>TIN MỚI</div>
          <div>SẢN PHẨM CÔNG NGHỆ MỚI</div>
          <div>KHUYẾN MÃI</div>
          <div>SỰ KIỆN</div>
          <div>VIDEO</div>
      </div>

      <div className='flex flex-wrap justify-center gap-12 p-2 mt-4 ' >
        <div className='flex flex-col' >
            <div className='font-semibold mb-5'>Tinh tế</div>
            <div>Nội quy diễn đàn</div>
            <div>Thỏa thuận sử dụng dịch vụ</div>
            <div>Góp ý</div>
            <div>Hỗ trợ, hướng dẫn</div>
            <div>Liên hệ quảng cáo</div>
            <div>Tinh tế RSS</div>
        </div>
        <div className='flex flex-col' >
            <div className='font-semibold mb-5'>Cộng đồng</div>
            <div>Điện thoại</div>
            <div>Máy tính</div>
            <div>Camera</div>
            <div>Xe</div>
            <div>Khoa học công nghệ</div>
        </div><div className='flex flex-col' >
            <div className='font-semibold mb-5'>Nhật Tảo</div>
            <div>Mua bán điện thoại</div>
            <div>Mua bán máy tính</div>
            <div>Mua bán máy tính bảng</div>
            <div>Mua bán camera</div>
            <div>Mua bán đồng hồ thông minh</div>
            <div>Mua bán xe</div>
            <div>Mua bán điện máy</div>
            <div>Mua bán sim, sim 3G</div>

        </div><div className='flex flex-col gap-2 ' >
            <div className='font-semibold mb-5'>Theo dõi chúng tôi</div>
            <div className='flex items-center gap-2  '>
              <img src='/facebook.png' className='w-8 h-8' />
              Facebook
            </div>
            <div className='flex   items-center gap-2 '>
              <img src='/youtube.png' className='w-8 h-8' />
              Youtube
            </div>
            <div className='flex  items-center gap-2 '>
              <img src='/flickr.png' className='w-8 h-8' />
              Flickr
            </div>
            <div className='flex  items-center gap-2 '>
              <img src='/twitter.png' className='w-8 h-8' />
              Twitter
            </div>
        </div>

      </div>

      <hr className='text-gray-300' />

      <div className='flex flex-wrap justify-center p-4 text-sm space-x-10 space-y-4'>
          <div>Chịu trách nhiệm nội dung: Trần Vĩnh Long</div>
          <div>© 2025 Công ty Cổ phần MXH Tinh Tế</div>
          <div>Địa chỉ: Số 70 Bà Huyện Thanh Quan, P. Võ Thị Sáu, Quận 3, TPHCM</div>
          <div>Số điện thoại: 028224603123</div>
          <div>MST: 03132523219</div>
          <div>Giấy phép thiết lập MXH số 11/GP-BTTTT, Ký ngày: 08/01/2019</div>
      </div>
    </div>
  </div>
  )
}

export default Footer