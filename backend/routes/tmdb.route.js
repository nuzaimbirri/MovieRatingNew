import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

const headers = {
  accept: 'application/json',
  Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1OTUzZjRiN2MzN2M4MzZjYzg1MmZkNzU1ZmQ2M2RhMCIsIm5iZiI6MTc0ODg1OTU0MC44ODUsInN1YiI6IjY4M2Q3YTk0ZTMwMDUxMTdiYTI4OGU2ZSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.sxF98j8Mg0pt_kaLxI3yfRKy4KJjEvyrVlDVCYcBx-U'
};

// Debug endpoint
router.get('/', (req, res) => {
  res.json({ message: 'TMDB routes are working' });
});

// Get movie genres
router.get('/genres', async (req, res) => {
  try {
    console.log('Fetching movie genres...');
    
    const url = 'https://api.themoviedb.org/3/genre/movie/list?language=en';
    const response = await axios.get(url, {
      headers: headers
    });

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
    
    const url = `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc&with_genres=${genreId}`;
    
    const response = await axios.get(url, {
      headers: headers
    });

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

// Existing endpoint
router.get('/movies/discover', async (req, res) => {
  try {
    console.log('Fetching movies from TMDB...');
    
    const url = 'https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc';
    
    const response = await axios.get(url, {
      headers: headers
    });

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

// New endpoint 
router.get('/movies/trending', async (req, res) => {
  try {
    console.log('Fetching data from TMDB with new API key...');
    
    const url = `https://api.themoviedb.org/3/trending/all/day?language=en-US`;
    const response = await axios.get(url, {
      headers: headers
    });

    console.log('TMDB Response Status:', response.status);
    
    if (response.status === 200 && response.data) {
      res.json(response.data);
    } else {
      throw new Error('Invalid response from TMDB');
    }
  } catch (error) {
    console.error('TMDB API Error:', error.message);
    res.status(500).json({ 
      error: 'Gagal mengambil data dari TMDB',
      details: error.message 
    });
  }
});

export default router;