import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Link,
  Typography,
  Divider,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

function Footer() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const footerLinks = [
    {
      title: 'Company',
      links: [
        { name: 'About Us', path: '/about' },
        { name: 'Our Team', path: '/team' },
        { name: 'Careers', path: '/careers' },
        { name: 'Contact', path: '/contact' },
      ],
    },
    {
      title: 'Services',
      links: [
        { name: 'Car Listings', path: '/cars' },
        { name: 'Sell Your Car', path: '/sell' },
        { name: 'Car Valuation', path: '/valuation' },
        { name: 'Car Finance', path: '/finance' },
      ],
    },
    {
      title: 'Support',
      links: [
        { name: 'Help Center', path: '/help' },
        { name: 'Privacy Policy', path: '/privacy' },
        { name: 'Terms of Service', path: '/terms' },
        { name: 'FAQ', path: '/faq' },
      ],
    },
  ];

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'background.paper',
        py: 6,
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Logo and description */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <DirectionsCarIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" color="primary.main" fontWeight="bold">
                Premium Cars
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" paragraph>
              Your trusted destination for premium and luxury cars. We connect buyers with the best car deals across the country.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <IconButton aria-label="facebook" color="primary">
                <FacebookIcon />
              </IconButton>
              <IconButton aria-label="twitter" color="primary">
                <TwitterIcon />
              </IconButton>
              <IconButton aria-label="instagram" color="primary">
                <InstagramIcon />
              </IconButton>
              <IconButton aria-label="linkedin" color="primary">
                <LinkedInIcon />
              </IconButton>
            </Box>
          </Grid>

          {/* Footer links */}
          {footerLinks.map((section) => (
            <Grid item xs={12} sm={6} md={2.5} key={section.title}>
              <Typography variant="subtitle1" color="text.primary" gutterBottom fontWeight="bold">
                {section.title}
              </Typography>
              <Box component="ul" sx={{ p: 0, m: 0, listStyle: 'none' }}>
                {section.links.map((link) => (
                  <Box component="li" key={link.name} sx={{ py: 0.5 }}>
                    <Link
                      component={RouterLink}
                      to={link.path}
                      color="text.secondary"
                      sx={{
                        textDecoration: 'none',
                        '&:hover': {
                          color: 'primary.main',
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      {link.name}
                    </Link>
                  </Box>
                ))}
              </Box>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 4 }} />

        {/* Copyright */}
        <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'center' : 'flex-start' }}>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} Premium Cars. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', mt: isMobile ? 2 : 0 }}>
            <Link component={RouterLink} to="/privacy" color="text.secondary" sx={{ mx: 1, textDecoration: 'none' }}>
              Privacy
            </Link>
            <Link component={RouterLink} to="/terms" color="text.secondary" sx={{ mx: 1, textDecoration: 'none' }}>
              Terms
            </Link>
            <Link component={RouterLink} to="/cookies" color="text.secondary" sx={{ mx: 1, textDecoration: 'none' }}>
              Cookies
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer; 