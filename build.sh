#!/bin/bash

# Print current directory
echo "Current directory: $(pwd)"

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

# List files in build directory
echo "Files in build directory:"
ls -la build/

echo "Build completed!" 