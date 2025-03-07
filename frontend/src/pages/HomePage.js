import React from 'react';
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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SpeedIcon from '@mui/icons-material/Speed';
import VerifiedIcon from '@mui/icons-material/Verified';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useLanguage } from '../contexts/LanguageContext';

// Placeholder data for featured cars
const featuredCars = [
  {
    id: 1,
    title: 'BMW 5 Series',
    titleSv: 'BMW 5-serie',
    price: '450 000 kr',
    year: 2022,
    mileage: '15 000 km',
    image: 'https://images.unsplash.com/photo-1523983388277-336a66bf9bcd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    location: 'Stockholm',
  },
  {
    id: 2,
    title: 'Mercedes-Benz E-Class',
    titleSv: 'Mercedes-Benz E-klass',
    price: '520 000 kr',
    year: 2021,
    mileage: '12 500 km',
    image: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    location: 'Göteborg',
  },
  {
    id: 3,
    title: 'Audi A6',
    titleSv: 'Audi A6',
    price: '485 000 kr',
    year: 2022,
    mileage: '9 800 km',
    image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    location: 'Malmö',
  },
  {
    id: 4,
    title: 'Tesla Model 3',
    titleSv: 'Tesla Model 3',
    price: '399 000 kr',
    year: 2023,
    mileage: '5 200 km',
    image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    location: 'Uppsala',
  },
];

function HomePage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isMedium = useMediaQuery(theme.breakpoints.down('md'));
  const { t, language } = useLanguage();
  
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

        <Grid container spacing={4}>
          {featuredCars.map((car) => (
            <Grid item key={car.id} xs={12} sm={6} md={3}>
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
                <CardActionArea component={RouterLink} to={`/cars/${car.id}`}>
                  <CardMedia
                    component="img"
                    height="160"
                    image={car.image}
                    alt={language === 'en' ? car.title : car.titleSv}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                      {language === 'en' ? car.title : car.titleSv}
                    </Typography>
                    <Typography variant="h6" color="primary" sx={{ fontWeight: 700, mb: 1 }}>
                      {car.price}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {t('year')}: {car.year}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {car.mileage}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {car.location}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>

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
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    {benefit.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {benefit.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          position: 'relative',
          backgroundColor: 'primary.main',
          color: '#fff',
          py: 8,
          mt: 8,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
                {t('readyToFind')}
              </Typography>
              <Typography variant="h6" paragraph>
                {t('readyToFindSubtitle')}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Button
                variant="contained"
                size="large"
                component={RouterLink}
                to="/scraper"
                sx={{
                  py: 1.5,
                  px: 4,
                  fontSize: '1.1rem',
                  borderRadius: '30px',
                  bgcolor: '#fff',
                  color: 'primary.main',
                  '&:hover': {
                    bgcolor: 'grey.100',
                  },
                }}
                startIcon={<PlayArrowIcon />}
              >
                {t('startSearching')}
              </Button>
            </Grid>
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
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  bgcolor: 'primary.light',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <Typography variant="h4" sx={{ color: 'primary.contrastText', fontWeight: 700 }}>
                  1
                </Typography>
              </Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                {t('step1Title')}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {t('step1Desc')}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  bgcolor: 'primary.light',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <Typography variant="h4" sx={{ color: 'primary.contrastText', fontWeight: 700 }}>
                  2
                </Typography>
              </Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                {t('step2Title')}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {t('step2Desc')}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  bgcolor: 'primary.light',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <Typography variant="h4" sx={{ color: 'primary.contrastText', fontWeight: 700 }}>
                  3
                </Typography>
              </Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                {t('step3Title')}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {t('step3Desc')}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default HomePage; 