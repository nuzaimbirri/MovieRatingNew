import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MovieCard from '../MovieCard';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

function MoviesPage() {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch genres on component mount
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/tmdb/genres');
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch genres');
        }
        
        setGenres(data.genres || []);
      } catch (error) {
        console.error('Error fetching genres:', error);
        toast.error('Failed to load movie genres');
      }
    };
    fetchGenres();
  }, []);

  // Fetch movies based on selected genre
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const url = selectedGenre
          ? `http://localhost:5000/api/tmdb/movies/genre/${selectedGenre}`
          : 'http://localhost:5000/api/tmdb/movies/discover';
        const response = await fetch(url);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch movies');
        }
        
        setMovies(data.results?.slice(0, 10) || []);
      } catch (error) {
        console.error('Error fetching movies:', error);
        toast.error('Failed to load movies');
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, [selectedGenre]);

  const handleGenreClick = (genreId) => {
    setSelectedGenre(genreId === selectedGenre ? null : genreId);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      width: '100%',
      gap: '24px',
      padding: '0 20px'
    }}>
      {/* Main content area */}
      <div style={{ flex: 1, padding: '20px' }}>
        <h1 style={{ 
          fontSize: '1.8rem', 
          fontWeight: '700', 
          color: '#fff', 
          marginBottom: '20px' 
        }}>
          {selectedGenre ? 'Movies by Genre' : 'Popular Movies'}
        </h1>        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '16px',
          marginBottom: '16px'
        }}>
          {movies.map((movie) => (
            <div 
              key={movie.id} 
              onClick={() => {
                if (movie.original_title?.toLowerCase().includes('lilo') || 
                    movie.title?.toLowerCase().includes('lilo')) {
                  navigate('/movies/lilo');
                }
              }} 
              style={{ 
                cursor: movie.title?.toLowerCase().includes('lilo') ? 'pointer' : 'default',
                transition: 'transform 0.2s',
                ':hover': {
                  transform: movie.title?.toLowerCase().includes('lilo') ? 'scale(1.05)' : 'none'
                }
              }}
            >
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
      </div>     
      <div style={{
        width: '300px',
        padding: '20px'
      }}>
        {/* Genre filter panel */}
        <div style={{
          background: '#1e1e1e',
          padding: '20px',
          borderRadius: '12px'
        }}>
          <h2 style={{
            color: '#fff',
            fontSize: '1.2rem',
            marginBottom: '16px'
          }}>Filter by Genre</h2>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            {genres.map((genre) => (
              <button
                key={genre.id}
                onClick={() => handleGenreClick(genre.id)}
                style={{
                  background: selectedGenre === genre.id ? '#fbbf24' : 'transparent',
                  color: selectedGenre === genre.id ? '#000' : '#fff',
                  border: '1px solid #fbbf24',
                  padding: '6px 12px',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                {genre.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MoviesPage;