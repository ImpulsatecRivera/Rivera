// src/api/quotes.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const isJson = (res) =>
  (res.headers.get('content-type') || '').includes('application/json');

async function buildHeaders(tokenFromCtx) {
  const stored = await AsyncStorage.getItem('clientToken');
  const bearer = tokenFromCtx || stored || '';
  const headers = { 'Content-Type': 'application/json' };
  if (bearer) headers.Authorization = `Bearer ${bearer}`;
  return headers;
}

// GET /api/cotizaciones?clientId=...
export async function fetchQuotesByClient({ baseUrl, token, clientId }) {
  const headers = await buildHeaders(token);
  
  if (!baseUrl) throw new Error('baseUrl es requerido');
  if (!clientId) throw new Error('clientId es requerido');
  
  const url = `${baseUrl}/api/cotizaciones?clientId=${encodeURIComponent(clientId)}`;
  
  try {
    const res = await fetch(url, { credentials: 'include', headers });
    
    if (!res.ok) {
      let body = '';
      try { 
        body = isJson(res) ? JSON.stringify(await res.json()) : await res.text(); 
      } catch {}
      throw new Error(
        `HTTP ${res.status} al listar cotizaciones: ${body.slice(0, 180) || res.statusText}`
      );
    }
    
    if (!isJson(res)) {
      throw new Error('Respuesta del servidor no es JSON válido');
    }
    
    return res.json();
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('Network request failed')) {
      throw new Error('Error de red. Verifica tu conexión a internet y que el servidor esté funcionando.');
    }
    throw error;
  }
}

// GET /api/cotizaciones/:id
export async function fetchQuoteById({ baseUrl, token, quoteId }) {
  const headers = await buildHeaders(token);
  
  if (!baseUrl) throw new Error('baseUrl es requerido');
  if (!quoteId) throw new Error('quoteId es requerido');
  
  const url = `${baseUrl}/api/cotizaciones/${encodeURIComponent(quoteId)}`;
  
  try {
    const res = await fetch(url, { credentials: 'include', headers });
    
    if (!res.ok) {
      let body = '';
      try { 
        body = isJson(res) ? JSON.stringify(await res.json()) : await res.text(); 
      } catch {}
      throw new Error(
        `HTTP ${res.status} al obtener cotización: ${body.slice(0, 180) || res.statusText}`
      );
    }
    
    if (!isJson(res)) {
      throw new Error('Respuesta del servidor no es JSON válido');
    }
    
    return res.json();
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('Network request failed')) {
      throw new Error('Error de red. Verifica tu conexión a internet.');
    }
    throw error;
  }
}

// POST /api/cotizaciones - CORREGIDO
export async function createQuote({ baseUrl, token, payload }) {
  const headers = await buildHeaders(token);
  
  if (!baseUrl) throw new Error('baseUrl es requerido');
  if (!payload) throw new Error('payload es requerido');
  
  // ✅ VALIDACIONES CORREGIDAS
  const requiredFields = [
    'clientId', 'quoteDescription', 'quoteName', 'travelLocations', 
    'fechaNecesaria', 'ruta', 'carga', 'horarios'
  ];
  
  for (const field of requiredFields) {
    if (!payload[field]) {
      throw new Error(`Campo requerido faltante: ${field}`);
    }
  }
  
  if (!payload.ruta.origen || !payload.ruta.destino) {
    throw new Error('La ruta debe incluir origen y destino');
  }
  
  if (!payload.ruta.origen.nombre || !payload.ruta.destino.nombre) {
    throw new Error('Origen y destino deben tener nombres');
  }
  
  if (!payload.ruta.origen.coordenadas || !payload.ruta.destino.coordenadas) {
    throw new Error('Origen y destino deben tener coordenadas');
  }
  
  if (!payload.carga.descripcion) {
    throw new Error('La carga debe tener descripción');
  }
  
  if (!payload.horarios.fechaSalida || !payload.horarios.fechaLlegadaEstimada) {
    throw new Error('Los horarios deben incluir fechas de salida y llegada');
  }
  
  const url = `${baseUrl}/api/cotizaciones`;
  
  try {
    console.log('🚚 Enviando cotización:', {
      url,
      clientId: payload.clientId,
      quoteName: payload.quoteName
    });
    
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    
    if (!res.ok) {
      let body = '';
      try { 
        if (isJson(res)) {
          const errorData = await res.json();
          body = JSON.stringify(errorData, null, 2);
        } else {
          body = await res.text();
        }
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
      }
      
      let errorMessage = `Error creando cotización (HTTP ${res.status})`;
      
      switch (res.status) {
        case 400:
          errorMessage = `Error de validación: ${body.slice(0, 300)}`;
          break;
        case 401:
          errorMessage = 'No autorizado. Verifica tu sesión.';
          break;
        case 500:
          errorMessage = 'Error interno del servidor.';
          break;
        default:
          errorMessage += `. ${body.slice(0, 180)}`;
      }
      
      throw new Error(errorMessage);
    }
    
    if (!isJson(res)) {
      throw new Error('Respuesta no es JSON válido');
    }
    
    const result = await res.json();
    console.log('✅ Cotización creada:', result.cotizacion?._id);
    
    return result;
    
  } catch (error) {
    console.error('❌ Error:', error);
    
    if (error.name === 'TypeError' && error.message.includes('Network request failed')) {
      throw new Error('Error de conexión. Verifica tu red.');
    }
    
    throw error;
  }
}

