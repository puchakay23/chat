import React, { useEffect, useState } from 'react'
import "./chatList.css"
import AddUser from '../../addUser/AddUser'
import { doc, onSnapshot,getDoc, updateDoc } from "firebase/firestore";
import { useUserStore } from '../../../lib/userStore'
import { useChatStore } from '../../../lib/chatStore'

import { db } from '../../../lib/firebase';

const ChatList = () => {
  const [chats,setChats] = useState([])
  const [addMode,setAddMode] = useState(false)
  const {currentUser} = useUserStore()
  const {changeChat,chatId} = useChatStore()
  const [input, setInput] = useState("")

  useEffect(()=>{
    const unsub = onSnapshot(doc(db, "userchats", currentUser.id),async (res) => {
      console.log(currentUser.id)
      const items = res.data().chats;

      const promises = items.map(async(item)=>{
        const userDocRef = doc(db, "users", item.receiverId);
        const userDocSnap = await getDoc(userDocRef);

        const user = userDocSnap.data()
        return {...item,user}
      })

      const chatData = await Promise.all(promises)

      setChats(chatData.sort((a,b)=>b.updatedAt-a.updatedAt))
    });

    return ()=>{
      unsub();
    }
  },[currentUser.id])

  const handleSelect =async(chat)=>{
    changeChat(chat.chatId,chat.user)
  }

  // const filteredChats = chats.filter((c)=>
  //   c.user.username.toLowerCase().includes(input.toLowerCase())
  // );

  return (
    <div className='chatList'>
      <div className="search">
        <div className="searchBar">
          <img src="./search.png" alt="" />
          <input type='text' placeholder='search' onChange={(e)=>setInput(e.target.value)}/>
        </div>
        <img src={addMode? "./minus.png":"./plus.png"} alt="" className='add'
        onClick={()=>setAddMode(prev=>!prev)}/>
      </div>
      {chats.map((chat)=>(
        <div className="item" key={chat.chatId} onClick={()=>handleSelect(chat)}
        style={{
          backgroundColor:'transparent'
        }}>
          <img src={chat.user.blocked.includes(currentUser.id)? "./avatar.png":chat.user.avatar || "./avatar.png"} alt="" loading='lazy'/>
          <div className="texts">
            <span>{chat.user.blocked.includes(currentUser.id)? "User":chat.user.username}</span>
            <p>{chat.lastMessage}</p>
          </div>
        </div>
      ))}
      
      {addMode && <AddUser/>}
    </div>
  )
}

export default ChatList