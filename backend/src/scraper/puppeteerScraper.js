const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const cheerio = require('cheerio');
const CarListing = require('../models/CarListing');

// Add stealth plugin to puppeteer
puppeteer.use(StealthPlugin());

/**
 * Puppeteer-based scraper with semantic understanding
 */
class PuppeteerScraper {
  constructor(options = {}) {
    this.options = {
      headless: process.env.SCRAPER_HEADLESS === 'true',
      timeout: parseInt(process.env.SCRAPER_TIMEOUT, 10) || 30000,
      userAgent: process.env.SCRAPER_USER_AGENT || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      progressCallback: () => {},
      ...options
    };
  }

  /**
   * Handle cookie consent popups and other overlays
   * @param {Page} page - Puppeteer page
   */
  async handlePopups(page) {
    try {
      // Common cookie consent button texts and selectors
      const consentButtonTexts = [
        'Accept', 'Accept All', 'Accept Cookies', 'I Accept', 'OK', 'Agree', 'Got it',
        'Acceptera', 'Acceptera alla', 'Godkänn', 'Jag godkänner', 'Jag accepterar'
      ];
      
      // Try to find and click buttons by text content
      await page.evaluate((buttonTexts) => {
        // Helper function to get text content of an element
        const getElementText = (element) => {
          return element.textContent.trim().toLowerCase();
        };
        
        // Find all buttons, links, and divs that might be consent buttons
        const elements = [
          ...document.querySelectorAll('button'),
          ...document.querySelectorAll('a'),
          ...document.querySelectorAll('div[role="button"]'),
          ...document.querySelectorAll('[class*="consent"],[class*="cookie"],[class*="accept"],[id*="consent"],[id*="cookie"]')
        ];
        
        // Try to click elements that match our consent button texts
        for (const element of elements) {
          const text = getElementText(element);
          if (buttonTexts.some(btnText => text.includes(btnText.toLowerCase()))) {
            console.log(`Found consent button with text: ${text}`);
            element.click();
            return true;
          }
        }
        
        return false;
      }, consentButtonTexts);
      
      // Wait a bit for any animations to complete
      await page.evaluate(() => {
        return new Promise(resolve => setTimeout(resolve, 1000));
      });
      
    } catch (error) {
      console.log('Error handling popups:', error.message);
      // Continue even if there's an error
    }
  }

