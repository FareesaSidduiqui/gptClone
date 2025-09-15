import { useState } from 'react'
import SideBar from './components/SideBar'
import { Route, Routes, useLocation } from 'react-router-dom'
import ChabtBox from './components/ChabtBox'
import Credits from './pages/Credits'
import Community from './pages/Community'
import { assets } from './assets/assets'
import './assets/prism.css'
import Loading from './pages/Loading'
import Login from './pages/Login'
import { useAppContext } from './context/AppContext'

function App() {
  const {user} = useAppContext()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const {pathname} = useLocation()

  if(pathname === '/loading') return <Loading/>

  return (
    <>
      {/* Hamburger menu button (only when sidebar is closed) */}
      {!isMenuOpen && (
        <button
          className="absolute top-4 left-4 z-50 md:hidden p-2 bg-gray-800 text-white rounded-md"
          onClick={() => setIsMenuOpen(true)}
        >
          <img src={assets.menu_icon} className="w-6 h-6" alt="menu" />
        </button>
      )}
{/* // <Route path='/login' element={<Login/>}/> */}
      {user ? (
               <div className="dark:bg-gradient-to-b from-[#242124] to-[#000000] dark:text-white">

        <div className="flex h-screen w-screen">
          <SideBar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

          <Routes>
            <Route path="/" element={<ChabtBox />} />
            <Route path="/credits" element={<Credits />} />
            <Route path="/community" element={<Community />} />
            <Route path='/loading' element={<Loading/>}/>
          </Routes>
        </div>
      </div>
      ) : (
        <div className='bg-gradient-to-b from-[#242124] to-[#000000] flex
        items-center justify-center h-screen w-screen'>
          <Login/>
        </div>
      )}


    </>
  )
}

export default App
