import React, { useState } from 'react'
import XSvg from '../../../components/svgs/U'

import { MdOutlineMail } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { MdPassword } from "react-icons/md";
import { MdDriveFileRenameOutline } from "react-icons/md";
import {Link} from "react-router-dom"

import {useMutation} from "@tanstack/react-query"

import {toast} from "react-hot-toast"


function SignUpPage() {
  const [formData, setFormData] = useState({
		email: "",
		username: "",
		fullname: "",
		password: "",
	});

  const {mutate,isError,isPending,error} = useMutation({
    mutationFn: async({username,fullname,password,email})=>{
      try {
        const res = await fetch("/api/auth/signup",{
          method: "POST",
          headers:{
            "Content-Type": "application/json",
          },
          body: JSON.stringify({username,fullname,password,email})
        })
        const data = await res.json()
        if(!res.ok) throw new Error(data.error || "Failed to create an account")
        return data;
      } catch (error) {
        // console.error(error)
        throw error
      }
    },
    onSuccess: ()=>{
      toast.success("Account created successfully")
    }
  })

	const handleSubmit = (e) => {
		e.preventDefault();
		mutate(formData)
	};

	const handleInputChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};




  return (
    <div className='container'>
      <div className='container__illustration'>
        <XSvg className='illustration-icon' />
      </div>
      <div className='container__form-container'>
        <form className='container__form-container__form' onSubmit={handleSubmit}>
          <h1 className='container__form-container__form__firstHeader'>Happening now.</h1>
          <h1 className='container__form-container__form__secoendHeader'>Join today.</h1>
          <div className='container__form-container__form__inputs'>
              <label >
                <MdOutlineMail className='icon' />
                  <input 
                    type="text"   
                    placeholder='Email'
                    name='email'
                    onChange={handleInputChange}
                    value={formData.email}
                    />
              </label>
              <label >
                <FaUser className='icon' />
                  <input 
                    type="text"   
                    placeholder='Username'
                    name='username'
                    onChange={handleInputChange}
                    value={formData.username}
                    />
              </label>
              <label >
                <MdDriveFileRenameOutline className='icon' />
                  <input 
                    type="text"   
                    placeholder='Full Name'
                    name='fullname'
                    onChange={handleInputChange}
                    value={formData.fullname}
                    />
              </label>
              <label >
                <MdPassword className='icon' />
                  <input 
                    type="password"   
                    placeholder='Password'
                    name='password'
                    onChange={handleInputChange}
                    value={formData.password}
                    />
              </label>
              <button style={{ backgroundColor: '#fbbf24', color: '#23272f' }}>
                {isPending ? "Loading..." : "Sign up"}
              </button>
              {isError && <p className='error'>{error.message}</p>}
            </div>
        </form>
        <div className='container__form-container__signin'>
          <p className='container__form-container__signin__signin-text'>Already have an account?</p>
          <Link to='/login'>
            <button style={{ backgroundColor: '#fbbf24', color: '#23272f' }}>Sign in</button>
          </Link>
        </div>
      </div>
  </div>
  
  )
}

export default SignUpPage
