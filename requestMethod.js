
import axios from "axios";

const getStoredValue = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("persist:root");
    }
    return null; // Return null on the server
  };


  const user = JSON.parse(getStoredValue())?.user;

// const user = JSON.parse(localStorage.getItem("persist:root"))?.user;
const currentUser = user && JSON.parse(user).currentUser
const TOKEN = user && JSON.parse(user).currentUser?.accessToken



//requestMethod.js

export const publicRequest = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BASE_URL,
})


export const userRequest = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BASE_URL,
    headers: { token: `Bearer ${TOKEN};UserId ${currentUser?._id}` },
    
})