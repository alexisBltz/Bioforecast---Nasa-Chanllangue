/**
 * Date utilities
 * Funciones para manejar fechas y generar rangos temporales
 */

/**
 * Formatea fecha a string YYYY-MM-DD
 */
export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Parsea string YYYY-MM-DD a Date
 */
export const parseDate = (dateString: string): Date => {
  return new Date(dateString);
};

/**
 * Genera un rango de fechas desde startDate hasta endDate
 */
export const generateDateRange = (
  startDate: string,
  endDate: string,
  stepDays: number = 1
): string[] => {
  const dates: string[] = [];
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  
  let current = new Date(start);
  
  while (current <= end) {
    dates.push(formatDate(current));
    current.setDate(current.getDate() + stepDays);
  }
  
  return dates;
};

/**
 * Genera un rango de fechas para los últimos N días con intervalo personalizado
 * @param days - Número de días hacia atrás desde hoy
 * @param interval - Intervalo de días entre cada fecha (por defecto 1)
 */
export const generateRecentDates = (days: number = 30, interval: number = 1): string[] => {
  const dates: string[] = [];
  const today = new Date();
  const validInterval = Math.max(1, Math.min(30, interval)); // Validar intervalo entre 1 y 30
  
  for (let i = days - 1; i >= 0; i -= validInterval) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(formatDate(date));
  }
  
  return dates;
};

/**
 * Obtiene la fecha más cercana válida a una fecha dada
 */
export const getClosestDate = (target: string, availableDates: string[]): string => {
  if (availableDates.length === 0) return target;
  
  const targetTime = parseDate(target).getTime();
  
  let closest = availableDates[0];
  let minDiff = Math.abs(parseDate(closest).getTime() - targetTime);
  
  for (const date of availableDates) {
    const diff = Math.abs(parseDate(date).getTime() - targetTime);
    if (diff < minDiff) {
      minDiff = diff;
      closest = date;
    }
  }
  
  return closest;
};

/**
 * Verifica si una fecha es válida
 */
export const isValidDate = (dateString: string): boolean => {
  const date = parseDate(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};
