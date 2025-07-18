'use client'
import React from 'react'
import { addMonths, subMonths, format} from 'date-fns';
import { useEffect, useState } from 'react';
import { useSidebar } from '@/components/ui/sidebar';
import { userRequest } from '@/requestMethod';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Bar, BarChart } from "recharts"
import { ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { ChevronLeft } from 'lucide-react';
import { ChevronRight } from 'lucide-react';

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


type chartData = {
  date: string,
  views: number
}

const page = () => {
  const {state} = useSidebar()
  const [width, setWidth] = useState(0);
  const [commentCount, setCommentCount] = useState<number>(0)
  const [postCount, setPostCount] = useState<number>(0)
  const [userCount, setUserCount] = useState<number>(0)
  const [reportCount, setReportCount] = useState<number>(0)
  const [totalPost, setTotalPost] = useState<number>(0)
  const [totalComment, setTotalComment] = useState<number>(0)
  const [chartData, setChartData] = useState<chartData[]>()
  const [year, setYear ] = useState<number>(new Date().getFullYear())
  const [month, setMonth] = useState<string>(new Date().toISOString().substring(5,7))
  const [day ,setDay] = useState<number>(new Date().getDate())
  const [date, setDate] = useState<string>(`${year}-${month}-${day}`)
  const [byYear, setByYear] = useState<string>('false')

  const handleNextMonth = () => {
    if(month === '12'){
      const nextMonthDate = addMonths(date, 1)
      const nextMonth = format(nextMonthDate, 'MM')
      setMonth(nextMonth)
      setDate(`${year+1}-${nextMonth}-${day}`)
      setYear(year+1)
    }
    const nextMonthDate = addMonths(date, 1)
    const nextMonth = format(nextMonthDate, 'MM')
    setMonth(nextMonth)
    setDate(`${year}-${nextMonth}-${day}`)
    
  }
  console.log('date',date)

  const handlePrevMonth = () => {
    if(month === '01'){
      const prevMonthDate = subMonths(date, 1)
      const prevMonth = format(prevMonthDate, 'MM')
      setMonth(prevMonth)
      setDate(`${year-1}-${prevMonth}-${day}`)
      setYear(year-1)
    }
    const prevMonthDate = subMonths(date, 1)
    const prevMonth = format(prevMonthDate, 'MM')
    setMonth(prevMonth)
    setDate(`${year}-${prevMonth}-${day}`)
  }

  const handlePrevYear = () => [
      setYear(prev=>prev-1)
  ]

  const handleNextYear = () => {
      setYear(prev=>prev+1)
  }

  const chartConfig = {
  views: {
    label: "Lượt truy cập",
    color: "#2563eb",
  },
  
} satisfies ChartConfig

  // get dataChart
  useEffect(()=>{
      const getData = async() => {
          try {
              const res = await userRequest.get(`/visit?year=${year}&month=${month}&day=${day}&byYear=${byYear}`)

              if(res.data){
                setChartData(res.data.dataChart)
                console.log('--->',res.data.dataChart)
              }
          } catch(err){
            console.log('get chart data failed', err)
          }
      }
      getData()
  }, [month , year, byYear])


  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);

    handleResize(); // initial width
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // get comment number of current month
  useEffect(()=>{
    const getCount = async () =>{
      try {
        const res = await userRequest.get('/comment/count/this-month')
        if(res.data){
          setCommentCount(res.data.total)
        }
      } catch(err){
        console.log('fetch comment-count failed',err)
      }
    }
    getCount()
  }, [])

   // get posts number of current month
  useEffect(()=>{
    const getCount = async () =>{
      try {
        const res = await userRequest.get('/post/count/this-month')
        if(res.data){
          setPostCount(res.data.total)
        }
      } catch(err){
        console.log('fetch comment-count failed',err)
      }
    }
    getCount()
  }, [])

   // get new user number of current month
  useEffect(()=>{
    const getCount = async () =>{
      try {
        const res = await userRequest.get('/user/count/this-month')
        if(res.data){
          setUserCount(res.data.total)
        }
      } catch(err){
        console.log('fetch comment-count failed',err)
      }
    }
    getCount()
  }, [])


   // get report number of current month
  useEffect(()=>{
    const getCount = async () =>{
      try {
        const res = await userRequest.get('/report-comment/count/this-month')
        if(res.data){
          setReportCount(res.data.total)
        }
      } catch(err){
        console.log('fetch comment-count failed',err)
      }
    }
    getCount()
  }, [])

  // get total posts
  useEffect(()=>{
    const getCount = async() => {
        try {
            const res = await userRequest.get('/post/count/all-posts')
            if(res.data){
              setTotalPost(res.data.total)
            }
        }catch(err){
          console.log('get total posts failed', err)
        }
    } 
    getCount()
  }, []) 

  // get total comments
  useEffect(()=>{
    const getCount = async() => {
        try {
            const res = await userRequest.get('/comment/count/all-comments')
            if(res.data){
              setTotalComment(res.data.total)
            }
        }catch(err){
          console.log('get total posts failed', err)
        }
    } 
    getCount()
  }, []) 

  return (
    <div className= 'flex justify-center p-2 md:px-8  w-screen '  >
      <div className='w-full  h-auto  flex flex-col space-y-20  mt-10 px-4'>

        <div className='text-2xl font-bold text-center'>
          Home 
        </div>

        {/* chart views */}
        <div>
      
          <div className=' flex flex-col justify-center items-center px-2 '>
            <div className='flex  justify-center items-center gap-1 md:gap-5'>
              {byYear === 'false'?
                <>
                  <ChevronLeft onClick={handlePrevMonth} className=' w-10 h-10  rounded-full md:hover:bg-blue-100 md:hover:cursor-pointer' />
                  <p className='text-2xl text-center '>Lượt truy cập trong tháng {month}/{year}</p>
                  <ChevronRight onClick={handleNextMonth} className=' w-10 h-10 rounded-full md:hover:bg-blue-100 md:hover:cursor-pointer' />
                </>
                :
                <>
                  <ChevronLeft onClick={handlePrevYear} className=' w-10 h-10  rounded-full md:hover:bg-blue-100 md:hover:cursor-pointer' />
                  <p className='text-2xl text-center '>Lượt truy cập trong năm {year}</p>
                  <ChevronRight onClick={handleNextYear} className=' w-10 h-10 rounded-full md:hover:bg-blue-100 md:hover:cursor-pointer' />
                </>
              }
            </div>
          </div>

          {/* options */}
          <div className='flex justify-end '>       
            <Select onValueChange={(value)=>setByYear(value)} value={byYear} >
              <SelectTrigger className="w-auto">
                <SelectValue placeholder={byYear} />
              </SelectTrigger>
              <SelectContent>                        
                  <SelectItem  value={'false'}>Theo ngày</SelectItem>   
                  <SelectItem  value={'true'}>Theo tháng</SelectItem>                              
              </SelectContent>
            </Select>
          </div>


          <ChartContainer config={chartConfig} className="max-h-[600px] w-full px-2 ">
            <LineChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={true}
                tickMargin={3}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  if (byYear === 'false'){
                    return date.toLocaleDateString("vi-VN", {
                      month: "short",
                      day: 'numeric'
                    })
                  } else {
                    return date.toLocaleDateString("vi-VN", {
                      month: "short",
                    })
                  }
                }}
              />
              <YAxis
                tickLine={false}
                dataKey='views'
              />
               <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />          
              <Line dot={false} type='monotone' dataKey={'views'} stroke="blue"  strokeWidth={5}/>
            </LineChart>
          </ChartContainer>  

        </div>

        {/* overall */}
        <div className='w-full h-auto flex  justify-center flex-wrap gap-5 '>
          <div className='w-35 md:w-80 border-2 border-gray-300 h-35 md:h-80 rounded-lg flex flex-col justify-center items-center  p-2  md:text-2xl gap-2 md:gap-10'>
              <p className='text-3xl md:text-5xl font-bold'>{commentCount}</p>
              <p className='text-center'>Lượt bình luận trong tháng này</p>
          </div>
          <div className='w-35 md:w-80 border-2 border-gray-300 h-35 md:h-80 rounded-lg flex flex-col justify-center items-center  p-2  md:text-2xl gap-2 md:gap-10'>
              <p className='text-3xl md:text-5xl font-bold'>{postCount}</p>
              <p className='text-center'>Bài viết mới trong tháng này</p>
          </div>
          <div className='w-35 md:w-80 border-2 border-gray-300 h-35 md:h-80 rounded-lg flex flex-col justify-center items-center  p-2  md:text-2xl gap-2 md:gap-10'>
              <p className='text-3xl md:text-5xl font-bold'>{userCount}</p>
              <p className='text-center'>Thành viên mới trong tháng này</p>
          </div>
          <div className='w-35 md:w-80 border-2 border-gray-300 h-35 md:h-80 rounded-lg flex flex-col justify-center items-center  p-2  md:text-2xl gap-2 md:gap-10'>
              <p className='text-3xl md:text-5xl font-bold'>{reportCount}</p>
              <p className='text-center'>Bình luận bị báo xấu trong tháng này</p>
          </div>
          <div className='w-35 md:w-80 border-2 border-gray-300 h-35 md:h-80 rounded-lg flex flex-col justify-center items-center  p-2  md:text-2xl gap-2 md:gap-10'>
              <p className='text-3xl md:text-5xl font-bold'>{totalPost}</p>
              <p className='text-center'>Tổng số bài viết</p>
          </div>
          <div className='w-35 md:w-80 border-2 border-gray-300 h-35 md:h-80 rounded-lg flex flex-col justify-center items-center  p-2  md:text-2xl gap-2 md:gap-10'>
              <p className='text-3xl md:text-5xl font-bold'>{totalComment}</p>
              <p className='text-center'>Tổng lượt bình luận</p>
          </div>
        </div>

      </div>
    </div>
  )
}

export default page