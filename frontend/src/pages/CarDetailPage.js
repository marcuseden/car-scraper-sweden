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
  Snackbar,
  Alert,
  Stack,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
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
import CloseIcon from '@mui/icons-material/Close';
import { carListingsApi } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';

// Format price with SEK
const formatPrice = (price) => {
  return new Intl.NumberFormat('sv-SE', { 
    style: 'currency', 
    currency: 'SEK',
    maximumFractionDigits: 0 
  }).format(price);
};

function CarDetailPage() {
  const { id } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isMedium = useMediaQuery(theme.breakpoints.down('md'));
  const { t, language } = useLanguage();
  
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [favorite, setFavorite] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [openGallery, setOpenGallery] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  // Fetch car data
  useEffect(() => {
    const fetchCarDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await carListingsApi.getListing(id);
        setCar(data);
        setFavorite(data.favorite);
        setLoading(false);
        
        // Set default message based on language
        setContactForm(prev => ({
          ...prev,
          message: language === 'en' 
            ? `I am interested in this ${data.title}. Please contact me with more information.`
            : `Jag är intresserad av denna ${data.title}. Vänligen kontakta mig med mer information.`
        }));
      } catch (err) {
        console.error('Error fetching car details:', err);
        setError('Failed to load car details. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchCarDetails();
  }, [id, language]);

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
    // For now, we'll just simulate a successful submission
    
    // Show success message based on language
    const message = language === 'en'
      ? 'Your message has been sent! The seller will contact you shortly.'
      : 'Ditt meddelande har skickats! Säljaren kommer att kontakta dig inom kort.';
    
    setSnackbarMessage(message);
    setSnackbarOpen(true);
    
    // Reset form
    setContactForm({
      name: '',
      email: '',
      phone: '',
      message: language === 'en' 
        ? `I am interested in this ${car.title}. Please contact me with more information.`
        : `Jag är intresserad av denna ${car.title}. Vänligen kontakta mig med mer information.`,
    });
  };
  
  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Open gallery
  const handleOpenGallery = (index) => {
    setGalleryIndex(index);
    setOpenGallery(true);
  };
  
  // Close gallery
  const handleCloseGallery = () => {
    setOpenGallery(false);
  };
  
  // Next image in gallery
  const handleNextImage = () => {
    if (car?.images) {
      setGalleryIndex((prevIndex) => (prevIndex + 1) % car.images.length);
    }
  };
  
  // Previous image in gallery
  const handlePrevImage = () => {
    if (car?.images) {
      setGalleryIndex((prevIndex) => (prevIndex - 1 + car.images.length) % car.images.length);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          {t('loadingCarDetails')}
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button 
          component={RouterLink} 
          to="/cars" 
          startIcon={<ArrowBackIcon />}
          variant="outlined"
        >
          {t('backToListings')}
        </Button>
      </Container>
    );
  }

  if (!car) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>{t('carNotFound')}</Alert>
        <Button 
          component={RouterLink} 
          to="/cars" 
          startIcon={<ArrowBackIcon />}
          variant="outlined"
        >
          {t('backToListings')}
        </Button>
      </Container>
    );
  }

  // Prepare images array
  const images = car.images && car.images.length > 0 
    ? car.images.map(img => img.url) 
    : ['https://via.placeholder.com/800x600?text=No+Image'];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />} 
        aria-label="breadcrumb"
        sx={{ mb: 2 }}
      >
        <Link component={RouterLink} to="/" color="inherit">
          {t('home')}
        </Link>
        <Link component={RouterLink} to="/cars" color="inherit">
          {t('carListings')}
        </Link>
        <Typography color="text.primary">{car.title}</Typography>
      </Breadcrumbs>
      
      {/* Back button */}
      <Button 
        component={RouterLink} 
        to="/cars" 
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 3 }}
      >
        {t('backToListings')}
      </Button>
      
      <Grid container spacing={4}>
        {/* Left column - Images */}
        <Grid item xs={12} md={8}>
          {/* Main image */}
          <Paper 
            elevation={2} 
            sx={{ 
              mb: 2, 
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
              '&:hover': {
                '& .MuiBox-root': {
                  opacity: 1,
                }
              }
            }}
            onClick={() => handleOpenGallery(selectedImage)}
          >
            <Box 
              component="img" 
              src={images[selectedImage]} 
              alt={car.title}
              sx={{ 
                width: '100%', 
                height: isMobile ? '300px' : '500px',
                objectFit: 'cover',
                display: 'block',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                bgcolor: 'rgba(0, 0, 0, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0,
                transition: 'opacity 0.3s',
              }}
            >
              <Typography variant="h6" color="white">
                {t('clickToViewGallery')}
              </Typography>
            </Box>
          </Paper>
          
          {/* Thumbnail images */}
          {images.length > 1 && (
            <Grid container spacing={1}>
              {images.slice(0, 6).map((image, index) => (
                <Grid item xs={4} sm={2} key={index}>
                  <Paper 
                    elevation={selectedImage === index ? 4 : 1}
                    sx={{ 
                      p: 0.5, 
                      cursor: 'pointer',
                      border: selectedImage === index ? `2px solid ${theme.palette.primary.main}` : 'none',
                    }}
                    onClick={() => setSelectedImage(index)}
                  >
                    <Box 
                      component="img" 
                      src={image} 
                      alt={`${car.title} - Image ${index + 1}`}
                      sx={{ 
                        width: '100%', 
                        height: '60px',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                  </Paper>
                </Grid>
              ))}
              {images.length > 6 && (
                <Grid item xs={4} sm={2}>
                  <Paper 
                    elevation={1}
                    sx={{ 
                      p: 0.5, 
                      cursor: 'pointer',
                      height: '60px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'rgba(0, 0, 0, 0.7)',
                    }}
                    onClick={() => handleOpenGallery(6)}
                  >
                    <Typography variant="body2" color="white">
                      +{images.length - 6} {t('more')}
                    </Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          )}
          
          {/* Car details */}
          <Paper elevation={2} sx={{ mt: 4, p: 3 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              {t('carDetails')}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={6} sm={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t('make')}
                </Typography>
                <Typography variant="body1">
                  {car.make || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t('model')}
                </Typography>
                <Typography variant="body1">
                  {car.model || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t('year')}
                </Typography>
                <Typography variant="body1">
                  {car.year || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t('mileage')}
                </Typography>
                <Typography variant="body1">
                  {car.mileage ? `${car.mileage.toLocaleString()} ${car.mileageUnit || 'km'}` : 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t('fuelType')}
                </Typography>
                <Typography variant="body1">
                  {car.fuel || car.fuelType || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t('transmission')}
                </Typography>
                <Typography variant="body1">
                  {car.transmission || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t('color')}
                </Typography>
                <Typography variant="body1">
                  {car.color || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t('horsePower')}
                </Typography>
                <Typography variant="body1">
                  {car.horsePower ? `${car.horsePower} hk` : 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t('bodyType')}
                </Typography>
                <Typography variant="body1">
                  {car.bodyType || 'N/A'}
                </Typography>
              </Grid>
              {car.driveType && (
                <Grid item xs={6} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('driveType')}
                  </Typography>
                  <Typography variant="body1">
                    {car.driveType}
                  </Typography>
                </Grid>
              )}
              {car.engineSize && (
                <Grid item xs={6} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('engineSize')}
                  </Typography>
                  <Typography variant="body1">
                    {car.engineSize}
                  </Typography>
                </Grid>
              )}
              {car.doors && (
                <Grid item xs={6} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('doors')}
                  </Typography>
                  <Typography variant="body1">
                    {car.doors}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Paper>
          
          {/* Description */}
          <Paper elevation={2} sx={{ mt: 4, p: 3 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              {t('description')}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
              {car.description || t('noDescriptionAvailable')}
            </Typography>
          </Paper>
          
          {/* Source information */}
          <Paper elevation={2} sx={{ mt: 4, p: 3 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              {t('sourceInformation')}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t('source')}
                </Typography>
                <Typography variant="body1">
                  {car.source || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t('scrapedAt')}
                </Typography>
                <Typography variant="body1">
                  {car.scrapedAt ? new Date(car.scrapedAt).toLocaleString() : 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t('sourceUrl')}
                </Typography>
                <Link href={car.sourceUrl} target="_blank" rel="noopener noreferrer">
                  {t('viewOriginalListing')}
                </Link>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* Right column - Price and contact */}
        <Grid item xs={12} md={4}>
          {/* Price card */}
          <Card elevation={3} sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h4" component="h1" gutterBottom>
                {car.title}
              </Typography>
              <Typography variant="h3" color="primary" gutterBottom>
                {formatPrice(car.price)}
              </Typography>
              
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Chip 
                  icon={<CalendarTodayIcon />} 
                  label={car.year || 'N/A'} 
                  variant="outlined"
                />
                <Chip 
                  icon={<SpeedIcon />} 
                  label={car.mileage ? `${car.mileage.toLocaleString()} ${car.mileageUnit || 'km'}` : 'N/A'} 
                  variant="outlined"
                />
              </Stack>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocationOnIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body1">
                  {car.location || car.seller?.location || 'N/A'}
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Stack direction="row" spacing={2}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  fullWidth
                  component="a"
                  href={car.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('viewOriginalListing')}
                </Button>
                <IconButton 
                  color={favorite ? 'primary' : 'default'} 
                  onClick={handleFavoriteToggle}
                  aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  {favorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton>
                <IconButton 
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: car.title,
                        text: `Check out this ${car.title} for ${formatPrice(car.price)}`,
                        url: window.location.href,
                      })
                      .catch((error) => console.log('Error sharing', error));
                    } else {
                      // Fallback for browsers that don't support the Web Share API
                      navigator.clipboard.writeText(window.location.href)
                        .then(() => alert('Link copied to clipboard!'))
                        .catch((error) => console.error('Could not copy text: ', error));
                    }
                  }}
                  aria-label="Share"
                >
                  <ShareIcon />
                </IconButton>
              </Stack>
            </CardContent>
          </Card>
          
          {/* Seller information */}
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                {t('sellerInformation')}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body1">
                  {car.seller?.name || t('notSpecified')}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <StoreIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body1">
                  {car.seller?.type === 'dealer' ? t('dealer') : 
                   car.seller?.type === 'private' ? t('privateSeller') : 
                   t('notSpecified')}
                </Typography>
              </Box>
              
              {car.seller?.phone && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body1">
                    <Link href={`tel:${car.seller.phone}`}>
                      {car.seller.phone}
                    </Link>
                  </Typography>
                </Box>
              )}
              
              {car.seller?.email && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body1">
                    <Link href={`mailto:${car.seller.email}`}>
                      {car.seller.email}
                    </Link>
                  </Typography>
                </Box>
              )}
              
              {car.seller?.location && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationOnIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body1">
                    {car.seller.location}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Image Gallery Dialog */}
      <Dialog
        fullScreen={isMobile}
        maxWidth="lg"
        open={openGallery}
        onClose={handleCloseGallery}
      >
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">{car.title} - {t('image')} {galleryIndex + 1} / {images.length}</Typography>
          <IconButton
            aria-label="close"
            onClick={handleCloseGallery}
            sx={{ color: 'grey.500' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 1, position: 'relative' }}>
          <Box 
            component="img" 
            src={images[galleryIndex]} 
            alt={`${car.title} - Image ${galleryIndex + 1}`}
            sx={{ 
              width: '100%', 
              maxHeight: '80vh',
              objectFit: 'contain',
              display: 'block',
            }}
          />
          
          {images.length > 1 && (
            <>
              <IconButton
                onClick={handlePrevImage}
                sx={{ 
                  position: 'absolute', 
                  left: 16, 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  bgcolor: 'rgba(255, 255, 255, 0.8)',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' },
                }}
              >
                <NavigateNextIcon sx={{ transform: 'rotate(180deg)' }} />
              </IconButton>
              <IconButton
                onClick={handleNextImage}
                sx={{ 
                  position: 'absolute', 
                  right: 16, 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  bgcolor: 'rgba(255, 255, 255, 0.8)',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' },
                }}
              >
                <NavigateNextIcon />
              </IconButton>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Snackbar for form submission feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default CarDetailPage; 