# Usa Node.js 20 (versión LTS)
FROM node:20-slim

# Establece el directorio de trabajo
WORKDIR /app

# Instalar dependencias del sistema necesarias para Chromium/Headless
RUN apt-get update \
	&& apt-get install -y --no-install-recommends \
	   ca-certificates \
	   fonts-liberation \
	   libnss3 \
	   libatk1.0-0 \
	   libatk-bridge2.0-0 \
	   libcups2 \
	   libdrm2 \
	   libxss1 \
	   libxshmfence1 \
	   libasound2 \
	   libx11-6 \
	   libx11-xcb1 \
	   libxcomposite1 \
	   libxdamage1 \
	   libxrandr2 \
	   libgbm1 \
	   libgtk-3-0 \
	   libxkbcommon0 \
	&& rm -rf /var/lib/apt/lists/*

# Copiar archivos de dependencias primero para aprovechar cache de Docker
COPY package*.json ./

# Asegurar que Puppeteer descargue Chromium durante npm install
# ✅ Instalar Chromium y configurar Puppeteer
RUN apt-get update && apt-get install -y chromium \
    && rm -rf /var/lib/apt/lists/*

# ✅ Variables críticas para Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV CHROME_BIN=/usr/bin/chromium

# Instala las dependencias de producción
RUN npm ci --only=production
# Copia el resto del código fuente del backend
COPY . .

# Cloud Run provee el puerto en la variable PORT, exponer 8080 por convención
ENV PORT=8080
EXPOSE 8080

# Inicia la aplicación
CMD ["node", "index.js"]
