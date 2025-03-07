import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Container,
  Grid,
  Paper,
  Typography,
  useTheme,
  useMediaQuery,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SpeedIcon from '@mui/icons-material/Speed';
import VerifiedIcon from '@mui/icons-material/Verified';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useLanguage } from '../contexts/LanguageContext';
import { carListingsApi } from '../services/api';

// Format price with SEK
const formatPrice = (price) => {
  return new Intl.NumberFormat('sv-SE', { 
    style: 'currency', 
    currency: 'SEK',
    maximumFractionDigits: 0 
  }).format(price);
};

function HomePage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isMedium = useMediaQuery(theme.breakpoints.down('md'));
  const { t, language } = useLanguage();
  
  const [featuredCars, setFeaturedCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch featured car listings
  useEffect(() => {
    const fetchFeaturedCars = async () => {
      setLoading(true);
      setError(null);
      try {
        // Get the latest listings with a limit of 8
        const response = await carListingsApi.getListings({ 
          limit: 8,
          sort: 'newest'
        });
        setFeaturedCars(response.listings);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching featured car listings:', err);
        setError('Failed to load featured car listings. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchFeaturedCars();
  }, []);
  
  // Benefits data with translations
  const benefits = [
    {
      icon: <SearchIcon fontSize="large" color="primary" />,
      title: t('easySearch'),
      description: t('easySearchDesc'),
    },
    {
      icon: <VerifiedIcon fontSize="large" color="primary" />,
      title: t('verifiedListings'),
      description: t('verifiedListingsDesc'),
    },
    {
      icon: <LocalOfferIcon fontSize="large" color="primary" />,
      title: t('bestPrices'),
      description: t('bestPricesDesc'),
    },
    {
      icon: <SupportAgentIcon fontSize="large" color="primary" />,
      title: t('support'),
      description: t('supportDesc'),
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Paper
        sx={{
          position: 'relative',
          backgroundColor: 'grey.800',
          color: '#fff',
          mb: 4,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundImage: 'url(https://source.unsplash.com/random/1600x900/?luxury-car)',
          height: { xs: '60vh', md: '70vh' },
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {/* Increase the priority of the hero background image */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
            backgroundColor: 'rgba(0,0,0,.5)',
          }}
        />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ maxWidth: { xs: '100%', md: '60%' } }}>
            <Typography
              component="h1"
              variant="h2"
              color="inherit"
              gutterBottom
              sx={{ fontWeight: 700, fontSize: { xs: '2.5rem', md: '3.5rem' } }}
            >
              {t('heroTitle')}
            </Typography>
            <Typography variant="h5" color="inherit" paragraph sx={{ mb: 4, fontSize: { xs: '1.2rem', md: '1.5rem' } }}>
              {t('heroSubtitle')}
            </Typography>
            <Button
              variant="contained"
              size="large"
              component={RouterLink}
              to="/cars"
              sx={{
                py: 1.5,
                px: 4,
                fontSize: '1.1rem',
                borderRadius: '30px',
                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
              }}
              startIcon={<SearchIcon />}
            >
              {t('browseCars')}
            </Button>
          </Box>
        </Container>
      </Paper>

      {/* Featured Cars Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
            {t('featuredCars')}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: '700px', mx: 'auto' }}>
            {t('featuredCarsSubtitle')}
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
        ) : featuredCars.length === 0 ? (
          <Alert severity="info" sx={{ my: 2 }}>{t('noListingsFound')}</Alert>
        ) : (
          <Grid container spacing={4}>
            {featuredCars.map((car) => (
              <Grid item key={car._id} xs={12} sm={6} md={3}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 20px rgba(0, 0, 0, 0.1)',
                    },
                  }}
                >
                  <CardActionArea component={RouterLink} to={`/cars/${car._id}`}>
                    <CardMedia
                      component="img"
                      height="160"
                      image={car.images && car.images.length > 0 ? 
                        car.images.find(img => img.isMain)?.url || car.images[0].url : 
                        'https://via.placeholder.com/400x200?text=No+Image'}
                      alt={car.title}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h6" component="h3" sx={{ fontWeight: 600 }} noWrap>
                        {car.title}
                      </Typography>
                      <Typography variant="h6" color="primary" sx={{ fontWeight: 700, mb: 1 }}>
                        {formatPrice(car.price)}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CalendarTodayIcon fontSize="small" sx={{ color: 'text.secondary', mr: 0.5 }} />
                          <Typography variant="body2" color="text.secondary">
                            {car.year || 'N/A'}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {car.mileage ? `${car.mileage.toLocaleString()} ${car.mileageUnit || 'km'}` : 'N/A'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocationOnIcon fontSize="small" sx={{ color: 'text.secondary', mr: 0.5 }} />
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {car.location || car.seller?.location || 'N/A'}
                        </Typography>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button
            variant="outlined"
            size="large"
            component={RouterLink}
            to="/cars"
            sx={{ borderRadius: '30px', px: 4 }}
          >
            {t('viewAllCars')}
          </Button>
        </Box>
      </Container>

      {/* Benefits Section */}
      <Box sx={{ bgcolor: 'background.paper', py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
              {t('whyChooseUs')}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: '700px', mx: 'auto' }}>
              {t('whyChooseUsSubtitle')}
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {benefits.map((benefit, index) => (
              <Grid item key={index} xs={12} sm={6} md={3}>
                <Box
                  sx={{
                    textAlign: 'center',
                    p: 3,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <Box sx={{ mb: 2 }}>{benefit.icon}</Box>
                  <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                    {benefit.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {benefit.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
            {t('howItWorks')}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: '700px', mx: 'auto' }}>
            {t('howItWorksSubtitle')}
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', p: 3 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                  fontSize: '2rem',
                  fontWeight: 'bold',
                }}
              >
                1
              </Box>
              <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                {t('step1Title')}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {t('step1Desc')}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', p: 3 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                  fontSize: '2rem',
                  fontWeight: 'bold',
                }}
              >
                2
              </Box>
              <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                {t('step2Title')}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {t('step2Desc')}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', p: 3 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                  fontSize: '2rem',
                  fontWeight: 'bold',
                }}
              >
                3
              </Box>
              <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                {t('step3Title')}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {t('step3Desc')}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Call to Action Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
                {t('readyToFind')}
              </Typography>
              <Typography variant="h6" paragraph sx={{ mb: 4, opacity: 0.9 }}>
                {t('readyToFindSubtitle')}
              </Typography>
              <Button
                variant="contained"
                size="large"
                component={RouterLink}
                to="/cars"
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  '&:hover': {
                    bgcolor: 'grey.100',
                  },
                  py: 1.5,
                  px: 4,
                  fontSize: '1.1rem',
                  borderRadius: '30px',
                  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
                }}
              >
                {t('startSearching')}
              </Button>
            </Grid>
            <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Box
                component="img"
                src="https://source.unsplash.com/random/600x400/?sports-car"
                alt="Luxury car"
                sx={{
                  width: '100%',
                  borderRadius: 2,
                  boxShadow: '0 16px 32px rgba(0, 0, 0, 0.2)',
                  transform: 'rotate(2deg)',
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}

export default HomePage; 