#!/bin/bash
set -e # Exit on any error

echo "Starting build process..."

# Build the frontend first
echo "Building frontend..."
cd /opt/render/project/src/frontend
npm install
npm run build

# Verify build was successful
if [ -d "/opt/render/project/src/frontend/dist" ]; then
  echo "Frontend build completed successfully"
  ls -la /opt/render/project/src/frontend/dist
else
  echo "ERROR: Frontend build failed - dist directory not found"
  exit 1
fi

# Change back to backend directory for server start
cd /opt/render/project/src/backend

echo "Build process completed successfully"