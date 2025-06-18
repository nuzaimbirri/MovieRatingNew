import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

function SearchPage() {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const navigate = useNavigate();

  // Fetch rekomendasi film dari backend
  const { data: movies, isLoading, isError } = useQuery({
    queryKey: ["movieRecommendations"],
    queryFn: async () => {
      const res = await fetch("/api/posts/movies");
      if (!res.ok) throw new Error("Failed to fetch movies");
      return res.json();
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSearching(true);
    setSearchError(null);
    // Navigasi ke halaman utama dengan filter tweet (query di URL, tanpa search=1)
    navigate(`/?movieTitle=${encodeURIComponent(search)}`);
    setIsSearching(false);
  };

  // Fungsi untuk handle klik pada hasil pencarian atau rekomendasi
  const handleMovieClick = (movieTitle) => {
    setSearch(movieTitle);
    // Navigasi ke halaman utama dengan filter tweet (query di URL, tanpa search=1)
    navigate(`/?movieTitle=${encodeURIComponent(movieTitle)}`);
  };

  return (
    <div className="search-page" style={{
      background: 'var(--main-bg, #fff)',
      borderRadius: '16px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
      padding: '2rem 1.5rem',
      maxWidth: 480,
      margin: '2rem auto',
      minHeight: 320
    }}>
      <form className="search-page__form" onSubmit={handleSubmit} style={{
        display: 'flex',
        gap: 8,
        marginBottom: 24
      }}>
        <input
          type="text"
          className="search-page__input"
          placeholder="Cari nama film..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          required
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            borderRadius: 8,
            border: '1px solid var(--border, #e0e0e0)',
            fontSize: 16,
            background: 'var(--input-bg, #f7f7f7)',
            outline: 'none',
            color: 'var(--text-main, #222)',
            transition: 'border 0.2s',
          }}
        />
        <button
          className="search-page__btn"
          type="submit"
          style={{
            background: 'var(--primary, #fabd23)',
            color: 'var(--button-text, #fff)',
            border: 'none',
            borderRadius: 8,
            padding: '0 1.5rem',
            fontWeight: 600,
            fontSize: 16,
            cursor: 'pointer',
            boxShadow: '0 1px 4px rgba(59,130,246,0.08)'
          }}
        >
          Search
        </button>
      </form>
      {/* Hasil pencarian */}
      {isSearching && <div style={{color:'var(--primary, #fabd23)',marginBottom:8}}>Mencari...</div>}
      {searchError && <div className="error" style={{color:'var(--danger, #ef4444)',marginBottom:8}}>{searchError}</div>}
      {searchResult.length > 0 && (
        <div className="search-page__results" style={{marginBottom:24}}>
          <h4 style={{margin:'0 0 8px 0',color:'var(--primary, #fabd23)',fontWeight:700,fontSize:18}}>Hasil Pencarian</h4>
          <ul style={{listStyle:'none',padding:0,margin:0}}>
            {searchResult.map((movie, idx) => (
              <li key={idx} className="search-page__movie-item" style={{
                background:'var(--card-bg, #f3f4f6)',
                borderRadius:8,
                padding:'0.75rem 1rem',
                marginBottom:8,
                display:'flex',
                alignItems:'center',
                gap:8,
                cursor:'pointer'
              }}
              onClick={() => handleMovieClick(movie.movieTitle)}
              >
                <strong style={{color:'var(--text-main, #111827)'}}>{movie.movieTitle}</strong> <span style={{color:'var(--primary, #fabd23)',fontWeight:500}}>{movie.genre && `(${movie.genre})`}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* Rekomendasi film */}
      <div className="search-page__recommendations">
        <h4 style={{margin:'0 0 8px 0',color:'var(--primary, #fabd23)',fontWeight:700,fontSize:18}}>Rekomendasi Film Terbaru</h4>
        {isLoading && <div style={{color:'var(--primary, #fabd23)'}}>Loading...</div>}
        {isError && <div style={{color:'var(--danger, #ef4444)'}}>Gagal memuat rekomendasi.</div>}
        {movies && movies.length === 0 && <div style={{color:'var(--text-secondary, #6b7280)'}}>Belum ada rekomendasi film.</div>}
        {movies && movies.length > 0 && (
          <ul style={{listStyle:'none',padding:0,margin:0}}>
            {movies.map((movie, idx) => (
              <li key={idx} className="search-page__movie-item" style={{
                background:'var(--card-bg, #f3f4f6)',
                borderRadius:8,
                padding:'0.75rem 1rem',
                marginBottom:8,
                display:'flex',
                alignItems:'center',
                gap:8,
                cursor:'pointer'
              }}
              onClick={() => handleMovieClick(movie.movieTitle)}
              >
                <strong style={{color:'var(--text-main, #111827)'}}>{movie.movieTitle}</strong> <span style={{color:'var(--primary, #fabd23)',fontWeight:500}}>{movie.genre && `(${movie.genre})`}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default SearchPage;
