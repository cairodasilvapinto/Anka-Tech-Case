import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

export async function assetRoutes(fastify: FastifyInstance) {
  // Endpoint que retorna uma lista fixa de ativos financeiros com valores estáticos [cite: 7]
  fastify.get('/assets', async (request: FastifyRequest, reply: FastifyReply) => {
    const fixedAssets = [
      { name: 'Ação XYZ', value: 150.75 },
      { name: 'Fundo ABC', value: 320.50 },
      { name: 'Tesouro Direto IPCA+ 2045', value: 105.22 },
      { name: 'CDB Liquidez Diária BankX', value: 100.00 },
    ];
    return reply.status(200).send(fixedAssets);
  });
}