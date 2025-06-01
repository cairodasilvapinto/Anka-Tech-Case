// src/routes/asset.routes.ts
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getFixedAssets } from '../lib/fixedAssets';

export async function assetRoutes(fastify: FastifyInstance) {
  fastify.get('/assets', async (request: FastifyRequest, reply: FastifyReply) => {
    const fixedAssets = getFixedAssets();
    return reply.status(200).send(fixedAssets);
  });
}