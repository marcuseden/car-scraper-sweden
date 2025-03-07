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
import config from '../config';

// Mock data for scraper history
const scraperHistory = [
  {
    id: 1,
    query: "Find BMW 5 Series models from 2018-2022 with less than 50,000 miles",
    date: "2023-03-15",
    status: "completed",
    results: 42
  },
  {
    id: 2,
    query: "Scrape Tesla Model 3 listings in California with price under $40,000",
    date: "2023-03-10",
    status: "completed",
    results: 18
  },
  {
    id: 3,
    query: "Find Mercedes-Benz E-Class with premium package and under 30,000 miles",
    date: "2023-03-05",
    status: "failed",
    results: 0
  }
];

// Example car types for suggestions
const carTypeSuggestions = [
  "Luxury sedans under $50,000",
  "Electric SUVs with 300+ mile range",
  "Sports cars with manual transmission",
  "Family minivans with entertainment package",
  "Hybrid vehicles with leather interior"
];

function ScraperPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isMedium = useMediaQuery(theme.breakpoints.down('md'));
  
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scraperRunning, setScraperRunning] = useState(false);
  const [scraperProgress, setScraperProgress] = useState(0);
  const [conversations, setConversations] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [voiceInputEnabled] = useState(config.features.enableVoiceInput);
  
  const recognitionRef = useRef(null);
  const conversationEndRef = useRef(null);
  
  // Initialize speech recognition if enabled
  useEffect(() => {
    if (voiceInputEnabled && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
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
  }, [voiceInputEnabled]);
  
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
          const increment = Math.floor(Math.random() * 5) + 1;
          return Math.min(prev + increment, 100);
        });
      }, 1000);
    } else if (scraperProgress >= 100) {
      setScraperRunning(false);
      addBotMessage("Scraping completed! Found 37 cars matching your criteria. You can view the results in the Car Listings page.");
    }
    
    return () => clearInterval(interval);
  }, [scraperRunning, scraperProgress]);
  
  const toggleListening = () => {
    if (!voiceInputEnabled) {
      addBotMessage("Voice input is currently disabled in this environment.");
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch (error) {
          console.error('Speech recognition error', error);
        }
      } else {
        addBotMessage("Sorry, speech recognition is not supported in your browser.");
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
    
    if (lowerText.includes('start') || lowerText.includes('begin') || lowerText.includes('scrape')) {
      addBotMessage("I'll start scraping for cars based on your criteria. This may take a few minutes. You'll see the results in real-time.");
      setScraperRunning(true);
      setScraperProgress(0);
    } else if (lowerText.includes('stop') || lowerText.includes('cancel')) {
      addBotMessage("I've stopped the scraper. You can start a new search anytime.");
      setScraperRunning(false);
    } else if (lowerText.includes('help') || lowerText.includes('how')) {
      addBotMessage("To use the car scraper, simply describe the type of cars you want to find. For example, 'Find BMW sedans from 2018-2022 with less than 50,000 miles' or 'Scrape Tesla Model 3 listings in California'. Then click 'Start Scraper' to begin.");
    } else {
      addBotMessage(`I understand you're looking for ${text}. Would you like me to start scraping for these cars now? Click the "Start Scraper" button when ready.`);
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
      addBotMessage("Please describe what type of cars you want to scrape first.");
      return;
    }
    
    const lastUserMessage = [...conversations].reverse().find(msg => msg.type === 'user');
    if (lastUserMessage) {
      addBotMessage(`Starting scraper to find: ${lastUserMessage.text}`);
      setScraperRunning(true);
      setScraperProgress(0);
    } else {
      addBotMessage("Please describe what type of cars you want to scrape first.");
    }
  };
  
  const stopScraper = () => {
    setScraperRunning(false);
    addBotMessage("Scraper stopped. You can start a new search anytime.");
  };
  
  const handleSuggestionClick = (suggestion) => {
    setInputText(suggestion);
  };
  
  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
        Car Scraper
      </Typography>
      
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Describe the type of cars you want to scrape, and our system will find them for you. You can use natural language to specify make, model, year range, price range, mileage, and other features.
      </Typography>
      
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
              <Typography variant="h6">Car Scraper Assistant</Typography>
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
                    Start a conversation by describing what cars you want to scrape.
                  </Typography>
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Try saying something like:
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
                  placeholder="Describe the cars you want to scrape..."
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
                  Send
                </Button>
              </Box>
            </Box>
          </Paper>
          
          {/* Scraper Controls */}
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Scraper Controls</Typography>
              <IconButton aria-label="settings">
                <SettingsIcon />
              </IconButton>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Progress: {scraperProgress}%
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
                Start Scraper
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<StopIcon />}
                onClick={stopScraper}
                disabled={!scraperRunning}
                fullWidth
              >
                Stop Scraper
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          {/* History or Settings Panel */}
          <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              {showHistory ? 'Scraper History' : 'Scraper Settings'}
            </Typography>
            
            {showHistory ? (
              <>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Your recent scraping activities:
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
                            label={`${item.results} results`} 
                            color={item.results > 0 ? "primary" : "default"}
                          />
                          <Button size="small">View</Button>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </>
            ) : (
              <>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Configure your scraper settings:
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Sources to Scrape
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                    <Chip label="AutoTrader" color="primary" />
                    <Chip label="Cars.com" color="primary" />
                    <Chip label="CarGurus" color="primary" />
                    <Chip label="TrueCar" variant="outlined" />
                    <Chip label="Edmunds" variant="outlined" />
                  </Box>
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Data to Collect
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                    <Chip label="Price" color="primary" />
                    <Chip label="Mileage" color="primary" />
                    <Chip label="Year" color="primary" />
                    <Chip label="Features" color="primary" />
                    <Chip label="Images" color="primary" />
                    <Chip label="Seller Info" variant="outlined" />
                    <Chip label="History Report" variant="outlined" />
                  </Box>
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Location
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Enter zip code or city"
                    defaultValue="94103"
                    size="small"
                    sx={{ mb: 3 }}
                  />
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Search Radius
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    <Chip label="25 miles" variant="outlined" />
                    <Chip label="50 miles" color="primary" />
                    <Chip label="100 miles" variant="outlined" />
                    <Chip label="200 miles" variant="outlined" />
                    <Chip label="Nationwide" variant="outlined" />
                  </Box>
                </Box>
                
                {/* Settings panel with environment info */}
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Environment
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                    <Chip 
                      label={config.isProduction ? "Production" : "Development"} 
                      color={config.isProduction ? "success" : "info"} 
                    />
                    <Chip 
                      label={`Voice Input: ${voiceInputEnabled ? "Enabled" : "Disabled"}`} 
                      color={voiceInputEnabled ? "success" : "default"} 
                    />
                    <Chip 
                      label={`Max Results: ${config.app.maxSearchResults}`} 
                      variant="outlined" 
                    />
                  </Box>
                </Box>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default ScraperPage; 