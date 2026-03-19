import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const shouldSkip = process.env.SKIP_CHROME_DOWNLOAD === 'true' || process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD === 'true' || process.env.PUPPETEER_SKIP_DOWNLOAD === 'true';

if (shouldSkip) {
  console.log('⏭️ Chrome download skipped by environment variable.');
  process.exit(0);
}

const cacheDir = path.resolve(process.cwd(), '.cache', 'puppeteer');
fs.mkdirSync(cacheDir, { recursive: true });

console.log(`📦 Installing Chrome for Puppeteer into: ${cacheDir}`);

execSync('npx puppeteer browsers install chrome', {
  stdio: 'inherit',
  env: {
    ...process.env,
    PUPPETEER_CACHE_DIR: cacheDir
  }
});

console.log('✅ Chrome installation completed.');
