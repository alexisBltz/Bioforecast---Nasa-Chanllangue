# BioForecast - Backlog de Mejoras Futuras

## 📋 Características para V2

### Alta Prioridad

- [ ] **Pre-fetch GetCapabilities**: Obtener rangos temporales válidos automáticamente desde GIBS
- [ ] **Extracción de Valores**: Implementar GetFeatureInfo para obtener valores numéricos del píxel clickeado
- [ ] **Cálculo de NDVI**: Procesamiento de índices vegetativos desde Surface Reflectance
- [ ] **Serie Temporal**: Gráfico de valores en un punto a lo largo del tiempo
- [ ] **Descarga de Imagen**: Exportar PNG del viewport actual

### Prioridad Media

- [ ] **localStorage**: Guardar último indicador/fecha/vista del usuario
- [ ] **Marcadores**: Permitir al usuario guardar puntos de interés
- [ ] **Áreas de Interés**: Dibujar polígonos y calcular estadísticas
- [ ] **Búsqueda Geográfica**: Geocoder para buscar por nombre de lugar
- [ ] **Múltiples Capas**: Permitir overlay de 2+ capas simultáneamente
- [ ] **Comparación Side-by-Side**: Vista dividida para comparar fechas

### Prioridad Baja

- [ ] **Backend API**: Servicio para cálculos complejos y caching
- [ ] **Autenticación**: Login para guardar configuraciones del usuario
- [ ] **Exportar a GeoTIFF**: Descargar rasters con valores reales
- [ ] **Soporte MVT**: Capas vectoriales con leaflet.vectorgrid
- [ ] **WebGL con MapLibre**: Migrar a MapLibre GL para mejor performance
- [ ] **Dark Mode**: Tema oscuro para la interfaz
- [ ] **Internacionalización**: Soporte multi-idioma (ES/EN)

## 🔧 Mejoras Técnicas

### Performance

- [ ] Implementar Web Workers para procesamiento de imágenes
- [ ] Lazy loading de componentes con React.lazy
- [ ] Optimizar re-renders con React.memo
- [ ] Implementar virtual scrolling en lista de fechas
- [ ] Service Worker para offline support

### Testing

- [ ] Aumentar coverage a >80%
- [ ] Tests E2E con Playwright
- [ ] Tests de integración para store
- [ ] Visual regression testing
- [ ] Performance testing

### DevOps

- [ ] CI/CD con GitHub Actions
- [ ] Auto-deploy a Vercel/Netlify
- [ ] Semantic versioning automático
- [ ] Changelog generado automáticamente
- [ ] Lighthouse CI para performance metrics

## 🌐 Integraciones

- [ ] **Google Earth Engine**: Acceso a más datasets
- [ ] **Sentinel Hub**: Imágenes Sentinel-2
- [ ] **STAC API**: Búsqueda en catálogos STAC
- [ ] **OpenWeatherMap**: Datos meteorológicos actuales
- [ ] **NOAA Climate Data**: Series históricas de clima

## 📱 Responsive & UX

- [ ] PWA (Progressive Web App)
- [ ] Modo offline con cache de tiles
- [ ] Touch gestures optimizados para móvil
- [ ] Onboarding tour para nuevos usuarios
- [ ] Tooltips contextuales
- [ ] Keyboard shortcuts

## 🔐 Seguridad

- [ ] Rate limiting en llamadas a GIBS
- [ ] Sanitización de inputs
- [ ] Content Security Policy headers
- [ ] HTTPS enforcement

## 📊 Analytics

- [ ] Google Analytics / Matomo
- [ ] Tracking de uso de indicadores
- [ ] Métricas de performance (FCP, LCP, FID)
- [ ] Error tracking con Sentry

## 🎨 UI/UX

- [ ] Tema claro/oscuro toggle
- [ ] Palette de colores personalizable para leyendas
- [ ] Animaciones más fluidas
- [ ] Micro-interacciones
- [ ] Feedback háptico en móvil

---

**Nota**: Este backlog es dinámico y se actualizará según las necesidades del proyecto y feedback de usuarios.