  /**
   * Extract car listing data using semantic understanding
   * @param {string} html - HTML content
   * @param {string} url - URL of the listing
   * @returns {Object} Car listing data
   */
  extractCarListingData(html, url) {
    const $ = cheerio.load(html);
    
    // Initialize listing data
    let listing = {
      title: '',
      price: 0,
      currency: 'SEK',
      year: null,
      make: '',
      model: '',
      mileage: null,
      mileageUnit: 'km',
      description: '',
      location: '',
      images: [],
      seller: {
        name: '',
        type: 'unknown',
        location: ''
      },
      sourceUrl: url,
      source: this.getSourceFromUrl(url),
      scrapedAt: new Date()
    };
    
    // Use semantic understanding to extract data
    
    // 1. Extract title - look for the most prominent heading
    const possibleTitles = [];
    
    // Look for h1 elements
    $('h1').each((i, el) => {
      possibleTitles.push({
        text: $(el).text().trim(),
        score: 10 - i, // Higher score for earlier h1s
        element: el
      });
    });
    
    // Look for large text that might be a title
    $('*').each((i, el) => {
      const fontSize = $(el).css('font-size');
      const fontWeight = $(el).css('font-weight');
      
      if ((fontSize && parseInt(fontSize) > 18) || (fontWeight && parseInt(fontWeight) >= 600)) {
        const text = $(el).text().trim();
        if (text.length > 5 && text.length < 100) {
          possibleTitles.push({
            text,
            score: 5,
            element: el
          });
        }
      }
    });
    
    // Sort by score and pick the best title
    if (possibleTitles.length > 0) {
      possibleTitles.sort((a, b) => b.score - a.score);
      listing.title = possibleTitles[0].text;
    }
    
    // 2. Extract price - look for currency patterns
    const pricePattern = /(\d+[\s\d]*)\s*(kr|:-|SEK|€|\$)/i;
    const bodyText = $('body').text();
    const priceMatches = bodyText.match(new RegExp(pricePattern, 'g')) || [];
    
    if (priceMatches.length > 0) {
      // Find the most prominent price (usually the largest number)
      let highestPrice = 0;
      
      for (const match of priceMatches) {
        const priceMatch = match.match(pricePattern);
        if (priceMatch && priceMatch[1]) {
          const price = parseInt(priceMatch[1].replace(/\s/g, ''), 10);
          if (price > highestPrice) {
            highestPrice = price;
            listing.price = price;
            
            // Set currency if found
            if (priceMatch[2]) {
              if (priceMatch[2].toLowerCase() === 'kr' || priceMatch[2] === ':-') {
                listing.currency = 'SEK';
              } else if (priceMatch[2] === '€') {
                listing.currency = 'EUR';
              } else if (priceMatch[2] === '$') {
                listing.currency = 'USD';
              } else {
                listing.currency = priceMatch[2];
              }
            }
          }
        }
      }
    }
    
    // 3. Extract description - look for the largest text block
    const paragraphs = [];
    
    $('p, div, span').each((i, el) => {
      const text = $(el).text().trim();
      if (text.length > 100) {
        paragraphs.push({
          text,
          length: text.length,
          element: el
        });
      }
    });
    
    if (paragraphs.length > 0) {
      paragraphs.sort((a, b) => b.length - a.length);
      listing.description = paragraphs[0].text;
    }
    
    // 4. Extract images - look for all images that are not icons or logos
    $('img').each((i, el) => {
      const src = $(el).attr('src');
      const alt = $(el).attr('alt') || '';
      const width = $(el).attr('width') || 0;
      const height = $(el).attr('height') || 0;
      
      // Skip small images, data URLs, and images with "logo" or "icon" in the URL or alt text
      if (src && 
          !src.includes('data:image') && 
          !src.includes('logo') && 
          !src.includes('icon') &&
          !alt.toLowerCase().includes('logo') &&
          !alt.toLowerCase().includes('icon') &&
          (parseInt(width) > 100 || parseInt(height) > 100 || (!width && !height))) {
        
        listing.images.push({
          url: this.normalizeImageUrl(src, url),
          isMain: i === 0
        });
      }
    });
    
    // 5. Extract year - look for 4-digit years
    const yearPattern = /\b(19|20)\d{2}\b/g;
    const yearMatches = bodyText.match(yearPattern) || [];
    
    if (yearMatches.length > 0) {
      // Find the most recent year that's not in the future
      const currentYear = new Date().getFullYear();
      let bestYear = null;
      
      for (const match of yearMatches) {
        const year = parseInt(match, 10);
        if (year <= currentYear && (bestYear === null || year > bestYear)) {
          bestYear = year;
        }
      }
      
      if (bestYear !== null) {
        listing.year = bestYear;
      }
    }
    
    // 6. Extract mileage - look for distance patterns
    const mileagePatterns = [
      /(\d+[\s\d]*)\s*mil/i,
      /(\d+[\s\d]*)\s*km/i,
      /(\d+[\s\d]*)\s*miles/i
    ];
    
    for (const pattern of mileagePatterns) {
      const matches = bodyText.match(pattern);
      if (matches && matches[1]) {
        const mileage = parseInt(matches[1].replace(/\s/g, ''), 10);
        
        // Convert to km if needed
        if (pattern.toString().includes('mil') && !pattern.toString().includes('km')) {
          // Swedish mil is 10km
          listing.mileage = mileage * 10;
          listing.mileageUnit = 'km';
        } else if (pattern.toString().includes('miles')) {
          // Miles to km
          listing.mileage = Math.round(mileage * 1.60934);
          listing.mileageUnit = 'km';
        } else {
          listing.mileage = mileage;
          listing.mileageUnit = 'km';
        }
        
        break;
      }
    }
    
    // 7. Extract location - look for location patterns
    const locationPatterns = [
      /plats:?\s*([^,\.]+)/i,
      /ort:?\s*([^,\.]+)/i,
      /stad:?\s*([^,\.]+)/i,
      /location:?\s*([^,\.]+)/i
    ];
    
    for (const pattern of locationPatterns) {
      const matches = bodyText.match(pattern);
      if (matches && matches[1]) {
        listing.location = matches[1].trim();
        break;
      }
    }
    
    // 8. Extract make and model from title
    const carBrands = [
      'Porsche', 'BMW', 'Mercedes', 'Audi', 'Volvo', 'Volkswagen', 'Tesla',
      'Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'Mazda', 'Kia',
      'Hyundai', 'Lexus', 'Jaguar', 'Land Rover', 'Jeep', 'Subaru'
    ];
    
    for (const brand of carBrands) {
      if (listing.title.includes(brand)) {
        listing.make = brand;
        
        // Try to extract model
        const titleAfterBrand = listing.title.split(brand)[1];
        if (titleAfterBrand) {
          // Look for common model patterns
          const modelMatch = titleAfterBrand.match(/^\s+([A-Z0-9-]+)/);
          if (modelMatch && modelMatch[1]) {
            listing.model = modelMatch[1].trim();
          }
        }
        
        break;
      }
    }
    
    // 9. Extract seller information - look for seller patterns
    const sellerPatterns = [
      /säljare:?\s*([^,\.]+)/i,
      /seller:?\s*([^,\.]+)/i,
      /handlare:?\s*([^,\.]+)/i,
      /dealer:?\s*([^,\.]+)/i
    ];
    
    for (const pattern of sellerPatterns) {
      const matches = bodyText.match(pattern);
      if (matches && matches[1]) {
        listing.seller.name = matches[1].trim();
        
        // Determine seller type
        if (listing.seller.name.toLowerCase().includes('handel') || 
            listing.seller.name.toLowerCase().includes('bilhandlare') ||
            listing.seller.name.toLowerCase().includes('dealer') ||
            listing.seller.name.toLowerCase().includes('ab') ||
            listing.seller.name.toLowerCase().includes('center')) {
          listing.seller.type = 'dealer';
        } else {
          listing.seller.type = 'private';
        }
        
        listing.seller.location = listing.location;
        break;
      }
    }
    
    return listing;
  }

