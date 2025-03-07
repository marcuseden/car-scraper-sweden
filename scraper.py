import os
import time
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional
import re

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from webdriver_manager.chrome import ChromeDriverManager
from fake_useragent import UserAgent
from pymongo import MongoClient
from pymongo.collection import Collection
from pymongo.database import Database
from dotenv import load_dotenv
from bs4 import BeautifulSoup
import requests
from pathlib import Path

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def get_mongodb_connection() -> tuple[Optional[MongoClient], Optional[Database], Optional[Collection]]:
    """
    Establish connection to MongoDB Atlas.
    
    Returns:
        tuple: (client, database, collection) or (None, None, None) if connection fails
    """
    try:
        mongodb_uri = os.getenv('MONGODB_URI')
        db_name = os.getenv('DATABASE_NAME', 'blocket_cars')
        collection_name = os.getenv('COLLECTION_NAME', 'car_ads')
        
        if not mongodb_uri:
            logger.error("MongoDB URI not found in environment variables")
            return None, None, None
            
        # Connect to MongoDB with SSL certificate verification disabled
        # Note: This is not recommended for production use, but helps during development
        client = MongoClient(
            mongodb_uri,
            tlsAllowInvalidCertificates=True,  # Use this instead of ssl_cert_reqs
            serverSelectionTimeoutMS=5000  # 5 second timeout
        )
        
        database = client[db_name]
        collection = database[collection_name]
        
        # Test connection
        client.admin.command('ping')
        logger.info("Successfully connected to MongoDB")
        
        return client, database, collection
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {str(e)}")
        return None, None, None

def setup_driver() -> webdriver.Chrome:
    """
    Set up and configure Chrome WebDriver with Selenium.
    
    Returns:
        webdriver.Chrome: Configured Chrome WebDriver instance
    """
    # Set up Chrome options
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # Run in headless mode
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    
    # Use random user agent to avoid detection
    ua = UserAgent()
    user_agent = ua.random
    chrome_options.add_argument(f'--user-agent={user_agent}')
    
    # Set up Chrome driver with specific options for Mac with Apple Silicon
    import platform
    import sys
    
    # Check if running on Mac with Apple Silicon
    is_mac_arm = platform.system() == 'Darwin' and platform.machine() == 'arm64'
    
    try:
        if is_mac_arm:
            # For Mac with Apple Silicon
            from selenium.webdriver.chrome.service import Service as ChromeService
            from webdriver_manager.chrome import ChromeDriverManager
            from webdriver_manager.core.os_manager import ChromeType
            
            service = ChromeService(ChromeDriverManager().install())
        else:
            # For other platforms
            service = Service(ChromeDriverManager().install())
            
        driver = webdriver.Chrome(service=service, options=chrome_options)
        return driver
    except Exception as e:
        logger.error(f"Error setting up Chrome driver: {str(e)}")
        logger.info("Attempting alternative setup method...")
        
        try:
            # Alternative method using direct path
            chrome_options.binary_location = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
            driver = webdriver.Chrome(options=chrome_options)
            return driver
        except Exception as e2:
            logger.error(f"Alternative setup also failed: {str(e2)}")
            raise

def scroll_to_bottom(driver: webdriver.Chrome, max_scrolls: int = 20) -> None:
    """
    Scroll to the bottom of the page to load all ads.
    
    Args:
        driver: Chrome WebDriver instance
        max_scrolls: Maximum number of scrolls to perform
    """
    scroll_count = 0
    last_height = driver.execute_script("return document.body.scrollHeight")
    
    while scroll_count < max_scrolls:
        # Scroll down to bottom
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        
        # Wait to load page
        time.sleep(2)
        
        # Calculate new scroll height and compare with last scroll height
        new_height = driver.execute_script("return document.body.scrollHeight")
        if new_height == last_height:
            # If heights are the same, we've reached the bottom or no more content is loading
            break
            
        last_height = new_height
        scroll_count += 1
        
        # Log progress
        logger.info(f"Scrolled {scroll_count} times")
        
        # Add a random delay to mimic human behavior
        time.sleep(1.5 + (scroll_count % 2))

