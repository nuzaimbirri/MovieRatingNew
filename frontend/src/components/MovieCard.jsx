import React from 'react';

const MovieCard = ({ movie }) => {
  return (
    <div style={{
      background: '#1e1e1e',
      borderRadius: '8px',
      overflow: 'hidden',
      border: '1px solid #333',
      transition: 'all 0.3s ease',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{
        width: '100%',
        aspectRatio: '2/3',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <img
          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
          alt={movie.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease'
          }}
        />
      </div>
      <div style={{
        padding: '12px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <h3 style={{
          color: '#fff',
          fontSize: '0.9rem',
          fontWeight: '600',
          marginBottom: '4px',
          display: '-webkit-box',
          WebkitLineClamp: '2',
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          lineHeight: '1.2'
        }}>{movie.title}</h3>
        
        <div style={{
          marginTop: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ color: '#666', fontSize: '0.8rem' }}>
            {new Date(movie.release_date).getFullYear()}
          </span>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: '#252525',
            padding: '4px 8px',
            borderRadius: '4px'
          }}>
            <span style={{ color: '#ffd700', fontSize: '0.8rem' }}>★</span>
            <span style={{ 
              color: '#fff', 
              fontSize: '0.8rem',
              fontWeight: '600'
            }}>
              {movie.vote_average.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;