import React, { useState } from 'react'
import { FaUser } from 'react-icons/fa';
import { MdPassword } from 'react-icons/md';
import XSvg from '../../../components/svgs/U';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';


function LoginPage() {
  const [formData, setFormData] = useState({
		username: "",
		password: "",
	});
  const queryClient = useQueryClient()
  const {mutate:loginMutation,isError,isPending,error} = useMutation({
    mutationFn: async({username,password})=>{
      try {
        const res = await fetch("/api/auth/login",{
          method: "POST",
          headers:{
            "Content-Type": "application/json",
          },
          body: JSON.stringify({username,password})
        })
        const data = await res.json()
        if(!res.ok) throw new Error(data.error || "Something went wrong")


      } catch (error) {
        throw new Error(error.message)
      }
    },
    onSuccess:()=>{
      // refetch authUser query
      queryClient.invalidateQueries({queryKey:["authUser"]})
    },
    retry: false,
  
  })


	const handleSubmit = (e) => {
		e.preventDefault();
		loginMutation(formData)
	};

	const handleInputChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};
  return (
    <div className='loginContainer'>
    <div className='loginContainer__illustration'>
      <XSvg className='illustration-icon' />
    </div>
    <div className='loginContainer__form-container'>
      <form className='loginContainer__form-container__form' onSubmit={handleSubmit}>
        <h1 className='loginContainer__form-container__form__header'>Lets go.</h1>
        <div className='loginContainer__form-container__form__inputs'>
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
              {isPending ? "Loading..." : "Login"}
            </button>
            {isError && <p className='error'>{error.message}</p>}
          </div>
      </form>
      <div className='loginContainer__form-container__login'>
        <p className='loginContainer__form-container__login__login-text'>Don't have an account?</p>
        <Link to='/signup'>
          <button style={{ backgroundColor: '#fbbf24', color: '#23272f' }}>Sign up</button>
        </Link>
      </div>
    </div>
 </div>
  )
}

export default LoginPage
