// src/app/clients/[clientId]/allocations/page.tsx
"use client";

import React from "react"; // Removido useState se não for usado diretamente aqui
import Link from "next/link";
import { useParams } from "next/navigation";
import axios, { AxiosError } from "axios"; // Importado AxiosError
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label"; // Removido se FormLabel for usado
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  // TableCaption, // Removido se não for usado
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Trash2, Plus } from "lucide-react";

// Tipos
interface Client {
  id: string;
  name: string;
  email: string;
  status: "ACTIVE" | "INACTIVE";
}

interface FixedAsset {
  name: string;
  value: number;
}

interface ClientAllocation {
  id: string;
  assetName: string;
  quantity: number;
  clientId: string;
  allocatedAt: string;
  currentAssetValue: number;
  totalValue: number;
}

const addAllocationFormSchema = z.object({
  assetName: z.string().min(1, { message: "Selecione um ativo." }),
  quantity: z.coerce.number().positive({ message: "Quantidade deve ser positiva." }),
});
type AddAllocationFormValues = z.infer<typeof addAllocationFormSchema>;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

// Funções de fetch e mutation
const fetchClientDetails = async (clientId: string): Promise<Client> => {
  if (!API_BASE_URL || !clientId) throw new Error("Client ID ou API URL não definidos para fetchClientDetails");
  const { data } = await axios.get(`${API_BASE_URL}/clients/${clientId}`);
  return data;
};

const fetchClientAllocations = async (clientId: string): Promise<ClientAllocation[]> => {
  if (!API_BASE_URL || !clientId) throw new Error("Client ID ou API URL não definidos para fetchClientAllocations");
  const { data } = await axios.get(`${API_BASE_URL}/clients/${clientId}/allocations`);
  return data;
};

const fetchAvailableAssets = async (): Promise<FixedAsset[]> => {
  if (!API_BASE_URL) throw new Error("API URL não definida para fetchAvailableAssets");
  const { data } = await axios.get(`${API_BASE_URL}/assets`);
  return data;
};

const createAllocation = async ({ clientId, allocationData }: { clientId: string; allocationData: AddAllocationFormValues }) => {
  if (!API_BASE_URL || !clientId) throw new Error("Client ID ou API URL não definidos para createAllocation");
  const { data } = await axios.post(`${API_BASE_URL}/clients/${clientId}/allocations`, allocationData);
  return data;
};

const removeAllocation = async (allocationId: string) => { // allocationId é usado aqui
  if (!API_BASE_URL || !allocationId) throw new Error("Allocation ID ou API URL não definidos para removeAllocation");
  await axios.delete(`${API_BASE_URL}/allocations/${allocationId}`);
};

