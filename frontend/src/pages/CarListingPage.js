import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  Container,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Slider,
  Stack,
  TextField,
  Typography,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SpeedIcon from '@mui/icons-material/Speed';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { carListingsApi } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';

// Filter options
const makes = ['Alla märken', 'Audi', 'BMW', 'Jaguar', 'Lexus', 'Mercedes-Benz', 'Porsche', 'Range Rover', 'Tesla'];
const years = ['Alla år', '2024', '2023', '2022', '2021', '2020', '2019', '2018'];
const fuelTypes = ['Alla bränsletyper', 'Bensin', 'Diesel', 'El', 'Hybrid'];
const transmissions = ['Alla växellådor', 'Automat', 'Manuell'];

// Format price with SEK
const formatPrice = (price) => {
  return new Intl.NumberFormat('sv-SE', { 
    style: 'currency', 
    currency: 'SEK',
    maximumFractionDigits: 0 
  }).format(price);
};

function CarListingPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isMedium = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState([0, 2000000]);
  const [selectedMake, setSelectedMake] = useState('Alla märken');
  const [selectedYear, setSelectedYear] = useState('Alla år');
  const [selectedFuel, setSelectedFuel] = useState('Alla bränsletyper');
  const [selectedTransmission, setSelectedTransmission] = useState('Alla växellådor');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(!isMobile);
  const [cars, setCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const carsPerPage = 12;

  // Parse query params on initial load
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.has('make')) setSelectedMake(params.get('make'));
    if (params.has('search')) setSearchTerm(params.get('search'));
    if (params.has('minPrice') && params.has('maxPrice')) {
      setPriceRange([parseInt(params.get('minPrice')), parseInt(params.get('maxPrice'))]);
    }
    if (params.has('year')) setSelectedYear(params.get('year'));
    if (params.has('fuel')) setSelectedFuel(params.get('fuel'));
    if (params.has('transmission')) setSelectedTransmission(params.get('transmission'));
    if (params.has('sort')) setSortBy(params.get('sort'));
    if (params.has('page')) setPage(parseInt(params.get('page')));
  }, [location.search]);

  // Fetch car listings
  useEffect(() => {
    const fetchCars = async () => {
      setLoading(true);
      setError(null);
      try {
        // Build filter params
        const params = {};
        if (selectedMake !== 'Alla märken') params.make = selectedMake;
        if (priceRange[0] > 0) params.minPrice = priceRange[0];
        if (priceRange[1] < 2000000) params.maxPrice = priceRange[1];
        if (searchTerm) params.search = searchTerm;
        params.page = page;
        params.limit = carsPerPage;

        const response = await carListingsApi.getListings(params);
        setCars(response.listings);
        setTotalPages(response.totalPages);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching car listings:', err);
        setError('Failed to load car listings. Please try again later.');
        setLoading(false);
      }
    };

    fetchCars();
  }, [selectedMake, priceRange, searchTerm, page]);

  // Apply client-side filters
  useEffect(() => {
    let filtered = [...cars];
    
    // Apply year filter
    if (selectedYear !== 'Alla år') {
      filtered = filtered.filter(car => 
        car.year && car.year.toString() === selectedYear
      );
    }
    
    // Apply fuel type filter
    if (selectedFuel !== 'Alla bränsletyper') {
      filtered = filtered.filter(car => 
        (car.fuel && car.fuel === selectedFuel) || 
        (car.fuelType && car.fuelType === selectedFuel)
      );
    }
    
    // Apply transmission filter
    if (selectedTransmission !== 'Alla växellådor') {
      filtered = filtered.filter(car => 
        car.transmission === selectedTransmission
      );
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        filtered.sort((a, b) => (b.year || 0) - (a.year || 0));
        break;
      case 'oldest':
        filtered.sort((a, b) => (a.year || 0) - (b.year || 0));
        break;
      default:
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
    setFilteredCars(filtered);
  }, [cars, selectedYear, selectedFuel, selectedTransmission, sortBy]);

  // Handle price range change
  const handlePriceChange = (event, newValue) => {
    setPriceRange(newValue);
  };

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Handle search submit
  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setPage(1);
    updateQueryParams();
  };

  // Handle sort change
  const handleSortChange = (event) => {
    setSortBy(event.target.value);
    updateQueryParams({ sort: event.target.value });
  };

  // Toggle filters visibility on mobile
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Handle favorite toggle
  const handleFavoriteToggle = (id) => {
    setCars(cars.map(car => 
      car._id === id ? { ...car, favorite: !car.favorite } : car
    ));
  };

  // Handle pagination change
  const handlePageChange = (event, value) => {
    setPage(value);
    updateQueryParams({ page: value });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Update query params in URL
  const updateQueryParams = (newParams = {}) => {
    const params = new URLSearchParams(location.search);
    
    // Update with current filter values
    if (selectedMake !== 'Alla märken') params.set('make', selectedMake);
    else params.delete('make');
    
    if (searchTerm) params.set('search', searchTerm);
    else params.delete('search');
    
    if (priceRange[0] > 0) params.set('minPrice', priceRange[0]);
    else params.delete('minPrice');
    
    if (priceRange[1] < 2000000) params.set('maxPrice', priceRange[1]);
    else params.delete('maxPrice');
    
    if (selectedYear !== 'Alla år') params.set('year', selectedYear);
    else params.delete('year');
    
    if (selectedFuel !== 'Alla bränsletyper') params.set('fuel', selectedFuel);
    else params.delete('fuel');
    
    if (selectedTransmission !== 'Alla växellådor') params.set('transmission', selectedTransmission);
    else params.delete('transmission');
    
    if (sortBy !== 'newest') params.set('sort', sortBy);
    else params.delete('sort');
    
    // Override with any new params
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    
    navigate({ search: params.toString() });
  };

  // Apply filters
  const applyFilters = () => {
    setPage(1);
    updateQueryParams({ page: 1 });
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setPriceRange([0, 2000000]);
    setSelectedMake('Alla märken');
    setSelectedYear('Alla år');
    setSelectedFuel('Alla bränsletyper');
    setSelectedTransmission('Alla växellådor');
    setSortBy('newest');
    setPage(1);
    navigate({ search: '' });
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('carListings')}
      </Typography>
      
      <Grid container spacing={3}>
        {/* Filters */}
        <Grid item xs={12} md={3}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" component="h2">
              {t('filters')}
            </Typography>
            <Button 
              variant="outlined" 
              startIcon={<FilterListIcon />}
              onClick={toggleFilters}
              sx={{ display: { md: 'none' } }}
            >
              {showFilters ? t('hideFilters') : t('showFilters')}
            </Button>
          </Box>
          
          {(showFilters || !isMobile) && (
            <Paper elevation={3} sx={{ p: 2 }}>
              <form onSubmit={handleSearchSubmit}>
                <TextField
                  fullWidth
                  label={t('search')}
                  variant="outlined"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  sx={{ mb: 3 }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton type="submit" edge="end">
                          <SearchIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </form>
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="make-label">{t('make')}</InputLabel>
                <Select
                  labelId="make-label"
                  value={selectedMake}
                  label={t('make')}
                  onChange={(e) => setSelectedMake(e.target.value)}
                >
                  {makes.map((make) => (
                    <MenuItem key={make} value={make}>
                      {make}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Box sx={{ mb: 3 }}>
                <Typography gutterBottom>{t('price')}</Typography>
                <Slider
                  value={priceRange}
                  onChange={handlePriceChange}
                  valueLabelDisplay="auto"
                  min={0}
                  max={2000000}
                  step={50000}
                  valueLabelFormat={(value) => formatPrice(value)}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">{formatPrice(priceRange[0])}</Typography>
                  <Typography variant="body2">{formatPrice(priceRange[1])}</Typography>
                </Box>
              </Box>
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="year-label">{t('year')}</InputLabel>
                <Select
                  labelId="year-label"
                  value={selectedYear}
                  label={t('year')}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  {years.map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="fuel-label">{t('fuelType')}</InputLabel>
                <Select
                  labelId="fuel-label"
                  value={selectedFuel}
                  label={t('fuelType')}
                  onChange={(e) => setSelectedFuel(e.target.value)}
                >
                  {fuelTypes.map((fuel) => (
                    <MenuItem key={fuel} value={fuel}>
                      {fuel}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="transmission-label">{t('transmission')}</InputLabel>
                <Select
                  labelId="transmission-label"
                  value={selectedTransmission}
                  label={t('transmission')}
                  onChange={(e) => setSelectedTransmission(e.target.value)}
                >
                  {transmissions.map((transmission) => (
                    <MenuItem key={transmission} value={transmission}>
                      {transmission}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Stack direction="row" spacing={2}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  fullWidth
                  onClick={applyFilters}
                >
                  {t('applyFilters')}
                </Button>
                <Button 
                  variant="outlined" 
                  color="secondary" 
                  fullWidth
                  onClick={resetFilters}
                >
                  {t('resetFilters')}
                </Button>
              </Stack>
            </Paper>
          )}
        </Grid>
        
        {/* Car Listings */}
        <Grid item xs={12} md={9}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography variant="h6" component="h2">
              {loading ? t('loading') : `${filteredCars.length} ${t('carsFound')}`}
            </Typography>
            
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel id="sort-label">{t('sortBy')}</InputLabel>
              <Select
                labelId="sort-label"
                value={sortBy}
                label={t('sortBy')}
                onChange={handleSortChange}
                startAdornment={
                  <InputAdornment position="start">
                    <SortIcon />
                  </InputAdornment>
                }
              >
                <MenuItem value="newest">{t('newest')}</MenuItem>
                <MenuItem value="oldest">{t('oldest')}</MenuItem>
                <MenuItem value="price-low">{t('priceLowToHigh')}</MenuItem>
                <MenuItem value="price-high">{t('priceHighToLow')}</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
          ) : filteredCars.length === 0 ? (
            <Alert severity="info" sx={{ my: 2 }}>{t('noListingsFound')}</Alert>
          ) : (
            <Grid container spacing={3}>
              {filteredCars.map((car) => (
                <Grid item xs={12} sm={6} md={4} key={car._id}>
                  <Card 
                    elevation={3} 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                      }
                    }}
                  >
                    <CardActionArea component={RouterLink} to={`/cars/${car._id}`}>
                      <CardMedia
                        component="img"
                        height="200"
                        image={car.images && car.images.length > 0 ? 
                          car.images.find(img => img.isMain)?.url || car.images[0].url : 
                          'https://via.placeholder.com/400x200?text=No+Image'}
                        alt={car.title}
                      />
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography gutterBottom variant="h6" component="h3" noWrap>
                          {car.title}
                        </Typography>
                        
                        <Typography variant="h5" color="primary" gutterBottom>
                          {formatPrice(car.price)}
                        </Typography>
                        
                        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                          <Chip 
                            icon={<CalendarTodayIcon />} 
                            label={car.year || 'N/A'} 
                            size="small" 
                            variant="outlined"
                          />
                          <Chip 
                            icon={<SpeedIcon />} 
                            label={car.mileage ? `${car.mileage} ${car.mileageUnit || 'km'}` : 'N/A'} 
                            size="small" 
                            variant="outlined"
                          />
                        </Stack>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <LocationOnIcon fontSize="small" sx={{ mr: 0.5 }} />
                          {car.location || car.seller?.location || 'N/A'}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                    <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        {car.source || 'Unknown source'}
                      </Typography>
                      <IconButton 
                        color={car.favorite ? 'primary' : 'default'} 
                        onClick={() => handleFavoriteToggle(car._id)}
                        aria-label={car.favorite ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        {car.favorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                      </IconButton>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
          
          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange} 
                color="primary" 
                size={isMobile ? 'small' : 'medium'}
              />
            </Box>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}

export default CarListingPage; 