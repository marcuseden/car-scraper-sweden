import axios from 'axios';

// Create an axios instance with base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Car listings API
export const carListingsApi = {
  // Get all car listings with filters
  getListings: async (filters = {}) => {
    try {
      const response = await api.get('/cars', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching car listings:', error);
      throw error;
    }
  },
  
  // Get a single car listing by ID
  getListing: async (id) => {
    try {
      const response = await api.get(`/cars/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching car listing with ID ${id}:`, error);
      throw error;
    }
  }
};

// Scraper API
export const scraperApi = {
  // Start a scraper job
  startScraper: async (params = {}) => {
    try {
      const response = await api.post('/scraper/start', params);
      return response.data;
    } catch (error) {
      console.error('Error starting scraper job:', error);
      throw error;
    }
  },
  
  // Get scraper job status
  getScraperStatus: async (jobId) => {
    try {
      const response = await api.get(`/scraper/status/${jobId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching scraper job status for job ${jobId}:`, error);
      throw error;
    }
  }
};

export default {
  carListingsApi,
  scraperApi
}; 