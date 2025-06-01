# Anka-Tech-Case/anka-tech-backend/Dockerfile

FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY prisma ./prisma/
# Copie o entrypoint.sh para dentro da imagem
COPY entrypoint.sh /usr/src/app/entrypoint.sh
RUN chmod +x /usr/src/app/entrypoint.sh

COPY . .

RUN npx prisma generate

EXPOSE 3001

# Define o entrypoint para ser o nosso script
ENTRYPOINT ["/usr/src/app/entrypoint.sh"]
# O CMD agora será passado como argumento para o entrypoint.sh
CMD ["npm", "run", "dev"]
# For production, you'd have a build step:
# FROM development AS build
# RUN npm run build
# FROM node:18-alpine AS production
# WORKDIR /usr/src/app
# COPY --from=build /usr/src/app/dist ./dist
# COPY --from=build /usr/src/app/node_modules ./node_modules
# COPY --from=build /usr/src/app/prisma ./prisma
# COPY package*.json ./
# EXPOSE 3001
# CMD ["node", "dist/server.js"]