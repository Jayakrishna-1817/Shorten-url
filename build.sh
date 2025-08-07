#!/bin/bash
set -e

echo "Starting build process..."
npm ci --only=production
npx vite build
echo "Build completed successfully!"
