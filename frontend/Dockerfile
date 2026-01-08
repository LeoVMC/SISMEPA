FROM node:20-alpine

WORKDIR /app

# Copiar archivos de dependencias primero (mejor cache de Docker)
COPY package*.json ./

# Instalar dependencias y limpiar cache de esbuild
RUN npm install --legacy-peer-deps && \
    rm -rf node_modules/.cache && \
    npm rebuild esbuild

# Copiar el resto del código
COPY . .

# Puerto que usa Vite (configurado en vite.config.js)
EXPOSE 3000

# Comando para desarrollo (--host permite acceso externo al container)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
