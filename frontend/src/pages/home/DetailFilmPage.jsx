import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import "./DetailFilmPage.css";
import { FaStar } from 'react-icons/fa';
import { BiComment, BiLike } from 'react-icons/bi';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

const DetailFilmPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");
  const [commentRating, setCommentRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: film, isLoading, error } = useQuery({
    queryKey: ['film', id],
    queryFn: async () => {
      if (!id) throw new Error('ID film tidak valid');
      
      const res = await fetch(`/api/posts/detail/${id}`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengambil detail film');
      }

      // Transform data to ensure correct types
      return {
        ...data,
        avgRating: Number(data.avgRating || 0),
        ratings: Array.isArray(data.ratings) ? data.ratings : [],
        comments: Array.isArray(data.comments) ? data.comments : []
      };
    },
    retry: 2,
    retryDelay: 1000,
    staleTime: 60000,
    enabled: !!id,
    onError: (error) => {
      toast.error(error.message);
      console.error('Query error:', error);
    }
  });

  // Enhanced comment mutation
  const { mutate: addComment, isLoading: isAddingComment } = useMutation({
    mutationFn: async (data) => {
      setIsSubmitting(true);
      try {
        const res = await fetch(`/api/posts/comment/${id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(data),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error);
        return result;
      } finally {
        setIsSubmitting(false);
      }
    },
    onSuccess: () => {
      setComment('');
      setCommentRating(0);
      queryClient.invalidateQueries(['film', id]);
      toast.success('Komentar berhasil ditambahkan');
    },
    onError: (error) => {
      toast.error(error.message || 'Gagal menambahkan komentar');
    }
  });

  // Enhanced rating mutation with optimistic updates
  const { mutate: addRating, isLoading: isAddingRating } = useMutation({
    mutationFn: async (value) => {
      const res = await fetch(`/api/posts/rate/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    },
    onMutate: async (newRating) => {
      await queryClient.cancelQueries(['film', id]);
      const previousFilm = queryClient.getQueryData(['film', id]);
      
      // Optimistic update
      queryClient.setQueryData(['film', id], old => ({
        ...old,
        ratings: [...(old.ratings || []), { value: newRating, user: {} }],
        avgRating: newRating
      }));

      return { previousFilm };
    },
    onError: (err, newRating, context) => {
      queryClient.setQueryData(['film', id], context.previousFilm);
      toast.error('Gagal memberikan rating');
    },
    onSettled: () => {
      queryClient.invalidateQueries(['film', id]);
    }
  });

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error('Komentar tidak boleh kosong.');
      return;
    }
    if (commentRating === 0) {
      toast.error('Harap berikan rating.');
      return;
    }
    addComment({ text: comment, rating: commentRating });
  };

  const handleRating = (value) => {
    if (isAddingRating) return;
    addRating(value);
  };

  const handleCommentRating = (rating) => {
    setCommentRating(rating);
  };

  const calculateUserRating = (userId) => {
    const userRating = film?.ratings?.find(r => r.user._id === userId);
    return userRating ? userRating.value : 0;
  };

  const getUserRating = (userId) => {
    return film?.ratings?.find(r => r.user._id === userId)?.value || 0;
  };

  const renderStars = (rating, isInteractive = false, onRatingClick = null) => {
    return [...Array(5)].map((_, index) => {
      const starValue = index + 1;
      return (
        <FaStar
          key={index}
          className={`star-icon ${starValue <= rating ? 'filled' : ''}`}
          onClick={isInteractive ? () => onRatingClick(starValue) : undefined}
        />
      );
    });
  };

  const renderCommentStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <FaStar
        key={index}
        className={`comment-star-icon ${index < rating ? '' : 'empty'}`}
      />
    ));
  };

  // Early return with better loading state
  if (isLoading) {
    return (
      <div className="detail-film-page min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4">Memuat detail film...</p>
        </div>
      </div>
    );
  }

  // Error handling with retry option
  if (error) {
    return (
      <div className="detail-film-page min-h-screen flex items-center justify-center">
        <div className="text-center p-4">
          <h3 className="text-xl font-bold mb-2">Error</h3>
          <p className="text-red-500 mb-4">{error.message}</p>
          <div className="space-x-4">
            <button
              onClick={() => queryClient.invalidateQueries(['film', id])}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Coba Lagi
            </button>
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Kembali
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!film) {
    return (
      <div className="detail-film-page min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>Film tidak ditemukan</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  // Helper function untuk format rating
  const formatRating = (rating) => {
    const numRating = Number(rating);
    return Number.isFinite(numRating) ? numRating.toFixed(1) : '-';
  };

  // Add helper function for formatting dates
  const formatCommentDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, {
        addSuffix: true,
        locale: id
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <div className="detail-film-container">
      <div className="detail-header-section">
        <nav className="navigation-bar">
          <button onClick={() => navigate(-1)} className="back-button">
            ← Back
          </button>
        </nav>

        <div className="main-content">
          <div className="poster-section">
            <img 
              src={film?.img || '/movie-placeholder.png'} 
              alt={film?.movieTitle}
              className="movie-poster"
            />
            <button className="add-watchlist-button">
              + Add to Watchlist
            </button>
          </div>

          <div className="movie-info-section">
            <h1 className="movie-title">{film?.movieTitle}</h1>
            <div className="movie-meta">
              <span>{film?.year}</span>
              <span className="separator">•</span>
              <span>{film?.genre}</span>
              <span className="separator">•</span>
              <span>{film?.duration}</span>
            </div>

            <div className="rating-container">
              <div className="imdb-rating">
                <div className="rating-score">
                  <span className="star-icon">★</span>
                  <span className="score">{formatRating(film?.avgRating)}</span>
                  <span className="total">/5</span>
                </div>
                <span className="rating-count">{film?.ratings?.length || 0}</span>
              </div>
              
              <div className="user-rating">
                <span className="rate-text">Rate this</span>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRating(star)}
                      className={`star-button ${star <= (Number(film?.avgRating) || 0) ? 'active' : ''}`}
                      disabled={isAddingRating}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="synopsis-section">
              <p className="synopsis-text">{film?.synopsis}</p>
            </div>

            <div className="creator-info">
              <div className="info-row">
                <span className="label">Director</span>
                <span className="value">{film?.director}</span>
              </div>
              <div className="info-row">
                <span className="label">Posted by</span>
                <Link to={`/profile/${film?.user?.username}`} className="value link">
                  {film?.user?.username}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="comments-section">
        <div className="comments-header">
          <h3 className="section-title">Komentar</h3>
          <div className="comments-count">{film.comments.length}</div>
        </div>

        <div className="comment-form-container">
          <div className="comment-form-wrapper">
            <div className="comment-form-avatar">
              <img src="/avatar-placeholder.png" alt="Your avatar" />
            </div>
            <form onSubmit={handleCommentSubmit} className="comment-form">
              <div className="comment-rating-input">
                <span className="rating-label">Beri Rating:</span>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                      key={star}
                      className={`comment-star-input ${star <= commentRating ? 'active' : ''}`}
                      onClick={() => handleCommentRating(star)}
                    />
                  ))}
                </div>
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tambahkan komentar..."
                maxLength={280}
                className="comment-input"
              />
              <div className="comment-form-footer">
                <div className="comment-length">{comment.length}/280</div>
                <button 
                  type="submit" 
                  disabled={isAddingComment || !comment.trim() || commentRating === 0}
                  className="comment-submit-btn"
                >
                  {isAddingComment ? 'Mengirim...' : 'Kirim'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="comments-list">
          {film.comments.map((comment) => (
            <div key={comment._id} className="comment-item">
              <div className="comment-avatar">
                <img
                  src={comment.user?.profileImg || "/avatar-placeholder.png"}
                  alt={comment.user?.username}
                />
              </div>
              <div className="comment-main">
                <div className="comment-header">
                  <div className="comment-user-info">
                    <Link to={`/profile/${comment.user?.username}`} className="comment-username">
                      {comment.user?.username}
                    </Link>
                    <span className="comment-time">
                      {formatCommentDate(comment.createdAt)}
                    </span>
                  </div>
                  {getUserRating(comment.user?._id) > 0 && (
                    <div className="comment-user-rating">
                      {renderCommentStars(getUserRating(comment.user?._id))}
                    </div>
                  )}
                </div>
                <p className="comment-text">{comment.text}</p>
                <div className="comment-actions">
                  <button className="comment-action">
                    <BiComment /> Balas
                  </button>
                  <button className="comment-action">
                    <BiLike /> Suka
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DetailFilmPage;