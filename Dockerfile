# 1. Build aşaması
FROM node:18 AS builder
WORKDIR /app

# package.json ve package-lock.json'u kopyala
COPY package*.json ./

# Bağımlılıkları yükle
RUN npm install

# next komutunun çalışması için PATH ayarla
ENV PATH /app/node_modules/.bin:$PATH

# Proje dosyalarını kopyala
COPY . .

# Dosya izinlerini düzelt
RUN chmod -R 755 /app

# Build et
RUN npm run build

# 2. Production aşaması
FROM node:18 AS runner
WORKDIR /app

# Gerekli production dosyalarını kopyala
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/.env.production ./.env.production

# Port ayarı
EXPOSE 3000

# Başlat
CMD ["npm", "start"]
