import { z } from 'zod';
export const ClientStatusEnum = z.enum(['ACTIVE', 'INACTIVE']);
export const createClientSchema = z.object({
  name: z.string().min(1, { message: "O nome não pode estar vazio" }),
  email: z.string().email({ message: "Formato de email inválido" }),
  status: ClientStatusEnum.optional().default('ACTIVE'),
});

// TypeScript type inferido a partir do schema de criação
export type CreateClientInput = z.infer<typeof createClientSchema>;

// Schema para a atualização de um cliente existente
// Todos os campos são opcionais, pois o usuário pode querer atualizar apenas um deles
export const updateClientSchema = z.object({
  name: z.string().min(1, { message: "O nome não pode estar vazio" }).optional(),
  email: z.string().email({ message: "Formato de email inválido" }).optional(),
  status: ClientStatusEnum.optional(),
});

// TypeScript type inferido a partir do schema de atualização
export type UpdateClientInput = z.infer<typeof updateClientSchema>;

// Schema para validar parâmetros de rota que esperam um ID de cliente
// Útil para rotas como GET /clients/:id ou PUT /clients/:id
export const clientIdParamsSchema = z.object({
  id: z.string().cuid({ message: "Formato de CUID inválido para o ID" }), // O ID deve ser uma string no formato CUID (usado pelo Prisma)
});

export type ClientIdParams = z.infer<typeof clientIdParamsSchema>;