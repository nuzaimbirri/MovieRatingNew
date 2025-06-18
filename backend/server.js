import path from "path";
import express from "express";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import cors from "cors";

import authRoutes from "./routes/auth.route.js";
import usersRoutes from "./routes/user.route.js";
import postsRoutes from "./routes/post.route.js";
import notificationsRoutes from "./routes/notification.route.js";
import tmdbRoutes from './routes/tmdb.js'; // pastikan ekstensi .js ada jika pakai ES Modules
import watchlistRoutes from "./routes/watchlist.route.js";
import connectMongoDB from "./db/connectToMongo.js";

dotenv.config(); // Load .env file

// Konfigurasi Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Setup Express app
const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve(); // untuk kebutuhan path statis

// CORS Configuration
app.use(
  cors({
    origin: process.env.NODE_ENV === "development" 
      ? ["http://localhost:5173", "http://localhost:3000"] 
      : process.env.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Middlewares
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175'
  ],
  credentials: true, // Izinkan pengiriman cookie atau header otentikasi
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Access-Control-Allow-Origin'],
  exposedHeaders: ['Access-Control-Allow-Origin']
}));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/tmdb", tmdbRoutes);
app.use('/api/watchlist', watchlistRoutes);

// Cek mode produksi
const env = process.env.NODE_ENV?.trim() || "";

if (env === "production") {
  console.log("Entering production block");

  app.use(express.static(path.join(__dirname, "/frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "/frontend", "dist", "index.html"));
  });

  console.log("NODE_ENV:", env, "__dirname:", __dirname);
} else {
  console.log("Not in production");
}

// Cek apakah MONGO_URI sudah terdefinisi
if (!process.env.MONGO_URI) {
  console.error("MONGO_URI is not defined in environment variables! Pastikan file .env sudah ada dan variabelnya benar.");
  process.exit(1);
}

// Koneksi ke MongoDB
mongoose
  .connect(process.env.MONGO_URI, {})
  .then(() => {
    console.log("Connected to MongoDB");
    // Start server setelah koneksi ke MongoDB berhasil
    app.listen(PORT, () => {
      console.log("Server is running at port", PORT);
    });
  })
  .catch((error) => {
    console.log("error connection to mongoDB", error.message);
    process.exit(1); // agar proses exit jika gagal koneksi

  });

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: err.message || 'Internal Server Error',
    status: 500 
  });
});
