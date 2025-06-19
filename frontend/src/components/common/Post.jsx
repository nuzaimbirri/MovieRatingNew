import { FaRegComment } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { FaRegBookmark, FaBookmark } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import PropTypes from "prop-types";

import LoadingSpinner from "../common/LoadingSpinner.jsx";
import { formatPostDate } from "../../utils/date/index.js";

const Post = ({ post }) => {
	const navigate = useNavigate();
	const [comment, setComment] = useState("");
	const { data: authUser } = useQuery({ queryKey: ["authUser"] });
	const queryClient = useQueryClient();
	const isInWatchlist = authUser?.watchlist?.includes(post._id);

	const { mutate: deletePost, isPending: deletePending } = useMutation({
		mutationFn: async () => {
			try {
				const res = await fetch(`/api/posts/${post._id}`, {
					// <-- tambahkan slash di depan
					method: "DELETE",
				});
				const data = await res.json();

				if (!res.ok) throw new Error(data.error || "Something went wrong!");
				return data;
			} catch (error) {
				throw new Error(error.message);
			}
		},
		onSuccess: () => {
			toast.success("Post deleted successfully");
			queryClient.invalidateQueries({ queryKey: ["posts"] });
		},
	});

	const isLiked = post.likes.includes(authUser._id);

	const { mutate: likeUnlikePost, isPending: likeUnlikePending } = useMutation({
		mutationFn: async () => {
			const res = await fetch(`/api/posts/like/${post._id}`, {
				method: "POST",
				credentials: "include",
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Gagal melakukan aksi like!");
			return data;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["posts"] });
			toast.success(isLiked ? "Unlike berhasil" : "Like berhasil");
		},
		onError: (error) => {
			toast.error(error.message || "Gagal melakukan aksi like!");
		},
	});

	const { mutate: commentPost, isPending: commentPending, error } = useMutation({
		mutationFn: async () => {
			try {
				const res = await fetch(`/api/posts/comment/${post._id}`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ text: comment }),
				});
				const data = await res.json();

				if (!res.ok) throw new Error(data.error || "Something went wrong!");

				return data;
			} catch (error) {
				throw new Error(error.message);
			}
		},
		onSuccess: (newCommentsInPost) => {
			setComment("");
			queryClient.setQueryData(["posts"], (oldData) => {
				return oldData.map((p) => {
					if (p._id === post._id) {
						return { ...p, comments: newCommentsInPost.comments };
					} else {
						return p;
					}
				});
			});
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});
	// Tambahan: Mutasi untuk rating
	const { mutate: ratePost } = useMutation({
		mutationFn: async (value) => {
			const res = await fetch(`/api/posts/rate/${post._id}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ value }),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Gagal memberi rating");
			return data;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["posts"] });
		},
	});

	const postOwner = post.user;

	const isMyPost = authUser._id === postOwner._id;

	const formattedDate = formatPostDate(post.createdAt);

	const handleDeletePost = (e) => {
		e.stopPropagation(); // <-- tambahkan ini agar tidak trigger navigasi
		deletePost();
	};

	const handlePostComment = (e) => {
		e.preventDefault();
		if (commentPending) return;
		commentPost(comment);
	};

	const handleLikePost = (e) => {
		e?.stopPropagation();
		if (!likeUnlikePending) likeUnlikePost();
	};
	// Tambahan: handleRate untuk highlight semua bintang <= value
	const handleRate = (value) => {
		ratePost(value);
	};

	// Mendapatkan rating user saat ini
	const myRating = post.ratings?.find((r) => r.user === authUser._id)?.value;

	const handleNavigateToDetail = (e) => {
		// Hindari navigasi jika klik pada tombol atau link tertentu
		const tag = e.target.tagName.toLowerCase();
		const classList = e.target.classList?.toString() || "";
		if (
			tag === "button" ||
			tag === "svg" ||
			classList.includes("post__content__postInfo__firstPart__comments") ||
			classList.includes("post__content__postInfo__firstPart__likes") ||
			classList.includes("post__content__userInfo__trashIcon__icon") ||
			classList.includes("post__content__postInfo__seconedPart__icon")
		)
			return;

		navigate(`/post/${post._id}`);
	};

	const { mutate: toggleWatchlist, isPending: watchlistPending } = useMutation({
		mutationFn: async () => {
			const res = await fetch("/api/watchlist/toggle", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ postId: post._id }),
			});
			if (!res.ok) {
				const err = await res.json();
				throw new Error(err.error || "Gagal update watchlist");
			}
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries(["authUser"]);
			queryClient.invalidateQueries(["watchlist"]);
			toast.success(isInWatchlist ? "Dihapus dari Watchlist" : "Ditambahkan ke Watchlist");
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	return (
		<>
			<div className="post" style={{ cursor: "pointer" }} onClick={handleNavigateToDetail}>
				<Link to={`/profile/${postOwner.username}`} className="post__avatar link">
					<img src={postOwner.profileImg || "/avatar-placeholder.png"} />
				</Link>

				<div className="post__content">
					<div className="post__content__userInfo">
						<Link to={`/profile/${postOwner.username}`} className="post__content__userInfo__fullName link">
							{postOwner.fullname}
						</Link>
						<span className="post__content__userInfo__userName">
							<Link className="link" to={`/profile/${postOwner.username}`}>
								@{postOwner.username}
							</Link>
							<span>·</span>
							<span>{formattedDate}</span>
						</span>
						{isMyPost && (
							<span className="post__content__userInfo__trashIcon">
								{!deletePending && (
									<FaTrash onClick={handleDeletePost} className="post__content__userInfo__trashIcon__icon" />
								)}
								{deletePending && <LoadingSpinner size={"sm"} />}
							</span>
						)}
					</div>

					{/* Judul & Genre di atas gambar */}
					<div
						className="post__content__movieTitleGenre"
						style={{
							color: "#fff",
							padding: "20px 12px",
							borderRadius: "8px 8px 0 0",
							position: "relative",
							zIndex: 2,
							marginBottom: "-8px",
							maxWidth: "80%",
						}}
					>
						<div style={{ fontWeight: "bold", fontSize: "1.1rem" }}>{post.movieTitle}</div>
						<div
							style={{
								display: "inline-block",
								color: "#fbbf24",
								padding: "2px 12px",
								borderRadius: "6px",
								border: "1.5px solid #fbbf24",
								fontSize: "0.95rem",
								fontWeight: 600,
								marginTop: 4,
								boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
							}}
						>
							{post.genre}
						</div>
					</div>

					<div
						className="post__content__postImage"
						style={{ cursor: "pointer" }}
						onClick={(e) => {
							e.stopPropagation();
							navigate(`/post/${post._id}`);
						}}
					>
						{post.img && (
							<img
								src={post.img}
								className="h-80 object-contain rounded-lg border border-gray-700"
								alt={post.movieTitle}
							/>
						)}
					</div>

					{/* Bagian lain (komentar, like, dsb) tetap */}
					<div className="post__content__postInfo">
						<div className="post__content__postInfo__firstPart">
							<div
								className="post__content__postInfo__firstPart__comments"
								onClick={() => document.getElementById("comments_modal" + post._id).showModal()}
							>
								<FaRegComment className="post__content__postInfo__firstPart__comments__icon" />
								<span className="text-sm text-slate-500 group-hover:text-sky-400">
									{post.comments.length}
								</span>
							</div>
							{/* We're using Modal Component from DaisyUI */}
							<dialog id={`comments_modal${post._id}`} className="post__content__postInfo__firstPart__showComments">
								<div className="post__content__postInfo__firstPart__showComments__section">
									<h3 className="post__content__postInfo__firstPart__showComments__section__header">COMMENTS</h3>
									<div className="post__content__postInfo__firstPart__showComments__section__allComments">
										{post.comments.length === 0 && (
											<p className="post__content__postInfo__firstPart__showComments__section__allComments__noComments">
												No comments yet 🤔 Be the first one 😉
											</p>
										)}
										{post.comments.map((comment) => (
											<div key={comment._id} className="post__content__postInfo__firstPart__showComments__section__allComments__comment">
												<img
													src={comment.user.profileImg || "/avatar-placeholder.png"}
													className="post__content__postInfo__firstPart__showComments__section__allComments__comment__avatar"
												/>

												<div className="post__content__postInfo__firstPart__showComments__section__allComments__comment__userInfo">
													<div className="post__content__postInfo__firstPart__showComments__section__allComments__comment__userInfo__first">
														<span className="font-bold">{comment.user.fullname}</span>
														<span className="text-gray-700 text-sm">@{comment.user.username}</span>
													</div>
													<div className="post__content__postInfo__firstPart__showComments__section__allComments__comment__userInfo__seconed">
														{comment.text}
													</div>
												</div>
											</div>
										))}
									</div>
									<form
										className="post__content__postInfo__firstPart__showComments__section__addComment"
										onSubmit={handlePostComment}
									>
										<textarea
											className=""
											placeholder="Add a comment..."
											value={comment}
											onChange={(e) => setComment(e.target.value)}
										/>
										<button className="post__content__postInfo__firstPart__showComments__section__addComment__btn">
											{commentPending ? <LoadingSpinner size={"sm"} /> : "Post"}
										</button>
									</form>
								</div>
								<form method="dialog" className="post__content__postInfo__firstPart__showComments__btn">
									<button className="outline-none">close</button>
								</form>
							</dialog>
									<div className="post__content__postInfo__firstPart__likes" onClick={handleLikePost} style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center' }}>
								{isLiked && !likeUnlikePending ? (
									<FaHeart className="post__content__postInfo__firstPart__likes__icon active" />
								) : (
									<FaRegHeart className="post__content__postInfo__firstPart__likes__icon" />
								)}
								{likeUnlikePending && <LoadingSpinner size={"sm"} />}
								<span
									className={`post__content__postInfo__firstPart__likes ${isLiked ? "isLiked" : ""}`}
								>
									{post.likes.length}
								</span>
							</div>
						</div>
						<div className="post__content__postInfo__seconedPart">
							<button
								onClick={(e) => {
									e.stopPropagation();
									if (!watchlistPending) toggleWatchlist();
								}}
								className="post__content__postInfo__seconedPart__icon bookmark-btn"
								disabled={watchlistPending}
								style={{ background: 'rgba(0,0,0,0.85)', border: 'none', boxShadow: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
							>
								{watchlistPending ? (
									<LoadingSpinner size="sm" />
								) : isInWatchlist ? (
									<FaBookmark style={{ color: "#EAB93B", fontSize: '1.2rem' }} />
								) : (
									<FaRegBookmark style={{ color: "", fontSize: '1.2rem' }} />
								)}
							</button>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

Post.propTypes = {
	post: PropTypes.shape({
		_id: PropTypes.string.isRequired,
		user: PropTypes.shape({
			_id: PropTypes.string.isRequired,
			username: PropTypes.string.isRequired,
			profileImg: PropTypes.string,
			fullname: PropTypes.string.isRequired,
		}).isRequired,
		likes: PropTypes.arrayOf(PropTypes.string).isRequired,
		createdAt: PropTypes.string.isRequired,
		ratings: PropTypes.arrayOf(
			PropTypes.shape({
				user: PropTypes.string.isRequired,
				value: PropTypes.number.isRequired,
			})
		),
		movieTitle: PropTypes.string,
		genre: PropTypes.string,
		img: PropTypes.string,
		comments: PropTypes.arrayOf(
			PropTypes.shape({
				_id: PropTypes.string.isRequired,
				text: PropTypes.string.isRequired,
				user: PropTypes.shape({
					_id: PropTypes.string.isRequired,
					username: PropTypes.string.isRequired,
				}).isRequired,
			})
		).isRequired,
	}).isRequired,
};

export default Post;