def scrape_blocket() -> List[Dict[str, Any]]:
    """
    Scrape Porsche car ads from Blocket.se with prices over 400,000 SEK.
    Collects detailed information including images, specifications, and tags.
    
    Returns:
        List[Dict[str, Any]]: List of car ad details
    """
    # URL for Porsche cars with price over 400,000 SEK
    url = "https://www.blocket.se/annonser/hela_sverige/fordon/bilar?cg=1020&q=porsche&r=11&r=10&r=9&r=8&r=7&r=6&r=5&r=4&r=3&r=2&r=1&mys=400000&st=s&ca=11&ca=10&ca=9&ca=8&ca=7&ca=6&ca=5&ca=4&ca=3&ca=2&ca=1&is=1&l=0&md=th"
    
    driver = None
    car_ads = []
    
    try:
        logger.info(f"Starting to scrape Porsche cars over 400,000 SEK from {url}")
        driver = setup_driver()
        
        # Set page load timeout
        driver.set_page_load_timeout(60)  # Increased timeout
        
        # Navigate to the URL
        logger.info("Navigating to the URL...")
        driver.get(url)
        
        # Wait for the page to load
        logger.info("Waiting for the page to load...")
        
        # Take a screenshot for debugging
        try:
            driver.save_screenshot("blocket_page.png")
            logger.info("Screenshot saved as blocket_page.png")
        except Exception as e:
            logger.warning(f"Failed to save screenshot: {str(e)}")
        
        # Print page title and URL for debugging
        logger.info(f"Page title: {driver.title}")
        logger.info(f"Current URL: {driver.current_url}")
        
        # Accept cookies if the dialog appears
        try:
            logger.info("Looking for cookie consent dialog...")
            cookie_selectors = [
                "button[data-testid='accept-all-cookies-button']",
                "button.cookie-consent-accept-button",
                "button.accept-cookies",
                "button[aria-label='Accept cookies']"
            ]
            
            for cookie_selector in cookie_selectors:
                try:
                    cookie_button = WebDriverWait(driver, 2).until(
                        EC.element_to_be_clickable((By.CSS_SELECTOR, cookie_selector))
                    )
                    logger.info(f"Cookie dialog found with selector: {cookie_selector}")
                    cookie_button.click()
                    logger.info("Cookies accepted")
                    time.sleep(2)
                    break
                except TimeoutException:
                    continue
        except Exception:
            logger.info("No cookie dialog found or already accepted")
        
        # Scroll to load all ads
        logger.info("Scrolling to load all ads...")
        scroll_to_bottom(driver, max_scrolls=5)  # Reduced max scrolls for testing
        
        # Find all car ad links directly
        logger.info("Finding car ad links...")
        
        # Store all found ad URLs to avoid duplicates
        ad_urls = set()
        
        # Method 1: Find links containing '/annons/' in the URL
        try:
            # Get the page source and use a more reliable method to extract links
            page_source = driver.page_source
            
            # Use BeautifulSoup to parse the HTML and find links
            soup = BeautifulSoup(page_source, 'html.parser')
            
            # Find all links
            links = soup.find_all('a', href=True)
            logger.info(f"Found {len(links)} links with BeautifulSoup")
            
            # Filter links that might be car ads
            for link in links:
                href = link.get('href', '')
                if '/annons/' in href and href.startswith('http'):
                    ad_urls.add(href)
            
            logger.info(f"Found {len(ad_urls)} potential car ad URLs with BeautifulSoup")
        except Exception as e:
            logger.error(f"Error finding links with BeautifulSoup: {str(e)}")
        
        # Method 2: Use Selenium to find links (as a backup)
        if not ad_urls:
            try:
                # Find all links on the page
                link_elements = driver.find_elements(By.TAG_NAME, "a")
                logger.info(f"Found {len(link_elements)} links with Selenium")
                
                # Extract and filter URLs
                for link in link_elements:
                    try:
                        href = link.get_attribute("href")
                        if href and '/annons/' in href:
                            ad_urls.add(href)
                    except:
                        continue
                
                logger.info(f"Found {len(ad_urls)} potential car ad URLs with Selenium")
            except Exception as e:
                logger.error(f"Error finding links with Selenium: {str(e)}")
        
        # Process each unique ad URL
        logger.info(f"Processing {len(ad_urls)} unique car ad URLs")
        for ad_url in ad_urls:
            try:
                logger.info(f"Processing ad URL: {ad_url}")
                
                # Visit the individual ad page to get detailed information
                ad_data = scrape_individual_ad(driver, ad_url)
                if ad_data:
                    car_ads.append(ad_data)
                    logger.info(f"Added ad from link: {ad_data.get('title', 'Unknown')}")
                
            except Exception as e:
                logger.error(f"Error processing URL {ad_url}: {str(e)}")
                continue
        
        logger.info(f"Found {len(car_ads)} car ads")
                
    except Exception as e:
        logger.error(f"Error during scraping: {str(e)}")
    finally:
        if driver:
            driver.quit()
            logger.info("WebDriver closed")
        
    logger.info(f"Scraping completed. Found {len(car_ads)} car ads.")
    return car_ads

