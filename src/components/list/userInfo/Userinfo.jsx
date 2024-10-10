import React from 'react'
import "./userInfo.css"
import { useUserStore } from '../../../lib/userStore';

const Userinfo = () => {
  const {currentUser} = useUserStore();

  return (
    <div className='userInfo'>
      <div className="user">
        <img src={currentUser.avatar || "./avatar.png"} alt="" width={100} height={100} loading='lazy'/>
        <h2>{currentUser.username}</h2>
      </div>
      <div className="icons">
        <img src='./more.png' alt='' />
        <img src='./video.png' alt='' />
        <img src='./edit.png' alt='' />
      </div>
    </div>
  )
}

export default Userinfo