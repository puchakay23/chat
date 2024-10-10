import React, { useEffect, useRef, useState } from 'react'
import "./chat.css"
import EmojiPicker from 'emoji-picker-react'
import { db } from '../../lib/firebase';
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { useChatStore } from '../../lib/chatStore';
import { useUserStore } from '../../lib/userStore';
import upload from '../../lib/upload';

const Chat = () => {
  const [chat,setChat] = useState()
  const [open,setOpen] = useState(false)
  const [text,setText] = useState("")
  const endRef = useRef(null)
  const [img,setImg] = useState({
    file:null,
    url:""
  })

  const {chatId,user,isCurrentUserBlocked,isReceiverBlocked} = useChatStore()
  const {currentUser} = useUserStore()

  useEffect(()=>{
    endRef.current?.scrollIntoView({behavior:"smooth"})
  },[])

  useEffect(()=>{
    const unSub = onSnapshot(doc(db,"chats",chatId),(res)=>{
      setChat(res.data())
    })

    return ()=>{
      unSub();
    }
  },[chatId])

  console.log(chat?.messages);
  
  const handleEmoji=(e)=>{
    setText(prev=>prev+e.emoji);
    setOpen(false)
  }

  const handleImg = e =>{
    if(e.target.files[0]){
      setImg({
        file:e.target.files[0],
        url:URL.createObjectURL(e.target.files[0])
      })
    }
  }

  const handleSend =async()=>{
    let imgUrl = null

    if(img.file){
      imgUrl = await upload(img.file)
    }
    if(text==="") return;
      try {
        await updateDoc(doc(db,"chats",chatId),{
          messages:arrayUnion({
            senderId:currentUser.id,
            text,
            createdAt:new Date(),
            ...(imgUrl && {img:imgUrl})
          })
        })

        const userIDs = [currentUser.id,user.id]
        userIDs.forEach(async (id)=>{

          const userChatsRef = doc(db,"userchats",id)
          const userChatSnapshot = await getDoc(userChatsRef)
          
          if(userChatSnapshot.exists()){
            const userChatsData = userChatSnapshot.data()
            
            const chatIndex = userChatsData.chats.findIndex(c=>c.chatId===chatId)
            
            userChatsData.chats[chatIndex].lastMessage = text
            userChatsData.chats[chatIndex].isSeen = id === currentUser.id?true:false;
            userChatsData.chats[chatIndex].updatedAt = Date.now()
            
            await updateDoc(userChatsRef,{
              chats:userChatsData.chats,
            })
          }
        })
        } catch (error) {
        console.log(error)
      }

      setImg({
        file:null,
        imgUrl:""
      })

      setText("")
  }
  
  return (
    <div className='chat'>
      <div className="top">
        <div className="user">
          <img src={user.avatar || "./avatar.png"} alt="" width={100} height={100} loading='lazy' />
          <div className="texts">
            <span>{user.username}</span>
            <p>Lorem ipsum dolor sit amet</p>
          </div>
        </div> 
        <div className="icons">
          <img src="./phone.png" alt="" />
          <img src="./video.png" alt="" />
          <img src="./info.png" alt="" />
        </div>
      </div>
      <div className="center">
        {chat?.messages?.map(message=>(
          <div className={message.senderId === currentUser?.id ? "message own":"message"} key={message?.createdAt}>
            <div className="texts">
              {message.img && <img src={message.img} alt="" />}
              <p>
                {message.text}
              </p>
              {/* <span>1 min ago</span> */}
            </div>
          </div>
          ))
        }

        {img.url && <div className="message own">
          <div className="texts">
            <img src={img.url} alt="" />
          </div>
        </div>}

        <div ref={endRef}></div>
      </div>
      <div className="bottom">
        <div className="icons">
          <label htmlFor="file">
            <img src="./img.png" alt="" />
          </label>
          <input type="file" id='file' style={{display:"none"}} onChange={handleImg}/>
          <img src="./camera.png" alt="" />
          <img src="./mic.png" alt="" />
        </div>
        <input type="text" 
        placeholder={isCurrentUserBlocked || isReceiverBlocked? "You cannot send message":'Type a message...'}
        value={text}
        onChange={(e)=>setText(e.target.value)}
        disabled={isCurrentUserBlocked || isReceiverBlocked}/>
        <div className="emoji">
          <img src="./emoji.png" alt="" onClick={()=>setOpen(prev=>!prev)}/>
          <div className="picker">
            <EmojiPicker open={open} onEmojiClick={handleEmoji}/>
          </div>
            
        </div>
        <button className='sendButton' onClick={handleSend} disabled={isCurrentUserBlocked || isReceiverBlocked}>send</button>
      </div>
    </div>
  )
}

export default Chat