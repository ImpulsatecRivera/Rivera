import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const shouldSkip = process.env.SKIP_CHROME_DOWNLOAD === 'true' || process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD === 'true' || process.env.PUPPETEER_SKIP_DOWNLOAD === 'true';

if (shouldSkip) {
  console.log('⏭️ Chrome download skipped by environment variable.');
  process.exit(0);
}

// Dejar que Puppeteer use su carpeta predeterminada
// Puppeteer descargará a ~/.cache/puppeteer en Linux (Render)
// o al directorio de node_modules en otros sistemas

console.log(`📦 Installing Chrome for Puppeteer...`);
console.log(`PUPPETEER_CACHE_DIR: ${process.env.PUPPETEER_CACHE_DIR || 'default'}`);

try {
  execSync('npx puppeteer browsers install chrome', {
    stdio: 'inherit',
    env: {
      ...process.env,
      // Permitir que Puppeteer use su ubicación predeterminada
      // No especificamos PUPPETEER_CACHE_DIR para dejar que use ~/.cache/puppeteer
    }
  });
  console.log('✅ Chrome installation completed.');
} catch (error) {
  console.error('⚠️ Chrome installation warning (puede no ser crítico):', error.message);
  // No fallar si no se puede instalar, Puppeteer podría encontrar Chrome del sistema
}
