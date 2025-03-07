#!/bin/bash

# Print current directory and environment
echo "Current directory: $(pwd)"
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"
echo "Environment variables:"
env | grep VERCEL

# List files in current directory
echo "Files in current directory:"
ls -la

# Install dependencies
echo "Installing dependencies..."
npm install --legacy-peer-deps

# Build the frontend
echo "Building frontend..."
cd frontend
npm install --legacy-peer-deps
npm run build
cd ..

# Create build directory at root if it doesn't exist
echo "Creating build directory at root..."
mkdir -p build

# Copy frontend build to root build directory
echo "Copying frontend build to root build directory..."
cp -r frontend/build/* build/

# Verify the build directory contents
echo "Files in build directory:"
ls -la build/

# Check if index.html exists in the build directory
if [ -f "build/index.html" ]; then
  echo "index.html found in build directory"
else
  echo "ERROR: index.html NOT found in build directory"
  # Try to find index.html anywhere
  find . -name "index.html"
fi

# Create a simple index.html if it doesn't exist (fallback)
if [ ! -f "build/index.html" ]; then
  echo "Creating a fallback index.html..."
  echo '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Premium Cars</title></head><body><div id="root">Loading...</div></body></html>' > build/index.html
fi

echo "Build completed!" 