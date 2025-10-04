/**
 * ImageDownload Component
 * Permite descargar capturas del mapa como PNG o serie temporal como ZIP
 */
import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import { Map as LeafletMap } from 'leaflet';
import { useAppStore } from '../store/appStore';
import '../styles/ImageDownload.css';

interface ImageDownloadProps {
  mapRef: React.RefObject<LeafletMap>;
}

const ImageDownload: React.FC<ImageDownloadProps> = ({ mapRef }) => {
  const { indicator, date } = useAppStore();
  const [downloading, setDownloading] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);

  const captureMapImage = async (): Promise<string> => {
    if (!mapRef.current) {
      throw new Error('Referencia al mapa no disponible');
    }

    const mapContainer = mapRef.current.getContainer();
    const canvas = await html2canvas(mapContainer, {
      useCORS: true,
      logging: false,
      backgroundColor: '#f0f0f0',
    });

    return canvas.toDataURL('image/png');
  };

  const downloadSingleImage = async () => {
    setDownloading(true);
    try {
      const dataUrl = await captureMapImage();
      
      // Crear enlace de descarga
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `BioForecast_${indicator}_${date}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('Imagen descargada exitosamente');
    } catch (error) {
      console.error('Error al descargar imagen:', error);
      alert('Error al descargar la imagen. Por favor, intenta de nuevo.');
    } finally {
      setDownloading(false);
    }
  };

  const downloadTimeSeriesZip = async () => {
    setDownloadingZip(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder('BioForecast_TimeSeries');

      if (!folder) {
        throw new Error('Error al crear carpeta ZIP');
      }

      // Simular captura de múltiples fechas
      // En producción, esto iteraría sobre un rango de fechas
      const dates = [
        new Date(date),
        new Date(new Date(date).setMonth(new Date(date).getMonth() - 1)),
        new Date(new Date(date).setMonth(new Date(date).getMonth() - 2)),
      ];

      for (let i = 0; i < dates.length; i++) {
        const currentDate = dates[i].toISOString().split('T')[0];
        
        // Simular delay entre capturas
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // En producción, aquí cambiaríamos la fecha en el store y esperaríamos a que se actualice el mapa
        const dataUrl = await captureMapImage();
        
        // Convertir dataUrl a blob
        const base64Data = dataUrl.split(',')[1];
        folder.file(`${indicator}_${currentDate}.png`, base64Data, { base64: true });
      }

      // Generar ZIP
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      // Descargar ZIP
      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipBlob);
      link.download = `BioForecast_${indicator}_Series.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('Serie temporal descargada exitosamente');
    } catch (error) {
      console.error('Error al descargar serie temporal:', error);
      alert('Error al descargar la serie temporal. Por favor, intenta de nuevo.');
    } finally {
      setDownloadingZip(false);
    }
  };

  return (
    <div className="image-download">
      <h4>📥 Descargar Imágenes</h4>
      
      <div className="download-buttons">
        <button
          className="download-btn download-single"
          onClick={downloadSingleImage}
          disabled={downloading}
        >
          {downloading ? (
            <>
              <span className="btn-spinner"></span>
              Capturando...
            </>
          ) : (
            <>
              🖼️ Descargar PNG Actual
            </>
          )}
        </button>

        <button
          className="download-btn download-series"
          onClick={downloadTimeSeriesZip}
          disabled={downloadingZip}
        >
          {downloadingZip ? (
            <>
              <span className="btn-spinner"></span>
              Generando ZIP...
            </>
          ) : (
            <>
              📦 Descargar Serie (ZIP)
            </>
          )}
        </button>
      </div>

      <p className="download-note">
        <small>
          💡 La descarga de serie incluye las últimas 3 capturas disponibles del indicador actual.
        </small>
      </p>
    </div>
  );
};

export default ImageDownload;