def scrape_individual_ad(driver: webdriver.Chrome, url: str) -> Dict[str, Any]:
    """
    Scrape detailed information from an individual car ad page.
    Optimized for Elasticsearch with structured data for low latency.
    
    Args:
        driver: Chrome WebDriver instance
        url: URL of the individual ad page
        
    Returns:
        Dict[str, Any]: Detailed car ad data
    """
    logger.info(f"Visiting individual ad page: {url}")
    
    # Store the current URL to return to the search results later
    current_url = driver.current_url
    
    # Navigate to the individual ad page
    try:
        driver.get(url)
        # Wait for the page to load
        WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )
        time.sleep(2)  # Additional wait to ensure page is fully loaded
        
        # Handle cookie consent if it appears
        try:
            cookie_selectors = [
                "button[data-testid='accept-all-cookies-button']",
                "button.cookie-consent-accept-button",
                "button.accept-cookies",
                "button[aria-label='Accept cookies']",
                "#accept-cookies",
                ".accept-cookies-button"
            ]
            
            for selector in cookie_selectors:
                try:
                    cookie_button = WebDriverWait(driver, 3).until(
                        EC.element_to_be_clickable((By.CSS_SELECTOR, selector))
                    )
                    logger.info(f"Cookie dialog found with selector: {selector}")
                    cookie_button.click()
                    logger.info("Cookies accepted")
                    time.sleep(1)
                    break
                except:
                    continue
        except Exception:
            logger.info("No cookie dialog found or already accepted")
            
    except Exception as e:
        logger.error(f"Error navigating to individual ad page: {str(e)}")
        # Try to go back to the search results
        driver.get(current_url)
        return None
    
    # Initialize ad data with the URL and scrape date
    timestamp = datetime.now()
    
    ad_data = {
        # Core fields (always present)
        "url": url,
        "id": url.split('/')[-1],  # Extract ID from URL for easier reference
        "scrape_date": timestamp.isoformat(),
        "scrape_timestamp": int(timestamp.timestamp()),  # Unix timestamp for easier date math
        
        # Elasticsearch-specific fields
        "indexed": False,  # Flag to track if the document has been indexed in Elasticsearch
        "active": True,    # Flag to track if the ad is still active
        
        # Search optimization fields
        "search_text": "",  # Will concatenate all searchable text
        "keywords": [],     # Will extract important keywords
    }
    
    try:
        # Extract title
        try:
            title_selectors = ["h1", "h1.title", "h1[data-testid='ad-title']"]
            for selector in title_selectors:
                try:
                    title_element = WebDriverWait(driver, 5).until(
                        EC.presence_of_element_located((By.CSS_SELECTOR, selector))
                    )
                    title = title_element.text.strip()
                    ad_data["title"] = title
                    ad_data["title_keyword"] = title  # For exact matching
                    ad_data["search_text"] += f" {title}"
                    logger.info(f"Title: {title}")
                    break
                except:
                    continue
        except Exception as e:
            logger.warning(f"Failed to extract title: {str(e)}")
            ad_data["title"] = "Unknown Title"
            ad_data["title_keyword"] = "Unknown Title"
        
        # Extract price information
        try:
            # Regular price
            price_selectors = ["p.price", "span.price", "[data-testid='price-tag']", ".price-tag"]
            for selector in price_selectors:
                try:
                    price_element = driver.find_element(By.CSS_SELECTOR, selector)
                    price_text = price_element.text.strip()
                    ad_data["price_text"] = price_text
                    ad_data["search_text"] += f" {price_text}"
                    
                    # Clean price (remove "kr" and spaces)
                    price = ''.join(filter(str.isdigit, price_text))
                    ad_data["price"] = int(price) if price else None
                    
                    # Add price ranges for faceted search
                    if ad_data["price"]:
                        price_val = ad_data["price"]
                        if price_val < 100000:
                            ad_data["price_range"] = "Under 100,000 kr"
                        elif price_val < 200000:
                            ad_data["price_range"] = "100,000 - 200,000 kr"
                        elif price_val < 300000:
                            ad_data["price_range"] = "200,000 - 300,000 kr"
                        elif price_val < 500000:
                            ad_data["price_range"] = "300,000 - 500,000 kr"
                        elif price_val < 1000000:
                            ad_data["price_range"] = "500,000 - 1,000,000 kr"
                        else:
                            ad_data["price_range"] = "Over 1,000,000 kr"
                    
                    logger.info(f"Price: {price_text}")
                    break
                except:
                    continue
        except Exception as e:
            logger.warning(f"Failed to extract price: {str(e)}")
            ad_data["price_text"] = "Unknown Price"
            ad_data["price"] = None
        
        # Extract VAT price if available
        try:
            vat_selectors = [
                ".vat-price", 
                "[data-testid='vat-price']", 
                "span:contains('Moms')", 
                "span:contains('moms')",
                "div:contains('inkl. moms')"
            ]
            
            for selector in vat_selectors:
                try:
                    vat_element = driver.find_element(By.CSS_SELECTOR, selector)
                    vat_text = vat_element.text.strip()
                    ad_data["vat_price_text"] = vat_text
                    
                    # Extract numeric value if possible
                    vat_price = ''.join(filter(str.isdigit, vat_text))
                    ad_data["vat_price"] = int(vat_price) if vat_price else None
                    
                    logger.info(f"VAT Price: {vat_text}")
                    break
                except:
                    continue
        except Exception as e:
            logger.warning(f"Failed to extract VAT price: {str(e)}")
            # VAT price is optional, so we don't set default values
        
        # Extract monthly financing information if available
        try:
            financing_selectors = [
                ".financing", 
                "[data-testid='financing']", 
                "span:contains('Finansiering')", 
                "div:contains('kr/mån')",
                ".monthly-payment"
            ]
            
            for selector in financing_selectors:
                try:
                    financing_element = driver.find_element(By.CSS_SELECTOR, selector)
                    financing_text = financing_element.text.strip()
                    ad_data["financing_text"] = financing_text
                    
                    # Extract numeric value if possible
                    financing_amount = ''.join(filter(str.isdigit, financing_text))
                    ad_data["financing_monthly"] = int(financing_amount) if financing_amount else None
                    
                    logger.info(f"Monthly Financing: {financing_text}")
                    break
                except:
                    continue
        except Exception as e:
            logger.warning(f"Failed to extract financing information: {str(e)}")
            # Financing info is optional, so we don't set default values
        
        # Extract location
        try:
            location_selectors = [".location", "span.location", "[data-testid='location']"]
            for selector in location_selectors:
                try:
                    location_element = driver.find_element(By.CSS_SELECTOR, selector)
                    location = location_element.text.strip()
                    ad_data["location"] = location
                    ad_data["location_keyword"] = location  # For exact matching
                    ad_data["search_text"] += f" {location}"
                    
                    # Try to extract city and region for better filtering
                    location_parts = location.split(',')
                    if len(location_parts) >= 1:
                        ad_data["city"] = location_parts[0].strip()
                    if len(location_parts) >= 2:
                        ad_data["region"] = location_parts[1].strip()
                        
                    logger.info(f"Location: {location}")
                    break
                except:
                    continue
        except Exception as e:
            logger.warning(f"Failed to extract location: {str(e)}")
            ad_data["location"] = "Unknown Location"
            ad_data["location_keyword"] = "Unknown Location"
        
        # Extract images
        try:
            image_selectors = ["img.image", "img[data-testid='image']", ".gallery img", ".carousel img"]
            images = []
            image_urls = []
            
            for selector in image_selectors:
                try:
                    image_elements = driver.find_elements(By.CSS_SELECTOR, selector)
                    if image_elements:
                        for img in image_elements:
                            src = img.get_attribute("src")
                            if src and src.startswith("http"):
                                # Store both the URL and a structured object with metadata
                                image_urls.append(src)
                                
                                # Create a structured image object
                                image_id = f"{ad_data['id']}_{len(images) + 1}"
                                image_obj = {
                                    "id": image_id,
                                    "url": src,
                                    "position": len(images) + 1,
                                    "is_primary": len(images) == 0,  # First image is primary
                                    "filename": f"{image_id}.jpg",
                                    "local_path": f"images/{ad_data['id']}/{image_id}.jpg",
                                    "downloaded": False
                                }
                                images.append(image_obj)
                        break
                except:
                    continue
            
            ad_data["image_urls"] = image_urls  # Simple list of URLs
            ad_data["images"] = images  # Structured image objects
            ad_data["image_count"] = len(images)
            ad_data["has_images"] = len(images) > 0
            
            # Set primary image URL if available
            if images:
                ad_data["primary_image"] = images[0]["url"]
            
            logger.info(f"Found {len(images)} images")
        except Exception as e:
            logger.warning(f"Failed to extract images: {str(e)}")
            ad_data["image_urls"] = []
            ad_data["images"] = []
            ad_data["image_count"] = 0
            ad_data["has_images"] = False
        
        # Extract description
        try:
            description_selectors = [".description", "[data-testid='description']", ".body-text"]
            for selector in description_selectors:
                try:
                    description_element = driver.find_element(By.CSS_SELECTOR, selector)
                    description = description_element.text.strip()
                    ad_data["description"] = description
                    ad_data["description_length"] = len(description)
                    ad_data["search_text"] += f" {description}"
                    logger.info(f"Description length: {len(description)}")
                    break
                except:
                    continue
        except Exception as e:
            logger.warning(f"Failed to extract description: {str(e)}")
            ad_data["description"] = ""
            ad_data["description_length"] = 0
        
        # Extract specifications/details
        try:
            specs = {}
            normalized_specs = {}  # For standardized specs
            spec_selectors = [
                ".specifications", 
                ".details", 
                "[data-testid='specifications']",
                ".parameter-list",
                "dl.specs"
            ]
            
            for selector in spec_selectors:
                try:
                    spec_elements = driver.find_elements(By.CSS_SELECTOR, f"{selector} dt, {selector} dd")
                    if spec_elements and len(spec_elements) > 1:
                        for i in range(0, len(spec_elements), 2):
                            if i + 1 < len(spec_elements):
                                key = spec_elements[i].text.strip()
                                value = spec_elements[i+1].text.strip()
                                if key and value:
                                    specs[key] = value
                                    
                                    # Add to search text
                                    ad_data["search_text"] += f" {key} {value}"
                                    
                                    # Normalize common specifications
                                    norm_key = key.lower().replace(" ", "_").replace("-", "_")
                                    normalized_specs[norm_key] = value
                                    
                                    # Extract specific fields for filtering
                                    if "year" in key.lower() or "årsmodell" in key.lower():
                                        try:
                                            year_match = re.search(r'\d{4}', value)
                                            if year_match:
                                                ad_data["year"] = int(year_match.group(0))
                                        except:
                                            pass
                                    
                                    if "mileage" in key.lower() or "miltal" in key.lower():
                                        try:
                                            mileage = ''.join(filter(str.isdigit, value))
                                            if mileage:
                                                ad_data["mileage"] = int(mileage)
                                        except:
                                            pass
                                    
                                    if "fuel" in key.lower() or "bränsle" in key.lower():
                                        ad_data["fuel_type"] = value
                                    
                                    if "transmission" in key.lower() or "växellåda" in key.lower():
                                        ad_data["transmission"] = value
                                    
                                    if "engine" in key.lower() or "motor" in key.lower():
                                        ad_data["engine"] = value
                                    
                                    if "color" in key.lower() or "färg" in key.lower():
                                        ad_data["color"] = value
                        break
                except:
                    continue
            
            # If no specs found with the above method, try another approach
            if not specs:
                try:
                    # Look for key-value pairs in the page
                    key_value_elements = driver.find_elements(By.CSS_SELECTOR, ".key-value, .parameter, .spec-item")
                    for element in key_value_elements:
                        try:
                            key_element = element.find_element(By.CSS_SELECTOR, ".key, .label, .name")
                            value_element = element.find_element(By.CSS_SELECTOR, ".value, .data")
                            key = key_element.text.strip()
                            value = value_element.text.strip()
                            if key and value:
                                specs[key] = value
                                ad_data["search_text"] += f" {key} {value}"
                        except:
                            continue
                except:
                    pass
            
            ad_data["specifications"] = specs
            ad_data["specs"] = normalized_specs  # Shorter name for normalized specs
            logger.info(f"Found {len(specs)} specifications")
        except Exception as e:
            logger.warning(f"Failed to extract specifications: {str(e)}")
            ad_data["specifications"] = {}
            ad_data["specs"] = {}
        
        # Extract tags
        try:
            tags = []
            tag_selectors = [".tags", ".tag", "[data-testid='tags']", ".badges"]
            
            for selector in tag_selectors:
                try:
                    tag_elements = driver.find_elements(By.CSS_SELECTOR, selector)
                    if tag_elements:
                        for tag_element in tag_elements:
                            tag = tag_element.text.strip()
                            if tag:
                                tags.append(tag)
                                ad_data["search_text"] += f" {tag}"
                        break
                except:
                    continue
            
            ad_data["tags"] = tags
            logger.info(f"Found {len(tags)} tags")
        except Exception as e:
            logger.warning(f"Failed to extract tags: {str(e)}")
            ad_data["tags"] = []
        
        # Extract seller information
        try:
            seller = {}
            seller_selectors = [".seller", "[data-testid='seller']", ".contact-info"]
            
            for selector in seller_selectors:
                try:
                    seller_element = driver.find_element(By.CSS_SELECTOR, selector)
                    if seller_element:
                        seller_text = seller_element.text.strip()
                        seller["info"] = seller_text
                        ad_data["search_text"] += f" {seller_text}"
                        
                        # Try to extract seller name
                        try:
                            name_element = seller_element.find_element(By.CSS_SELECTOR, ".name, .seller-name")
                            seller["name"] = name_element.text.strip()
                        except:
                            pass
                        
                        # Try to extract seller type (private/dealer)
                        try:
                            type_element = seller_element.find_element(By.CSS_SELECTOR, ".type, .seller-type")
                            seller_type = type_element.text.strip()
                            seller["type"] = seller_type
                            
                            # Add a normalized seller type for filtering
                            if "privat" in seller_type.lower():
                                ad_data["seller_type"] = "private"
                            elif "handel" in seller_type.lower() or "dealer" in seller_type.lower():
                                ad_data["seller_type"] = "dealer"
                            else:
                                ad_data["seller_type"] = "unknown"
                        except:
                            pass
                        
                        break
                except:
                    continue
            
            ad_data["seller"] = seller
            logger.info(f"Found seller information: {seller}")
        except Exception as e:
            logger.warning(f"Failed to extract seller information: {str(e)}")
            ad_data["seller"] = {}
        
        # Extract publication date
        try:
            date_selectors = [".date", "[data-testid='publication-date']", ".publication-date"]
            for selector in date_selectors:
                try:
                    date_element = driver.find_element(By.CSS_SELECTOR, selector)
                    publication_date = date_element.text.strip()
                    ad_data["publication_date"] = publication_date
                    
                    # Try to parse the date for better filtering
                    try:
                        # Common Swedish date formats
                        date_formats = [
                            "%Y-%m-%d",
                            "%d/%m/%Y",
                            "%d-%m-%Y",
                            "%d %B %Y",
                            "%d %b %Y"
                        ]
                        
                        parsed_date = None
                        for fmt in date_formats:
                            try:
                                parsed_date = datetime.strptime(publication_date, fmt)
                                break
                            except:
                                continue
                        
                        if parsed_date:
                            ad_data["publication_timestamp"] = int(parsed_date.timestamp())
                    except:
                        pass
                    
                    logger.info(f"Publication date: {publication_date}")
                    break
                except:
                    continue
        except Exception as e:
            logger.warning(f"Failed to extract publication date: {str(e)}")
            ad_data["publication_date"] = "Unknown"
        
        # Extract car make and model from title or specifications
        try:
            # Try to extract from specifications first
            make = None
            model = None
            
            if "make" in ad_data.get("specs", {}) or "märke" in ad_data.get("specs", {}):
                make = ad_data["specs"].get("make") or ad_data["specs"].get("märke")
            
            if "model" in ad_data.get("specs", {}) or "modell" in ad_data.get("specs", {}):
                model = ad_data["specs"].get("model") or ad_data["specs"].get("modell")
            
            # If not found in specs, try to extract from title
            if not make or not model:
                title = ad_data.get("title", "")
                
                # Common car makes
                car_makes = ["Volvo", "Saab", "BMW", "Audi", "Mercedes", "Volkswagen", "VW", 
                             "Toyota", "Honda", "Mazda", "Ford", "Opel", "Peugeot", "Renault",
                             "Porsche", "Ferrari", "Lamborghini", "Maserati", "Bentley", "Rolls-Royce"]
                
                for car_make in car_makes:
                    if car_make.lower() in title.lower():
                        make = car_make
                        # Try to extract model after make
                        make_index = title.lower().find(car_make.lower())
                        if make_index >= 0:
                            rest_of_title = title[make_index + len(car_make):].strip()
                            # Extract first word or number as model
                            model_match = re.search(r'[A-Za-z0-9]+', rest_of_title)
                            if model_match:
                                model = model_match.group(0)
                        break
            
            if make:
                ad_data["make"] = make
                ad_data["make_keyword"] = make  # For exact matching
            
            if model:
                ad_data["model"] = model
                ad_data["model_keyword"] = model  # For exact matching
                
        except Exception as e:
            logger.warning(f"Failed to extract car make and model: {str(e)}")
        
        # Generate keywords for better search
        try:
            keywords = set()
            
            # Add make and model
            if "make" in ad_data:
                keywords.add(ad_data["make"].lower())
            if "model" in ad_data:
                keywords.add(ad_data["model"].lower())
            
            # Add year
            if "year" in ad_data:
                keywords.add(str(ad_data["year"]))
            
            # Add fuel type
            if "fuel_type" in ad_data:
                keywords.add(ad_data["fuel_type"].lower())
            
            # Add transmission
            if "transmission" in ad_data:
                keywords.add(ad_data["transmission"].lower())
            
            # Add color
            if "color" in ad_data:
                keywords.add(ad_data["color"].lower())
            
            # Add seller type
            if "seller_type" in ad_data:
                keywords.add(ad_data["seller_type"])
            
            # Add tags
            for tag in ad_data.get("tags", []):
                keywords.add(tag.lower())
            
            ad_data["keywords"] = list(keywords)
            
        except Exception as e:
            logger.warning(f"Failed to generate keywords: {str(e)}")
            ad_data["keywords"] = []
        
    except Exception as e:
        logger.error(f"Error scraping individual ad: {str(e)}")
    
    # Go back to the search results
    try:
        driver.get(current_url)
        # Wait for the search results page to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )
    except Exception as e:
        logger.error(f"Error returning to search results: {str(e)}")
    
    return ad_data

