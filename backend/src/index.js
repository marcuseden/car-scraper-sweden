require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');
const connectDB = require('./db/connection');
const CarListing = require('./models/CarListing');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB()
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Car Scraper API is running' });
});

// Get all car listings
app.get('/api/cars', async (req, res) => {
  try {
    const { make, model, minPrice, maxPrice, limit = 20, page = 1 } = req.query;
    
    // Build filter
    const filter = {};
    if (make) filter.make = new RegExp(make, 'i');
    if (model) filter.model = new RegExp(model, 'i');
    
    // Price filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseInt(minPrice, 10);
      if (maxPrice) filter.price.$lte = parseInt(maxPrice, 10);
    }
    
    // Calculate pagination
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    
    // Get total count
    const total = await CarListing.countDocuments(filter);
    
    // Get listings
    const listings = await CarListing.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));
    
    res.json({
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10)),
      listings
    });
  } catch (error) {
    console.error('Error fetching car listings:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get a single car listing by ID
app.get('/api/cars/:id', async (req, res) => {
  try {
    const listing = await CarListing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ error: 'Car listing not found' });
    }
    res.json(listing);
  } catch (error) {
    console.error('Error fetching car listing:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Start a scraper job
app.post('/api/scraper/start', (req, res) => {
  try {
    const { make = 'Porsche', minPrice = 400000 } = req.body;
    
    // Validate input
    if (!make) {
      return res.status(400).json({ error: 'Make is required' });
    }
    
    // Create a unique job ID
    const jobId = `scraper_${Date.now()}`;
    
    // Start the scraper process
    const scraperProcess = spawn('node', [
      path.join(__dirname, 'scraper', 'runScraper.js')
    ], {
      env: {
        ...process.env,
        SCRAPER_MAKE: make,
        SCRAPER_MIN_PRICE: minPrice.toString()
      },
      detached: true,
      stdio: 'ignore'
    });
    
    // Unref the process to allow it to run independently
    scraperProcess.unref();
    
    res.json({
      message: `Scraper job started for ${make} with minimum price ${minPrice} SEK`,
      jobId
    });
  } catch (error) {
    console.error('Error starting scraper job:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get scraper status (this is a mock since we don't have real-time status tracking)
app.get('/api/scraper/status/:jobId', (req, res) => {
  // In a real implementation, you would check the status of the job in a database
  res.json({
    jobId: req.params.jobId,
    status: 'running',
    message: 'Scraper is running'
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 