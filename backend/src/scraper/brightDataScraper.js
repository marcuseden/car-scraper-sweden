const { BrightData } = require('@brightdata/sdk');
const axios = require('axios');
const cheerio = require('cheerio');
const CarListing = require('../models/CarListing');

/**
 * Content-aware scraper using Bright Data
 * This scraper uses semantic understanding of the page content rather than relying on CSS selectors
 */
class ContentAwareScraper {
  constructor(options = {}) {
    this.options = {
      brightDataUsername: process.env.BRIGHT_DATA_USERNAME,
      brightDataPassword: process.env.BRIGHT_DATA_PASSWORD,
      brightDataZone: process.env.BRIGHT_DATA_ZONE,
      brightDataCountry: process.env.BRIGHT_DATA_COUNTRY || 'se',
      timeout: process.env.SCRAPER_TIMEOUT || 30000,
      progressCallback: () => {},
      ...options
    };

    // Initialize Bright Data client
    this.brightData = new BrightData({
      username: this.options.brightDataUsername,
      password: this.options.brightDataPassword
    });

    // Create a proxy session
    this.proxySession = this.brightData.newProxySession({
      zone: this.options.brightDataZone,
      country: this.options.brightDataCountry,
      session_id: `car_scraper_${Date.now()}`
    });
  }