def save_to_mongo(car_ads: List[Dict[str, Any]]) -> Dict[str, int]:
    """
    Save scraped car ads to MongoDB.
    Handles detailed car information including images, specifications, and tags.
    Optimized for Elasticsearch with structured data for low latency.
    
    Args:
        car_ads: List of car ad details
        
    Returns:
        Dict[str, int]: Statistics about the operation
    """
    stats = {
        "total_ads": len(car_ads),
        "inserted": 0,
        "updated": 0,
        "unchanged": 0,
        "errors": 0
    }
    
    client, db, collection = get_mongodb_connection()
    
    if client is None or db is None or collection is None:
        logger.error("Failed to get MongoDB connection")
        stats["errors"] = len(car_ads)
        return stats
    
    try:
        # Create indexes for better performance
        try:
            # Create a text index on searchable fields
            collection.create_index([
                ("title", "text"), 
                ("description", "text"),
                ("search_text", "text")
            ])
            
            # Create indexes for common query fields
            collection.create_index("url", unique=True)  # Unique constraint on URL
            collection.create_index("id", unique=True)   # Unique constraint on ID
            collection.create_index("price")             # For price filtering and sorting
            collection.create_index("year")              # For year filtering and sorting
            collection.create_index("mileage")           # For mileage filtering and sorting
            collection.create_index("make")              # For make filtering
            collection.create_index("model")             # For model filtering
            collection.create_index("fuel_type")         # For fuel type filtering
            collection.create_index("transmission")      # For transmission filtering
            collection.create_index("seller_type")       # For seller type filtering
            collection.create_index("scrape_timestamp")  # For recency filtering
            collection.create_index("publication_timestamp")  # For publication date filtering
            collection.create_index("indexed")           # For tracking Elasticsearch indexing
            collection.create_index("active")            # For tracking active ads
            
            logger.info("Created MongoDB indexes")
        except Exception as e:
            logger.warning(f"Failed to create indexes: {str(e)}")
        
        for ad in car_ads:
            try:
                # Use URL as unique identifier
                result = collection.update_one(
                    {"url": ad["url"]},
                    {"$set": ad},
                    upsert=True
                )
                
                if result.matched_count == 0 and result.upserted_id:
                    stats["inserted"] += 1
                    logger.info(f"Inserted new ad: {ad.get('title', 'Unknown')}")
                elif result.modified_count > 0:
                    stats["updated"] += 1
                    logger.info(f"Updated existing ad: {ad.get('title', 'Unknown')}")
                else:
                    stats["unchanged"] += 1
                    logger.info(f"Ad unchanged: {ad.get('title', 'Unknown')}")
                
                # Download images if available
                if ad.get("images") and len(ad["images"]) > 0:
                    try:
                        # Create directory for images if it doesn't exist
                        ad_id = ad.get("id")
                        image_dir = Path(f"images/{ad_id}")
                        image_dir.mkdir(parents=True, exist_ok=True)
                        
                        # Download each image
                        for img in ad["images"]:
                            img_url = img.get("url")
                            img_path = img.get("local_path")
                            
                            if img_url and img_path and not os.path.exists(img_path):
                                try:
                                    # Download the image
                                    response = requests.get(img_url, stream=True, timeout=10)
                                    if response.status_code == 200:
                                        with open(img_path, 'wb') as f:
                                            for chunk in response.iter_content(1024):
                                                f.write(chunk)
                                        
                                        # Update the image object
                                        img["downloaded"] = True
                                        logger.info(f"Downloaded image: {img_path}")
                                        
                                        # Update the image in MongoDB
                                        collection.update_one(
                                            {"url": ad["url"]},
                                            {"$set": {f"images.$[elem].downloaded": True}},
                                            array_filters=[{"elem.url": img_url}]
                                        )
                                except Exception as img_err:
                                    logger.error(f"Error downloading image {img_url}: {str(img_err)}")
                    except Exception as img_dir_err:
                        logger.error(f"Error setting up image directory: {str(img_dir_err)}")
                
            except Exception as e:
                logger.error(f"Error saving ad to MongoDB: {str(e)}")
                stats["errors"] += 1
                
    except Exception as e:
        logger.error(f"Error saving to MongoDB: {str(e)}")
        stats["errors"] += 1
    finally:
        if client:
            client.close()
            logger.info("MongoDB connection closed")
            
    return stats

if __name__ == "__main__":
    # For testing locally
    car_ads = scrape_blocket()
    stats = save_to_mongo(car_ads)
    print(f"Scraping results: {stats}") 