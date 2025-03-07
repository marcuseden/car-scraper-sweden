#!/usr/bin/env python3
"""
Sync car ads data from MongoDB to Elasticsearch.
This script reads car ads from MongoDB and indexes them in Elasticsearch.
"""

import os
import json
import logging
from datetime import datetime
from typing import Dict, Any, List, Optional

from dotenv import load_dotenv
from pymongo import MongoClient
from elasticsearch import Elasticsearch
from elasticsearch.helpers import bulk

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

def get_mongodb_connection():
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
            
        client = MongoClient(
            mongodb_uri,
            tlsAllowInvalidCertificates=True,
            serverSelectionTimeoutMS=5000
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

def get_elasticsearch_connection():
    """
    Establish connection to Elasticsearch.
    
    Returns:
        Elasticsearch: Elasticsearch client or None if connection fails
    """
    try:
        es_host = os.getenv('ELASTICSEARCH_HOST', 'localhost')
        es_port = os.getenv('ELASTICSEARCH_PORT', '9200')
        es_user = os.getenv('ELASTICSEARCH_USER')
        es_password = os.getenv('ELASTICSEARCH_PASSWORD')
        
        es_url = f"http://{es_host}:{es_port}"
        
        # Connect to Elasticsearch
        if es_user and es_password:
            es = Elasticsearch(es_url, basic_auth=(es_user, es_password))
        else:
            es = Elasticsearch(es_url)
        
        # Test connection
        if es.ping():
            logger.info("Successfully connected to Elasticsearch")
            return es
        else:
            logger.error("Failed to connect to Elasticsearch")
            return None
    except Exception as e:
        logger.error(f"Failed to connect to Elasticsearch: {str(e)}")
        return None

def prepare_document_for_elasticsearch(doc: Dict[str, Any]) -> Dict[str, Any]:
    """
    Prepare a MongoDB document for Elasticsearch indexing.
    
    Args:
        doc: MongoDB document
        
    Returns:
        Dict[str, Any]: Document prepared for Elasticsearch
    """
    # Create a copy of the document to avoid modifying the original
    es_doc = doc.copy()
    
    # Remove MongoDB _id field
    if '_id' in es_doc:
        del es_doc['_id']
    
    # Set indexed flag to True
    es_doc['indexed'] = True
    es_doc['last_indexed'] = datetime.now().isoformat()
    
    return es_doc

def generate_elasticsearch_actions(collection, index_name: str, batch_size: int = 100):
    """
    Generate actions for bulk indexing in Elasticsearch.
    
    Args:
        collection: MongoDB collection
        index_name: Elasticsearch index name
        batch_size: Number of documents to process in each batch
        
    Yields:
        Dict[str, Any]: Action for Elasticsearch bulk API
    """
    # Find documents that haven't been indexed yet or need updating
    query = {
        "$or": [
            {"indexed": {"$ne": True}},
            {"indexed": {"$exists": False}}
        ]
    }
    
    # Get total count for progress reporting
    total_docs = collection.count_documents(query)
    logger.info(f"Found {total_docs} documents to index")
    
    # Process documents in batches
    processed = 0
    cursor = collection.find(query)
    
    for doc in cursor:
        # Prepare document for Elasticsearch
        es_doc = prepare_document_for_elasticsearch(doc)
        
        # Create action for bulk API
        action = {
            "_index": index_name,
            "_id": es_doc.get("id") or es_doc.get("url"),
            "_source": es_doc
        }
        
        yield action
        
        # Update document in MongoDB to mark as indexed
        collection.update_one(
            {"_id": doc["_id"]},
            {"$set": {"indexed": True, "last_indexed": es_doc["last_indexed"]}}
        )
        
        processed += 1
        if processed % batch_size == 0:
            logger.info(f"Processed {processed}/{total_docs} documents")

def create_elasticsearch_index(es, index_name: str, mapping_file: str) -> bool:
    """
    Create Elasticsearch index with mapping.
    
    Args:
        es: Elasticsearch client
        index_name: Index name
        mapping_file: Path to mapping file
        
    Returns:
        bool: True if index was created or already exists, False otherwise
    """
    try:
        # Check if index already exists
        if es.indices.exists(index=index_name):
            logger.info(f"Index '{index_name}' already exists")
            return True
        
        # Load mapping from file
        with open(mapping_file, 'r') as f:
            mapping = json.load(f)
        
        # Create index with mapping
        es.indices.create(index=index_name, body=mapping)
        logger.info(f"Created index '{index_name}' with mapping")
        return True
    except Exception as e:
        logger.error(f"Failed to create index '{index_name}': {str(e)}")
        return False

def sync_to_elasticsearch():
    """
    Sync data from MongoDB to Elasticsearch.
    """
    # Connect to MongoDB
    mongo_client, mongo_db, mongo_collection = get_mongodb_connection()
    if not mongo_collection:
        logger.error("Failed to connect to MongoDB")
        return
    
    # Connect to Elasticsearch
    es = get_elasticsearch_connection()
    if not es:
        logger.error("Failed to connect to Elasticsearch")
        return
    
    # Get index name from environment variable or use default
    index_name = os.getenv('ELASTICSEARCH_INDEX', 'car_ads')
    
    # Create index with mapping if it doesn't exist
    mapping_file = os.getenv('ELASTICSEARCH_MAPPING_FILE', 'elasticsearch_mapping.json')
    if not create_elasticsearch_index(es, index_name, mapping_file):
        logger.error("Failed to create Elasticsearch index")
        return
    
    # Sync data from MongoDB to Elasticsearch
    try:
        # Generate actions for bulk API
        actions = generate_elasticsearch_actions(mongo_collection, index_name)
        
        # Perform bulk indexing
        success, failed = bulk(es, actions, stats_only=True)
        
        logger.info(f"Indexed {success} documents, {failed} failed")
    except Exception as e:
        logger.error(f"Failed to sync data to Elasticsearch: {str(e)}")
    finally:
        # Close connections
        if mongo_client:
            mongo_client.close()
            logger.info("MongoDB connection closed")

if __name__ == "__main__":
    sync_to_elasticsearch() 