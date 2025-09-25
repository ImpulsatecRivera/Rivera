export const formatters = {
  // Formatear moneda
  currency: (amount, currency = 'USD') => {
    if (!amount || amount === '—') return '—';
    try {
      const num = typeof amount === 'string' ? parseFloat(amount) : amount;
      if (isNaN(num)) return '—';
      return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(num);
    } catch {
      return `$${amount}`;
    }
  },

  // Formatear fecha completa
  dateTime: (dateStr) => {
    if (!dateStr || dateStr === '—') return '—';
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  },

  // Formatear fecha corta
  dateShort: (dateStr) => {
    if (!dateStr || dateStr === '—') return '—';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  },

  // Truncar texto
  truncate: (text, maxLength = 30) => {
    if (!text || text === '—') return '—';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  },

  // Capitalizar primera letra
  capitalize: (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },
};