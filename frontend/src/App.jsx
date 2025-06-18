import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import {Routes,Route, Navigate} from "react-router-dom"

import HomePage from "./pages/home/HomePage.jsx"
import SignUpPage from "./pages/auth/signup/SignUpPage.jsx"
import LoginPage from './pages/auth/login/LoginPage.jsx'
import Sidebar from './components/common/Sidebar.jsx'
import RightPanel from './components/common/RightPanel.jsx'
import NotificationPage from './pages/notification/NotificationPage.jsx'
import ProfilePage from './pages/profile/ProfilePage.jsx'
import DetailFilmPage from './pages/home/DetailFilmPage.jsx'
import MoviesPage from "./components/movies/MoviesPage.jsx";
import Lilo from './components/movies/Lilo.jsx';

import{Toaster}from "react-hot-toast"
import { useQuery } from '@tanstack/react-query'
import LoadingSpinner from './components/common/LoadingSpinner.jsx'

const API_BASE_URL = 'http://localhost:5000/api/tmdb';

function App() {
  const {data:authUser,isLoading,isError,error} = useQuery({
    queryKey: ["authUser"],
    queryFn: async()=>{
      try {
        const res = await fetch("/api/auth/me")
        const data = await res.json()
        if(data.error) return null
        if(!res.ok) throw new Error(data.error || "Something went wrong")
      
        return data
      } catch (error) {
        throw new Error(error.message)
      }
    }
  })

   const fetchTMDBData = async (endpoint) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching TMDB data:', error);
      throw error;
    }
  };

  if(isLoading){
    return(
      <div className='loaderContainer'>
        <LoadingSpinner size={"lg"}/>
      </div>
    )
  }
  return (
      <div className='app'>
        {authUser && <Sidebar />}
        <Routes>
          <Route path='/' element={authUser ? <HomePage />: <Navigate to={"/login"} />} />
          <Route path='/login' element={!authUser ? <LoginPage /> :<Navigate to={"/"} /> } />
          <Route path='/signup' element={!authUser ? <SignUpPage />: <Navigate to={"/"} />} />
          <Route path='/notifications' element={authUser ?<NotificationPage />: <Navigate to={"/login"} />} />
          <Route path='/profile/:username' element={authUser ?<ProfilePage />: <Navigate to={"/login"} />} />
          <Route path='/post/:id' element={authUser ? <DetailFilmPage /> : <Navigate to={"/login"} />} />
          <Route path='/movies' element={authUser ? <MoviesPage /> : <Navigate to={"/login"} />} />
          <Route path='/movies/lilo' element={authUser ? <Lilo /> : <Navigate to={"/login"} />} />
        </Routes>
        {authUser&& <RightPanel />}
        <Toaster />
      </div>

  )
}

export default App
