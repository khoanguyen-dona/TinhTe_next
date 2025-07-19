'use client'
import React, { useEffect } from 'react'

import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import ThreeDotLoading from './ThreeDotLoading';
import { setReconnectSuccess } from '@/redux/socketConnectionRedux';

const SocketConnect = () => {
    const dispatch = useDispatch()
    const isConnected = useSelector((state: RootState)=>state.socketConnection.isConnected)
    const reconnectSuccess = useSelector((state: RootState)=>state.socketConnection.reconnectSuccess)

    //use this value to turn on and off the notifycation when successfully reconnected
    useEffect(()=>{
        if(reconnectSuccess){
            setTimeout(()=>{
                dispatch(setReconnectSuccess(false))
            }, 3000)
        }
    },[reconnectSuccess])
    
  
  return (
    <div className='fixed bottom-0  w-full z-20 h-10'>
        {/* content */}
        {isConnected !== true &&
        <div className='flex justify-center z-50 items-center h-10 text-white bg-red-500 opacity-100 gap-3 '>                               
                Đang kết nối lại
                <ThreeDotLoading className={' w-4 h-4 bg-white'} />                                         
        </div>
        }
        {reconnectSuccess  &&
        <div className='flex justify-center z-50 items-center h-10 text-white bg-green-500 opacity-100 gap-3 '>   
            Kết nối thành công
        </div>
        }

      
    </div>
  )
}

export default SocketConnect