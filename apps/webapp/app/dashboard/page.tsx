import React from 'react'
import Header from '@/components/dashboard/Header'
import DAODashboard from '@/components/dashboard/DAODashboard'
import Notifications from '@/components/Notification/Notification'

const page = () => {
  return (
    <div className='bg-black'>
      <Header/>
      <div className='flex flex-col md:flex-row justify-between'>
        <div className='md:w-[78%]'>
        <DAODashboard/>
        </div>
        <div className='md:w-[20%]'>
        <Notifications/>
        </div>
      </div>
    
    </div>
  )
}

export default page
