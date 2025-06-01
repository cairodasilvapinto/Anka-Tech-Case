# Anka-Tech-Case/anka-tech-frontend/Dockerfile

# Estágio de Build
FROM node:20-alpine3.19 AS builder
WORKDIR /app

# Copia package.json e lock file
COPY package*.json ./

# Instala dependências
RUN npm install

# Copia o restante do código do frontend
COPY . .

# Argumento para a URL da API (para ser usado durante o build)
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Builda a aplicação Next.js
RUN npm run build

# Estágio de Produção/Execução
FROM node:20-alpine3.19 AS runner
WORKDIR /app

# Define o ambiente para produção
ENV NODE_ENV=production

# Copia os arquivos de build do estágio anterior
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts
# (Opcional, mas recomendado) Instalar apenas dependências de produção se 'next start' precisar delas
RUN npm install --omit=dev
# Se o seu 'next start' não precisar de node_modules (comum com standalone output), pode pular.
# Para uma imagem menor, você pode usar o output 'standalone' do Next.js
# e copiar apenas a pasta .next/standalone.

EXPOSE 3000

# Como iniciar a aplicação
CMD ["npm", "start"]