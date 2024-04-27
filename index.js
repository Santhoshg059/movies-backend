import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB database
mongoose.connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  });

// Create movie schema
const movieSchema = new mongoose.Schema({
  backdrop: String,
  cast: [String],
  classification: String,
  director: [String],
  genres: [String],
  imdb_rating: Number,
  length: String,
  overview: String,
  poster: String,
  released_on: Date,
  slug: String,
  title: String
});

// Create movie model
const Movie = mongoose.model('Movie', movieSchema);

app.use(cors());
app.use(express.json());

// Middleware to check for authentication token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token === 'FSMovies2023') {
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

// API endpoint to fetch movies
app.get('/movies', authenticateToken, async (req, res) => {
    try {
      console.log('Fetching movies...');
      const movies = await Movie.find();
      console.log('Number of movies fetched:', movies.length);
   
      res.json(movies);
    } catch (error) {
      console.error('Error fetching movies:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/movies/:id', authenticateToken, async (req, res) => {
    try {
      const movieId = req.params.id;
      const movie = await Movie.findById(movieId);
      if (!movie) {
        return res.status(404).json({ message: 'Movie not found' });
      }
      res.json(movie);
    } catch (error) {
      console.error('Error fetching movie:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
