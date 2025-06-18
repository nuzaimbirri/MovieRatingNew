const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  getDetailPost,
  addComment,
  addRating
} = require('../controllers/postController');

router.get('/detail/:id', async (req, res) => {
  // Ambil detail film berdasarkan id
  // ...implementasi...
});

router.post('/comment/:id', async (req, res) => {
  // Tambah komentar ke film dengan id
  // ...implementasi...
});

router.post('/rate/:id', async (req, res) => {
  // Tambah rating ke film dengan id
  // ...implementasi...
});

module.exports = router;
