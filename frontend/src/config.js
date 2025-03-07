/**
 * Application configuration
 * Uses environment variables with fallbacks for development
 */

const config = {
  // API configuration
  api: {
    baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  },
  
  // Feature flags
  features: {
    enableVoiceInput: process.env.REACT_APP_ENABLE_VOICE_INPUT === 'true',
    enableAnalytics: process.env.REACT_APP_ENABLE_ANALYTICS === 'true',
  },
  
  // External services
  services: {
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
  },
  
  // Application settings
  app: {
    maxSearchResults: parseInt(process.env.REACT_APP_MAX_SEARCH_RESULTS || '50', 10),
    defaultLocation: process.env.REACT_APP_DEFAULT_LOCATION || 'San Francisco, CA',
  },
  
  // Environment detection
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
};

export default config; 