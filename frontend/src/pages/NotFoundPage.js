import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';

function NotFoundPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '70vh',
          textAlign: 'center',
          py: 8,
        }}
      >
        <DirectionsCarIcon
          sx={{
            fontSize: { xs: 80, md: 120 },
            color: 'primary.main',
            mb: 2,
            transform: 'rotate(-15deg)',
          }}
        />
        
        <Typography
          variant="h1"
          component="h1"
          sx={{
            fontWeight: 700,
            fontSize: { xs: '4rem', md: '6rem' },
            mb: 2,
            background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          404
        </Typography>
        
        <Typography
          variant="h4"
          component="h2"
          gutterBottom
          sx={{
            fontWeight: 600,
            mb: 2,
          }}
        >
          Page Not Found
        </Typography>
        
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            maxWidth: '600px',
            mb: 4,
          }}
        >
          Oops! The page you are looking for seems to have taken a wrong turn.
          It might have been moved, deleted, or never existed in the first place.
        </Typography>
        
        <Box
          sx={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: 2,
            mt: 2,
          }}
        >
          <Button
            variant="contained"
            size="large"
            component={RouterLink}
            to="/"
            startIcon={<HomeIcon />}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: '30px',
            }}
          >
            Back to Home
          </Button>
          
          <Button
            variant="outlined"
            size="large"
            component={RouterLink}
            to="/cars"
            startIcon={<SearchIcon />}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: '30px',
            }}
          >
            Browse Cars
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default NotFoundPage; 