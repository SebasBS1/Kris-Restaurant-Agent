# Definir versión de Node con el fin de armar la API para optimización.
FROM node:18-alpine AS builder

# Directorio.
WORKDIR /app

# Hacer una copia de los archivos del paquete.
COPY package*.json ./

# Instalar todas las dependencias.
RUN npm ci

# Hacer una copia del código fuente.
COPY . .

# Armar la API
RUN npm run build

# Producción.
FROM node:18-alpine AS runner

# Directorio de trabajo.
WORKDIR /app

# Usuario que no es de raíz (non-root).
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 tooluser

# Copiar package.json.
COPY package*.json ./
RUN npm ci --omit=dev

# Hacer una copia de la API armada.
COPY --from=builder --chown=tooluser:nodejs /app/dist ./dist

# Escoger el usuario que no es de raíz.
USER tooluser

# Puerto (variable de entorno).
ENV PORT=3000

# Exponer el puerto.
EXPOSE 3000

# Revisar la "salud" del agente.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Correr la API.
CMD ["npm", "start"]