import puppeteer from 'puppeteer';
import { launchUniversalBrowser } from './puppeteerLauncher.js';

export const generatePdfFromHtml = async (html, {
  serviceName = 'pdf-service',
  pdfOptions = { format: 'A4', printBackground: true },
  timeoutMs = 30000,
  retries = 2,
  waitUntil = 'networkidle2'
} = {}) => {
  let attempt = 0;
  let lastError = null;

  while (attempt <= retries) {
    let browser;
    try {
      attempt++;
      browser = await launchUniversalBrowser(puppeteer, { serviceName });
      const page = await browser.newPage();

      // Establecer timeouts razonables
      page.setDefaultNavigationTimeout(timeoutMs);
      page.setDefaultTimeout(timeoutMs);

      // Cargar contenido
      await page.setContent(html, { waitUntil });

      // Generar PDF
      const pdfBuffer = await page.pdf(pdfOptions);

      await browser.close();
      return pdfBuffer;
    } catch (error) {
      lastError = error;
      try { if (browser) await browser.close(); } catch (e) { /* ignore */ }
      // pequeño delay antes de reintentar
      if (attempt <= retries) {
        await new Promise(res => setTimeout(res, 800));
      }
    }
  }

  // Si aquí, todos los intentos fallaron
  throw new Error(`generatePdfFromHtml: All attempts failed. Last error: ${lastError?.message || lastError}`);
};
