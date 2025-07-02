import { AxiosError, AxiosInstance } from 'axios';

import axios from "axios";

// const getStoredValue = () => {
//     if (typeof window !== "undefined") {
//       return localStorage.getItem("accessToken");
//     }
// };

//requestMethod.js

export const publicRequest = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BASE_URL,
})

// Khởi tạo instance Axios của bạn
export const userRequest: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Quan trọng để gửi và nhận cookie (như refresh token)
});


// --- Request Interceptor ---
// Chặn mọi yêu cầu đi để thêm Access Token vào header
userRequest.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken')
    console.log('send req with accessToken: ',accessToken)
    if (accessToken) {
      if (config.headers) { // Đảm bảo config.headers tồn tại
        config.headers.token = `Bearer ${accessToken}`;
      }
    }
    return config; // Trả về cấu hình đã sửa đổi
  },
  (error) => {
    // Xử lý lỗi yêu cầu (ví dụ: lỗi mạng, cấu hình không hợp lệ)
    return Promise.reject(error);
  }
);


// --- Response Interceptor ---
// Chặn mọi phản hồi đến để xử lý các lỗi như token hết hạn và chuyển hướng
userRequest.interceptors.response.use(
  (response) => {
    if(response.data.accessToken){
      localStorage.setItem('accessToken',response.data.accessToken.toString())
    }
    return response;
  },
  async(err)=>{
    if(err.status === 401){
      console.log('err',err)
      return window.location.href = err.response.data.redirectTo
    }
  }
  
  
);