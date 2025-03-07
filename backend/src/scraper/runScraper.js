require('dotenv').config();
const connectDB = require('../db/connection');
const { ContentAwareScraper } = require('./brightDataScraper');

// Function to run the scraper
async function runScraper() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    
    // Get parameters from environment variables or use defaults
    const make = process.env.SCRAPER_MAKE || 'Porsche';
    const minPrice = parseInt(process.env.SCRAPER_MIN_PRICE, 10) || 400000;
    
    console.log(`Starting content-aware scraper for ${make} over ${minPrice} SEK using Bright Data...`);
    
    // Set up progress callback to log progress
    const progressCallback = (progress) => {
      console.log(`[${progress.status}] ${progress.message}`);
    };
    
    // Create scraper instance
    const scraper = new ContentAwareScraper({
      progressCallback
    });
    
    // Run the scraper
    const listings = await scraper.scrapeBlocket({
      make,
      minPrice
    });
    
    console.log(`Scraping completed. Found ${listings.length} ${make} listings over ${minPrice} SEK.`);
    
    // Exit process
    process.exit(0);
  } catch (error) {
    console.error('Error running scraper:', error);
    process.exit(1);
  }
}

// Run the scraper
runScraper(); 