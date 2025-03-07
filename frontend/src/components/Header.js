import React, { useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Button,
  MenuItem,
  Link,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import SearchIcon from '@mui/icons-material/Search';

const pages = [
  { name: 'Home', path: '/' },
  { name: 'Car Listings', path: '/cars' },
  { name: 'Car Scraper', path: '/scraper' },
];

function Header() {
  const [anchorElNav, setAnchorElNav] = useState(null);
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          {/* Logo for desktop */}
          <DirectionsCarIcon 
            sx={{ 
              display: { xs: 'none', md: 'flex' }, 
              mr: 1, 
              color: 'primary.main' 
            }} 
          />
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontWeight: 700,
              color: 'primary.main',
              textDecoration: 'none',
            }}
          >
            Premium Cars
          </Typography>

          {/* Mobile menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {pages.map((page) => (
                <MenuItem 
                  key={page.name} 
                  onClick={handleCloseNavMenu}
                  component={RouterLink}
                  to={page.path}
                  selected={location.pathname === page.path}
                >
                  <Typography textAlign="center">{page.name}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* Logo for mobile */}
          <DirectionsCarIcon 
            sx={{ 
              display: { xs: 'flex', md: 'none' }, 
              mr: 1, 
              color: 'primary.main' 
            }} 
          />
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontWeight: 700,
              color: 'primary.main',
              textDecoration: 'none',
            }}
          >
            Premium Cars
          </Typography>

          {/* Desktop menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <Button
                key={page.name}
                component={RouterLink}
                to={page.path}
                onClick={handleCloseNavMenu}
                sx={{ 
                  my: 2, 
                  color: 'text.primary', 
                  display: 'block',
                  fontWeight: location.pathname === page.path ? 700 : 400,
                  borderBottom: location.pathname === page.path ? '2px solid' : 'none',
                  borderColor: 'primary.main',
                }}
              >
                {page.name}
              </Button>
            ))}
          </Box>

          {/* Right side of the header */}
          <Box sx={{ flexGrow: 0, display: 'flex', gap: 2 }}>
            <Button 
              variant="contained" 
              color="primary"
              component={RouterLink}
              to="/scraper"
              sx={{ 
                display: { xs: 'none', sm: 'block' },
                borderRadius: '20px',
                px: 3
              }}
              startIcon={<SearchIcon />}
            >
              Start Scraper
            </Button>
            <Button 
              variant="outlined" 
              color="primary"
              component={RouterLink}
              to="/cars"
              sx={{ 
                display: { xs: 'none', sm: 'block' },
                borderRadius: '20px',
                px: 3
              }}
            >
              Find Cars
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Header; 