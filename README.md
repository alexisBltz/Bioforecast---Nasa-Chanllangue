# BioForecast

BioForecast is a satellite phenology viewer web application that provides interactive visualization of environmental and agricultural data layers on a map. It allows users to explore satellite-derived indicators, view crop suitability, and analyze temporal data for specific geographic points.

## Features

- Interactive map based on React Leaflet with OpenStreetMap basemap and NASA GIBS overlay layers.
- Multi-layer support with adjustable opacity and visibility.
- Selection of environmental indicators such as NDVI, precipitation, land surface temperature, and croplands.
- Date controls with support for different time resolutions and intervals.
- Point data inspection with detailed modal views.
- Crop suitability analysis modal for selected points.
- Dashboard with controls for indicators, layers, opacity, date, and language switching.
- Responsive design with overlay dashboard on small screens.
- Internationalization support with English and Spanish translations.
- State management using Zustand with URL synchronization for shareable views.
- Bloom mode preset for phenology analysis with predefined layers and settings.
- Toast notifications for user feedback (e.g., clicking on ocean points).

## Technologies

- React with TypeScript
- Zustand for state management
- React Leaflet for map rendering
- i18next for internationalization
- NASA GIBS for satellite imagery layers
- OpenStreetMap for basemap tiles
- CSS modules and global styles for UI styling

## Usage

- Click on the map to select a point and view data or crop suitability.
- Use the dashboard to select indicators, adjust layer opacity, and control the date.
- Toggle multiple layers and adjust their visibility.
- Use the bloom mode preset for phenology-specific visualization.
- Switch languages between English and Spanish.

## Project Structure

- `src/` - Main source code
  - `components/` - React components including MapView, Dashboard, modals, and controls
  - `store/` - Zustand global state store
  - `services/` - Data services for satellite and environmental data
  - `hooks/` - Custom React hooks
  - `styles/` - CSS stylesheets
  - `locales/` - Translation JSON files
  - `utils/` - Utility functions for date handling and URL state management
  - `config/` - Application constants and configuration

## Development

- The app initializes state from URL parameters for shareable views.
- The map restricts navigation to valid world bounds and supports zoom and pan.
- Layers are managed with opacity and visibility toggles.
- Date intervals and available dates are dynamically generated based on indicator time resolution.
- The bloom mode activates a preset configuration for phenology analysis.

## License

This project is licensed under the MIT License.