export default function ClientAllocationsPage() {
  const params = useParams();
  const clientId = params.clientId as string; // Assegura que clientId é string

  const queryClient = useQueryClient();

  const { data: client, isLoading: isLoadingClient } = useQuery<Client, Error>({
    queryKey: ["clientDetails", clientId],
    queryFn: () => fetchClientDetails(clientId), // clientId é usado aqui
    enabled: !!clientId,
  });

  const { data: allocations, isLoading: isLoadingAllocations } = useQuery<ClientAllocation[], Error>({ // Removido refetchAllocations se não usado
    queryKey: ["clientAllocations", clientId],
    queryFn: () => fetchClientAllocations(clientId), // clientId é usado aqui
    enabled: !!clientId,
  });

  const { data: availableAssets, isLoading: isLoadingAvailableAssets } = useQuery<FixedAsset[], Error>({
    queryKey: ["availableAssets"],
    queryFn: fetchAvailableAssets, // Não precisa de clientId aqui
  });

  const addAllocationMutation = useMutation({
    mutationFn: (data: AddAllocationFormValues) => createAllocation({ clientId, allocationData: data }), // clientId é usado aqui
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientAllocations", clientId] });
      alert("Alocação adicionada com sucesso!");
      form.reset({ assetName: "", quantity: 0 });
    },
    onError: (error: unknown) => { // CORRIGIDO para unknown
      const axiosError = error as AxiosError<any>; // Asserção de tipo
      console.error("Erro ao adicionar alocação:", axiosError.response || axiosError.message);
      alert(axiosError.response?.data?.message || "Erro ao adicionar alocação.");
    },
  });

  const removeAllocationMutation = useMutation({
    mutationFn: removeAllocation, // removeAllocation usa seu parâmetro allocationId
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientAllocations", clientId] });
      alert("Alocação removida com sucesso!");
    },
    onError: (error: unknown) => { // CORRIGIDO para unknown
      const axiosError = error as AxiosError<any>; // Asserção de tipo
      console.error("Erro ao remover alocação:", axiosError.response || axiosError.message);
      alert(axiosError.response?.data?.message || "Erro ao remover alocação.");
    },
  });

  const form = useForm<AddAllocationFormValues>({
    resolver: zodResolver(addAllocationFormSchema),
    defaultValues: {
      assetName: "",
      quantity: 0,
    },
  });

  function onSubmitAllocation(data: AddAllocationFormValues) {
    addAllocationMutation.mutate(data); // onSuccess do mutation já limpa o form
  }

  const handleRemoveAllocation = (allocationId: string) => {
    if (window.confirm("Tem certeza que deseja remover esta alocação?")) {
      removeAllocationMutation.mutate(allocationId);
    }
  };
  
  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  if (isLoadingClient || !clientId) { // Adicionada verificação para clientId também
    return (
      <div className="container mx-auto p-6 text-center">
        <Skeleton className="h-8 w-1/2 mx-auto mb-4" />
        <Skeleton className="h-6 w-1/4 mx-auto" />
      </div>
    );
  }
  // Se client não for encontrado após o carregamento (isErrorCliente pode ser verificado aqui)
  if (!client && !isLoadingClient) {
      return (
          <div className="container mx-auto p-6 text-center">
              <p className="text-red-500">Cliente não encontrado ou ID inválido.</p>
              <Link href="/clients">
                  <Button variant="link" className="mt-4">Voltar para Clientes</Button>
              </Link>
          </div>
      );
  }


  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Link href="/clients">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Clientes
          </Button>
        </Link>
      </div>

      {client && ( // Adicionada verificação para client antes de usá-lo
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Alocações de {client.name}</CardTitle>
            <CardDescription>{client.email}</CardDescription>
          </CardHeader>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Adicionar Nova Alocação</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitAllocation)} className="grid sm:grid-cols-3 gap-4 items-end">
              <FormField
                control={form.control}
                name="assetName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ativo</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingAvailableAssets}> {/* Adicionado value={field.value} */}
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={isLoadingAvailableAssets ? "Carregando..." : "Selecione um ativo"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableAssets?.map((asset) => (
                          <SelectItem key={asset.name} value={asset.name}>
                            {asset.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} min="0.01" step="0.01" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={addAllocationMutation.isPending} className="sm:self-end">
                <Plus className="mr-2 h-4 w-4" />
                {addAllocationMutation.isPending ? "Adicionando..." : "Adicionar"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alocações Atuais</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingAllocations ? (
            <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
          ) : allocations && allocations.length > 0 ? (
            <Table>
              {/* Removido TableCaption se não for necessário para o linter */}
              <TableHeader>
                <TableRow>
                  <TableHead>Ativo</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Valor Unit. Atual</TableHead>
                  <TableHead>Valor Total Alocado</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allocations.map((alloc) => (
                  <TableRow key={alloc.id}>
                    <TableCell className="font-medium">{alloc.assetName}</TableCell>
                    <TableCell>{alloc.quantity}</TableCell>
                    <TableCell>{formatCurrency(alloc.currentAssetValue)}</TableCell>
                    <TableCell>{formatCurrency(alloc.totalValue)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveAllocation(alloc.id)} // allocationId é usado aqui
                        disabled={removeAllocationMutation.isPending && removeAllocationMutation.variables === alloc.id}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-gray-500 py-4">Nenhuma alocação para este cliente.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}