/**
 * Utilidades para manejar zona horaria de El Salvador (CST, UTC-6)
 * El Salvador no observa horario de verano, siempre está en UTC-6
 */

// Offset de El Salvador: UTC-6 (en milisegundos)
const EL_SALVADOR_OFFSET = -6 * 60 * 60 * 1000;

/**
 * Obtiene el día de la semana en zona horaria de El Salvador
 * 0 = domingo, 1 = lunes, 2 = martes, ..., 6 = sábado
 * 
 * @param {Date|string} fecha - Fecha ISO string o Date object
 * @returns {number} Día de la semana (0-6)
 */
export function getDayInSalvadorTimeZone(fecha) {
    const date = new Date(fecha);
    
    // Obtener el offset del navegador en milisegundos
    const browserOffset = date.getTimezoneOffset() * 60 * 1000;
    
    // Ajustar la fecha a UTC
    const utcTime = date.getTime() + browserOffset;
    
    // Ajustar a zona horaria de El Salvador
    const salvadorTime = new Date(utcTime + EL_SALVADOR_OFFSET);
    
    return salvadorTime.getDay();
}

/**
 * Obtiene la fecha actual en zona horaria de El Salvador
 * @returns {Date} Fecha actual en CST
 */
export function getNowInSalvadorTimeZone() {
    const now = new Date();
    const browserOffset = now.getTimezoneOffset() * 60 * 1000;
    const utcTime = now.getTime() + browserOffset;
    return new Date(utcTime + EL_SALVADOR_OFFSET);
}

/**
 * Convierte una fecha de string (YYYY-MM-DD) a Date, considerando zona horaria El Salvador
 * Fuerza la interpretación como fecha local de El Salvador
 * 
 * @param {string} dateString - Formato YYYY-MM-DD
 * @returns {Date} Date object ajustado a El Salvador
 */
export function dateStringToSalvadorDate(dateString) {
    // Parsear el string YYYY-MM-DD
    const [year, month, day] = dateString.split('-');
    
    // Crear fecha a las 00:00:00 en el navegador
    const browserDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 0, 0, 0, 0);
    
    // Obtener el offset del navegador
    const browserOffset = browserDate.getTimezoneOffset() * 60 * 1000;
    
    // Convertir a UTC
    const utcTime = browserDate.getTime() + browserOffset;
    
    // Convertir a El Salvador y luego obtener la fecha
    // Queremos que la fecha sea correcta EN El Salvador
    // Entonces si son las 00:00:00 en El Salvador, eso son 06:00:00 UTC
    // Entonces en UTC debe ser 6 horas después
    const salvadorDate = new Date(utcTime + EL_SALVADOR_OFFSET);
    
    return salvadorDate;
}

/**
 * Formatea una fecha para mostrar en la interfaz considerando zona horaria El Salvador
 * @param {Date|string} fecha - Fecha a formatear
 * @param {string} locale - Locale a usar (default: 'es-ES')
 * @returns {string} Fecha formateada
 */
export function formatearFechaEnSalvador(fecha, locale = 'es-ES') {
    if (!fecha) return '';
    
    const date = new Date(fecha);
    
    // Obtener el offset del navegador
    const browserOffset = date.getTimezoneOffset() * 60 * 1000;
    
    // Convertir a UTC
    const utcTime = date.getTime() + browserOffset;
    
    // Convertir a El Salvador
    const salvadorDate = new Date(utcTime + EL_SALVADOR_OFFSET);
    
    // Formatear
    return salvadorDate.toLocaleDateString(locale, {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
    });
}

/**
 * Obtiene solo la parte de fecha (YYYY-MM-DD) de una fecha en zona horaria El Salvador
 * @param {Date|string} fecha - Fecha a procesar
 * @returns {string} Formato YYYY-MM-DD
 */
export function getDateStringInSalvador(fecha) {
    if (!fecha) return '';
    
    const date = new Date(fecha);
    
    // Obtener el offset del navegador
    const browserOffset = date.getTimezoneOffset() * 60 * 1000;
    
    // Convertir a UTC
    const utcTime = date.getTime() + browserOffset;
    
    // Convertir a El Salvador
    const salvadorDate = new Date(utcTime + EL_SALVADOR_OFFSET);
    
    // Extraer componentes
    const year = salvadorDate.getFullYear();
    const month = String(salvadorDate.getMonth() + 1).padStart(2, '0');
    const day = String(salvadorDate.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
}

/**
 * Obtiene el nombre del día en español en zona horaria El Salvador
 * @param {Date|string} fecha - Fecha a procesar
 * @returns {string} Nombre del día (lunes, martes, etc.)
 */
export function getDayNameInSalvador(fecha) {
    const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const dayNum = getDayInSalvadorTimeZone(fecha);
    return dias[dayNum];
}
