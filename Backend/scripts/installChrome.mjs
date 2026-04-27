import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const shouldSkip = process.env.SKIP_CHROME_DOWNLOAD === 'true' || process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD === 'true' || process.env.PUPPETEER_SKIP_DOWNLOAD === 'true';

if (shouldSkip) {
  console.log('⏭️ Chrome download skipped by environment variable.');
  process.exit(0);
}

// En Render, el cache está en /opt/render/.cache/puppeteer
const RENDER_CACHE_DIR = '/opt/render/.cache/puppeteer';
const LOCAL_CACHE_DIR = path.resolve(process.cwd(), '.cache', 'puppeteer');

// Usar el directorio correcto según el entorno
const cacheDir = fs.existsSync('/opt/render') ? RENDER_CACHE_DIR : LOCAL_CACHE_DIR;
fs.mkdirSync(cacheDir, { recursive: true });

console.log(`📦 Installing Chrome for Puppeteer into: ${cacheDir}`);

execSync('npx puppeteer browsers install chrome', {
  stdio: 'inherit',
  env: {
    ...process.env,
    PUPPETEER_CACHE_DIR: cacheDir,
    CHROME_BIN: path.join(cacheDir, 'chrome', 'linux64', 'chrome-linux64', 'chrome')
  }
});

console.log('✅ Chrome installation completed.');
