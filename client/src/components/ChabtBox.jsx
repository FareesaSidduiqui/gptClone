import React, { useEffect, useRef, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import Message from './Message'

function ChabtBox() {
    const containRef = useRef(null)
    const {selectedChat , theme} = useAppContext()
    const [messages, setMessages] = useState([])
    const [loading , setLoading] = useState(false)
    const [prompt , setPrompt] = useState('')
    const [mode , setMode] = useState('text')
    const [isPublished , setIsPublished] = useState(false)

    const onSubmit = async(e)=>{
        e.preventDefault()
    }
    useEffect(()=>{
        if(selectedChat){
            setMessages(selectedChat.messages)
        }
    },[selectedChat])

    useEffect(()=>{
      if(containRef.current){
        containRef.current.scrollTo({
          top:containRef.current.scrollHeight,
          behavior : 'smooth',
        })
      }
    },[messages])

  return (
    <div className='flex-1 flex flex-col justify-between m-5 md:m-10 x1:mx-30 
    max-md:mt-14 2x1:pr-40'>

        {/* CHat messages */}
        <div ref={containRef} className='flex-1 mb-5 overflow-y-scroll'>
          {messages.length === 0 && (
            <div className='h-full flex flex-col items-center justify-center gap-2
            text-primary'>
                <img src={theme === 'dark' ? assets.logo_full : assets.logo_full_dark} alt="" className='w-fill max-w-56 sm:max-w-68'/>
                <p className='mt-5 text-4xl sm:text-6xl text-center text-gray-400
                dark:text-white'>Ask me anything</p>
            </div>
          )}

          {messages.map((message , index)=><Message key={index} message={message}/>)}

          {/* Three dots loading */}
          {
            loading && <div className='loaded flex items-center gap-1.5'>
                <div className='w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white
                animate-bounce'></div>
                <div className='w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white
                animate-bounce'></div>
                <div className='w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white
                animate-bounce'></div>
            </div>
          }
        </div>

        {/* Prompt input box */}
        {mode === 'image' && (
          <label htmlFor="" className='inline-flex items-center gap-2 mb-3 text-sm mx-auto'>
            <p className='text-xs'>Publish Generated Image to Community</p>
            <input type="checkbox" className="cursor=pointer" id="" checked={isPublished}
            onChange={(e)=>setIsPublished(e.target.checked)} />
          </label>
        )}
      {/* Prompt Input Box */}
<form 
  onSubmit={onSubmit} 
  className="bg-primary/20 dark:bg-[#583C79]/30 border border-primary dark:border-[#80609F]/30 
             rounded-full w-full max-w-2xl p-3 pl-4 mx-auto flex gap-4 items-center"
>
  <select 
    onChange={(e)=>setMode(e.target.value)} 
    value={mode} 
    className="text-sm pl-3 pr-2 outline-none bg-transparent 
               text-gray-800 dark:text-white 
               placeholder-gray-400 dark:placeholder-gray-300"
  >
    <option className="bg-white dark:bg-purple-900" value="text">Text</option>
    <option className="bg-white dark:bg-purple-900" value="image">Image</option>
  </select>

  <input 
    onChange={(e)=>setPrompt(e.target.value)} 
    value={prompt} 
    type="text" 
    placeholder="Type your prompt here..." 
    className="flex-1 w-full text-sm outline-none bg-transparent 
               text-gray-800 dark:text-white 
               placeholder-gray-400 dark:placeholder-gray-300"
    required
  />

  <button disabled={loading}>
    <img 
      src={loading ? assets.stop_icon : assets.send_icon} 
      className="w-8 cursor-pointer" 
      alt="" 
    />
  </button>
</form>


    </div>
  )
}

export default ChabtBox