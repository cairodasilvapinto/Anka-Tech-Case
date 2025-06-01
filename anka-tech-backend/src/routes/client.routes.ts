import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../lib/prisma';
import {
  createClientSchema,
  CreateClientInput,
  updateClientSchema,
  UpdateClientInput,
  clientIdParamsSchema,       // Para rotas /clients/:id
  ClientIdParams,
  clientIdSpecificParamsSchema, // Para rotas /clients/:clientId/...
  ClientIdSpecificParams,
} from '../schemas/client.schemas'; // Seus schemas de cliente
import {
  createAllocationBodySchema,
  CreateAllocationBodyInput,
  allocationIdParamsSchema,
  AllocationIdParams,
} from '../schemas/allocation.schemas'; // Seus schemas de alocação
import { getFixedAssets } from '../lib/fixedAssets';

export async function clientRoutes(fastify: FastifyInstance) {
  // --- ROTAS CRUD DE CLIENTES ---

  fastify.post<{ Body: CreateClientInput }>(
    '/clients',
    { schema: { body: createClientSchema } },
    async (request: FastifyRequest<{ Body: CreateClientInput }>, reply: FastifyReply) => {
      try {
        const client = await prisma.client.create({
          data: request.body,
        });
        return reply.status(201).send(client);
      } catch (error: any) {
        if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
          return reply.status(409).send({ message: 'Este email já está em uso.' });
        }
        fastify.log.error(error, "Erro ao criar cliente.");
        return reply.status(500).send({ message: 'Erro interno ao criar cliente.' });
      }
    }
  );

  fastify.get(
    '/clients',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const clients = await prisma.client.findMany({
          orderBy: { createdAt: 'desc' } // Opcional: listar os mais recentes primeiro
        });
        return reply.status(200).send(clients);
      } catch (error) {
        fastify.log.error(error, "Erro ao listar clientes.");
        return reply.status(500).send({ message: 'Erro interno ao listar clientes.' });
      }
    }
  );

  fastify.get<{ Params: ClientIdParams }>(
    '/clients/:id',
    { schema: { params: clientIdParamsSchema } },
    async (request: FastifyRequest<{ Params: ClientIdParams }>, reply: FastifyReply) => {
      try {
        const { id } = request.params;
        const client = await prisma.client.findUnique({
          where: { id },
        });
        if (!client) {
          return reply.status(404).send({ message: 'Cliente não encontrado.' });
        }
        return reply.status(200).send(client);
      } catch (error) {
        fastify.log.error(error, "Erro ao buscar cliente por ID.");
        return reply.status(500).send({ message: 'Erro interno ao buscar cliente.' });
      }
    }
  );

  fastify.put<{ Body: UpdateClientInput; Params: ClientIdParams }>(
    '/clients/:id',
    { schema: { body: updateClientSchema, params: clientIdParamsSchema } },
    async (request: FastifyRequest<{ Body: UpdateClientInput; Params: ClientIdParams }>, reply: FastifyReply) => {
      try {
        const { id } = request.params;
        const client = await prisma.client.update({
          where: { id },
          data: request.body,
        });
        return reply.status(200).send(client);
      } catch (error: any) {
        if (error.code === 'P2025') {
          return reply.status(404).send({ message: 'Cliente não encontrado para atualização.' });
        }
        if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
          return reply.status(409).send({ message: 'Este email já está em uso por outro cliente.' });
        }
        fastify.log.error(error, "Erro ao atualizar cliente.");
        return reply.status(500).send({ message: 'Erro interno ao atualizar cliente.' });
      }
    }
  );

  fastify.delete<{ Params: ClientIdParams }>(
    '/clients/:id',
    { schema: { params: clientIdParamsSchema } },
    async (request: FastifyRequest<{ Params: ClientIdParams }>, reply: FastifyReply) => {
      try {
        const { id } = request.params;
        // O Prisma lança P2025 se o registro não existir, tratado no catch
        await prisma.client.delete({
          where: { id },
        });
        return reply.status(204).send();
      } catch (error: any) {
        if (error.code === 'P2025') {
          return reply.status(404).send({ message: 'Cliente não encontrado para exclusão.' });
        }
        fastify.log.error(error, 'Erro ao excluir cliente');
        return reply.status(500).send({ message: 'Erro interno ao tentar excluir o cliente.' });
      }
    }
  );

  // --- NOVAS ROTAS PARA ALOCAÇÕES DE ATIVOS POR CLIENTE ---

  // POST /api/clients/:clientId/allocations - Adicionar uma alocação a um cliente
  fastify.post<{ Params: ClientIdSpecificParams; Body: CreateAllocationBodyInput }>(
    '/clients/:clientId/allocations',
    { schema: { params: clientIdSpecificParamsSchema, body: createAllocationBodySchema } },
    async (request, reply) => {
      try { // <--- Bloco try adicionado para envolver toda a lógica
        const { clientId } = request.params;
        const { assetName, quantity } = request.body;

        const clientExists = await prisma.client.findUnique({ where: { id: clientId } });
        if (!clientExists) {
          return reply.status(404).send({ message: "Cliente não encontrado." });
        }

        const fixedAssets = getFixedAssets();
        if (!fixedAssets.some(asset => asset.name === assetName)) {
          return reply.status(400).send({ message: `Ativo '${assetName}' inválido ou não encontrado na lista de ativos permitidos.` });
        }

        const newAllocation = await prisma.clientAssetAllocation.create({
          data: {
            clientId: clientId,
            assetName,
            quantity,
          },
        });
        return reply.status(201).send(newAllocation);
      } catch (error) { // <--- Bloco catch correspondente
        fastify.log.error(error, "Erro ao criar alocação para o cliente.");
        return reply.status(500).send({ message: 'Erro interno ao criar alocação.' });
      }
    }
  );

  // GET /api/clients/:clientId/allocations - Listar alocações de um cliente
  fastify.get<{ Params: ClientIdSpecificParams }>(
    '/clients/:clientId/allocations',
    { schema: { params: clientIdSpecificParamsSchema } },
    async (request, reply) => {
      try { // <--- Bloco try já estava correto, mas garantindo que envolva tudo
        const { clientId } = request.params;
        const allocations = await prisma.clientAssetAllocation.findMany({
          where: { clientId },
          orderBy: { allocatedAt: 'desc' }
        });

        const fixedAssets = getFixedAssets();
        const enrichedAllocations = allocations.map(alloc => {
          const assetDetail = fixedAssets.find(fa => fa.name === alloc.assetName);
          const currentAssetValue = assetDetail ? assetDetail.value : 0;
          return {
            ...alloc,
            currentAssetValue,
            totalValue: currentAssetValue * alloc.quantity,
          };
        });

        return reply.send(enrichedAllocations);
      } catch (error) {
        fastify.log.error(error, "Erro ao buscar alocações do cliente.");
        return reply.status(500).send({ message: 'Erro interno ao buscar alocações.' });
      }
    }
  );

  // DELETE /api/allocations/:id - Remover uma alocação específica
  fastify.delete<{ Params: AllocationIdParams }>(
    '/allocations/:id',
    { schema: { params: allocationIdParamsSchema } },
    async (request, reply) => {
      try {
        const { id } = request.params;
        // O Prisma lança P2025 se o registro não existir, tratado no catch
        await prisma.clientAssetAllocation.delete({
          where: { id },
        });
        return reply.status(204).send();
      } catch (error: any) {
        if (error.code === 'P2025') {
          return reply.status(404).send({ message: 'Alocação não encontrada.' });
        }
        fastify.log.error(error, "Erro ao remover alocação.");
        return reply.status(500).send({ message: 'Erro interno ao remover alocação.' });
      }
    }
  );
}