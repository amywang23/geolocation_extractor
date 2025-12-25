# GeoExtractor - GPS Coordinate Extractor

A beautiful, galaxy-themed web application that extracts GPS coordinates from your images and provides downloadable location data.

## Features

- 🌌 Beautiful galaxy/space-themed UI
- 📸 Upload multiple images (JPG, PNG, HEIC)
- 📍 Extract GPS coordinates from EXIF data
- 📄 Download results as a text file
- 🗺️ Direct Google Maps links for each location
- ⚡ Fast, client-side processing (no server needed)

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Navigate to the project directory:
   ```bash
   cd geolocation_extractor
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`)

## Build for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist` directory.

To preview the production build:

```bash
npm run preview
```

## Usage

1. Click the upload button on the homepage
2. Select one or multiple image files
3. Wait for processing to complete
4. View extracted GPS coordinates
5. Download the text file with all location data
6. Click Google Maps links to view locations

## Technical Details

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **GPS Extraction**: exif-js library
- **Icons**: Lucide React

## Note on GPS Data

- Only images with embedded GPS EXIF data will show coordinates
- Most smartphone photos include GPS data (if location services were enabled)
- Screenshots and edited images often lose GPS data
- Some apps strip GPS data for privacy

## Privacy

All image processing happens entirely in your browser. No images or data are uploaded to any server.
