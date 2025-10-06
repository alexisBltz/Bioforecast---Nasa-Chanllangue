# BioForecast

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

BioForecast is a satellite phenology viewer web application that provides interactive visualization of environmental and agricultural data layers on a map. It allows users to explore satellite-derived indicators, view crop suitability, and analyze temporal data for specific geographic points.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Scripts](#scripts)
- [Project Structure](#project-structure)
- [Technologies](#technologies)
- [Development](#development)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Interactive Map**: Based on React Leaflet with OpenStreetMap basemap and NASA GIBS overlay layers
- **Multi-layer Support**: Adjustable opacity and visibility for multiple data layers
- **Environmental Indicators**: Selection of indicators such as NDVI, precipitation, land surface temperature, and croplands
- **Temporal Controls**: Date controls with support for different time resolutions and intervals
- **Point Data Analysis**: Detailed modal views for inspecting data at specific geographic points
- **Crop Suitability Analysis**: Modal for assessing crop suitability at selected points
- **Responsive Dashboard**: Control panel with indicators, layers, opacity, date, and language switching
- **Mobile Support**: Overlay dashboard on small screens with hamburger menu
- **Internationalization**: Support for English and Spanish translations
- **State Management**: Zustand store with URL synchronization for shareable views
- **Bloom Mode**: Preset configuration for phenology analysis with predefined layers
- **User Feedback**: Toast notifications for interactions (e.g., clicking on ocean points)
- **Data Export**: Image download functionality for map views

## Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd bioforecast
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173` (or the port shown in the terminal).

## Usage

### Basic Navigation
- **Map Interaction**: Click on the map to select a point and view available data options
- **Dashboard Controls**: Use the right panel to select indicators, adjust layer settings, and control dates
- **Language Switching**: Toggle between English and Spanish using the language switcher

### Key Features
- **Layer Management**: Toggle multiple layers and adjust their opacity using the dashboard controls
- **Temporal Analysis**: Use date controls to view data across different time periods
- **Point Analysis**: Click on land points to access detailed data modals or crop suitability analysis
- **Bloom Mode**: Activate the phenology preset for specialized vegetation analysis
- **Image Export**: Download map views using the action buttons

### URL Sharing
The application state is synchronized with URL parameters, allowing you to share specific map views and configurations.

## Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint for code quality checks
- `npm run test` - Run the test suite
- `npm run test:ui` - Run tests with UI interface
- `npm run test:coverage` - Run tests with coverage report

## Project Structure

```
src/
├── components/          # React components
│   ├── MapView.tsx      # Main map component
│   ├── Dashboard.tsx    # Control panel
│   ├── modals/          # Modal components (PointData, CropSuitability, etc.)
│   └── controls/        # UI control components
├── store/               # Zustand global state management
├── services/            # Data services and API integrations
│   ├── gibsConfig.ts    # NASA GIBS configuration
│   ├── nasaPowerService.ts  # NASA POWER API service
│   └── cropSuitabilityService.ts  # Crop analysis service
├── hooks/               # Custom React hooks
├── styles/              # CSS stylesheets
├── locales/             # Translation files (en/es)
├── utils/               # Utility functions
│   ├── dateUtils.ts     # Date handling utilities
│   └── urlState.ts      # URL state management
├── config/              # Application constants
├── tests/               # Test files
└── assets/              # Static assets
```

## Technologies

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **State Management**: Zustand
- **Mapping**: React Leaflet with Leaflet.js
- **Internationalization**: i18next with react-i18next
- **HTTP Client**: Axios
- **Charts**: Recharts
- **UI Components**: Custom CSS with responsive design
- **Testing**: Vitest with Testing Library
- **Data Sources**: NASA GIBS, NASA POWER, SoilGrids, OpenStreetMap

## Development

### Architecture Overview

The application follows a component-based architecture with centralized state management:

- **State Management**: Global state is managed using Zustand, with automatic URL synchronization
- **Component Structure**: Modular components for map, dashboard, modals, and controls
- **Data Flow**: Services handle external API calls, with hooks managing component-level logic
- **Styling**: CSS modules for component-specific styles, global styles for base layout

### Key Concepts

- **Indicators**: Satellite-derived environmental data layers (NDVI, LST, precipitation, etc.)
- **Layers**: Visual overlays on the map with configurable opacity and visibility
- **Temporal Resolution**: Support for daily, 8-day, and static data intervals
- **Bloom Mode**: Specialized preset for vegetation phenology analysis
- **Responsive Design**: Adaptive layout for desktop and mobile devices

### API Integrations

- **NASA GIBS**: Satellite imagery tiles
- **NASA POWER**: Meteorological and climatological data
- **SoilGrids**: Soil property data
- **Land/Sea Service**: Geographic validation for point selections

## Testing

The project uses Vitest for unit testing with React Testing Library. Tests cover component rendering, user interactions, and state management.

Run tests with:
```bash
npm run test
```

For coverage report:
```bash
npm run test:coverage
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Attributions:**
- Map data © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors
- Satellite imagery © [NASA GIBS](https://earthdata.nasa.gov/eosdis/science-system-description/eosdis-components/gibs) / EOSDIS
