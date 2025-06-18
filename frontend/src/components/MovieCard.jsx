import React from 'react';
import { Link } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';

const MovieCard = ({ movie, isWatchlistView = false }) => {
  if (!movie) return null;

  return (
    <Link 
      to={`/post/${movie._id}`} 
      className="movie-card-link"
    >
      <div className="movie-card">
        <div className="movie-poster">
          <img
            src={movie.img || '/movie-placeholder.png'}
            alt={movie.movieTitle}
            className="poster-image"
          />
          <div className="movie-overlay">
            <div className="movie-rating">
              <FaStar className="star-icon" />
              <span>{movie.avgRating?.toFixed(1) || "0.0"}</span>
            </div>
          </div>
        </div>
        
        <div className="movie-info">
          <h3 className="movie-title">{movie.movieTitle}</h3>
          <div className="movie-meta">
            <span className="movie-year">{movie.year}</span>
            <span className="movie-genre">{movie.genre}</span>
          </div>
          {isWatchlistView && movie.director && (
            <p className="movie-director">Director: {movie.director}</p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;