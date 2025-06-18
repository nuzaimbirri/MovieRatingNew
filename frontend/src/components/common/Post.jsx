import { FaRegComment } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { FaRegHeart } from "react-icons/fa";
import { FaRegBookmark } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import LoadingSpinner from "../common/LoadingSpinner.jsx"
import {formatPostDate} from "../../utils/date/index.js"

const Post = ({ post }) => {
	const navigate = useNavigate();
	const [comment, setComment] = useState("");
	const {data:authUser} = useQuery({queryKey:["authUser"]})
	const queryClient = useQueryClient()

	const {mutate:deletePost,isPending:deletePending} = useMutation({
		mutationFn: async()=>{
			try {
				const res = await fetch(`/api/posts/${post._id}`,{ // <-- tambahkan slash di depan
					method: "DELETE"
				})
				const data = await res.json()

				if(!res.ok) throw new Error (data.error || "Something went wrong!")
				return data;
			} catch (error) {
				throw new Error(error.message)
			}
		},
		onSuccess: ()=>{
			toast.success("Post deleted successfully")
			queryClient.invalidateQueries({queryKey: ["posts"]})
		}
	})

	const {mutate:likeUnlikePost,isPending:likeUnlikePending} = useMutation({
		mutationFn: async()=>{
				try {
					const res = await fetch(`/api/posts/like/${post._id}`,{
						method: "POST",
					})
					const data = await res.json()

					if(!res.ok) throw new Error(data.error || "Something went wrong!")

					return data

				} catch (error) {
					throw new Error(error.message)
				}
		},
		onSuccess: (updatedLikes)=>{
			// toast.success("Post is liked")
			// is not the most optimal Solution for the UI/UX because it refetch all the posts
			// queryClient.invalidateQueries({queryKey:["posts"]})
			// instead, upfate the cache directly for that post
			queryClient.setQueryData(["posts"],(oldData)=>{
				return oldData.map(p =>{
					if(p._id === post._id)
						return {...p,likes:updatedLikes}
					else
					 return p
				})
			})
		},
		onError: ()=>{
			toast.error("Something went wrong!")
		}
	})

	const {mutate:commentPost,isPending:commentPending,error} = useMutation({
		mutationFn: async()=>{
			try {
				const res = await  fetch(`/api/posts/comment/${post._id}`,{
					method: "POST",
					headers:{
            "Content-Type": "application/json",
          },
          body: JSON.stringify({text:comment})
				})
				const data = await res.json()

				if(!res.ok) throw new Error(data.error || "Something went wrong!")
				
				return data

			} catch (error) {
				throw new Error(error.message)
			}
		},
		onSuccess: (newCommentsInPost)=>{
  		setComment("")
			queryClient.setQueryData(["posts"],(oldData)=>{
				return oldData.map(p => {
					if(p._id === post._id){
						return {...p,comments:newCommentsInPost.comments}
					} else {
						return p
					}
				})
			})
		},
		onError: (error)=>{
			toast.error(error.message)
		}
	}) 
	// Tambahan: Mutasi untuk rating
	const { mutate: ratePost } = useMutation({
		mutationFn: async (value) => {
			const res = await fetch(`/api/posts/rate/${post._id}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ value })
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Gagal memberi rating");
			return data;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["posts"] });
		}
	});

	const postOwner = post.user;
	const isLiked = post.likes.includes(authUser._id);

	const isMyPost = authUser._id === postOwner._id;

	const formattedDate = formatPostDate(post.createdAt);

	const handleDeletePost = (e) => {
		e.stopPropagation(); // <-- tambahkan ini agar tidak trigger navigasi
		deletePost()
	};

	const handlePostComment = (e) => {
		e.preventDefault();
		if(commentPending) return
		commentPost(comment)
	};

	const handleLikePost = () => {
		if(likeUnlikePending) return
		likeUnlikePost()
	};
	// Tambahan: handleRate untuk highlight semua bintang <= value
	const handleRate = (value) => {
		ratePost(value);
	};

	// Mendapatkan rating user saat ini
	const myRating = post.ratings?.find(r => r.user === authUser._id)?.value;

	const handleNavigateToDetail = (e) => {
		// Hindari navigasi jika klik pada tombol atau link tertentu
		const tag = e.target.tagName.toLowerCase();
		const classList = e.target.classList?.toString() || '';
		if (
			tag === 'button' ||
			tag === 'svg' ||
			classList.includes('post__content__postInfo__firstPart__comments') ||
			classList.includes('post__content__postInfo__firstPart__likes') ||
			classList.includes('post__content__userInfo__trashIcon__icon') ||
			classList.includes('post__content__postInfo__seconedPart__icon')
		) return;
		
		navigate(`/post/${post._id}`);
	};

	return (
		<>
			<div className='post' style={{cursor:'pointer'}}
				onClick={handleNavigateToDetail}
			>
				<Link to={`/profile/${postOwner.username}`} className='post__avatar link'>
						<img src={postOwner.profileImg || "/avatar-placeholder.png"} />
					</Link>

				<div className='post__content'>
					<div className='post__content__userInfo'>
						<Link to={`/profile/${postOwner.username}`} className='post__content__userInfo__fullName link'>
							{postOwner.fullname}
						</Link>
						<span className='post__content__userInfo__userName'>
							<Link className="link" to={`/profile/${postOwner.username}`}>@{postOwner.username}</Link>
							<span>·</span>
							<span>{formattedDate}</span>
						</span>
						{isMyPost && (
							<span className='post__content__userInfo__trashIcon'>
								{!deletePending &&(
									<FaTrash onClick={handleDeletePost} className="post__content__userInfo__trashIcon__icon"/>
								)
								}
								{deletePending && (
									<LoadingSpinner  size={"sm"}/>
								)}
							</span>
						)}
					</div>					<div 
						className='post__content__postImage'
						style={{ cursor: 'pointer' }}
						onClick={(e) => {
							e.stopPropagation();
							navigate(`/post/${post._id}`);
						}}
					>
						<span>{post.text}</span>
						{post.img && (
							<img
								src={post.img}
								className='h-80 object-contain rounded-lg border border-gray-700'
								alt={post.movieTitle}
							/>
						)}
					</div>
					{/* Tambahan: tampilkan data film */}
					<div className='post__content__movieInfo'>
						<div><strong>Judul Film:</strong> {post.movieTitle}</div>
						<div><strong>Genre:</strong> {post.genre}</div>
						<div><strong>Sutradara:</strong> {post.director}</div>
						<div><strong>Sinopsis:</strong> {post.synopsis}</div>
						{/* Komponen rating dipindah ke bawah sinopsis */}
						<div className='post__content__rating' style={{display:'flex',alignItems:'center',marginTop:'0.5rem',gap:8}}>
  <span style={{fontWeight:'bold',color:'#23272f',background:'#fbbf24',borderRadius:6,padding:'2px 8px',marginRight:8}}>
    {post.avgRating ? post.avgRating.toFixed(1) : '-'}
  </span>
  {/* Bintang rating dengan style custom, ukuran lebih kecil */}
  {[1,2,3,4,5].map((star) => {
    let fill = '#FFD600';
    let half = false;
    if (post.avgRating) {
      if (star <= Math.floor(post.avgRating)) fill = '#FFD600';
      else if (star - post.avgRating < 1 && star - post.avgRating > 0) half = true;
      else fill = '#E0E0E0';
    } else {
      fill = '#E0E0E0';
    }
    return (
      <svg
        key={star}
        width="18" height="18" viewBox="0 0 24 24"
        style={{marginRight:1, cursor:'pointer', verticalAlign:'middle'}}
        onClick={() => handleRate(star)}
      >
        <defs>
          <linearGradient id={`half-star-${post._id}-${star}`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="50%" stopColor="#FFD600" />
            <stop offset="50%" stopColor="#E0E0E0" />
          </linearGradient>
        </defs>
        <path
          d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
          fill={half ? `url(#half-star-${post._id}-${star})` : fill}
          stroke="#FFD600"
          strokeWidth="1"
        />
      </svg>
    );
  })}
  </div>
					</div>
					<div className='post__content__postInfo'>
						<div className='post__content__postInfo__firstPart'>
							<div
								className='post__content__postInfo__firstPart__comments'
								onClick={() => document.getElementById("comments_modal" + post._id).showModal()}
							>
								<FaRegComment className='post__content__postInfo__firstPart__comments__icon' />
								<span className='text-sm text-slate-500 group-hover:text-sky-400'>
									{post.comments.length}
								</span>
							</div>
							{/* We're using Modal Component from DaisyUI */}
							<dialog id={`comments_modal${post._id}`} className='post__content__postInfo__firstPart__showComments'>
								<div className='post__content__postInfo__firstPart__showComments__section'>
									<h3 className='post__content__postInfo__firstPart__showComments__section__header'>COMMENTS</h3>
									<div className='post__content__postInfo__firstPart__showComments__section__allComments'>
										{post.comments.length === 0 && (
											<p className='post__content__postInfo__firstPart__showComments__section__allComments__noComments'>
												No comments yet 🤔 Be the first one 😉
											</p>
										)}
										{post.comments.map((comment) => (
											<div key={comment._id} className='post__content__postInfo__firstPart__showComments__section__allComments__comment'>	
												<img
													src={comment.user.profileImg || "/avatar-placeholder.png"} className="post__content__postInfo__firstPart__showComments__section__allComments__comment__avatar"
													/>
											
												<div className='post__content__postInfo__firstPart__showComments__section__allComments__comment__userInfo'>
													<div className='post__content__postInfo__firstPart__showComments__section__allComments__comment__userInfo__first'>
														<span className='font-bold'>{comment.user.fullname}</span>
														<span className='text-gray-700 text-sm'>
															@{comment.user.username}
														</span>
													</div>
													<div className='post__content__postInfo__firstPart__showComments__section__allComments__comment__userInfo__seconed'>{comment.text}</div>
												</div>
											</div>
										))}
									</div>
									<form
										className='post__content__postInfo__firstPart__showComments__section__addComment'
										onSubmit={handlePostComment}
									>
										<textarea
											className=''
											placeholder='Add a comment...'
											value={comment}
											onChange={(e) => setComment(e.target.value)}
										/>
										<button className='post__content__postInfo__firstPart__showComments__section__addComment__btn'>
											{commentPending ? (
												<LoadingSpinner size={"sm"} />
											) : (
												"Post"
											)}
										</button>
									</form>
								</div>
								<form method='dialog' className='post__content__postInfo__firstPart__showComments__btn'>
									<button className='outline-none'>close</button>
								</form>
							</dialog>
							<div className='post__content__postInfo__firstPart__replys'>
								<BiRepost className='post__content__postInfo__firstPart__replys__icon' />
								<span className=''>0</span>
							</div>
							<div className='post__content__postInfo__firstPart__likes' onClick={handleLikePost}>
								{!isLiked && !likeUnlikePending && (
									<FaRegHeart className='post__content__postInfo__firstPart__likes__icon' />
								)}
								{isLiked && !likeUnlikePending && <FaRegHeart className='post__content__postInfo__firstPart__likes__icon active' />}
								{likeUnlikePending && <LoadingSpinner size={"sm"}/>}
								<span
									className={`post__content__postInfo__firstPart__likes ${
										isLiked ? "isLiked" : ""
									}`}
								>
									{post.likes.length}
								</span>
							</div>
						</div>
						<div className='post__content__postInfo__seconedPart'>
							<FaRegBookmark className='post__content__postInfo__seconedPart__icon' />
						</div>
					</div>
				</div>
			</div>
		</>
	);
};
export default Post;