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

// Placeholder data for featured cars
const featuredCars = [
  {
    id: 1,
    title: 'BMW 5 Series',
    price: '450 000 kr',
    year: 2022,
    mileage: '15 000 km',
    image: 'https://images.unsplash.com/photo-1523983388277-336a66bf9bcd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    location: 'Stockholm',
  },
  {
    id: 2,
    title: 'Mercedes-Benz E-Class',
    price: '520 000 kr',
    year: 2021,
    mileage: '12 500 km',
    image: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    location: 'Göteborg',
  },
  {
    id: 3,
    title: 'Audi A6',
    price: '485 000 kr',
    year: 2022,
    mileage: '9 800 km',
    image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    location: 'Malmö',
  },
  {
    id: 4,
    title: 'Tesla Model 3',
    price: '399 000 kr',
    year: 2023,
    mileage: '5 200 km',
    image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    location: 'Uppsala',
  },
];

// Benefits data
const benefits = [
  {
    icon: <SearchIcon fontSize="large" color="primary" />,
    title: 'Easy Search',
    description: 'Find your dream car with our powerful search filters and intuitive interface.',
  },
  {
    icon: <VerifiedIcon fontSize="large" color="primary" />,
    title: 'Verified Listings',
    description: 'All our listings are verified for authenticity and accurate information.',
  },
  {
    icon: <LocalOfferIcon fontSize="large" color="primary" />,
    title: 'Best Prices',
    description: 'Compare prices across different sellers to get the best deal possible.',
  },
  {
    icon: <SupportAgentIcon fontSize="large" color="primary" />,
    title: '24/7 Support',
    description: 'Our customer support team is available around the clock to assist you.',
  },
];

function HomePage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isMedium = useMediaQuery(theme.breakpoints.down('md'));

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
              Find Your Dream Car Today
            </Typography>
            <Typography variant="h5" color="inherit" paragraph sx={{ mb: 4, fontSize: { xs: '1.2rem', md: '1.5rem' } }}>
              Browse through thousands of premium and luxury cars from trusted sellers across the country.
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
              Browse Cars
            </Button>
          </Box>
        </Container>
      </Paper>

      {/* Featured Cars Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
            Featured Cars
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: '700px', mx: 'auto' }}>
            Discover our handpicked selection of premium vehicles that offer exceptional value and quality.
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
                    alt={car.title}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                      {car.title}
                    </Typography>
                    <Typography variant="h6" color="primary" sx={{ fontWeight: 700, mb: 1 }}>
                      {car.price}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Year: {car.year}
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
            View All Cars
          </Button>
        </Box>
      </Container>

      {/* Benefits Section */}
      <Box sx={{ bgcolor: 'background.paper', py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
              Why Choose Us
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: '700px', mx: 'auto' }}>
              We provide a seamless car buying experience with features designed to make your journey easier.
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
                  <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                    {benefit.icon}
                  </Box>
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

      {/* Car Scraper Promo Section */}
      <Box
        sx={{
          py: 8,
          position: 'relative',
          overflow: 'hidden',
          bgcolor: 'grey.100',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
                Try Our New Car Scraper
              </Typography>
              <Typography variant="subtitle1" paragraph sx={{ mb: 4 }}>
                Looking for a specific type of car? Our intelligent car scraper can find exactly what you're looking for across multiple sources. Just describe what you want in natural language or use voice commands.
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
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
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
                  }}
                  startIcon={<SearchIcon />}
                >
                  Start Scraping
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    py: 1.5,
                    px: 4,
                    fontSize: '1.1rem',
                    borderRadius: '30px',
                  }}
                >
                  Learn More
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  position: 'relative',
                  height: { xs: '300px', md: '400px' },
                  width: '100%',
                  borderRadius: 4,
                  overflow: 'hidden',
                  boxShadow: '0 16px 32px rgba(0, 0, 0, 0.1)',
                }}
              >
                <Box
                  component="img"
                  src="https://source.unsplash.com/random/600x400/?car-search"
                  alt="Car Scraper"
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    bgcolor: 'rgba(0,0,0,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <PlayArrowIcon sx={{ fontSize: 80, color: 'white', opacity: 0.9 }} />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Call to Action */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
            Ready to Find Your Perfect Car?
          </Typography>
          <Typography variant="subtitle1" paragraph sx={{ mb: 4, maxWidth: '700px', mx: 'auto' }}>
            Start browsing our extensive collection of premium vehicles and find the one that matches your style and needs.
          </Typography>
          <Button
            variant="contained"
            size="large"
            component={RouterLink}
            to="/cars"
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              py: 1.5,
              px: 4,
              fontSize: '1.1rem',
              borderRadius: '30px',
              '&:hover': {
                bgcolor: 'grey.100',
              },
            }}
          >
            Start Searching Now
          </Button>
        </Container>
      </Box>
    </Box>
  );
}

export default HomePage; 