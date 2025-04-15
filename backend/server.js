const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY);

const app = express();

app.use(cors());
app.use(express.json());

// Routes
const aiRoutes = require('./routes/ai');
const authRoutes = require('./routes/auth');
const offerRoutes = require('./routes/offer');

// Debug-utskrift
console.log('authRoutes type:', typeof authRoutes);
console.log('offerRoutes type:', typeof offerRoutes);

console.log('REAL offerRoutes value:', offerRoutes);

// Use routes
app.use('/api/ai', aiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/offers', offerRoutes); // ✅ Här läggs offerRoutes till

// DB-anslutning
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
