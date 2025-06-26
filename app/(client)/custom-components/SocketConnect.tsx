'use client'
import React, { useEffect, useRef, useState } from 'react'
import { useSocket } from "@/context/socketContext";
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import ThreeDotLoading from './ThreeDotLoading';
import { setReconnectSuccess } from '@/redux/socketConnectionRedux';

const SocketConnect = () => {
    const {reconnect} = useSocket()
    const dispatch = useDispatch()
    const isConnected = useSelector((state: RootState)=>state.socketConnection.isConnected)
    const isReconnecting = useSelector((state: RootState)=>state.socketConnection.isReconnect)
    const reconnectSuccess = useSelector((state: RootState)=>state.socketConnection.reconnectSuccess)
    const [reconnected, setReconnected] = useState<boolean>(false)

    //use this value to turn on and off the notifycation when successfully reconnected
    useEffect(()=>{
        if(reconnectSuccess){
            setTimeout(()=>{
                dispatch(setReconnectSuccess(false))
            }, 3000)
        }
    },[reconnectSuccess])
    
    useEffect(()=>{
        if(isReconnecting){
            setReconnected(true)
        }
    },[isReconnecting])

  return (
    <div className='fixed bottom-0  w-full z-20 h-10'>
        {/* content */}
        {isConnected !== true &&
        <div className='flex justify-center z-50 items-center h-10 text-white bg-red-500 opacity-100 gap-3 '>   
            
            {isReconnecting===false ?
                <>
                    <div>Bạn đang offline</div>
                    <button onClick={reconnect} className='  rounded-lg  hover:cursor-pointer bg-white text-red-500 hover:opacity-80  p-1'>Kết nối lại</button>
                </>
                :
                <>
                Đang kết nối lại
                <ThreeDotLoading className={' w-4 h-4 bg-white'} />               
                </>
            }
        </div>
        }
        {reconnectSuccess && reconnected &&
        <div className='flex justify-center z-50 items-center h-10 text-white bg-green-500 opacity-100 gap-3 '>   
            Kết nối thành công
        </div>
        }

      
    </div>
  )
}

export default SocketConnect