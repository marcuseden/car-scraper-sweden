import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useLanguage } from '../contexts/LanguageContext';

// Mock data for available scrapers
const availableScrapers = {
  scandinavia: [
    { id: 'blocket', name: 'Blocket.se', country: 'Sweden', enabled: true, status: 'active' },
    { id: 'bytbil', name: 'Bytbil.com', country: 'Sweden', enabled: true, status: 'active' },
    { id: 'bilweb', name: 'Bilweb.se', country: 'Sweden', enabled: true, status: 'active' },
    { id: 'finn', name: 'Finn.no', country: 'Norway', enabled: true, status: 'active' },
    { id: 'bilbasen', name: 'Bilbasen.dk', country: 'Denmark', enabled: true, status: 'active' },
    { id: 'nettiauto', name: 'Nettiauto.com', country: 'Finland', enabled: false, status: 'development' }
  ],
  europe: [
    { id: 'mobile', name: 'Mobile.de', country: 'Germany', enabled: false, status: 'planned' },
    { id: 'autoscout24', name: 'AutoScout24.com', country: 'Europe', enabled: false, status: 'planned' },
    { id: 'autovit', name: 'Autovit.ro', country: 'Romania', enabled: false, status: 'development' },
    { id: 'leboncoin', name: 'Leboncoin.fr', country: 'France', enabled: false, status: 'planned' }
  ]
};

function ScraperConfig() {
  const { t, language } = useLanguage();
  const [scrapers, setScrapers] = useState(availableScrapers);
  const [scrapingInterval, setScrapingInterval] = useState('daily');
  const [maxResults, setMaxResults] = useState(100);
  const [saveImages, setSaveImages] = useState(true);
  const [proxyEnabled, setProxyEnabled] = useState(false);
  const [proxyUrl, setProxyUrl] = useState('');
  const [userAgent, setUserAgent] = useState('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
  
  const handleToggleScraper = (region, id) => {
    setScrapers(prev => {
      const newScrapers = {...prev};
      const scraperIndex = newScrapers[region].findIndex(s => s.id === id);
      if (scraperIndex !== -1) {
        newScrapers[region][scraperIndex].enabled = !newScrapers[region][scraperIndex].enabled;
      }
      return newScrapers;
    });
  };
  
  const handleSaveConfig = () => {
    // In a real app, this would save to backend
    console.log('Saving config:', {
      scrapers,
      scrapingInterval,
      maxResults,
      saveImages,
      proxyEnabled,
      proxyUrl,
      userAgent
    });
    
    // Mock success message
    alert(t('configSaved'));
  };
  
  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'success';
      case 'development': return 'warning';
      case 'planned': return 'info';
      default: return 'default';
    }
  };
  
  const getStatusText = (status) => {
    if (language === 'en') {
      return status.charAt(0).toUpperCase() + status.slice(1);
    } else {
      switch(status) {
        case 'active': return 'Aktiv';
        case 'development': return 'Utveckling';
        case 'planned': return 'Planerad';
        default: return status;
      }
    }
  };
  
  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h5" gutterBottom>
        {t('scraperConfiguration')}
      </Typography>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        {t('scraperConfigDescription')}
      </Typography>
      
      <Grid container spacing={3}>
        {/* Scraper Sources */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            {t('scraperSources')}
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              {language === 'en' ? 'Scandinavian' : 'Skandinaviska'}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {scrapers.scandinavia.map((scraper) => (
                <Chip 
                  key={scraper.id}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {scraper.name}
                      <Chip 
                        size="small" 
                        label={getStatusText(scraper.status)} 
                        color={getStatusColor(scraper.status)}
                        sx={{ height: 20, fontSize: '0.6rem' }}
                      />
                    </Box>
                  }
                  onClick={() => handleToggleScraper('scandinavia', scraper.id)}
                  color={scraper.enabled ? "primary" : "default"}
                  variant={scraper.enabled ? "filled" : "outlined"}
                  sx={{ py: 2 }}
                />
              ))}
            </Box>
            
            <Typography variant="subtitle2" gutterBottom>
              {language === 'en' ? 'European' : 'Europeiska'}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {scrapers.europe.map((scraper) => (
                <Chip 
                  key={scraper.id}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {scraper.name}
                      <Chip 
                        size="small" 
                        label={getStatusText(scraper.status)} 
                        color={getStatusColor(scraper.status)}
                        sx={{ height: 20, fontSize: '0.6rem' }}
                      />
                    </Box>
                  }
                  onClick={() => handleToggleScraper('europe', scraper.id)}
                  color={scraper.enabled ? "primary" : "default"}
                  variant={scraper.enabled ? "filled" : "outlined"}
                  sx={{ py: 2 }}
                />
              ))}
            </Box>
          </Box>
        </Grid>
        
        {/* Scraping Settings */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('scrapingSettings')}
              </Typography>
              
              <FormGroup sx={{ mb: 2 }}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel id="interval-label">{t('scrapingInterval')}</InputLabel>
                  <Select
                    labelId="interval-label"
                    value={scrapingInterval}
                    label={t('scrapingInterval')}
                    onChange={(e) => setScrapingInterval(e.target.value)}
                  >
                    <MenuItem value="hourly">{t('hourly')}</MenuItem>
                    <MenuItem value="daily">{t('daily')}</MenuItem>
                    <MenuItem value="weekly">{t('weekly')}</MenuItem>
                    <MenuItem value="manual">{t('manualOnly')}</MenuItem>
                  </Select>
                </FormControl>
                
                <TextField
                  fullWidth
                  type="number"
                  label={t('maxResultsPerSite')}
                  value={maxResults}
                  onChange={(e) => setMaxResults(Number(e.target.value))}
                  sx={{ mb: 2 }}
                />
                
                <FormControlLabel
                  control={
                    <Switch 
                      checked={saveImages} 
                      onChange={(e) => setSaveImages(e.target.checked)} 
                    />
                  }
                  label={t('saveImages')}
                />
              </FormGroup>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Advanced Settings */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('advancedSettings')}
              </Typography>
              
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch 
                      checked={proxyEnabled} 
                      onChange={(e) => setProxyEnabled(e.target.checked)} 
                    />
                  }
                  label={t('useProxy')}
                  sx={{ mb: 1 }}
                />
                
                <TextField
                  fullWidth
                  label={t('proxyUrl')}
                  value={proxyUrl}
                  onChange={(e) => setProxyUrl(e.target.value)}
                  disabled={!proxyEnabled}
                  placeholder="http://proxy.example.com:8080"
                  sx={{ mb: 2 }}
                />
                
                <TextField
                  fullWidth
                  label={t('userAgent')}
                  value={userAgent}
                  onChange={(e) => setUserAgent(e.target.value)}
                  multiline
                  rows={2}
                />
              </FormGroup>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Save Button */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button 
              variant="outlined" 
              startIcon={<RefreshIcon />}
              onClick={() => setScrapers(availableScrapers)}
            >
              {t('resetDefaults')}
            </Button>
            <Button 
              variant="contained" 
              startIcon={<SaveIcon />}
              onClick={handleSaveConfig}
            >
              {t('saveConfiguration')}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}

export default ScraperConfig; 