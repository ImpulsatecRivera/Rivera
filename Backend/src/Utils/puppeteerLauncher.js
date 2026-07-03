import fs from 'node:fs';
import path from 'node:path';

// En Render, el cache está en /opt/render/.cache/puppeteer
// En desarrollo local, está en .cache/puppeteer
const RENDER_PUPPETEER_CACHE = '/opt/render/.cache/puppeteer';
const PROJECT_PUPPETEER_CACHE = process.env.PUPPETEER_CACHE_DIR || path.resolve(process.cwd(), '.cache', 'puppeteer');

// Usar el cache de Render si existe, si no el local
const PUPPETEER_CACHE = fs.existsSync(RENDER_PUPPETEER_CACHE) ? RENDER_PUPPETEER_CACHE : PROJECT_PUPPETEER_CACHE;

if (!process.env.PUPPETEER_CACHE_DIR) {
  process.env.PUPPETEER_CACHE_DIR = PUPPETEER_CACHE;
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

// Rutas de Chrome instalado por Puppeteer
const PUPPETEER_CHROME_PATHS = [
  path.join(PUPPETEER_CACHE, 'chrome', 'linux64', 'chrome-linux64', 'chrome'),
  path.join(PUPPETEER_CACHE, 'chrome', 'win64', 'chrome-win64', 'chrome.exe'),
  path.join(PUPPETEER_CACHE, 'chrome', 'mac64', 'chrome-mac', 'Chromium.app', 'Contents', 'MacOS', 'Chromium')
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
  ].filter(Boolean);

  let bundledPath;
  try {
    // puppeteer-core no tiene bundled Chrome, esto puede fallar
    bundledPath = puppeteer.executablePath();
  } catch {
    bundledPath = undefined;
  }

  const systemCandidates = process.platform === 'linux' ? SYSTEM_CHROME_CANDIDATES : [];
  const cacheCandidates = findChromeExecutablesInDir(PUPPETEER_CACHE);
  
  // Agregar rutas conocidas de Chrome instalado por Puppeteer
  const puppeteerChromePaths = PUPPETEER_CHROME_PATHS.filter(exists);

  const allCandidates = unique([...envCandidates, bundledPath, ...systemCandidates, ...cacheCandidates, ...puppeteerChromePaths].filter(Boolean));

  // Helpers: comprobar si es archivo ejecutable
  const isExecutableFile = (p) => {
    try {
      if (!exists(p)) return false;
      const stat = fs.statSync(p);
      if (!stat.isFile()) return false;
      if (process.platform === 'win32') return true; // .exe is OK
      // Verificar bit de ejecución
      fs.accessSync(p, fs.constants.X_OK);
      return true;
    } catch (err) {
      return false;
    }
  };

  const resolved = [];

  for (const candidate of allCandidates) {
    try {
      if (isExecutableFile(candidate)) {
        resolved.push(candidate);
        continue;
      }

      // Si es un directorio, buscar ejecutables dentro
      if (exists(candidate) && fs.statSync(candidate).isDirectory()) {
        const found = findChromeExecutablesInDir(candidate, 4).filter(isExecutableFile);
        resolved.push(...found);
        continue;
      }

      // Si existe pero no es ejecutable archivo, intentar fijar permisos (POSIX)
      if (exists(candidate) && process.platform !== 'win32') {
        try {
          // Intentar otorgar permiso ejecutable
          fs.chmodSync(candidate, 0o755);
          if (isExecutableFile(candidate)) {
            resolved.push(candidate);
            continue;
          }
        } catch (chmodErr) {
          // No pudo cambiar permisos, seguir
        }
      }
    } catch (err) {
      // ignorar candidato con error
    }
  }

  const final = unique(resolved).filter(isExecutableFile);
  console.log('🔍 Candidatos de Chrome ejecutables encontrados:', final);
  return final;
};

const buildLaunchAttempts = (primaryConfig, executableCandidates) => {
  const attempts = [];

  // Primero: intentar con la configuración primaria (puede tener executablePath específico)
  if (primaryConfig && typeof primaryConfig === 'object') {
    attempts.push({
      name: 'primary-config',
      options: { ...primaryConfig }
    });
  }

  // Segundo: intentar sin executablePath (usa el Chrome bundled de puppeteer)
  const modes = ['new', true];
  const argProfiles = [DEFAULT_ARGS, CONSTRAINED_ARGS];

  for (const headless of modes) {
    for (const args of argProfiles) {
      attempts.push({
        name: `headless-${String(headless)}-bundled`,
        options: {
          headless,
          args
          // SIN executablePath - usa el Chrome bundled de puppeteer
        }
      });
    }
  }

  // Tercero: intentar con cada executablePath conocido
  for (const executablePath of executableCandidates) {
    for (const headless of modes) {
      for (const args of argProfiles) {
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
  
  console.log(`🔍 [${serviceName}] Buscando Chrome. Candidatos:`, executableCandidates);
  
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
