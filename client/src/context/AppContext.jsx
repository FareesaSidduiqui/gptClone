import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dummyChats, dummyUserData } from "../assets/assets";
const AppContext = createContext(); //This makes a "box" where your data will live.

export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const fetchUser = async () => {
    setUser(dummyUserData);
  };

  const fetchUserChats = () => {
    setChats(dummyChats)
    setSelectedChat(dummyChats[0])
  }

  useEffect(()=>{
     if(theme === 'dark'){
        document.documentElement.classList.add('dark')
     }
     else{
        document.documentElement.classList.remove('dark')
     }
     localStorage.setItem('theme',theme)
  },[theme])

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(()=>{
     if(user){
        fetchUserChats()
     }
     else{
        setChats([])
        setSelectedChat(null)
     }
  },[user])



  const value = {
    navigate,
    user,
    setUser,
    fetchUser,
    chats,
    setChats,
    selectedChat,
    setSelectedChat,
    theme,
    setTheme
  }; // this is your global data
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
