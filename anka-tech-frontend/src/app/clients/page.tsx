// src/app/clients/page.tsx
"use client";
import { AxiosError } from "axios";
import React, { useState } from "react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { EditClientForm } from "@/components/EditClientForm"; // Certifique-se que este caminho está correto
import { AddClientForm } from "@/components/AddClientForm";   // Certifique-se que este caminho está correto

// Definindo o tipo para um Cliente
interface Client {
  id: string;
  name: string;
  email: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
}

// USA A VARIÁVEL DE AMBIENTE COM FALLBACK
console.log("API URL USADA NO CLIENTE:", process.env.NEXT_PUBLIC_API_URL);
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
// Função que busca os clientes
const fetchClients = async (): Promise<Client[]> => {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_URL não está definida");
  }
  const { data } = await axios.get(`${API_BASE_URL}/clients`);
  return data;
};

// Função para deletar um cliente
const deleteClient = async (clientId: string) => {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_URL não está definida");
  }
  await axios.delete(`${API_BASE_URL}/clients/${clientId}`);
};

export default function ClientsPage() {
  const queryClient = useQueryClient();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const {
    data: clients,
    isLoading,
    isError,
    error,
  } = useQuery<Client[], Error>({
    queryKey: ["clients"],
    queryFn: fetchClients,
  });

  const mutationDelete = useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      alert("Cliente excluído com sucesso!");
    },
  onError: (error: unknown) => { // Ou (error: Error) ou (error: AxiosError) se importar AxiosError
    // Se usar unknown ou Error genérico, pode precisar de type assertion ou type guard para acessar error.response
    // Use AxiosError para tipar corretamente o erro
    const axiosError = error as AxiosError<{ message?: string }>;
    console.error("Objeto de erro completo do Axios (Excluir):", axiosError);
    if (axiosError.response) {
      alert(`Erro ${axiosError.response.status}: ${axiosError.response.data?.message || 'Erro ao excluir o cliente.'}`);
    } else if (axiosError.request) {
      alert("Erro de rede ao excluir: Nenhuma resposta recebida do servidor.");
    } else {
      alert(`Erro ao configurar requisição de exclusão: ${axiosError.message}`);
    }
  },
  });

  const handleEditClick = (client: Client) => {
    setSelectedClient(client);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (clientId: string) => {
    if (window.confirm("Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.")) {
      mutationDelete.mutate(clientId);
    }
  };

  const handleOpenAddClientModal = () => {
    setIsAddDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold">Meus Clientes</h1>
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px] md:w-[250px]">Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead className="hidden lg:table-cell">Criado Em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(3)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell className="hidden lg:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell className="text-right space-x-2">
                    <Skeleton className="h-8 w-16 inline-block" />
                    <Skeleton className="h-8 w-16 inline-block" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-4">Meus Clientes</h1>
        <p className="text-red-600 bg-red-100 p-4 rounded-md">
          Erro ao buscar clientes: {error?.message || "Erro desconhecido"}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Meus Clientes</h1>
        <Button onClick={handleOpenAddClientModal}>
          Adicionar Novo Cliente
        </Button>
      </div>

      {clients && clients.length > 0 ? (
        <div className="border rounded-md">
          <Table>
            <TableCaption>Uma lista dos seus clientes.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px] md:w-[250px]">Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead className="hidden lg:table-cell">Criado Em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium break-all">{client.name}</TableCell>
                  <TableCell className="break-all">{client.email}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        client.status === "ACTIVE"
                          ? "bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100"
                          : "bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-100"
                      }`}
                    >
                      {client.status === "ACTIVE" ? "Ativo" : "Inativo"}
                    </span>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {new Date(client.createdAt).toLocaleDateString("pt-BR", {
                      day: '2-digit', month: '2-digit', year: 'numeric'
                    })}
                  </TableCell>
                  <TableCell className="text-right space-x-2 whitespace-nowrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(client)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteClick(client.id)}
                      disabled={mutationDelete.isPending && mutationDelete.variables === client.id}
                    >
                      {mutationDelete.isPending && mutationDelete.variables === client.id ? "Excluindo..." : "Excluir"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500">Nenhum cliente encontrado.</p>
          <p className="text-sm text-gray-400 mt-2">Comece adicionando um novo cliente.</p>
        </div>
      )}

      {/* Modal de Edição */}
      {selectedClient && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px] md:max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Cliente</DialogTitle>
              <DialogDescription>
                Faça alterações nos dados do cliente aqui. Clique em salvar quando terminar.
              </DialogDescription>
            </DialogHeader>
            <EditClientForm
              client={selectedClient}
              onSuccess={() => {
                setIsEditDialogOpen(false);
                setSelectedClient(null);
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Modal de Adicionar Novo Cliente */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px] md:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Cliente</DialogTitle>
            <DialogDescription>
              Preencha os dados abaixo para cadastrar um novo cliente.
            </DialogDescription>
          </DialogHeader>
          <AddClientForm
            onSuccess={() => {
              setIsAddDialogOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}