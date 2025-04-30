import React from 'react'
import NotificationDashboard from './NotificationDashboard'
import NotificationSettings from './NotificationSetting'

const DashBoardMain = () => {
  return (
    <div className='flex flex-row px-4 h-full'>
     <div className='w-[70%]'>
     <NotificationDashboard/>
     </div>
      <div className='w-[28%] h-full'>
      <NotificationSettings/>
      </div>
    </div>
  )
}

export default DashBoardMain
