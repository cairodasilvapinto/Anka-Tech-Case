import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../lib/prisma'; // Nossa instância do Prisma Client
import {
  createClientSchema,
  CreateClientInput,
  updateClientSchema,
  UpdateClientInput,
  clientIdParamsSchema,
  ClientIdParams,
} from '../schemas/client.schemas'; // Nossos schemas Zod para validação

export async function clientRoutes(fastify: FastifyInstance) {
  // Rota para CRIAR um novo cliente
  fastify.post<{ Body: CreateClientInput }>(
    '/clients',
    {
      schema: {
        body: createClientSchema, // Valida o corpo da requisição com o schema Zod
        // Opcional: definir um schema de resposta para documentação/validação
        // response: {
        //   201: { $ref: 'clientResponseSchema#' } // Supondo um schema de resposta definido
        // }
      },
    },
    async (request: FastifyRequest<{ Body: CreateClientInput }>, reply: FastifyReply) => {
      try {
        const client = await prisma.client.create({
          data: request.body, // Os dados já foram validados pelo Zod
        });
        return reply.status(201).send(client);
      } catch (error: any) {
        if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
          // Código P2002 do Prisma indica violação de constraint única (ex: email duplicado)
          return reply.status(409).send({ message: 'Este email já está em uso.' });
        }
        fastify.log.error(error); // Loga o erro no console do Fastify
        return reply.status(500).send({ message: 'Erro interno no servidor' });
      }
    }
  );

  // Rota para LISTAR todos os clientes
  fastify.get(
    '/clients',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const clients = await prisma.client.findMany();
        return reply.status(200).send(clients);
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ message: 'Erro interno no servidor' });
      }
    }
  );

  // Rota para BUSCAR um cliente específico pelo ID
  fastify.get<{ Params: ClientIdParams }>(
    '/clients/:id',
    {
      schema: {
        params: clientIdParamsSchema, // Valida se o ID na URL está no formato CUID
      },
    },
    async (request: FastifyRequest<{ Params: ClientIdParams }>, reply: FastifyReply) => {
      try {
        const { id } = request.params;
        const client = await prisma.client.findUnique({
          where: { id },
        });
        if (!client) {
          return reply.status(404).send({ message: 'Cliente não encontrado' });
        }
        return reply.status(200).send(client);
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ message: 'Erro interno no servidor' });
      }
    }
  );

  // Rota para EDITAR (Atualizar) um cliente existente pelo ID
  fastify.put<{ Body: UpdateClientInput; Params: ClientIdParams }>(
    '/clients/:id',
    {
      schema: {
        body: updateClientSchema, // Valida o corpo da requisição
        params: clientIdParamsSchema, // Valida o ID na URL
      },
    },
    async (request: FastifyRequest<{ Body: UpdateClientInput; Params: ClientIdParams }>, reply: FastifyReply) => {
      try {
        const { id } = request.params;
        const client = await prisma.client.update({
          where: { id },
          data: request.body, // Dados para atualização (validados pelo Zod)
        });
        return reply.status(200).send(client);
      } catch (error: any) {
        if (error.code === 'P2025') {
          // P2025: Registro a ser atualizado não encontrado
          return reply.status(404).send({ message: 'Cliente não encontrado para atualização' });
        }
        if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
          return reply.status(409).send({ message: 'Este email já está em uso por outro cliente.' });
        }
        fastify.log.error(error);
        return reply.status(500).send({ message: 'Erro interno no servidor' });
      }
    }
  );
  // Rota para DELETAR um cliente pelo ID
  fastify.delete<{ Params: ClientIdParams }>(
  '/clients/:id',
  {
    schema: {
      params: clientIdParamsSchema, // Valida o ID
    },
  },
  async (request: FastifyRequest<{ Params: ClientIdParams }>, reply: FastifyReply) => {
    try {
      const { id } = request.params;
      const clientExists = await prisma.client.findUnique({ where: { id } });
      if (!clientExists) {
        return reply.status(404).send({ message: 'Cliente não encontrado para exclusão' });
      }
      await prisma.client.delete({
        where: { id },
      });
      return reply.status(204).send(); // Sucesso na deleção
    } catch (error: any) {
      if (error.code === 'P2025') { 
        return reply.status(404).send({ message: 'Cliente não encontrado para exclusão (Erro Prisma P2025)' });
      }
      fastify.log.error(error, 'Erro ao excluir cliente');
      return reply.status(500).send({ message: 'Erro interno no servidor ao tentar excluir o cliente.' });
    }
  }
);
  // Você pode adicionar um schema de resposta compartilhado aqui se desejar, para referência em 'response'
  // fastify.addSchema({
  //   $id: 'clientResponseSchema',
  //   type: 'object',
  //   properties: {
  //     id: { type: 'string' },
  //     name: { type: 'string' },
  //     email: { type: 'string' },
  //     status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
  //     createdAt: { type: 'string', format: 'date-time' },
  //     updatedAt: { type: 'string', format: 'date-time' },
  //   }
  // });
}