  /**
   * Normalize image URL (convert relative to absolute)
   * @param {string} imageUrl - Image URL
   * @param {string} pageUrl - Page URL
   * @returns {string} Normalized image URL
   */
  normalizeImageUrl(imageUrl, pageUrl) {
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    try {
      const url = new URL(pageUrl);
      if (imageUrl.startsWith('/')) {
        return `${url.protocol}//${url.host}${imageUrl}`;
      } else {
        return `${url.protocol}//${url.host}/${imageUrl}`;
      }
    } catch (error) {
      return imageUrl;
    }
  }

  /**
   * Get source name from URL
   * @param {string} url - URL
   * @returns {string} Source name
   */
  getSourceFromUrl(url) {
    try {
      const hostname = new URL(url).hostname;
      if (hostname.includes('blocket')) return 'Blocket';
      if (hostname.includes('bytbil')) return 'Bytbil';
      if (hostname.includes('bilweb')) return 'Bilweb';
      if (hostname.includes('wayke')) return 'Wayke';
      if (hostname.includes('kvdbil')) return 'KVD';
      if (hostname.includes('mobile.de')) return 'Mobile.de';
      if (hostname.includes('autoscout24')) return 'AutoScout24';
      
      // Extract domain name without TLD
      const domainMatch = hostname.match(/([^.]+)\.[^.]+$/);
      if (domainMatch && domainMatch[1]) {
        return domainMatch[1].charAt(0).toUpperCase() + domainMatch[1].slice(1);
      }
      
      return hostname;
    } catch (error) {
      return 'Unknown';
    }
  }