// PUT /api/cotizaciones/:id
export async function updateQuote({ baseUrl, token, quoteId, updates }) {
  const headers = await buildHeaders(token);
  
  if (!baseUrl) throw new Error('baseUrl es requerido');
  if (!quoteId) throw new Error('quoteId es requerido');
  if (!updates || Object.keys(updates).length === 0) {
    throw new Error('Se requieren campos a actualizar');
  }
  
  const url = `${baseUrl}/api/cotizaciones/${encodeURIComponent(quoteId)}`;
  
  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updates),
    });
    
    if (!res.ok) {
      let body = '';
      try { 
        body = isJson(res) ? JSON.stringify(await res.json()) : await res.text(); 
      } catch {}
      throw new Error(`Error ${res.status}: ${body.slice(0, 180)}`);
    }
    
    if (!isJson(res)) {
      throw new Error('Respuesta no es JSON válido');
    }
    
    return res.json();
    
  } catch (error) {
    console.error('❌ Error actualizando:', error);
    throw error;
  }
}

// DELETE /api/cotizaciones/:id
export async function deleteQuote({ baseUrl, token, quoteId }) {
  const headers = await buildHeaders(token);
  
  if (!baseUrl) throw new Error('baseUrl es requerido');
  if (!quoteId) throw new Error('quoteId es requerido');
  
  const url = `${baseUrl}/api/cotizaciones/${encodeURIComponent(quoteId)}`;
  
  try {
    const res = await fetch(url, {
      method: 'DELETE',
      headers,
    });
    
    if (!res.ok) {
      let body = '';
      try { 
        body = isJson(res) ? JSON.stringify(await res.json()) : await res.text(); 
      } catch {}
      throw new Error(`Error ${res.status}: ${body.slice(0, 180)}`);
    }
    
    if (!isJson(res)) {
      throw new Error('Respuesta no es JSON válido');
    }
    
    return res.json();
    
  } catch (error) {
    console.error('❌ Error eliminando:', error);
    throw error;
  }
}

// Obtener todas las cotizaciones con paginación
export async function fetchAllQuotes({ baseUrl, token, page = 1, limit = 10, status, sortBy = 'createdAt', sortOrder = 'desc' }) {
  const headers = await buildHeaders(token);
  
  if (!baseUrl) throw new Error('baseUrl es requerido');
  
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    sortBy,
    sortOrder
  });
  
  if (status) params.append('status', status);
  
  const url = `${baseUrl}/api/cotizaciones?${params.toString()}`;
  
  try {
    const res = await fetch(url, { headers });
    
    if (!res.ok) {
      let body = '';
      try { 
        body = isJson(res) ? JSON.stringify(await res.json()) : await res.text(); 
      } catch {}
      throw new Error(`HTTP ${res.status}: ${body.slice(0, 180)}`);
    }
    
    if (!isJson(res)) {
      throw new Error('Respuesta no es JSON válido');
    }
    
    return res.json();
  } catch (error) {
    throw error;
  }
}

// Cambiar status de cotización
export async function updateQuoteStatus({ baseUrl, token, quoteId, status, motivoRechazo }) {
  const updates = { status };
  
  if (status === 'rechazada' && !motivoRechazo) {
    throw new Error('El motivo de rechazo es requerido');
  }
  
  if (motivoRechazo) {
    updates.motivoRechazo = motivoRechazo;
  }
  
  return updateQuote({ baseUrl, token, quoteId, updates });
}

// Actualizar precio de cotización
export async function updateQuotePrice({ baseUrl, token, quoteId, price, costos }) {
  if (!price || typeof price !== 'number' || price <= 0) {
    throw new Error('El precio debe ser un número mayor a 0');
  }
  
  const updates = { price };
  
  if (costos && typeof costos === 'object') {
    updates.costos = costos;
  }
  
  return updateQuote({ baseUrl, token, quoteId, updates });
}

// Validar configuración del cliente
export async function validateClientConfig() {
  try {
    const clientData = await AsyncStorage.getItem('clientData');
    const clientToken = await AsyncStorage.getItem('clientToken');
    
    if (!clientData) {
      throw new Error('Datos del cliente no encontrados.');
    }
    
    if (!clientToken) {
      throw new Error('Token no encontrado.');
    }
    
    const parsedClientData = JSON.parse(clientData);
    const clientId = parsedClientData.id || parsedClientData._id;
    
    if (!clientId) {
      throw new Error('ID del cliente no encontrado.');
    }
    
    return {
      clientId,
      clientData: parsedClientData,
      token: clientToken
    };
    
  } catch (error) {
    if (error.message.includes('JSON')) {
      throw new Error('Datos corruptos. Inicia sesión de nuevo.');
    }
    throw error;
  }
}

export default {
  fetchQuotesByClient,
  fetchQuoteById,
  createQuote,
  updateQuote,
  deleteQuote,
  fetchAllQuotes,
  updateQuoteStatus,
  updateQuotePrice,
  validateClientConfig
};