  /**
   * Create an axios instance with Bright Data proxy
   * @returns {Object} Axios instance
   */
  createAxiosInstance() {
    const proxyConfig = this.proxySession.getProxyAddress();
    
    return axios.create({
      proxy: {
        host: proxyConfig.host,
        port: proxyConfig.port,
        auth: {
          username: proxyConfig.username,
          password: proxyConfig.password
        }
      },
      timeout: this.options.timeout,
      headers: {
        'User-Agent': process.env.SCRAPER_USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'sv-SE,sv;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
  }

  /**
   * Extract text content from HTML using semantic understanding
   * @param {Object} $ - Cheerio instance
   * @param {Array} keywords - Keywords to look for
   * @param {string} context - Context to search in (e.g., 'title', 'price', 'description')
   * @returns {string} Extracted text
   */
  extractTextByContent($, keywords, context) {
    // Strategy 1: Look for elements with matching text content
    for (const keyword of keywords) {
      const elements = $(`*:contains("${keyword}")`);
      if (elements.length > 0) {
        // Get the closest element that likely contains the value
        for (const el of elements.toArray()) {
          const $el = $(el);
          // Check if this element or its next sibling contains the value
          const nextSibling = $el.next();
          if (nextSibling.length && !nextSibling.find(':contains(' + keywords.join('), :contains(') + ')').length) {
            return nextSibling.text().trim();
          }
          
          // Check if parent contains the value
          const parent = $el.parent();
          if (parent.length && !parent.find(':contains(' + keywords.join('), :contains(') + ')').length) {
            return parent.text().replace(keyword, '').trim();
          }
        }
      }
    }
    
    // Strategy 2: Context-specific extraction
    switch (context) {
      case 'title':
        // Look for the most prominent heading
        const headings = $('h1, h2, h3').toArray();
        if (headings.length > 0) {
          // Sort by font size or prominence
          const mainHeading = headings.sort((a, b) => {
            const aSize = parseInt($(a).css('font-size')) || 0;
            const bSize = parseInt($(b).css('font-size')) || 0;
            return bSize - aSize;
          })[0];
          return $(mainHeading).text().trim();
        }
        break;
        
      case 'price':
        // Look for currency symbols or price patterns
        const pricePattern = /([0-9\s]+)(kr|:-|SEK|€|\$)/i;
        const bodyText = $('body').text();
        const priceMatch = bodyText.match(pricePattern);
        if (priceMatch) {
          return priceMatch[0].trim();
        }
        break;
        
      case 'description':
        // Look for the largest text block
        const paragraphs = $('p').toArray();
        if (paragraphs.length > 0) {
          // Sort by text length
          const mainParagraph = paragraphs.sort((a, b) => {
            return $(b).text().length - $(a).text().length;
          })[0];
          return $(mainParagraph).text().trim();
        }
        break;
        
      case 'image':
        // Find the largest image
        const images = $('img').toArray();
        if (images.length > 0) {
          // Sort by image size if available, otherwise by position
          const mainImage = images.sort((a, b) => {
            const aWidth = parseInt($(a).attr('width')) || 0;
            const bWidth = parseInt($(b).attr('width')) || 0;
            return bWidth - aWidth;
          })[0];
          return $(mainImage).attr('src');
        }
        break;
    }
    
    return '';
  }

  /**
   * Extract structured data from HTML
   * @param {string} html - HTML content
   * @returns {Object} Extracted data
   */
  extractStructuredData(html) {
    const $ = cheerio.load(html);
    
    // Look for JSON-LD structured data
    const jsonLdScripts = $('script[type="application/ld+json"]');
    if (jsonLdScripts.length > 0) {
      for (const script of jsonLdScripts.toArray()) {
        try {
          const data = JSON.parse($(script).html());
          if (data['@type'] === 'Product' || data['@type'] === 'Vehicle' || data['@type'] === 'Car') {
            return data;
          }
        } catch (error) {
          console.error('Error parsing JSON-LD:', error);
        }
      }
    }
    
    // Look for OpenGraph meta tags
    const ogData = {};
    $('meta[property^="og:"]').each((i, el) => {
      const property = $(el).attr('property').replace('og:', '');
      const content = $(el).attr('content');
      ogData[property] = content;
    });
    
    if (Object.keys(ogData).length > 0) {
      return ogData;
    }
    
    return null;
  }

  /**
   * Extract car listing data using content-aware methods
   * @param {string} html - HTML content
   * @param {string} url - URL of the listing
   * @returns {Object} Car listing data
   */
  extractCarListingData(html, url) {
    const $ = cheerio.load(html);
    
    // Try to extract structured data first
    const structuredData = this.extractStructuredData(html);
    
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
    
    // Use structured data if available
    if (structuredData) {
      if (structuredData.name) listing.title = structuredData.name;
      if (structuredData.offers && structuredData.offers.price) {
        listing.price = parseInt(structuredData.offers.price, 10);
        if (structuredData.offers.priceCurrency) {
          listing.currency = structuredData.offers.priceCurrency;
        }
      }
      if (structuredData.description) listing.description = structuredData.description;
      if (structuredData.image) {
        const images = Array.isArray(structuredData.image) ? structuredData.image : [structuredData.image];
        listing.images = images.map((url, index) => ({ url, isMain: index === 0 }));
      }
      if (structuredData.brand) listing.make = structuredData.brand.name || structuredData.brand;
      if (structuredData.model) listing.model = structuredData.model;
    }
    
    // Fall back to content-aware extraction for missing data
    if (!listing.title) {
      listing.title = this.extractTextByContent($, ['title', 'heading', 'name'], 'title');
    }
    
    if (!listing.price) {
      const priceText = this.extractTextByContent($, ['price', 'pris', 'kostnad', 'kr'], 'price');
      if (priceText) {
        const priceMatch = priceText.match(/(\d+[\s\d]*)/);
        if (priceMatch && priceMatch[1]) {
          listing.price = parseInt(priceMatch[1].replace(/\s/g, ''), 10);
        }
      }
    }
    
    if (!listing.description) {
      listing.description = this.extractTextByContent($, ['description', 'beskrivning', 'info', 'about'], 'description');
    }
    
    if (listing.images.length === 0) {
      // Extract images
      $('img').each((i, el) => {
        const src = $(el).attr('src');
        if (src && !src.includes('data:image') && !src.includes('logo') && !src.includes('icon')) {
          listing.images.push({
            url: this.normalizeImageUrl(src, url),
            isMain: i === 0
          });
        }
      });
    }
    
    // Extract year
    if (!listing.year) {
      const yearKeywords = ['year', 'år', 'modellår', 'årsmodell'];
      const yearText = this.extractTextByContent($, yearKeywords, 'year');
      if (yearText) {
        const yearMatch = yearText.match(/\b(19|20)\d{2}\b/);
        if (yearMatch) {
          listing.year = parseInt(yearMatch[0], 10);
        }
      }
    }
    
    // Extract mileage
    if (!listing.mileage) {
      const mileageKeywords = ['mileage', 'miltal', 'körsträcka', 'km', 'mil'];
      const mileageText = this.extractTextByContent($, mileageKeywords, 'mileage');
      if (mileageText) {
        const mileageMatch = mileageText.match(/(\d+[\s\d]*)/);
        if (mileageMatch && mileageMatch[1]) {
          listing.mileage = parseInt(mileageMatch[1].replace(/\s/g, ''), 10);
          
          // Convert from Swedish 'mil' to km if needed
          if (mileageText.toLowerCase().includes('mil') && !mileageText.toLowerCase().includes('km')) {
            listing.mileage *= 10; // 1 Swedish mil = 10 km
          }
        }
      }
    }
    
    // Extract location
    if (!listing.location) {
      const locationKeywords = ['location', 'plats', 'ort', 'stad', 'region'];
      listing.location = this.extractTextByContent($, locationKeywords, 'location');
    }
    
    // Extract make and model from title if not already set
    if (!listing.make || !listing.model) {
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
    }
    
    // Extract seller information
    const sellerKeywords = ['seller', 'säljare', 'dealer', 'handlare', 'contact', 'kontakt'];
    const sellerText = this.extractTextByContent($, sellerKeywords, 'seller');
    if (sellerText) {
      listing.seller.name = sellerText;
      
      // Determine seller type
      if (sellerText.toLowerCase().includes('handel') || 
          sellerText.toLowerCase().includes('bilhandlare') ||
          sellerText.toLowerCase().includes('dealer') ||
          sellerText.toLowerCase().includes('ab') ||
          sellerText.toLowerCase().includes('center')) {
        listing.seller.type = 'dealer';
      } else {
        listing.seller.type = 'private';
      }
      
      listing.seller.location = listing.location;
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
   * @param {number} params.minPrice - Minimum price
   * @returns {Promise<Array>} Array of car listings
   */
  async scrapeBlocket(params = {}) {
    const { make = 'Porsche', minPrice = 400000 } = params;
    const { progressCallback } = this.options;
    
    progressCallback({ status: 'starting', message: 'Starting Bright Data scraper...' });
    
    try {
      const axios = this.createAxiosInstance();
      
      // Construct search URL
      const searchUrl = `https://www.blocket.se/annonser/hela_sverige/fordon/bilar?cg=1020&q=${encodeURIComponent(make)}&pris=${minPrice}-&st=s&r=0`;
      
      progressCallback({ status: 'navigating', message: `Navigating to Blocket.se to search for ${make} over ${minPrice} SEK...` });
      
      // Get search results page
      const searchResponse = await axios.get(searchUrl);
      const $ = cheerio.load(searchResponse.data);
      
      // Extract listing URLs
      const listingUrls = [];
      $('a').each((i, el) => {
        const href = $(el).attr('href');
        if (href && href.includes('/annons/')) {
          if (href.startsWith('http')) {
            listingUrls.push(href);
          } else {
            listingUrls.push(`https://www.blocket.se${href}`);
          }
        }
      });
      
      // Remove duplicates
      const uniqueUrls = [...new Set(listingUrls)];
      
      progressCallback({ 
        status: 'scraping', 
        message: `Found ${uniqueUrls.length} listings. Starting to process...`,
        totalListings: uniqueUrls.length
      });
      
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
          
          // Get listing page
          const listingResponse = await axios.get(url);
          
          // Extract listing data
          const listing = this.extractCarListingData(listingResponse.data, url);
          
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
          
          // Add to results array
          allListings.push(listing);
          
          // Save to database
          const carListing = new CarListing(listing);
          await carListing.save();
          
          console.log(`Saved listing: ${listing.title}`);
          
          // Add a small delay to avoid overloading the server
          await new Promise(resolve => setTimeout(resolve, 1000));
          
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
      // Close the proxy session
      await this.proxySession.close();
    }
  }
}

module.exports = { ContentAwareScraper }; 