  /**
   * Scrape car listings from Blocket
   * @param {Object} params - Search parameters
   * @param {string} params.make - Car make (e.g., 'Porsche')
   * @param {string} params.model - Car model (e.g., '911')
   * @param {number} params.minPrice - Minimum price
   * @returns {Promise<Array>} Array of car listings
   */
  async scrapeBlocket(params = {}) {
    const { make = 'Porsche', model = '', minPrice = 400000 } = params;
    const { progressCallback } = this.options;
    
    progressCallback({ status: 'starting', message: 'Starting Puppeteer scraper...' });
    
    const browser = await puppeteer.launch({
      headless: this.options.headless ? 'new' : false,
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
      const page = await browser.newPage();
      
      // Set user agent
      await page.setUserAgent(this.options.userAgent);
      
      // Set viewport
      await page.setViewport({ width: 1920, height: 1080 });
      
      // Set navigation timeout
      await page.setDefaultNavigationTimeout(this.options.timeout);
      
      // Block unnecessary resources to speed up scraping
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        const resourceType = req.resourceType();
        if (resourceType === 'image' || resourceType === 'font' || resourceType === 'media') {
          req.abort();
        } else {
          req.continue();
        }
      });
      
      // Construct search URL using the correct format
      const searchTerm = model ? `${make}+${model}` : make;
      const baseSearchUrl = `https://www.blocket.se/bilar/sok?q=${encodeURIComponent(searchTerm)}&filter=%7B%22key%22%3A%22price%22%2C%22range%22%3A%7B%22start%22%3A%22${minPrice}%22%2C%22end%22%3A%22%22%7D%7D`;
      
      progressCallback({ status: 'navigating', message: `Navigating to Blocket.se to search for ${searchTerm} over ${minPrice} SEK...` });
      
      // Array to store all listing URLs across all pages
      const allListingUrls = [];
      let currentPage = 1;
      let hasNextPage = true;
      
      // Process all pagination pages
      while (hasNextPage) {
        const searchUrl = currentPage === 1 ? baseSearchUrl : `${baseSearchUrl}&page=${currentPage}`;
        console.log(`Scraping page ${currentPage}: ${searchUrl}`);
        
        // Navigate to search page
        await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });
        
        // Handle cookie consent and other popups
        await this.handlePopups(page);
        
        // Wait for page to load completely
        await page.evaluate(() => {
          return new Promise(resolve => setTimeout(resolve, 5000));
        });
        
        // Get page content
        const content = await page.content();
        
        // Use semantic understanding to extract listing URLs
        const $ = cheerio.load(content);
        const pageListingUrls = [];
        
        // Find all links
        $('a').each((i, el) => {
          const href = $(el).attr('href');
          if (href && href.includes('/annons/')) {
            // Normalize URL
            const fullUrl = href.startsWith('http') ? href : `https://www.blocket.se${href}`;
            pageListingUrls.push(fullUrl);
          }
        });
        
        // Remove duplicates from this page
        const uniquePageUrls = [...new Set(pageListingUrls)];
        console.log(`Found ${uniquePageUrls.length} listings on page ${currentPage}`);
        
        // Add to master list
        allListingUrls.push(...uniquePageUrls);
        
        // Check if there's a next page by looking for pagination links
        const nextPageExists = await page.evaluate((currentPageNum) => {
          // Look for pagination elements
          const paginationElements = document.querySelectorAll('a[href*="page="], [class*="pagination"] a, [class*="paging"] a');
          
          // Convert to array and check if any element has text or aria-label indicating "next"
          return Array.from(paginationElements).some(el => {
            const text = el.textContent.toLowerCase();
            const ariaLabel = el.getAttribute('aria-label')?.toLowerCase() || '';
            return text.includes('nästa') || 
                   text.includes('next') || 
                   ariaLabel.includes('nästa') || 
                   ariaLabel.includes('next') ||
                   el.href?.includes(`page=${currentPageNum + 1}`);
          });
        }, currentPage);
        
        if (nextPageExists) {
          currentPage++;
          console.log(`Moving to page ${currentPage}`);
        } else {
          hasNextPage = false;
          console.log('No more pages found');
        }
        
