import React from 'react'
import { Link } from 'react-router-dom'
import XSvg from '../svgs/X'
import { MdHomeFilled } from 'react-icons/md'
import { MdMovie } from 'react-icons/md'
import { FaUser } from 'react-icons/fa'
import { IoNotifications } from "react-icons/io5";
import { BiLogOut } from "react-icons/bi";
import { FaPlus, FaSearch, FaHome, FaBell, FaFilm } from "react-icons/fa";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

function Sidebar() {
  const queryClient = useQueryClient()
  const {mutate:logoutMutation} = useMutation({
    mutationFn: async()=>{
      try {
        const res = await fetch("/api/auth/logout",{
          method: "POST",
        })
        const data = await res.json()
        if(!res.ok) throw new Error(data.error || "Something went wrong!")

      } catch (error) {
        throw new Error(error.message)
      }
    
    },
    onSuccess: ()=>{
      queryClient.invalidateQueries({queryKey: ["authUser"]})
    },
    onError: ()=>{
      toast.error("Something went wrong!")
    }
  })
 // get userAuth data from useQuery key
 const {data:authUser} = useQuery({queryKey:["authUser"]})
  return (
    <div className='sidebar'>
      <div className='sidebar__container'>
         <Link to="/" className='sidebar__container__logo link'>
            <XSvg className='px-2 w-12 h-12 rounded-full fill-white hover:bg-stone-900' />
         </Link>
         <ul className='sidebar__container__list'>
            <Link to="/" className='link'>
              <li>
                  <FaHome color="#fbbf24" className='icon'/>
                  <span>Home</span> 
              </li>
            </Link>
            {/* Tombol Tweet di bawah Home */}
            <Link to="/?tweet=1" className='link'>
              <li style={{display:'flex',alignItems:'center',gap:12,margin:'0.7rem 0',fontWeight:500}}>
                <span style={{background:'#fbbf24',borderRadius:'50%',width:28,height:28,display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <FaPlus size={16} color="#23272f" />
                </span>
                <span style={{color:'#fff'}}>Tweet</span>
              </li>
            </Link>
            {/* Tombol Search di bawah Tweet */}
            <Link to="/?search=1" className='link'>
              <li style={{display:'flex',alignItems:'center',gap:12,margin:'0.7rem 0',fontWeight:500}}>
                <span style={{background:'#fbbf24',borderRadius:'50%',width:28,height:28,display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <FaSearch size={16} color="#23272f" />
                </span>
                <span style={{color:'#fff'}}>Search</span>
              </li>
            </Link>
            <Link to="/notifications" className='link'>
           <li>
              <FaBell color="#fbbf24" className='icon' />
              <span>Notifications</span> 
           </li>
            </Link>
            <Link to={`/profile/${authUser.username}`} className='link'>
           <li>
              <FaUser color="#fbbf24" className='icon' />
              <span>Profile</span> 
           </li>
            </Link>
            <Link to="/movies" className='link'>
              <li>
                <FaFilm color="#fbbf24" className='icon' />
                <span>Movies</span> 
              </li>
            </Link>
         </ul>
         {authUser && (
					<Link
						to={`/profile/${authUser.username}`}
						className='sidebar__container__user-container link'
					>
						<div className='sidebar__container__user-container__avatar'>
								<img src={authUser?.profileImg || "/avatar-placeholder.png"} className='sidebar__container__user-container__avatar__profile-image' />
						</div>
						<div className='sidebar__container__user-container__info'>
							<div className='sidebar__container__user-container__info__text'>
								<p className=''>{authUser?.fullname}</p>
								<p className=''>@{authUser?.username}</p>
							</div>
							<BiLogOut className='icon' 
              onClick={(e)=>{
                e.preventDefault()
                logoutMutation()
              }}
              />
						</div>
					</Link>
				)}
      </div>
    </div>
  )
}

export default Sidebar
