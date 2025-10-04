# BioForecast V1# React + TypeScript + Vite



![BioForecast](https://img.shields.io/badge/version-1.0.0-blue.svg)This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

![React](https://img.shields.io/badge/react-19.1-blue.svg)

![TypeScript](https://img.shields.io/badge/typescript-5.9-blue.svg)Currently, two official plugins are available:

![License](https://img.shields.io/badge/license-MIT-green.svg)

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh

**BioForecast** es una aplicación web frontend-only desarrollada en React que permite visualizar productos satelitales relevantes para fenología de floración directamente sobre un mapa interactivo, consumiendo datos de **NASA GIBS** (Global Imagery Browse Services).- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh



## 🌟 Características## React Compiler



- 🗺️ **Mapa Interactivo**: Visualización de capas satelitales sobre OpenStreetMap usando LeafletThe React Compiler is currently not compatible with SWC. See [this issue](https://github.com/vitejs/vite-plugin-react/issues/428) for tracking the progress.

- 📊 **Múltiples Indicadores**: True Color, Surface Reflectance, Thermal Anomalies, Croplands

- 📅 **Control Temporal**: Selector de fechas con slider y animación play/pause## Expanding the ESLint configuration

- 🎨 **Control de Opacidad**: Ajuste dinámico de la transparencia de las capas

- 📖 **Leyendas Dinámicas**: Visualización de leyendas según el indicador seleccionadoIf you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

- 🔗 **URL Compartibles**: Estado de la aplicación serializado en URL para compartir vistas

- 📱 **Responsive**: Diseño adaptable para desktop y dispositivos móviles```js

- ✅ **Tests Incluidos**: Tests unitarios con Vitest y React Testing Libraryexport default defineConfig([

  globalIgnores(['dist']),

## 🚀 Inicio Rápido  {

    files: ['**/*.{ts,tsx}'],

### Prerequisitos    extends: [

      // Other configs...

- Node.js >= 18.x

- npm >= 9.x      // Remove tseslint.configs.recommended and replace with this

      tseslint.configs.recommendedTypeChecked,

### Instalación      // Alternatively, use this for stricter rules

      tseslint.configs.strictTypeChecked,

```bash      // Optionally, add this for stylistic rules

# Instalar dependencias      tseslint.configs.stylisticTypeChecked,

npm install

```      // Other configs...

    ],

### Ejecutar en Desarrollo    languageOptions: {

      parserOptions: {

```bash        project: ['./tsconfig.node.json', './tsconfig.app.json'],

npm run dev        tsconfigRootDir: import.meta.dirname,

```      },

      // other options...

La aplicación estará disponible en `http://localhost:5173`    },

  },

### Build para Producción])

```

```bash

npm run buildYou can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```

```js

Los archivos optimizados se generarán en el directorio `dist/`// eslint.config.js

import reactX from 'eslint-plugin-react-x'

### Vista Previa del Buildimport reactDom from 'eslint-plugin-react-dom'



```bashexport default defineConfig([

npm run preview  globalIgnores(['dist']),

```  {

    files: ['**/*.{ts,tsx}'],

## 🧪 Testing    extends: [

      // Other configs...

```bash      // Enable lint rules for React

# Ejecutar tests      reactX.configs['recommended-typescript'],

npm run test      // Enable lint rules for React DOM

      reactDom.configs.recommended,

# Ejecutar tests con UI interactiva    ],

npm run test:ui    languageOptions: {

      parserOptions: {

# Ejecutar tests con coverage        project: ['./tsconfig.node.json', './tsconfig.app.json'],

npm run test:coverage        tsconfigRootDir: import.meta.dirname,

```      },

      // other options...

## 📁 Estructura del Proyecto    },

  },

```])

bioforecast/```

├── src/
│   ├── components/          # Componentes React
│   │   ├── MapView.tsx      # Componente principal del mapa
│   │   ├── LayerManager.tsx # Gestor de capas GIBS
│   │   ├── Dashboard.tsx    # Panel de control derecho
│   │   ├── IndicatorSelector.tsx
│   │   ├── DateControls.tsx
│   │   ├── OpacityControl.tsx
│   │   ├── LegendPanel.tsx
│   │   ├── MetadataCard.tsx
│   │   └── ActionButtons.tsx
│   ├── hooks/               # Custom hooks
│   │   └── useGIBSLayer.ts  # Hook para manejo de capas GIBS
│   ├── services/            # Servicios y configuraciones
│   │   └── gibsConfig.ts    # Mapping de indicadores a GIBS
│   ├── store/               # State management (Zustand)
│   │   └── appStore.ts      # Store global de la aplicación
│   ├── utils/               # Utilidades
│   │   ├── urlState.ts      # Serialización de estado en URL
│   │   └── dateUtils.ts     # Funciones para manejo de fechas
│   ├── styles/              # Estilos CSS
│   ├── tests/               # Tests unitarios
│   └── App.tsx              # Componente raíz
├── public/                  # Archivos estáticos
├── package.json
├── vite.config.ts
├── vitest.config.ts
├── tsconfig.json
└── README.md
```

## 🌐 Indicadores Disponibles

### 1. True Color (MODIS Terra)
- **Capa GIBS**: `MODIS_Terra_CorrectedReflectance_TrueColor`
- **Resolución**: 250m
- **Frecuencia**: Diaria
- **Descripción**: Imagen de color real de la superficie terrestre

### 2. Surface Reflectance (MODIS Bands 1-4-3)
- **Capa GIBS**: `MODIS_Terra_SurfaceReflectance_Bands143`
- **Resolución**: 500m
- **Frecuencia**: Diaria
- **Descripción**: Reflectancia superficial multi-banda para análisis de vegetación

### 3. Thermal Anomalies (VIIRS/NOAA20)
- **Capa GIBS**: `VIIRS_NOAA20_Thermal_Anomalies_375m_All`
- **Resolución**: 375m
- **Frecuencia**: Diaria
- **Descripción**: Detección de anomalías térmicas y fuegos activos

### 4. Croplands (Global)
- **Capa GIBS**: `Agricultural_Lands_Croplands_2000`
- **Resolución**: 1km
- **Frecuencia**: Anual (año 2000)
- **Descripción**: Mapa global de tierras agrícolas y cultivos

## 🔧 Configuración de GIBS

### Endpoints Utilizados

La aplicación consume datos de NASA GIBS usando la proyección **EPSG:3857** (Web Mercator) para compatibilidad con Leaflet:

- **WMS**: `https://gibs.earthdata.nasa.gov/wms/epsg3857/best/wms.cgi`
- **WMTS**: `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best`
- **Leyendas**: `https://gibs.earthdata.nasa.gov/legends`

### CORS

GIBS tiene CORS habilitado para la mayoría de endpoints. En caso de restricciones, considera usar un proxy o servidor intermedio.

### Proyección

Todas las capas se consumen en proyección **EPSG:3857** para asegurar compatibilidad con el basemap OpenStreetMap.

## 🎨 Uso de la Aplicación

### Interfaz

La aplicación está dividida en dos secciones:

- **Izquierda (70%)**: Mapa interactivo con capas satelitales
- **Derecha (30%)**: Panel de control (Dashboard) con:
  - Selector de indicador
  - Control de fecha con slider y animación
  - Control de opacidad
  - Leyenda dinámica
  - Metadata de la capa
  - Botones de acción (Reset, Compartir)

### Funcionalidades

1. **Selección de Indicador**: Elige el producto satelital desde el dropdown
2. **Control Temporal**: 
   - Selecciona fecha con el date picker
   - Usa el slider para navegar rápidamente
   - Presiona ▶️ Play para animar la secuencia temporal
3. **Ajuste de Opacidad**: Controla la transparencia de la capa sobre el mapa
4. **Click en el Mapa**: Abre un popup con información del punto (producto, fecha, coordenadas)
5. **Compartir Vista**: Copia la URL con el estado actual para compartir
6. **Restablecer Vista**: Vuelve al centro y zoom inicial

## 📊 Limitaciones de V1

- **Solo Visualización**: La aplicación muestra imágenes renderizadas, NO valores numéricos de píxeles
- **Frontend-Only**: No hay backend, toda la lógica corre en el navegador
- **Sin Procesamiento**: No se calculan índices (NDVI, etc.) en esta versión
- **Rango Temporal**: Limitado a los últimos 365 días para la mayoría de productos

## 🚢 Despliegue

### Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Netlify

```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Build y deploy
npm run build
netlify deploy --prod --dir=dist
```

### GitHub Pages

```bash
# Configurar base en vite.config.ts
# base: '/nombre-repositorio/'

npm run build
# Subir la carpeta dist/ a la rama gh-pages
```

## 🛠️ Tecnologías Utilizadas

- **React 19** - Framework UI
- **TypeScript 5.9** - Tipado estático
- **Vite** - Build tool y dev server
- **Leaflet & react-leaflet** - Mapas interactivos
- **Zustand** - State management
- **react-datepicker** - Selector de fechas
- **rc-slider** - Sliders personalizables
- **Vitest** - Testing framework
- **React Testing Library** - Testing de componentes

## 📝 Notas Técnicas

### Resolución de Tiles

GIBS WMTS usa el tile matrix set `GoogleMapsCompatible_Level9`, limitando el zoom máximo a nivel 9 para la mayoría de productos.

### Fechas Disponibles

Para productos diarios, la aplicación genera automáticamente los últimos 365 días. Los productos estáticos (como Croplands) tienen una fecha fija.

### Performance

- Las capas WMTS son más eficientes que WMS para visualización
- Los tiles se cachean automáticamente en el navegador
- La animación temporal usa throttling configurable (default: 1000ms)

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🙏 Agradecimientos

- **NASA GIBS** / EOSDIS por proporcionar los servicios de imágenes satelitales
- **OpenStreetMap** contributors por el basemap
- Comunidad de React y Leaflet

## 📧 Contacto

Para preguntas o soporte, por favor abre un issue en el repositorio.

---

**⚠️ Disclaimer**: Esta aplicación es una herramienta de visualización con fines educativos y de investigación. Los datos mostrados provienen de NASA GIBS y su precisión depende de los productos originales.
