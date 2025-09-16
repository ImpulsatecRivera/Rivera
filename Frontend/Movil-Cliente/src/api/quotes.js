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

  // Ruta principal según tu app.use("/api/cotizaciones", ...)
  const url = `${baseUrl}/api/cotizaciones?clientId=${encodeURIComponent(clientId)}`;

  const res = await fetch(url, { headers });
  if (!res.ok || !isJson(res)) {
    let body = '';
    try { body = await res.text(); } catch {}
    throw new Error(
      `HTTP ${res.status} al listar cotizaciones: ${body.slice(0, 180) || res.statusText}`
    );
  }
  return res.json();
}

// POST /api/cotizaciones
export async function createQuote({ baseUrl, token, payload }) {
  const headers = await buildHeaders(token);
  const url = `${baseUrl}/api/cotizaciones`;

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok || !isJson(res)) {
    let body = '';
    try { body = await res.text(); } catch {}
    throw new Error(
      `Error creando cotización (HTTP ${res.status}). ${body.slice(0, 180)}`
    );
  }
  return res.json();
}
