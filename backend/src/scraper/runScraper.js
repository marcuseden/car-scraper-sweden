require('dotenv').config();
const mongoose = require('mongoose');
const { PuppeteerScraper } = require('./puppeteerScraper');

// Get parameters from environment variables or use defaults
const make = process.env.SCRAPER_MAKE || 'Porsche';
const model = process.env.SCRAPER_MODEL || '911';
const minPrice = parseInt(process.env.SCRAPER_MIN_PRICE, 10) || 400000;

console.log(`Starting scraper for ${make} ${model} listings over ${minPrice} SEK...`);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    
    // Create scraper instance with progress callback
    const scraper = new PuppeteerScraper({
      headless: process.env.SCRAPER_HEADLESS !== 'false',
      timeout: parseInt(process.env.SCRAPER_TIMEOUT, 10) || 60000, // Increase timeout to 60 seconds
      progressCallback: (progress) => {
        console.log(`[${progress.status}] ${progress.message}`);
      }
    });
    
    // Run scraper
    return scraper.scrapeBlocket({ make, model, minPrice });
  })
  .then((listings) => {
    console.log(`Scraping completed. Found ${listings.length} ${make} ${model} listings over ${minPrice} SEK.`);
    
    // Display a summary of the listings
    if (listings.length > 0) {
      console.log('\nListing Summary:');
      console.log('----------------');
      
      // Group by year
      const yearGroups = {};
      listings.forEach(listing => {
        const year = listing.year || 'Unknown';
        if (!yearGroups[year]) {
          yearGroups[year] = [];
        }
        yearGroups[year].push(listing);
      });
      
      // Display summary by year
      Object.keys(yearGroups).sort().forEach(year => {
        const yearListings = yearGroups[year];
        const avgPrice = Math.round(yearListings.reduce((sum, l) => sum + l.price, 0) / yearListings.length);
        console.log(`Year ${year}: ${yearListings.length} listings, Avg price: ${avgPrice.toLocaleString()} SEK`);
      });
      
      // Price range
      const prices = listings.map(l => l.price).sort((a, b) => a - b);
      console.log(`\nPrice range: ${prices[0].toLocaleString()} - ${prices[prices.length - 1].toLocaleString()} SEK`);
      
      // Seller types
      const dealerCount = listings.filter(l => l.seller.type === 'dealer').length;
      const privateCount = listings.filter(l => l.seller.type === 'private').length;
      console.log(`Sellers: ${dealerCount} dealers, ${privateCount} private`);
    }
    
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  }); 