import React, { useState } from 'react'
import "./login.css"
import { createUserWithEmailAndPassword,signInWithEmailAndPassword } from 'firebase/auth'
import { auth,db } from '../../lib/firebase'
import { doc, setDoc } from "firebase/firestore";
import upload from '../../lib/upload';
import pic from "../../../public/avatar.png"

const Login = () => {
  const [avatar,setAvatar] = useState({
    file:"null",
    url:""
  })
  
  const [loading,setLoading] = useState(false)

  const handleAvatar = e =>{
    if(e.target.files[0]){
      setAvatar({
        file:e.target.files[0],
        url:URL.createObjectURL(e.target.files[0])
      })
    }
  }

  const handleRegister=async (e)=>{
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const {username,email,password} = Object.fromEntries(formData)
    try {
      const res = await createUserWithEmailAndPassword(auth,email, password)
      const imgUrl = await upload(avatar.file)
      await setDoc(doc(db, "users", res.user.uid), {
        username,
        email,
        avatar:imgUrl,
        id:res.user.uid,
        blocked:[]
      });

      await setDoc(doc(db, "userchats", res.user.uid), {
        chats:[],
      });

      alert("Account created")
    } catch (error) {
      console.log(error)
    } finally{
      setLoading(false)
    }
  }

  const handleLogin=async(e)=>{
    e.preventDefault();
    setLoading(true)
    const formData = new FormData(e.target);
    const {email,password} = Object.fromEntries(formData)
    try {
      await signInWithEmailAndPassword(auth,email,password)
      alert("Logged In")
    } catch (error) {
      console.log(error)
      alert("error")
    } finally{
      setLoading(false)
    }
  }

  return (
    <div className='login'>
      <div className="item">
        <h2>Welcome Back</h2>
        <form onSubmit={handleLogin}>
          <input type="text" placeholder='Email' name='email' required/>
          <input type="password" placeholder='Password' name='password' required/>
          <button disabled={loading}>{loading?"Loading":"Sign In"}</button>
        </form>
      </div>
      <div className="separator"></div>
      <div className="item">
      <h2>Create an Account</h2>
      {/* <p>All fields are required</p> */}
        <form onSubmit={handleRegister}>
          <label htmlFor="file">
            <img src={avatar.url || "https://thumbs.dreamstime.com/b/default-avatar-profile-icon-social-media-user-vector-default-avatar-profile-icon-social-media-user-vector-portrait-176194876.jpg"} alt="" />
            Upload an Image</label>
          <input type="file" id='file' style={{display:"none"}} onChange={handleAvatar} required/>
          <input type="text" placeholder='Username' name='username' required/>
          <input type="text" placeholder='Email' name='email' required/>
          <input type="password" placeholder='Password' name='password' required/>
          <button disabled={loading}>{loading?"Loading":"Sign Up"}</button>
        </form>
      </div>
    </div>
  )
}

export default Login