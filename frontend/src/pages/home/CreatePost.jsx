import React, { useRef, useState } from 'react'
import { CiImageOn } from "react-icons/ci";
import { BsEmojiSmileFill } from "react-icons/bs";
import { IoCloseSharp } from "react-icons/io5";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import EmojiPicker from 'emoji-picker-react';


function CreatePost() {
  const [text, setText] = useState("");
	const [img, setImg] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  // Tambahan state untuk data film
  const [movieTitle, setMovieTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [director, setDirector] = useState("");
  const [synopsis, setSynopsis] = useState("");

	const imgRef = useRef(null);

  const queryClient = useQueryClient()
  const {data:authUser} = useQuery({queryKey:["authUser"]})

  const {mutate:createPost,isPending,isError,error} = useMutation({
    mutationFn: async({text,img,movieTitle,genre,director,synopsis})=>{
      try {
        const res = await fetch("/api/posts/create",{
          method: "POST",
          headers:{
            "Content-Type": "application/json",
          },
          body: JSON.stringify({text,img,movieTitle,genre,director,synopsis})
        })
        const data = await res.json()
        if(!res.ok) throw new Error(data.error || "Something went wrong!")
        return data

      } catch (error) {
        throw new Error(error.message)
      }
    },
    onSuccess: ()=>{
      setImg(null)
      setText("")
      setMovieTitle("")
      setGenre("")
      setDirector("")
      setSynopsis("")
      toast.success("Post created successfully")
      queryClient.invalidateQueries({queryKey:["posts"]})
    }
  })

	const handleSubmit = (e) => {
		e.preventDefault();
    createPost({text,img,movieTitle,genre,director,synopsis})
	};

	const handleImgChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = () => {
				setImg(reader.result);
			};
			reader.readAsDataURL(file);
		}
	};

  const handleEmojiClick = (emojiData) => {
    setText((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  return (
  <div className='create-post'>
    <img src={authUser.profileImg || "/avatar-placeholder.png"} className='create-post__avatar' />

    <form className='create-post__form' onSubmit={handleSubmit}>
      {/* Tambahan input untuk data film */}
      <input
        className='create-post__form__input'
        type='text'
        placeholder='Judul Film'
        value={movieTitle}
        onChange={e => setMovieTitle(e.target.value)}
        required
      />
      <select
        className='create-post__form__input create-post__form__select'
        value={genre}
        onChange={e => setGenre(e.target.value)}
        required
      >
        <option value='' disabled>Pilih Genre</option>
        <option value='Action'>Action</option>
        <option value='Drama'>Drama</option>
        <option value='Comedy'>Comedy</option>
        <option value='Romance'>Romance</option>
        <option value='Horror'>Horror</option>
        <option value='Sci-Fi'>Sci-Fi</option>
        <option value='Thriller'>Thriller</option>
        <option value='Animation'>Animation</option>
        <option value='Documentary'>Documentary</option>
      </select>
      <input
        className='create-post__form__input'
        type='text'
        placeholder='Sutradara'
        value={director}
        onChange={e => setDirector(e.target.value)}
        required
      />
      <textarea
        className='create-post__form__textarea'
        placeholder='Sinopsis'
        value={synopsis}
        onChange={e => setSynopsis(e.target.value)}
        required
      />

      {img && (
        <div className='create-post__form__upload'>
          <IoCloseSharp
            className='create-post__form__upload__close-icon'
            onClick={() => {
              setImg(null);
              imgRef.current.value = null;
            }}
          />
          <img src={img} className='create-post__form__upload__image' />
        </div>
      )}

      <div className='create-post__form__data' style={{ position: "relative" }}>
        <div className='create-post__form__data__left'>
          <CiImageOn
            className='create-post__form__data__left__icon'
            onClick={() => imgRef.current.click()}
          />
          <BsEmojiSmileFill
            className='create-post__form__data__left__icon'
            onClick={() => setShowEmojiPicker((v) => !v)}
          />
          {showEmojiPicker && (
            <div style={{ position: "absolute", top: "40px", left: 0, zIndex: 10 }}>
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
          )}
        </div>
        <input type='file' hidden ref={imgRef} onChange={handleImgChange} />
        <button className='create-post__form__data__btn'>
          {isPending ? "Posting..." : "Post"}
        </button>
      </div>
      {isError && <div className='error'>Something went wrong</div>}
    </form>
  </div>
  )
}

export default CreatePost
