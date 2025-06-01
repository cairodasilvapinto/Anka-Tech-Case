// src/server.ts (do backend)
import Fastify, { FastifyInstance } from 'fastify';
import { ZodError } from 'zod';
import { clientRoutes } from './routes/client.routes';
import { assetRoutes } from './routes/asset.routes';
import { prisma } from './lib/prisma';
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from 'fastify-type-provider-zod'; // <--- IMPORTE
import cors from '@fastify/cors';

// CRIE A INSTÂNCIA DO FASTIFY COM O TYPE PROVIDER
const server = Fastify({
  logger: true,
}).withTypeProvider<ZodTypeProvider>();

// CONFIGURE O VALIDADOR E SERIALIZADOR DO ZOD
server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);

server.setErrorHandler(function (error, request, reply) {
  if (error instanceof ZodError) {
    server.log.error(error);
    return reply.status(400).send({
      message: 'Erro de validação nos dados da requisição.',
      errors: error.flatten().fieldErrors,
    });
  } else {
    server.log.error(error);
    // Se for um erro do Fastify com código de status de validação, respeite-o
    if (error.validation) {
       return reply.status(400).send({ message: 'Erro de validação.', details: error.validation });
    }
    return reply.status(500).send({ message: 'Erro interno no servidor' });
  }
});

server.register(clientRoutes, { prefix: '/api' });
server.register(assetRoutes, { prefix: '/api' });

const start = async () => {
  try {
    await server.register(cors, {
      origin: "*", // Para desenvolvimento. Em produção: "http://localhost:3000" ou seu domínio
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Seja explícito aqui
      allowedHeaders: ['Content-Type', 'Authorization'], // Cabeçalhos comuns
    });

    await prisma.$connect();
    server.log.info('Conexão com o banco de dados estabelecida com sucesso.');

    const address = await server.listen({ port: 3001, host: '0.0.0.0' });
    server.log.info(`Servidor escutando em ${address}`);

  } catch (err) {
    server.log.error(err);
    await prisma.$disconnect();
    process.exit(1);
  }
};

start();