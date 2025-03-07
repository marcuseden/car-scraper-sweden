import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  IconButton,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import SendIcon from '@mui/icons-material/Send';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import SettingsIcon from '@mui/icons-material/Settings';
import HistoryIcon from '@mui/icons-material/History';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import TuneIcon from '@mui/icons-material/Tune';
import ChatIcon from '@mui/icons-material/Chat';
import { useLanguage } from '../contexts/LanguageContext';
import ScraperConfig from '../components/ScraperConfig';
import { scraperApi } from '../services/api';

// Mock data for scraper history
const scraperHistory = [
  {
    id: 1,
    query: "BMW 5 Series från 2018-2022 med mindre än 5000 mil",
    date: "2023-03-15",
    status: "completed",
    results: 42
  },
  {
    id: 2,
    query: "Tesla Model 3 i Stockholm under 400 000 kr",
    date: "2023-03-10",
    status: "completed",
    results: 18
  },
  {
    id: 3,
    query: "Mercedes-Benz E-Class med premiumpaket och under 3000 mil",
    date: "2023-03-05",
    status: "failed",
    results: 0
  }
];

// European car sites with focus on Scandinavia
const carSites = {
  scandinavia: [
    { name: "Blocket.se", country: "Sweden", enabled: true },
    { name: "Bytbil.com", country: "Sweden", enabled: true },
    { name: "Bilweb.se", country: "Sweden", enabled: true },
    { name: "Finn.no", country: "Norway", enabled: true },
    { name: "Bilbasen.dk", country: "Denmark", enabled: true },
    { name: "Nettiauto.com", country: "Finland", enabled: false }
  ],
  europe: [
    { name: "Mobile.de", country: "Germany", enabled: false },
    { name: "AutoScout24.com", country: "Europe", enabled: false },
    { name: "Bilbasen.dk", country: "Denmark", enabled: false },
    { name: "Autovit.ro", country: "Romania", enabled: false },
    { name: "Leboncoin.fr", country: "France", enabled: false }
  ]
};

function ScraperPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isMedium = useMediaQuery(theme.breakpoints.down('md'));
  const { t, language } = useLanguage();
  
  // Example car types for suggestions based on language
  const carTypeSuggestions = language === 'en' ? [
    t('luxuryCars'),
    t('electricSUVs'),
    t('sportsCars'),
    t('familyCars'),
    t('hybridCars')
  ] : [
    t('luxuryCars'),
    t('electricSUVs'),
    t('sportsCars'),
    t('familyCars'),
    t('hybridCars')
  ];
  
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scraperRunning, setScraperRunning] = useState(false);
  const [scraperProgress, setScraperProgress] = useState(0);
  const [conversations, setConversations] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [voiceInputEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  
  const recognitionRef = useRef(null);
  const conversationEndRef = useRef(null);
  
  // Initialize speech recognition if enabled
  useEffect(() => {
    if (voiceInputEnabled && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      // Set language based on current app language
      recognitionRef.current.lang = language === 'sv' ? 'sv-SE' : 'en-US';
      
      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        
        setInputText(transcript);
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
    }
  }, [voiceInputEnabled, language]);
  
  // Scroll to bottom of conversation
  useEffect(() => {
    if (conversationEndRef.current) {
      conversationEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversations]);
  
  // Simulate scraper progress
  useEffect(() => {
    let interval;
    if (scraperRunning && scraperProgress < 100) {
      interval = setInterval(() => {
        setScraperProgress((prev) => {
          const increment = Math.floor(Math.random() * 3) + 1;
          return Math.min(prev + increment, 100);
        });
      }, 1000);
    } else if (scraperProgress >= 100) {
      setScraperRunning(false);
      addBotMessage(language === 'en' 
        ? "Scraping completed! Found 37 cars matching your criteria. You can view the results in the Car Listings page."
        : "Sökning slutförd! Hittade 37 bilar som matchar dina kriterier. Du kan se resultaten på sidan Billistor."
      );
    }
    
    return () => clearInterval(interval);
  }, [scraperRunning, scraperProgress, language]);
  
  const toggleListening = () => {
    if (!voiceInputEnabled) {
      addBotMessage(language === 'en' 
        ? "Voice input is currently disabled in this environment."
        : "Röstinmatning är för närvarande inaktiverad i denna miljö."
      );
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        try {
          // Update language before starting
          recognitionRef.current.lang = language === 'sv' ? 'sv-SE' : 'en-US';
          recognitionRef.current.start();
          setIsListening(true);
        } catch (error) {
          console.error('Speech recognition error', error);
        }
      } else {
        addBotMessage(language === 'en'
          ? "Sorry, speech recognition is not supported in your browser."
          : "Tyvärr, taligenkänning stöds inte i din webbläsare."
        );
      }
    }
  };
  
  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };
  
  const addUserMessage = (text) => {
    setConversations([...conversations, { type: 'user', text, timestamp: new Date() }]);
  };
  
  const addBotMessage = (text) => {
    setConversations([...conversations, { type: 'bot', text, timestamp: new Date() }]);
  };
  
  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    
    addUserMessage(inputText);
    setInputText('');
    setIsProcessing(true);
    
    // Simulate bot response after a delay
    setTimeout(() => {
      processUserInput(inputText);
      setIsProcessing(false);
    }, 1000);
  };
  
  const processUserInput = (text) => {
    const lowerText = text.toLowerCase();
    
    if (language === 'en') {
      if (lowerText.includes('start') || lowerText.includes('begin') || lowerText.includes('search')) {
        addBotMessage("I'll start searching for cars based on your criteria. This may take a few minutes. You'll see the results in real-time.");
        setScraperRunning(true);
        setScraperProgress(0);
      } else if (lowerText.includes('stop') || lowerText.includes('cancel')) {
        addBotMessage("I've stopped the search. You can start a new search anytime.");
        setScraperRunning(false);
      } else if (lowerText.includes('help') || lowerText.includes('how')) {
        addBotMessage("To use the car search, simply describe the type of cars you want to find. For example, 'Find BMW sedans from 2018-2022 with less than 50,000 miles' or 'Search for Tesla Model 3 listings in Stockholm'. Then click 'Start Search' to begin.");
      } else {
        addBotMessage(`I understand you're looking for ${text}. Would you like me to start searching for these cars now? Click the "Start Search" button when ready.`);
      }
    } else {
      if (lowerText.includes('starta') || lowerText.includes('börja') || lowerText.includes('sök')) {
        addBotMessage("Jag börjar söka efter bilar baserat på dina kriterier. Detta kan ta några minuter. Du kommer att se resultaten i realtid.");
        setScraperRunning(true);
        setScraperProgress(0);
      } else if (lowerText.includes('stoppa') || lowerText.includes('avbryt')) {
        addBotMessage("Jag har stoppat sökningen. Du kan starta en ny sökning när som helst.");
        setScraperRunning(false);
      } else if (lowerText.includes('hjälp') || lowerText.includes('hur')) {
        addBotMessage("För att använda bilsökaren, beskriv vilken typ av bilar du vill hitta. Till exempel, 'Hitta BMW sedan från 2018-2022 med mindre än 5000 mil' eller 'Sök efter Tesla Model 3 i Stockholm'. Klicka sedan på 'Starta sökning' för att börja.");
      } else {
        addBotMessage(`Jag förstår att du letar efter ${text}. Vill du att jag ska börja söka efter dessa bilar nu? Klicka på "Starta sökning" när du är redo.`);
      }
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const startScraper = () => {
    if (conversations.length === 0) {
      addBotMessage(language === 'en'
        ? "Please describe what type of cars you want to search for first."
        : "Vänligen beskriv vilken typ av bilar du vill söka efter först."
      );
      return;
    }
    
    const lastUserMessage = [...conversations].reverse().find(msg => msg.type === 'user');
    if (lastUserMessage) {
      // Extract make and price from the user message if possible
      const text = lastUserMessage.text.toLowerCase();
      let make = 'Porsche'; // Default to Porsche
      let minPrice = 400000; // Default to 400,000 SEK
      
      // Try to extract make
      const makeMatches = [
        { regex: /porsche/i, make: 'Porsche' },
        { regex: /bmw/i, make: 'BMW' },
        { regex: /mercedes|benz/i, make: 'Mercedes-Benz' },
        { regex: /audi/i, make: 'Audi' },
        { regex: /volvo/i, make: 'Volvo' },
        { regex: /tesla/i, make: 'Tesla' },
        { regex: /volkswagen|vw/i, make: 'Volkswagen' }
      ];
      
      for (const match of makeMatches) {
        if (match.regex.test(text)) {
          make = match.make;
          break;
        }
      }
      
      // Try to extract price
      const priceMatch = text.match(/(\d+)[\s]*(kr|kronor|sek|k|thousand)/i);
      if (priceMatch && priceMatch[1]) {
        let price = parseInt(priceMatch[1].replace(/\s/g, ''), 10);
        
        // Handle "k" or "thousand" suffix
        if (priceMatch[2] && (priceMatch[2].toLowerCase() === 'k' || priceMatch[2].toLowerCase() === 'thousand')) {
          price *= 1000;
        }
        
        if (price > 0) {
          minPrice = price;
        }
      }
      
      // Start the scraper
      addBotMessage(language === 'en'
        ? `Starting search to find: ${lastUserMessage.text}`
        : `Startar sökning för att hitta: ${lastUserMessage.text}`
      );
      
      setScraperRunning(true);
      setScraperProgress(0);
      
      // Call the API to start the scraper
      scraperApi.startScraper({ make, minPrice })
        .then(response => {
          console.log('Scraper job started:', response);
          
          // Store the job ID for status checking
          const jobId = response.jobId;
          
          // Simulate progress updates
          const statusCheckInterval = setInterval(() => {
            scraperApi.getScraperStatus(jobId)
              .then(statusResponse => {
                console.log('Scraper status:', statusResponse);
                
                // Update progress based on status
                if (statusResponse.status === 'completed') {
                  clearInterval(statusCheckInterval);
                  setScraperProgress(100);
                } else if (statusResponse.status === 'error') {
                  clearInterval(statusCheckInterval);
                  setScraperRunning(false);
                  addBotMessage(language === 'en'
                    ? `Error during search: ${statusResponse.message}`
                    : `Fel under sökning: ${statusResponse.message}`
                  );
                }
              })
              .catch(error => {
                console.error('Error checking scraper status:', error);
              });
          }, 5000); // Check status every 5 seconds
          
          // Simulate finding results after a delay
          setTimeout(() => {
            if (language === 'en') {
              addBotMessage(`Searching ${make} listings on Blocket.se...`);
            } else {
              addBotMessage(`Söker efter ${make} på Blocket.se...`);
            }
          }, 2000);
          
          setTimeout(() => {
            if (language === 'en') {
              addBotMessage(`Searching ${make} listings on Bytbil.com...`);
            } else {
              addBotMessage(`Söker efter ${make} på Bytbil.com...`);
            }
          }, 5000);
          
          setTimeout(() => {
            if (language === 'en') {
              addBotMessage(`Searching ${make} listings on Bilweb.se...`);
            } else {
              addBotMessage(`Söker efter ${make} på Bilweb.se...`);
            }
          }, 8000);
          
          setTimeout(() => {
            if (language === 'en') {
              addBotMessage(`Found 12 matching ${make} cars on Blocket.se`);
            } else {
              addBotMessage(`Hittade 12 matchande ${make} bilar på Blocket.se`);
            }
          }, 12000);
          
          setTimeout(() => {
            if (language === 'en') {
              addBotMessage(`Found 8 matching ${make} cars on Bytbil.com`);
            } else {
              addBotMessage(`Hittade 8 matchande ${make} bilar på Bytbil.com`);
            }
          }, 15000);
          
          setTimeout(() => {
            if (language === 'en') {
              addBotMessage(`Found 17 matching ${make} cars on Bilweb.se`);
            } else {
              addBotMessage(`Hittade 17 matchande ${make} bilar på Bilweb.se`);
            }
          }, 18000);
        })
        .catch(error => {
          console.error('Error starting scraper:', error);
          setScraperRunning(false);
          addBotMessage(language === 'en'
            ? "Error starting the search. Please try again later."
            : "Fel vid start av sökningen. Försök igen senare."
          );
        });
    } else {
      addBotMessage(language === 'en'
        ? "Please describe what type of cars you want to search for first."
        : "Vänligen beskriv vilken typ av bilar du vill söka efter först."
      );
    }
  };
  
  const stopScraper = () => {
    setScraperRunning(false);
    addBotMessage(language === 'en'
      ? "Search stopped. You can start a new search anytime."
      : "Sökning stoppad. Du kan starta en ny sökning när som helst."
    );
  };
  
  const handleSuggestionClick = (suggestion) => {
    setInputText(suggestion);
  };
  
  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
        {t('scraperTitle')}
      </Typography>
      
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        {t('scraperDescription')}
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          aria-label="scraper tabs"
          variant={isMobile ? "fullWidth" : "standard"}
        >
          <Tab 
            icon={<ChatIcon />} 
            label={isMobile ? "" : t('search')} 
            id="tab-0" 
            aria-controls="tabpanel-0" 
          />
          <Tab 
            icon={<TuneIcon />} 
            label={isMobile ? "" : t('settings')} 
            id="tab-1" 
            aria-controls="tabpanel-1" 
          />
        </Tabs>
      </Box>
      
      <div
        role="tabpanel"
        hidden={activeTab !== 0}
        id="tabpanel-0"
        aria-labelledby="tab-0"
      >
        {activeTab === 0 && (
          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              {/* Conversation Area */}
              <Paper 
                sx={{ 
                  height: '500px', 
                  mb: 3, 
                  display: 'flex', 
                  flexDirection: 'column',
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
              >
                <Box 
                  sx={{ 
                    p: 2, 
                    bgcolor: 'primary.main', 
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <Typography variant="h6">{t('scraperAssistant')}</Typography>
                  <IconButton 
                    color="inherit" 
                    onClick={toggleHistory}
                    aria-label="View history"
                  >
                    <HistoryIcon />
                  </IconButton>
                </Box>
                
                <Box 
                  sx={{ 
                    flexGrow: 1, 
                    p: 2, 
                    overflowY: 'auto',
                    bgcolor: 'background.default',
                  }}
                >
                  {conversations.length === 0 ? (
                    <Box sx={{ textAlign: 'center', mt: 10 }}>
                      <DirectionsCarIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                      <Typography color="text.secondary">
                        {t('startConversation')}
                      </Typography>
                      <Box sx={{ mt: 4 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          {t('trySaying')}
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1, mt: 2 }}>
                          {carTypeSuggestions.map((suggestion, index) => (
                            <Chip 
                              key={index} 
                              label={suggestion} 
                              onClick={() => handleSuggestionClick(suggestion)}
                              sx={{ m: 0.5 }}
                            />
                          ))}
                        </Box>
                      </Box>
                    </Box>
                  ) : (
                    conversations.map((message, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                          mb: 2,
                        }}
                      >
                        <Paper
                          sx={{
                            p: 2,
                            maxWidth: '80%',
                            bgcolor: message.type === 'user' ? 'primary.light' : 'background.paper',
                            color: message.type === 'user' ? 'primary.contrastText' : 'text.primary',
                            borderRadius: message.type === 'user' ? '20px 20px 5px 20px' : '20px 20px 20px 5px',
                          }}
                        >
                          <Typography variant="body1">{message.text}</Typography>
                          <Typography variant="caption" color={message.type === 'user' ? 'primary.contrastText' : 'text.secondary'} sx={{ opacity: 0.7 }}>
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Typography>
                        </Paper>
                      </Box>
                    ))
                  )}
                  <div ref={conversationEndRef} />
                </Box>
                
                <Box sx={{ p: 2, bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TextField
                      fullWidth
                      placeholder={language === 'en' 
                        ? "Describe the cars you want to search for..." 
                        : "Beskriv vilka bilar du vill söka efter..."
                      }
                      value={inputText}
                      onChange={handleInputChange}
                      onKeyPress={handleKeyPress}
                      disabled={isProcessing || scraperRunning}
                      multiline
                      maxRows={3}
                      InputProps={{
                        endAdornment: voiceInputEnabled ? (
                          <IconButton 
                            color="primary" 
                            onClick={toggleListening}
                            disabled={isProcessing || scraperRunning || !('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)}
                          >
                            {isListening ? <MicIcon color="error" /> : <MicOffIcon />}
                          </IconButton>
                        ) : null,
                      }}
                      sx={{ mr: 1 }}
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      endIcon={<SendIcon />}
                      onClick={handleSendMessage}
                      disabled={!inputText.trim() || isProcessing || scraperRunning}
                    >
                      {t('send')}
                    </Button>
                  </Box>
                </Box>
              </Paper>
              
              {/* Scraper Controls */}
              <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">{t('scraperControls')}</Typography>
                  <IconButton aria-label="settings" onClick={() => setActiveTab(1)}>
                    <SettingsIcon />
                  </IconButton>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {t('progress')}: {scraperProgress}%
                  </Typography>
                  <Box sx={{ position: 'relative', pt: 1 }}>
                    <Box
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    />
                    <Box
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        bgcolor: 'primary.main',
                        position: 'absolute',
                        top: 8,
                        left: 0,
                        width: `${scraperProgress}%`,
                        transition: 'width 0.5s ease-in-out',
                      }}
                    />
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<PlayArrowIcon />}
                    onClick={startScraper}
                    disabled={scraperRunning || isProcessing}
                    fullWidth
                  >
                    {t('startSearch')}
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<StopIcon />}
                    onClick={stopScraper}
                    disabled={!scraperRunning}
                    fullWidth
                  >
                    {t('stopSearch')}
                  </Button>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              {/* History or Settings Panel */}
              <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  {showHistory ? t('searchHistory') : t('searchSettings')}
                </Typography>
                
                {showHistory ? (
                  <>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {t('recentActivities')}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      {scraperHistory.map((item) => (
                        <Card key={item.id} sx={{ mb: 2, borderRadius: 2 }}>
                          <CardContent sx={{ pb: '16px !important' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              {item.status === 'completed' ? (
                                <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                              ) : item.status === 'failed' ? (
                                <ErrorIcon color="error" sx={{ mr: 1 }} />
                              ) : (
                                <HourglassEmptyIcon color="warning" sx={{ mr: 1 }} />
                              )}
                              <Typography variant="subtitle2">
                                {item.date}
                              </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              {item.query}
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Chip 
                                size="small" 
                                label={`${item.results} ${language === 'en' ? 'results' : 'resultat'}`} 
                                color={item.results > 0 ? "primary" : "default"}
                              />
                              <Button size="small">{language === 'en' ? 'View' : 'Visa'}</Button>
                            </Box>
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  </>
                ) : (
                  <>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {t('configureSettings')}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        {t('sourcesToSearch')}
                      </Typography>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {language === 'en' ? 'Scandinavian' : 'Skandinaviska'}:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                          {carSites.scandinavia.map((site) => (
                            <Chip 
                              key={site.name} 
                              label={site.name} 
                              color={site.enabled ? "primary" : "default"}
                              variant={site.enabled ? "filled" : "outlined"}
                            />
                          ))}
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {language === 'en' ? 'European' : 'Europeiska'}:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {carSites.europe.map((site) => (
                            <Chip 
                              key={site.name} 
                              label={site.name} 
                              color={site.enabled ? "primary" : "default"}
                              variant={site.enabled ? "filled" : "outlined"}
                            />
                          ))}
                        </Box>
                      </Box>
                      
                      <Typography variant="subtitle2" gutterBottom>
                        {t('dataToCollect')}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                        <Chip label={t('price')} color="primary" />
                        <Chip label={t('mileage')} color="primary" />
                        <Chip label={t('year')} color="primary" />
                        <Chip label={t('features')} color="primary" />
                        <Chip label={t('images')} color="primary" />
                        <Chip label={t('sellerInfo')} variant="outlined" />
                        <Chip label={t('historyReport')} variant="outlined" />
                      </Box>
                      
                      <Typography variant="subtitle2" gutterBottom>
                        {t('location')}
                      </Typography>
                      <TextField
                        fullWidth
                        placeholder={t('enterZipCode')}
                        defaultValue={language === 'en' ? "Stockholm" : "Stockholm"}
                        size="small"
                        sx={{ mb: 3 }}
                      />
                      
                      <Typography variant="subtitle2" gutterBottom>
                        {t('searchRadius')}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        <Chip label="25 km" variant="outlined" />
                        <Chip label="50 km" color="primary" />
                        <Chip label="100 km" variant="outlined" />
                        <Chip label="200 km" variant="outlined" />
                        <Chip label={t('nationwide')} variant="outlined" />
                      </Box>
                    </Box>
                  </>
                )}
              </Paper>
            </Grid>
          </Grid>
        )}
      </div>
      
      <div
        role="tabpanel"
        hidden={activeTab !== 1}
        id="tabpanel-1"
        aria-labelledby="tab-1"
      >
        {activeTab === 1 && <ScraperConfig />}
      </div>
    </Container>
  );
}

export default ScraperPage; 