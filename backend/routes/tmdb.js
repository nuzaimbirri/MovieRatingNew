import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const TMDB_API_KEY = process.env.TMDB_API_KEY;

// Debug endpoint
router.get('/', (req, res) => {
  res.json({ message: 'TMDB routes are working' });
});

// Get movie genres
router.get('/genres', async (req, res) => {
  try {
    console.log('Fetching movie genres...');
    
    const url = `https://api.themoviedb.org/3/genre/movie/list?api_key=${TMDB_API_KEY}&language=en-US`;
    const response = await axios.get(url);

    if (response.status === 200 && response.data) {
      res.json(response.data);
    } else {
      throw new Error('Invalid response from TMDB');
    }
  } catch (error) {
    console.error('TMDB API Error:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch movie genres',
      details: error.message 
    });
  }
});

// Get movies by genre
router.get('/movies/genre/:genreId', async (req, res) => {
  try {
    const { genreId } = req.params;
    console.log(`Fetching movies for genre ${genreId}...`);
    
    const url = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&language=en-US&sort_by=popularity.desc&with_genres=${genreId}`;
    
    const response = await axios.get(url);

    if (response.status === 200 && response.data && response.data.results) {
      res.json(response.data);
    } else {
      throw new Error('Invalid response from TMDB');
    }
  } catch (error) {
    console.error('TMDB API Error:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch movies by genre',
      details: error.message 
    });
  }
});

// Discover movies (popular)
router.get('/movies/discover', async (req, res) => {
  try {
    console.log('Fetching movies from TMDB...');
    
    const url = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&language=en-US&sort_by=popularity.desc`;
    
    const response = await axios.get(url);

    console.log('TMDB Response Status:', response.status);
    console.log('TMDB Response Data:', response.data); // Tambah log untuk debugging
    
    if (response.status === 200 && response.data && response.data.results) {
      res.json(response.data);
    } else {
      throw new Error('Invalid response from TMDB');
    }

  } catch (error) {
    console.error('TMDB API Error:', error.message);
    res.status(500).json({ 
      error: 'Gagal mengambil data film dari TMDB',
      details: error.message 
    });
  }
});

export default router;