        // Add a small delay between page requests
        await page.evaluate(() => {
          return new Promise(resolve => setTimeout(resolve, 2000));
        });
      }
      
      // Remove duplicates from all pages
      const uniqueUrls = [...new Set(allListingUrls)];
      
      progressCallback({ 
        status: 'scraping', 
        message: `Found ${uniqueUrls.length} total listings across ${currentPage} pages. Starting to process...`,
        totalListings: uniqueUrls.length
      });
      
      console.log(`Found ${uniqueUrls.length} total unique listings across ${currentPage} pages`);
      
      // If no listings found, try to debug
      if (uniqueUrls.length === 0) {
        console.log('No listings found. Saving page content for debugging...');
        await page.screenshot({ path: 'debug-screenshot.png' });
        console.log('Debug screenshot saved to debug-screenshot.png');
        
        // Try to find any links on the page
        const allLinks = await page.evaluate(() => {
          return Array.from(document.querySelectorAll('a')).map(a => a.href);
        });
        console.log(`Found ${allLinks.length} links on the page`);
        console.log('Sample links:', allLinks.slice(0, 5));
      }
      
      const allListings = [];
      
      // Process each listing
      for (let i = 0; i < uniqueUrls.length; i++) {
        const url = uniqueUrls[i];
        
        progressCallback({ 
          status: 'scraping', 
          message: `Processing listing ${i + 1} of ${uniqueUrls.length}...`,
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
          
          // Navigate to listing page
          await page.goto(url, { waitUntil: 'domcontentloaded' });
          
          // Handle cookie consent and other popups
          await this.handlePopups(page);
          
          // Wait for page to load completely
          await page.evaluate(() => {
            return new Promise(resolve => setTimeout(resolve, 3000));
          });
          
          // Get page content
          const content = await page.content();
          
          // Extract listing data using semantic understanding
          const listing = this.extractCarListingData(content, url);
          
          // Skip if price is below minPrice
          if (listing.price < minPrice) {
            console.log(`Skipping listing with price below ${minPrice} SEK: ${listing.price} SEK`);
            continue;
          }
          
          // Skip if make doesn't match
          if (make && !listing.title.toLowerCase().includes(make.toLowerCase()) && listing.make !== make) {
            console.log(`Skipping listing that doesn't match make ${make}: ${listing.title}`);
            continue;
          }
          
          // Enhance listing with additional details
          try {
            // Look for contact information
            const contactInfo = await page.evaluate(() => {
              // Look for phone numbers
              const phoneRegex = /(\+?46|0)[\s\-]?7[\s\-]?[02369][\s\-]?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}/g;
              const bodyText = document.body.innerText;
              const phoneMatches = bodyText.match(phoneRegex) || [];
              
              // Look for email addresses
              const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
              const emailMatches = bodyText.match(emailRegex) || [];
              
              return {
                phones: phoneMatches,
                emails: emailMatches
              };
            });
            
            // Add contact info to seller
            if (contactInfo.phones.length > 0) {
              listing.seller.phone = contactInfo.phones[0];
            }
            
            if (contactInfo.emails.length > 0) {
              listing.seller.email = contactInfo.emails[0];
            }
            
            // Look for additional car details
            const additionalDetails = await page.evaluate(() => {
              const details = {};
              
              // Common labels for car details
              const labelMap = {
                'färg': 'color',
                'color': 'color',
                'drivmedel': 'fuelType',
                'fuel': 'fuelType',
                'växellåda': 'transmission',
                'transmission': 'transmission',
                'hästkrafter': 'horsePower',
                'effekt': 'horsePower',
                'power': 'horsePower',
                'hp': 'horsePower',
                'modellår': 'modelYear',
                'model year': 'modelYear',
                'kaross': 'bodyType',
                'body': 'bodyType',
                'drivhjul': 'driveType',
                'drive': 'driveType'
              };
              
              // Find elements that might contain car details
              const detailElements = document.querySelectorAll('dt, th, [class*="label"], [class*="key"]');
              
              detailElements.forEach(element => {
                const label = element.textContent.trim().toLowerCase();
                let value;
                
                // Try to find the corresponding value element
                if (element.nextElementSibling) {
                  value = element.nextElementSibling.textContent.trim();
                } else if (element.parentElement && element.parentElement.nextElementSibling) {
                  value = element.parentElement.nextElementSibling.textContent.trim();
                }
                
                // Map the label to a standardized field name
                for (const [key, field] of Object.entries(labelMap)) {
                  if (label.includes(key)) {
                    details[field] = value;
                    break;
                  }
                }
              });
              
              return details;
            });
            
            // Add additional details to listing
            Object.assign(listing, additionalDetails);
            
          } catch (detailError) {
            console.log(`Error extracting additional details: ${detailError.message}`);
          }
          
          // Add to results array
          allListings.push(listing);
          
          // Save to database
          const carListing = new CarListing(listing);
          await carListing.save();
          
          console.log(`Saved listing: ${listing.title} - ${listing.price} SEK`);
          
          // Add a small delay to avoid overloading the server
          await page.evaluate(() => {
            return new Promise(resolve => setTimeout(resolve, 1000));
          });
          
        } catch (error) {
          console.error(`Error processing listing ${url}: ${error.message}`);
        }
      }
      
      progressCallback({ 
        status: 'completed', 
        message: `Scraping completed. Found ${allListings.length} ${make} listings over ${minPrice} SEK.`,
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
  }
}

module.exports = { PuppeteerScraper }; 