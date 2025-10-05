# 🌱 BioForecast - Satellite Phenology Viewer

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/alexisBltz/Bioforecast---Nasa-Chanllangue)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19.1.1-61DAFB.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue.svg)](https://typescriptlang.org/)

BioForecast is an advanced satellite-based phenology monitoring platform that combines NASA's Earth observation data with agricultural intelligence to provide comprehensive crop suitability analysis and vegetation monitoring capabilities.

*[Insert hero screenshot of the main dashboard here]*

## ✨ Key Features

### 📊 Multi-Layer Satellite Data Visualization
- **Real-time NASA GIBS Integration**: Access to 11+ satellite indicators including NDVI, LST, precipitation, and thermal anomalies
- **Interactive Mapping**: Powered by Leaflet with OpenStreetMap integration
- **Temporal Analysis**: Time-series visualization with customizable date ranges and animation controls
- **Multi-layer Comparison**: Simultaneous visualization of multiple satellite layers with opacity controls

*[Insert screenshot of multi-layer visualization]*

### 🌾 Advanced Crop Suitability Analysis
- **Comprehensive Quinoa Assessment**: Integrated analysis combining climate, soil, and terrain data
- **Multi-source Data Integration**: 
  - Climate data from NASA POWER API
  - Soil characteristics from SoilGrids
  - Elevation and terrain analysis
- **Intelligent Scoring System**: Weighted evaluation of environmental factors
- **Actionable Recommendations**: Detailed reports with strengths, limitations, and cultivation advice

*[Insert screenshot of crop suitability analysis modal]*

### 🌍 Global Environmental Monitoring
- **Climate Data Analysis**: Temperature, precipitation, solar radiation, and aridity indices
- **Soil Property Assessment**: Texture, pH, organic matter, and drainage evaluation
- **Topographic Analysis**: Elevation, slope, and aspect considerations
- **Point-specific Insights**: Click anywhere on the map for detailed location data

*[Insert screenshot of point data modal]*

### 🔧 Advanced Analysis Tools
- **Bloom Detection Mode**: Specialized layer configuration for phenological monitoring
- **Temporal Comparison**: Side-by-side analysis of different time periods
- **Time Series Charts**: Statistical analysis with interactive graphs
- **Data Export**: Download capabilities for images and analysis results

*[Insert screenshot of temporal comparison or time series]*

## 🚀 Technology Stack

### Frontend Framework
- **React 19.1.1** - Modern UI library with concurrent features
- **TypeScript 5.9.3** - Type-safe development
- **Vite** - Lightning-fast build tool and development server

### Mapping & Visualization
- **Leaflet 1.9.4** - Interactive mapping library
- **React-Leaflet 5.0.0** - React integration for Leaflet
- **Recharts 3.2.1** - Statistical data visualization

### Data & APIs
- **NASA GIBS** - Global Imagery Browse Services
- **NASA POWER** - Climate data API
- **SoilGrids** - Global soil information
- **Elevation APIs** - Terrain analysis

### State Management & Utils
- **Zustand 5.0.8** - Lightweight state management
- **i18next** - Internationalization (English/Spanish)
- **Axios** - HTTP client for API requests

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── Dashboard.tsx           # Main control panel
│   ├── MapView.tsx            # Interactive map component
│   ├── CropSuitabilityModal.tsx   # Crop analysis interface
│   ├── TimeSeriesModal.tsx    # Statistical charts
│   └── ...
├── services/           # API integrations & data processing
│   ├── cropSuitabilityService.ts  # Main analysis engine
│   ├── nasaPowerService.ts    # Climate data service
│   ├── soilGridsService.ts    # Soil data integration
│   └── ...
├── store/             # State management
│   └── appStore.ts    # Zustand store configuration
├── hooks/             # Custom React hooks
├── utils/             # Utility functions
├── locales/           # Internationalization files
└── styles/            # Component-specific CSS
```

## 🌟 Core Capabilities

### Agricultural Intelligence
BioForecast provides farmers, agronomists, and researchers with data-driven insights for crop planning and monitoring. The platform specializes in quinoa cultivation analysis but can be extended to other crops.

### Environmental Monitoring
Track vegetation health, climate patterns, and environmental changes using NASA's most advanced satellite instruments including MODIS, VIIRS, and SMAP sensors.

### Research Applications
Ideal for academic research, environmental studies, and agricultural development projects requiring reliable satellite data analysis.

## 🎯 Use Cases

### 🌾 Agricultural Planning
- **Site Selection**: Identify optimal locations for crop cultivation
- **Risk Assessment**: Evaluate climate and environmental risks
- **Seasonal Monitoring**: Track crop development throughout growing seasons

### 🔬 Research & Development
- **Phenological Studies**: Monitor vegetation cycles and seasonal changes
- **Climate Impact Analysis**: Assess environmental factors on agriculture
- **Data Collection**: Gather multi-temporal satellite observations

### 🌍 Environmental Management
- **Land Use Planning**: Support sustainable agricultural practices
- **Climate Adaptation**: Develop strategies for changing conditions
- **Resource Management**: Optimize water and land use efficiency

## 📊 Data Sources & Accuracy

### Satellite Data
- **MODIS Terra/Aqua**: 250m-1km resolution, daily temporal coverage
- **VIIRS NOAA20**: High-resolution thermal and vegetation indices
- **GPM IMERG**: Global precipitation measurements
- **SMAP**: Soil moisture observations

### Climate Data
- **NASA POWER**: Meteorological parameters with 0.5° spatial resolution
- **Temporal Coverage**: 40+ years of historical data
- **Parameters**: Temperature, precipitation, solar radiation, humidity

### Soil Information
- **SoilGrids**: Global soil property maps at 250m resolution
- **Properties**: Texture, pH, organic carbon, bulk density
- **Coverage**: Global terrestrial areas

*[Insert screenshot of data accuracy visualization or legend panel]*

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/alexisBltz/Bioforecast---Nasa-Chanllangue.git
cd Bioforecast---Nasa-Chanllangue
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

4. **Access the application**
Open your browser and navigate to `http://localhost:5173`

### Building for Production
```bash
npm run build
npm run preview
```

## 🌐 Multi-language Support

BioForecast supports multiple languages through i18next integration:
- 🇺🇸 **English** - Complete interface translation
- 🇪🇸 **Spanish** - Full localization including technical terms

*[Insert screenshot of language switcher]*

## 🔧 Configuration & Customization

### Adding New Indicators
The platform supports easy integration of additional satellite layers through the GIBS configuration system. New indicators can be added by updating the `gibsConfig.ts` file.

### Extending Crop Analysis
The crop suitability analysis system can be extended to support additional crops by implementing new evaluation algorithms in the services layer.

### Custom Styling
Component-specific CSS files allow for easy customization of the user interface while maintaining responsive design principles.

## 📈 Performance Features

### Optimized Data Loading
- **Lazy Loading**: Components and data load on demand
- **Caching**: Intelligent caching of satellite imagery and API responses
- **Compression**: Optimized asset delivery and image formats

### Responsive Design
- **Mobile-First**: Optimized for devices from phones to desktops
- **Progressive Enhancement**: Core features work on all modern browsers
- **Accessibility**: WCAG 2.1 compliant interface elements

## 🛠️ Development & Testing

### Development Tools
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run test         # Run test suite
npm run test:ui      # Interactive test runner
npm run test:coverage # Generate coverage report
```

### Code Quality
- **TypeScript**: Full type safety throughout the application
- **ESLint**: Automated code quality checks
- **Vitest**: Modern testing framework with UI
- **React Testing Library**: Component testing utilities

## 🤝 Contributing

We welcome contributions from the community! Whether you're interested in:
- 🐛 **Bug fixes**
- ✨ **New features**
- 📚 **Documentation improvements**
- 🌍 **Translations**

Please feel free to open issues and submit pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

### Data Providers
- **NASA GIBS/EOSDIS** - Satellite imagery and Earth observation data
- **NASA POWER** - Climate and meteorological data
- **ISRIC SoilGrids** - Global soil information system
- **OpenStreetMap** - Base map data and contributors

### Technologies
- **React Team** - For the powerful UI framework
- **Leaflet Community** - For the excellent mapping library
- **TypeScript Team** - For enhanced development experience

## 📞 Support & Contact

For support, questions, or collaboration opportunities:
- 📧 **Email**: [project-email]
- 🐛 **Issues**: [GitHub Issues](https://github.com/alexisBltz/Bioforecast---Nasa-Chanllangue/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/alexisBltz/Bioforecast---Nasa-Chanllangue/discussions)

---

**🌱 BioForecast** - Empowering agriculture through satellite intelligence

*Made with ❤️ for sustainable agriculture and environmental monitoring*