import fs from 'node:fs';
import path from 'node:path';

const PROJECT_PUPPETEER_CACHE = path.resolve(process.cwd(), '.cache', 'puppeteer');
if (!process.env.PUPPETEER_CACHE_DIR) {
  process.env.PUPPETEER_CACHE_DIR = PROJECT_PUPPETEER_CACHE;
}

const DEFAULT_ARGS = [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',
  '--disable-gpu'
];

const CONSTRAINED_ARGS = [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',
  '--disable-gpu',
  '--single-process',
  '--no-zygote'
];

const SYSTEM_CHROME_CANDIDATES = [
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/usr/bin/google-chrome-stable',
  '/opt/google/chrome/chrome'
];

const unique = (values) => [...new Set(values.filter(Boolean))];

const findChromeExecutablesInDir = (dirPath, maxDepth = 6) => {
  if (!exists(dirPath) || maxDepth < 0) return [];

  const found = [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      found.push(...findChromeExecutablesInDir(fullPath, maxDepth - 1));
      continue;
    }

    const lower = entry.name.toLowerCase();
    if (lower === 'chrome' || lower === 'chrome.exe' || lower === 'chromium') {
      found.push(fullPath);
    }
  }

  return found;
};

const exists = (filePath) => {
  try {
    return Boolean(filePath) && fs.existsSync(filePath);
  } catch {
    return false;
  }
};

const getExecutableCandidates = (puppeteer) => {
  const envCandidates = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    process.env.CHROME_BIN,
    process.env.GOOGLE_CHROME_BIN
  ];

  let bundledPath;
  try {
    bundledPath = puppeteer.executablePath();
  } catch {
    bundledPath = undefined;
  }

  const systemCandidates = process.platform === 'linux' ? SYSTEM_CHROME_CANDIDATES : [];
  const cacheCandidates = findChromeExecutablesInDir(process.env.PUPPETEER_CACHE_DIR || PROJECT_PUPPETEER_CACHE);

  return unique([...envCandidates, bundledPath, ...systemCandidates, ...cacheCandidates]).filter(exists);
};

const buildLaunchAttempts = (primaryConfig, executableCandidates) => {
  const attempts = [];

  if (primaryConfig && typeof primaryConfig === 'object') {
    attempts.push({
      name: 'primary-config',
      options: { ...primaryConfig }
    });
  }

  const modes = ['new', true];
  const argProfiles = [DEFAULT_ARGS, CONSTRAINED_ARGS];

  for (const headless of modes) {
    for (const args of argProfiles) {
      attempts.push({
        name: `headless-${String(headless)}-bundled`,
        options: {
          headless,
          args
        }
      });

      for (const executablePath of executableCandidates) {
        attempts.push({
          name: `headless-${String(headless)}-path-${executablePath}`,
          options: {
            headless,
            executablePath,
            args
          }
        });
      }
    }
  }

  return attempts;
};

export const launchUniversalBrowser = async (puppeteer, { serviceName = 'pdf', primaryConfig } = {}) => {
  const executableCandidates = getExecutableCandidates(puppeteer);
  const attempts = buildLaunchAttempts(primaryConfig, executableCandidates);
  const errors = [];

  for (const attempt of attempts) {
    try {
      return await puppeteer.launch(attempt.options);
    } catch (error) {
      const message = error?.message || String(error);
      errors.push(`${attempt.name}: ${message}`);
    }
  }

  const errorSummary = errors.slice(0, 8).join(' | ');
  throw new Error(
    `No se pudo iniciar Chromium para ${serviceName}. Intentos fallidos: ${errorSummary}`
  );
};
