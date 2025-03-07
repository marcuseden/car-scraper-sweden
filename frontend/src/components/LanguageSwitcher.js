import React from 'react';
import { Button, IconButton, useMediaQuery, useTheme } from '@mui/material';
import TranslateIcon from '@mui/icons-material/Translate';
import { useLanguage } from '../contexts/LanguageContext';

function LanguageSwitcher() {
  const { language, toggleLanguage, t } = useLanguage();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return isMobile ? (
    <IconButton color="inherit" onClick={toggleLanguage} aria-label={t('changeLanguage')}>
      <TranslateIcon />
    </IconButton>
  ) : (
    <Button
      onClick={toggleLanguage}
      startIcon={<TranslateIcon />}
      sx={{ 
        color: 'inherit',
        borderRadius: '20px',
        border: '1px solid',
        borderColor: 'divider',
        px: 2,
        minWidth: 100,
      }}
    >
      {language === 'en' ? t('swedish') : t('english')}
    </Button>
  );
}

export default LanguageSwitcher; 