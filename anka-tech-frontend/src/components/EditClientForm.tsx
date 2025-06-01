// src/components/EditClientForm.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { AxiosError } from "axios";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DialogFooter, DialogClose } from "@/components/ui/dialog";

// USA A VARIÁVEL DE AMBIENTE COM FALLBACK
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

const editClientFormSchema = z.object({
  name: z.string().min(1, { message: "O nome não pode estar vazio." }),
  email: z.string().email({ message: "Formato de email inválido." }),
  status: z.enum(["ACTIVE", "INACTIVE"], {
    required_error: "Você precisa selecionar um status.",
  }),
});

type EditClientFormValues = z.infer<typeof editClientFormSchema>;

interface Client {
  id: string;
  name: string;
  email: string;
  status: "ACTIVE" | "INACTIVE";
}

interface EditClientFormProps {
  client: Client;
  onSuccess: () => void;
}

const updateClient = async ({ id, data }: { id: string; data: EditClientFormValues }) => {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_URL não está definida");
  }
  const response = await axios.put(`${API_BASE_URL}/clients/${id}`, data);
  return response.data;
};

export function EditClientForm({ client, onSuccess }: EditClientFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<EditClientFormValues>({
    resolver: zodResolver(editClientFormSchema),
    defaultValues: {
      name: client.name || "",
      email: client.email || "",
      status: client.status || "ACTIVE",
    },
  });

  const mutation = useMutation({
    mutationFn: (values: EditClientFormValues) => updateClient({ id: client.id, data: values }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      onSuccess();
      alert("Cliente atualizado com sucesso!");
    },
onError: (error: unknown) => { // Ou (error: Error) ou (error: AxiosError)
  const axiosError = error as import("axios").AxiosError;
  console.error("Objeto de erro completo do Axios (Atualizar):", axiosError);
  if (axiosError.response) {
    alert(
      `Erro ${axiosError.response.status}: ${
        (axiosError.response.data && typeof axiosError.response.data === "object" && "message" in axiosError.response.data
          ? (axiosError.response.data as { message?: string }).message
          : undefined
        ) || 'Erro ao atualizar o cliente.'}`
    );
  } else if (axiosError.request) {
    alert("Erro de rede ao atualizar: Nenhuma resposta recebida do servidor.");
  } else {
    alert(`Erro ao configurar requisição de atualização: ${axiosError.message}`);
  }
},
  });

  function onSubmit(data: EditClientFormValues) {
    mutation.mutate(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Nome completo do cliente" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="email@exemplo.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ACTIVE">Ativo</SelectItem>
                  <SelectItem value="INACTIVE">Inativo</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter className="pt-4">
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={onSuccess}> {/* Simplesmente fecha o modal */}
              Cancelar
            </Button>
          </DialogClose>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}