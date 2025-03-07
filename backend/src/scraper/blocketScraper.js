const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const cheerio = require('cheerio');
const CarListing = require('../models/CarListing');

// Add stealth plugin to puppeteer
puppeteer.use(StealthPlugin());

/**
 * Scrape Blocket.se for Porsche listings over 400,000 SEK
 * @param {Object} options - Scraper options
 * @param {boolean} options.headless - Run browser in headless mode
 * @param {number} options.timeout - Timeout for page operations
 * @param {string} options.userAgent - User agent to use
 * @param {Function} options.progressCallback - Callback for progress updates
 * @returns {Promise<Array>} - Array of car listings
 */
const scrapeBlocket = async (options = {}) => {
  const {
    headless = true,
    timeout = 30000,
    userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    progressCallback = () => {}
  } = options;

  const browser = await puppeteer.launch({
    headless: headless ? 'new' : false,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--window-size=1920,1080',
    ]
  });

  try {
    progressCallback({ status: 'starting', message: 'Starting browser...' });
    
    const page = await browser.newPage();
    await page.setUserAgent(userAgent);
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setDefaultNavigationTimeout(timeout);

    // Set request interception to block images, fonts, and other resources to speed up scraping
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const resourceType = req.resourceType();
      if (resourceType === 'image' || resourceType === 'font' || resourceType === 'media') {
        req.abort();
      } else {
        req.continue();
      }
    });

    // Navigate to Blocket's car section with Porsche filter and price over 400,000 SEK
    progressCallback({ status: 'navigating', message: 'Navigating to Blocket.se...' });
    await page.goto('https://www.blocket.se/annonser/hela_sverige/fordon/bilar?cg=1020&q=porsche&mys=2013&pris=400000-&st=s&r=0', {
      waitUntil: 'domcontentloaded'
    });

    // Wait for the listings to load
    progressCallback({ status: 'waiting', message: 'Waiting for listings to load...' });
    await page.waitForSelector('[data-testid="list-item"]', { timeout });

    // Get the total number of pages
    let totalPages = 1;
    try {
      const paginationText = await page.$eval('[data-testid="pagination"]', el => el.textContent);
      const pagesMatch = paginationText.match(/av\s+(\d+)/i);
      if (pagesMatch && pagesMatch[1]) {
        totalPages = parseInt(pagesMatch[1], 10);
      }
    } catch (error) {
      console.log('Could not determine total pages, assuming single page');
    }

    // Limit to 5 pages for now to avoid overloading
    totalPages = Math.min(totalPages, 5);
    
    progressCallback({ 
      status: 'scraping', 
      message: `Found ${totalPages} pages of listings. Starting to scrape...`,
      totalPages
    });

    const allListings = [];
    
    // Scrape each page
    for (let currentPage = 1; currentPage <= totalPages; currentPage++) {
      progressCallback({ 
        status: 'scraping', 
        message: `Scraping page ${currentPage} of ${totalPages}...`,
        currentPage,
        totalPages
      });
      
      // If not on the first page, navigate to the next page
      if (currentPage > 1) {
        await page.goto(`https://www.blocket.se/annonser/hela_sverige/fordon/bilar?cg=1020&q=porsche&mys=2013&pris=400000-&st=s&r=0&page=${currentPage}`, {
          waitUntil: 'domcontentloaded'
        });
        await page.waitForSelector('[data-testid="list-item"]', { timeout });
      }
      
      // Get all listing URLs on the current page
      const listingUrls = await page.$$eval('[data-testid="list-item"] a', links => 
        links.map(link => link.href).filter(href => href.includes('/annons/'))
      );
      
      // Remove duplicates
      const uniqueUrls = [...new Set(listingUrls)];
      
      progressCallback({ 
        status: 'scraping', 
        message: `Found ${uniqueUrls.length} listings on page ${currentPage}. Processing...`,
        currentPage,
        totalPages,
        listingsOnPage: uniqueUrls.length
      });
      
      // Process each listing
      for (let i = 0; i < uniqueUrls.length; i++) {
        const url = uniqueUrls[i];
        
        progressCallback({ 
          status: 'scraping', 
          message: `Processing listing ${i + 1} of ${uniqueUrls.length} on page ${currentPage}...`,
          currentPage,
          totalPages,
          currentListing: i + 1,
          totalListings: uniqueUrls.length
        });
        
        try {
          // Check if this listing already exists in the database
          const existingListing = await CarListing.findOne({ sourceUrl: url });
          if (existingListing) {
            console.log(`Listing already exists: ${url}`);
            continue;
          }
          
          // Navigate to the listing page
          await page.goto(url, { waitUntil: 'domcontentloaded' });
          await page.waitForSelector('[data-testid="view-adpage"]', { timeout });
          
          // Get the page content
          const content = await page.content();
          const $ = cheerio.load(content);
          
          // Extract listing data
          const title = $('[data-testid="view-adpage-title"]').text().trim();
          
          // Extract price
          let price = 0;
          const priceText = $('[data-testid="view-adpage-price"]').text().trim();
          const priceMatch = priceText.match(/(\d+[\s\d]*)/);
          if (priceMatch && priceMatch[1]) {
            price = parseInt(priceMatch[1].replace(/\s/g, ''), 10);
          }
          
          // Skip if price is below 400,000 SEK
          if (price < 400000) {
            console.log(`Skipping listing with price below 400,000 SEK: ${price} SEK`);
            continue;
          }
          
          // Extract year
          let year = null;
          const yearElement = $('[data-testid="view-adpage-parameter-value"]').filter(function() {
            return $(this).prev().text().includes('Modellår');
          });
          if (yearElement.length) {
            year = parseInt(yearElement.text().trim(), 10);
          }
          
          // Extract mileage
          let mileage = null;
          const mileageElement = $('[data-testid="view-adpage-parameter-value"]').filter(function() {
            return $(this).prev().text().includes('Miltal');
          });
          if (mileageElement.length) {
            const mileageText = mileageElement.text().trim();
            const mileageMatch = mileageText.match(/(\d+[\s\d]*)/);
            if (mileageMatch && mileageMatch[1]) {
              mileage = parseInt(mileageMatch[1].replace(/\s/g, ''), 10);
            }
          }
          
          // Extract description
          const description = $('[data-testid="view-adpage-description"]').text().trim();
          
          // Extract location
          const location = $('[data-testid="view-adpage-location"]').text().trim();
          
          // Extract images
          const images = [];
          $('[data-testid="image-gallery"] img').each((index, element) => {
            const src = $(element).attr('src');
            if (src && !src.includes('data:image')) {
              // Convert thumbnail URL to full-size image URL
              const fullSizeUrl = src.replace(/\/litethumb\//, '/images/');
              images.push({
                url: fullSizeUrl,
                isMain: index === 0
              });
            }
          });
          
          // Extract seller information
          const seller = {
            name: $('[data-testid="view-adpage-seller-name"]').text().trim(),
            type: $('[data-testid="view-adpage-seller-type"]').text().toLowerCase().includes('företag') ? 'dealer' : 'private',
            location: location
          };
          
          // Extract make and model from title
          let make = 'Porsche';
          let model = '';
          
          if (title.toLowerCase().includes('911')) {
            model = '911';
          } else if (title.toLowerCase().includes('cayenne')) {
            model = 'Cayenne';
          } else if (title.toLowerCase().includes('panamera')) {
            model = 'Panamera';
          } else if (title.toLowerCase().includes('macan')) {
            model = 'Macan';
          } else if (title.toLowerCase().includes('boxster')) {
            model = 'Boxster';
          } else if (title.toLowerCase().includes('cayman')) {
            model = 'Cayman';
          } else if (title.toLowerCase().includes('taycan')) {
            model = 'Taycan';
          }
          
          // Create listing object
          const listing = {
            title,
            price,
            currency: 'SEK',
            year,
            make,
            model,
            mileage,
            mileageUnit: 'km',
            description,
            location,
            images,
            seller,
            sourceUrl: url,
            source: 'Blocket',
            scrapedAt: new Date()
          };
          
          // Add to results array
          allListings.push(listing);
          
          // Save to database
          const carListing = new CarListing(listing);
          await carListing.save();
          
          console.log(`Saved listing: ${title}`);
          
          // Add a small delay to avoid overloading the server
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (error) {
          console.error(`Error processing listing ${url}: ${error.message}`);
        }
      }
    }
    
    progressCallback({ 
      status: 'completed', 
      message: `Scraping completed. Found ${allListings.length} Porsche listings over 400,000 SEK.`,
      totalListings: allListings.length
    });
    
    return allListings;
    
  } catch (error) {
    progressCallback({ 
      status: 'error', 
      message: `Error during scraping: ${error.message}`
    });
    console.error('Scraper error:', error);
    throw error;
  } finally {
    await browser.close();
  }
};

module.exports = { scrapeBlocket }; 