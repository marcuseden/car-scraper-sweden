import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  IconButton,
  Link,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShareIcon from '@mui/icons-material/Share';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SpeedIcon from '@mui/icons-material/Speed';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import SettingsIcon from '@mui/icons-material/Settings';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

// Placeholder car data
const carData = {
  id: 1,
  title: 'BMW 5 Series 530i M Sport',
  price: 450000,
  year: 2022,
  mileage: '15 000 km',
  location: 'Stockholm',
  fuel: 'Bensin',
  transmission: 'Automat',
  color: 'Alpinvit',
  engine: '2.0L Turbo I4',
  drivetrain: 'Bakhjulsdrift',
  vin: 'WBA5R7C51LFH38113',
  favorite: false,
  description: 'Denna BMW 5 Series 530i M Sport är i utmärkt skick med låg körsträcka. Den har premiumläderklädsel, panoramasoltak och det senaste teknikpaketet inklusive navigation, Apple CarPlay och Android Auto. Fordonet har underhållits noggrant och levereras med fullständig servicehistorik.',
  features: [
    'Premiumläderklädsel',
    'Panoramasoltak',
    'Navigationssystem',
    'Apple CarPlay & Android Auto',
    'Harman Kardon ljudsystem',
    'Uppvärmda & ventilerade säten',
    'Adaptiv farthållare',
    'Körfältsassistent',
    'Parkeringssensorer',
    'Dödavinkelvarnare',
    'Trådlös laddning',
    'LED-strålkastare',
  ],
  images: [
    'https://images.unsplash.com/photo-1523983388277-336a66bf9bcd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1520050206274-a1ae44613e6d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1526726538690-5cbf956ae2fd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  ],
  seller: {
    name: 'Premium Auto Stockholm',
    phone: '08-123 45 67',
    email: 'kontakt@premiumauto.se',
    address: 'Bilgatan 123, 111 22 Stockholm',
    logo: 'https://images.unsplash.com/photo-1551522435-a13afa10f103?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80',
    rating: 4.8,
    reviewCount: 156,
  },
  similarCars: [
    {
      id: 2,
      title: 'Mercedes-Benz E-Class',
      price: 520000,
      year: 2021,
      mileage: '12 500 km',
      image: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      location: 'Göteborg',
    },
    {
      id: 3,
      title: 'Audi A6',
      price: 485000,
      year: 2022,
      mileage: '9 800 km',
      image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      location: 'Malmö',
    },
    {
      id: 4,
      title: 'Tesla Model 3',
      price: 399000,
      year: 2023,
      mileage: '5 200 km',
      image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      location: 'Uppsala',
    },
  ],
};

function CarDetailPage() {
  const { id } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isMedium = useMediaQuery(theme.breakpoints.down('md'));
  
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [favorite, setFavorite] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: 'I am interested in this BMW 5 Series 530i M Sport. Please contact me with more information.',
  });

  // Fetch car data
  useEffect(() => {
    // In a real app, this would be an API call
    // For now, we'll just use the placeholder data
    setTimeout(() => {
      setCar(carData);
      setFavorite(carData.favorite);
      setLoading(false);
    }, 500);
  }, [id]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Handle image selection
  const handleImageSelect = (index) => {
    setSelectedImage(index);
  };

  // Handle favorite toggle
  const handleFavoriteToggle = () => {
    setFavorite(!favorite);
  };

  // Handle contact form changes
  const handleContactFormChange = (e) => {
    const { name, value } = e.target;
    setContactForm({
      ...contactForm,
      [name]: value,
    });
  };

  // Handle contact form submission
  const handleContactSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would send the form data to an API
    alert('Your message has been sent! The seller will contact you shortly.');
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h5">Loading car details...</Typography>
      </Container>
    );
  }

  if (!car) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h5">Car not found</Typography>
        <Button
          component={RouterLink}
          to="/cars"
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2 }}
        >
          Back to Car Listings
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />} 
        aria-label="breadcrumb"
        sx={{ mb: 3 }}
      >
        <Link component={RouterLink} to="/" color="inherit">
          Home
        </Link>
        <Link component={RouterLink} to="/cars" color="inherit">
          Car Listings
        </Link>
        <Typography color="text.primary">{car.title}</Typography>
      </Breadcrumbs>

      {/* Back Button */}
      <Button
        component={RouterLink}
        to="/cars"
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 3 }}
      >
        Back to Car Listings
      </Button>

      {/* Car Title and Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap' }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: isMobile ? 2 : 0 }}>
          {car.title}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton 
            aria-label="add to favorites" 
            onClick={handleFavoriteToggle}
            sx={{ 
              border: '1px solid', 
              borderColor: 'divider',
              color: favorite ? 'error.main' : 'action.active',
            }}
          >
            {favorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </IconButton>
          <IconButton 
            aria-label="share" 
            sx={{ 
              border: '1px solid', 
              borderColor: 'divider',
            }}
          >
            <ShareIcon />
          </IconButton>
        </Box>
      </Box>

      <Grid container spacing={4}>
        {/* Left Column - Images and Details */}
        <Grid item xs={12} md={8}>
          {/* Image Gallery */}
          <Paper sx={{ mb: 4, overflow: 'hidden', borderRadius: 2 }}>
            <Box
              sx={{
                height: { xs: '250px', sm: '350px', md: '450px' },
                width: '100%',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Box
                component="img"
                src={car.images[selectedImage]}
                alt={`${car.title} - Image ${selectedImage + 1}`}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', p: 1, overflowX: 'auto' }}>
              {car.images.map((image, index) => (
                <Box
                  key={index}
                  component="img"
                  src={image}
                  alt={`${car.title} - Thumbnail ${index + 1}`}
                  onClick={() => handleImageSelect(index)}
                  sx={{
                    width: '80px',
                    height: '60px',
                    objectFit: 'cover',
                    m: 0.5,
                    cursor: 'pointer',
                    border: index === selectedImage ? '2px solid' : '2px solid transparent',
                    borderColor: index === selectedImage ? 'primary.main' : 'transparent',
                    borderRadius: 1,
                    opacity: index === selectedImage ? 1 : 0.7,
                    transition: 'all 0.2s',
                    '&:hover': {
                      opacity: 1,
                    },
                  }}
                />
              ))}
            </Box>
          </Paper>

          {/* Tabs for Details, Features, etc. */}
          <Box sx={{ mb: 4 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant={isMobile ? "scrollable" : "fullWidth"}
              scrollButtons={isMobile ? "auto" : false}
              aria-label="car details tabs"
              sx={{ mb: 2 }}
            >
              <Tab label="Description" />
              <Tab label="Features" />
              <Tab label="Specifications" />
            </Tabs>

            {/* Description Tab */}
            {activeTab === 0 && (
              <Box sx={{ p: 2 }}>
                <Typography variant="body1" paragraph>
                  {car.description}
                </Typography>
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Vehicle Overview
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                        <CalendarTodayIcon sx={{ color: 'text.secondary', mr: 1 }} />
                        <Typography variant="body2">
                          <strong>Year:</strong> {car.year}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                        <SpeedIcon sx={{ color: 'text.secondary', mr: 1 }} />
                        <Typography variant="body2">
                          <strong>Mileage:</strong> {car.mileage}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                        <LocalGasStationIcon sx={{ color: 'text.secondary', mr: 1 }} />
                        <Typography variant="body2">
                          <strong>Fuel Type:</strong> {car.fuel}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                        <SettingsIcon sx={{ color: 'text.secondary', mr: 1 }} />
                        <Typography variant="body2">
                          <strong>Transmission:</strong> {car.transmission}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                        <ColorLensIcon sx={{ color: 'text.secondary', mr: 1 }} />
                        <Typography variant="body2">
                          <strong>Color:</strong> {car.color}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                        <DirectionsCarIcon sx={{ color: 'text.secondary', mr: 1 }} />
                        <Typography variant="body2">
                          <strong>VIN:</strong> {car.vin}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            )}

            {/* Features Tab */}
            {activeTab === 1 && (
              <Box sx={{ p: 2 }}>
                <Grid container spacing={2}>
                  {car.features.map((feature, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CheckCircleIcon sx={{ color: 'success.main', mr: 1 }} fontSize="small" />
                        <Typography variant="body2">{feature}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* Specifications Tab */}
            {activeTab === 2 && (
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Technical Specifications
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Engine
                      </Typography>
                      <Typography variant="body1">
                        {car.engine}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Drivetrain
                      </Typography>
                      <Typography variant="body1">
                        {car.drivetrain}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Transmission
                      </Typography>
                      <Typography variant="body1">
                        {car.transmission}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Fuel Type
                      </Typography>
                      <Typography variant="body1">
                        {car.fuel}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Color
                      </Typography>
                      <Typography variant="body1">
                        {car.color}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        VIN
                      </Typography>
                      <Typography variant="body1">
                        {car.vin}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Box>

          {/* Similar Cars */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              Similar Cars
            </Typography>
            <Grid container spacing={3}>
              {car.similarCars.map((similarCar) => (
                <Grid item key={similarCar.id} xs={12} sm={6} md={4}>
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
                    <Box
                      component={RouterLink}
                      to={`/cars/${similarCar.id}`}
                      sx={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <Box
                        component="img"
                        src={similarCar.image}
                        alt={similarCar.title}
                        sx={{
                          width: '100%',
                          height: '140px',
                          objectFit: 'cover',
                        }}
                      />
                      <CardContent>
                        <Typography gutterBottom variant="subtitle1" component="h3" sx={{ fontWeight: 600 }}>
                          {similarCar.title}
                        </Typography>
                        <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 700, mb: 1 }}>
                          {similarCar.price.toLocaleString()} kr
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            {similarCar.year}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {similarCar.mileage}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Grid>

        {/* Right Column - Price and Contact */}
        <Grid item xs={12} md={4}>
          {/* Price Card */}
          <Card sx={{ mb: 4, position: 'sticky', top: 20 }}>
            <CardContent>
              <Typography variant="h4" color="primary" sx={{ fontWeight: 700, mb: 2 }}>
                {car.price.toLocaleString()} kr
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocationOnIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  {car.location}
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              {/* Seller Information */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  component="img"
                  src={car.seller.logo}
                  alt={car.seller.name}
                  sx={{
                    width: 50,
                    height: 50,
                    borderRadius: '50%',
                    mr: 2,
                  }}
                />
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {car.seller.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Rating: {car.seller.rating}/5
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      ({car.seller.reviewCount} reviews)
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              {/* Contact Form */}
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Contact Seller
              </Typography>
              
              <Box component="form" onSubmit={handleContactSubmit} sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Your Name"
                  name="name"
                  value={contactForm.name}
                  onChange={handleContactFormChange}
                  margin="normal"
                  required
                  size="small"
                />
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={contactForm.email}
                  onChange={handleContactFormChange}
                  margin="normal"
                  required
                  size="small"
                />
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={contactForm.phone}
                  onChange={handleContactFormChange}
                  margin="normal"
                  size="small"
                />
                <TextField
                  fullWidth
                  label="Message"
                  name="message"
                  value={contactForm.message}
                  onChange={handleContactFormChange}
                  margin="normal"
                  required
                  multiline
                  rows={4}
                  size="small"
                />
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{ mt: 2, py: 1.5 }}
                  className="pulse-button"
                >
                  Send Message
                </Button>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              {/* Direct Contact */}
              <Typography variant="subtitle2" gutterBottom>
                Or contact directly:
              </Typography>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<PhoneIcon />}
                sx={{ mb: 1 }}
                component="a"
                href={`tel:${car.seller.phone}`}
              >
                {car.seller.phone}
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<EmailIcon />}
                component="a"
                href={`mailto:${car.seller.email}`}
              >
                Email Seller
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default CarDetailPage; 