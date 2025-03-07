import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SpeedIcon from '@mui/icons-material/Speed';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

// Placeholder data for car listings
const carListings = [
  {
    id: 1,
    title: 'BMW 5 Series',
    price: 45000,
    year: 2022,
    mileage: '15,000 mi',
    image: 'https://source.unsplash.com/random/300x200/?bmw',
    location: 'San Francisco, CA',
    fuel: 'Gasoline',
    transmission: 'Automatic',
    favorite: false,
  },
  {
    id: 2,
    title: 'Mercedes-Benz E-Class',
    price: 52000,
    year: 2021,
    mileage: '12,500 mi',
    image: 'https://source.unsplash.com/random/300x200/?mercedes',
    location: 'Los Angeles, CA',
    fuel: 'Diesel',
    transmission: 'Automatic',
    favorite: true,
  },
  {
    id: 3,
    title: 'Audi A6',
    price: 48500,
    year: 2022,
    mileage: '9,800 mi',
    image: 'https://source.unsplash.com/random/300x200/?audi',
    location: 'New York, NY',
    fuel: 'Gasoline',
    transmission: 'Automatic',
    favorite: false,
  },
  {
    id: 4,
    title: 'Tesla Model 3',
    price: 39900,
    year: 2023,
    mileage: '5,200 mi',
    image: 'https://source.unsplash.com/random/300x200/?tesla',
    location: 'Chicago, IL',
    fuel: 'Electric',
    transmission: 'Automatic',
    favorite: false,
  },
  {
    id: 5,
    title: 'Lexus ES',
    price: 42000,
    year: 2022,
    mileage: '11,200 mi',
    image: 'https://source.unsplash.com/random/300x200/?lexus',
    location: 'Miami, FL',
    fuel: 'Hybrid',
    transmission: 'Automatic',
    favorite: false,
  },
  {
    id: 6,
    title: 'Porsche 911',
    price: 115000,
    year: 2021,
    mileage: '8,500 mi',
    image: 'https://source.unsplash.com/random/300x200/?porsche',
    location: 'Seattle, WA',
    fuel: 'Gasoline',
    transmission: 'Manual',
    favorite: true,
  },
  {
    id: 7,
    title: 'Range Rover Sport',
    price: 78000,
    year: 2022,
    mileage: '14,300 mi',
    image: 'https://source.unsplash.com/random/300x200/?rangerover',
    location: 'Denver, CO',
    fuel: 'Diesel',
    transmission: 'Automatic',
    favorite: false,
  },
  {
    id: 8,
    title: 'Jaguar F-Pace',
    price: 56000,
    year: 2023,
    mileage: '7,800 mi',
    image: 'https://source.unsplash.com/random/300x200/?jaguar',
    location: 'Austin, TX',
    fuel: 'Gasoline',
    transmission: 'Automatic',
    favorite: false,
  },
];

// Filter options
const makes = ['All Makes', 'Audi', 'BMW', 'Jaguar', 'Lexus', 'Mercedes-Benz', 'Porsche', 'Range Rover', 'Tesla'];
const years = ['All Years', '2023', '2022', '2021', '2020', '2019', '2018'];
const fuelTypes = ['All Fuel Types', 'Gasoline', 'Diesel', 'Electric', 'Hybrid'];
const transmissions = ['All Transmissions', 'Automatic', 'Manual'];

function CarListingPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isMedium = useMediaQuery(theme.breakpoints.down('md'));
  
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState([0, 150000]);
  const [selectedMake, setSelectedMake] = useState('All Makes');
  const [selectedYear, setSelectedYear] = useState('All Years');
  const [selectedFuel, setSelectedFuel] = useState('All Fuel Types');
  const [selectedTransmission, setSelectedTransmission] = useState('All Transmissions');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(!isMobile);
  const [cars, setCars] = useState(carListings);
  const [page, setPage] = useState(1);
  const carsPerPage = 6;

  // Handle price range change
  const handlePriceChange = (event, newValue) => {
    setPriceRange(newValue);
  };

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Handle sort change
  const handleSortChange = (event) => {
    setSortBy(event.target.value);
  };

  // Toggle filters visibility on mobile
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Handle favorite toggle
  const handleFavoriteToggle = (id) => {
    setCars(cars.map(car => 
      car.id === id ? { ...car, favorite: !car.favorite } : car
    ));
  };

  // Handle pagination change
  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter and sort cars
  useEffect(() => {
    let filteredCars = [...carListings];
    
    // Apply search filter
    if (searchTerm) {
      filteredCars = filteredCars.filter(car => 
        car.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply price range filter
    filteredCars = filteredCars.filter(car => 
      car.price >= priceRange[0] && car.price <= priceRange[1]
    );
    
    // Apply make filter
    if (selectedMake !== 'All Makes') {
      filteredCars = filteredCars.filter(car => 
        car.title.includes(selectedMake)
      );
    }
    
    // Apply year filter
    if (selectedYear !== 'All Years') {
      filteredCars = filteredCars.filter(car => 
        car.year.toString() === selectedYear
      );
    }
    
    // Apply fuel type filter
    if (selectedFuel !== 'All Fuel Types') {
      filteredCars = filteredCars.filter(car => 
        car.fuel === selectedFuel
      );
    }
    
    // Apply transmission filter
    if (selectedTransmission !== 'All Transmissions') {
      filteredCars = filteredCars.filter(car => 
        car.transmission === selectedTransmission
      );
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        filteredCars.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filteredCars.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        filteredCars.sort((a, b) => b.year - a.year);
        break;
      case 'oldest':
        filteredCars.sort((a, b) => a.year - b.year);
        break;
      default:
        break;
    }
    
    setCars(filteredCars);
    setPage(1); // Reset to first page when filters change
  }, [searchTerm, priceRange, selectedMake, selectedYear, selectedFuel, selectedTransmission, sortBy]);

  // Calculate pagination
  const indexOfLastCar = page * carsPerPage;
  const indexOfFirstCar = indexOfLastCar - carsPerPage;
  const currentCars = cars.slice(indexOfFirstCar, indexOfLastCar);
  const totalPages = Math.ceil(cars.length / carsPerPage);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
        Car Listings
      </Typography>
      
      {/* Search and Filter Bar */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search by make, model, or location"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <FormControl fullWidth>
              <InputLabel id="sort-label">Sort By</InputLabel>
              <Select
                labelId="sort-label"
                value={sortBy}
                label="Sort By"
                onChange={handleSortChange}
                startAdornment={
                  <InputAdornment position="start">
                    <SortIcon />
                  </InputAdornment>
                }
              >
                <MenuItem value="newest">Newest First</MenuItem>
                <MenuItem value="oldest">Oldest First</MenuItem>
                <MenuItem value="price-low">Price: Low to High</MenuItem>
                <MenuItem value="price-high">Price: High to Low</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={toggleFilters}
              sx={{ height: '56px' }}
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </Grid>
        </Grid>
        
        {/* Filters Section */}
        {showFilters && (
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel id="make-label">Make</InputLabel>
                  <Select
                    labelId="make-label"
                    value={selectedMake}
                    label="Make"
                    onChange={(e) => setSelectedMake(e.target.value)}
                  >
                    {makes.map((make) => (
                      <MenuItem key={make} value={make}>
                        {make}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel id="year-label">Year</InputLabel>
                  <Select
                    labelId="year-label"
                    value={selectedYear}
                    label="Year"
                    onChange={(e) => setSelectedYear(e.target.value)}
                  >
                    {years.map((year) => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel id="fuel-label">Fuel Type</InputLabel>
                  <Select
                    labelId="fuel-label"
                    value={selectedFuel}
                    label="Fuel Type"
                    onChange={(e) => setSelectedFuel(e.target.value)}
                  >
                    {fuelTypes.map((fuel) => (
                      <MenuItem key={fuel} value={fuel}>
                        {fuel}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel id="transmission-label">Transmission</InputLabel>
                  <Select
                    labelId="transmission-label"
                    value={selectedTransmission}
                    label="Transmission"
                    onChange={(e) => setSelectedTransmission(e.target.value)}
                  >
                    {transmissions.map((transmission) => (
                      <MenuItem key={transmission} value={transmission}>
                        {transmission}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Typography id="price-range-slider" gutterBottom>
                  Price Range: ${priceRange[0].toLocaleString()} - ${priceRange[1].toLocaleString()}
                </Typography>
                <Slider
                  value={priceRange}
                  onChange={handlePriceChange}
                  valueLabelDisplay="auto"
                  min={0}
                  max={150000}
                  step={5000}
                  valueLabelFormat={(value) => `$${value.toLocaleString()}`}
                  aria-labelledby="price-range-slider"
                />
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
      
      {/* Results Count and Active Filters */}
      <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', mb: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: isMobile ? 2 : 0 }}>
          Showing <strong>{cars.length}</strong> cars
        </Typography>
        
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {selectedMake !== 'All Makes' && (
            <Chip 
              label={`Make: ${selectedMake}`} 
              onDelete={() => setSelectedMake('All Makes')} 
              size="small" 
              sx={{ m: 0.5 }}
            />
          )}
          {selectedYear !== 'All Years' && (
            <Chip 
              label={`Year: ${selectedYear}`} 
              onDelete={() => setSelectedYear('All Years')} 
              size="small" 
              sx={{ m: 0.5 }}
            />
          )}
          {selectedFuel !== 'All Fuel Types' && (
            <Chip 
              label={`Fuel: ${selectedFuel}`} 
              onDelete={() => setSelectedFuel('All Fuel Types')} 
              size="small" 
              sx={{ m: 0.5 }}
            />
          )}
          {selectedTransmission !== 'All Transmissions' && (
            <Chip 
              label={`Transmission: ${selectedTransmission}`} 
              onDelete={() => setSelectedTransmission('All Transmissions')} 
              size="small" 
              sx={{ m: 0.5 }}
            />
          )}
          {(selectedMake !== 'All Makes' || selectedYear !== 'All Years' || 
            selectedFuel !== 'All Fuel Types' || selectedTransmission !== 'All Transmissions' || 
            priceRange[0] > 0 || priceRange[1] < 150000 || searchTerm) && (
            <Chip 
              label="Clear All" 
              onClick={() => {
                setSelectedMake('All Makes');
                setSelectedYear('All Years');
                setSelectedFuel('All Fuel Types');
                setSelectedTransmission('All Transmissions');
                setPriceRange([0, 150000]);
                setSearchTerm('');
              }} 
              color="primary" 
              size="small" 
              sx={{ m: 0.5 }}
            />
          )}
        </Stack>
      </Box>
      
      {/* Car Listings */}
      {cars.length > 0 ? (
        <>
          <Grid container spacing={3}>
            {currentCars.map((car) => (
              <Grid item key={car.id} xs={12} sm={6} md={4}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    position: 'relative',
                    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 20px rgba(0, 0, 0, 0.1)',
                    },
                  }}
                >
                  <IconButton
                    aria-label="add to favorites"
                    onClick={() => handleFavoriteToggle(car.id)}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: 'rgba(255, 255, 255, 0.8)',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.9)',
                      },
                      zIndex: 1,
                    }}
                  >
                    {car.favorite ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                  </IconButton>
                  <CardActionArea component={RouterLink} to={`/cars/${car.id}`}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={car.image}
                      alt={car.title}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                        {car.title}
                      </Typography>
                      <Typography variant="h6" color="primary" sx={{ fontWeight: 700, mb: 2 }}>
                        ${car.price.toLocaleString()}
                      </Typography>
                      
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <CalendarTodayIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                            <Typography variant="body2" color="text.secondary">
                              {car.year}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <SpeedIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                            <Typography variant="body2" color="text.secondary">
                              {car.mileage}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            <LocationOnIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                            <Typography variant="body2" color="text.secondary">
                              {car.location}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                      
                      <Box sx={{ display: 'flex', mt: 2, gap: 1 }}>
                        <Chip size="small" label={car.fuel} />
                        <Chip size="small" label={car.transmission} />
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange} 
                color="primary" 
                size={isMobile ? "small" : "medium"}
              />
            </Box>
          )}
        </>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No cars found matching your criteria
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Try adjusting your filters or search term to see more results.
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => {
              setSelectedMake('All Makes');
              setSelectedYear('All Years');
              setSelectedFuel('All Fuel Types');
              setSelectedTransmission('All Transmissions');
              setPriceRange([0, 150000]);
              setSearchTerm('');
            }}
          >
            Clear All Filters
          </Button>
        </Paper>
      )}
    </Container>
  );
}

export default CarListingPage; 