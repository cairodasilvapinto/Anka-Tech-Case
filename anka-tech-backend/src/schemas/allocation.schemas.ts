// src/schemas/allocation.schemas.ts
import { z } from 'zod';

export const createAllocationBodySchema = z.object({
  assetName: z.string().min(1, { message: "O nome do ativo é obrigatório." }),
  quantity: z.number().positive({ message: "A quantidade deve ser um número positivo." }),
});
export type CreateAllocationBodyInput = z.infer<typeof createAllocationBodySchema>;

// Para parâmetros de rota como /allocations/:id
export const allocationIdParamsSchema = z.object({
  id: z.string().cuid({ message: "ID da alocação inválido." }),
});
export type AllocationIdParams = z.infer<typeof allocationIdParamsSchema>;

// Para parâmetros de rota como /clients/:clientId/allocations (reutilize se já existir)
// Se você já tem clientIdParamsSchema em client.schemas.ts, pode importá-lo.
// Caso contrário, defina-o aqui ou em um local compartilhado.
// Por enquanto, vamos assumir que você importará de client.schemas.ts.