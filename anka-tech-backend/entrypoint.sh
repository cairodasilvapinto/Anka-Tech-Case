#!/bin/sh

# Sai imediatamente se um comando falhar
set -e

# Executa as migrações do Prisma
echo "Applying database migrations..."
npx prisma migrate deploy

# Executa o comando original passado para o contêiner (o CMD do Dockerfile)
echo "Starting the application..."
exec "$@"