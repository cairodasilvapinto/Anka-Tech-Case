// src/components/AddClientForm.tsx
"use client";
import { AxiosError } from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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

const addClientFormSchema = z.object({
  name: z.string().min(1, { message: "O nome não pode estar vazio." }),
  email: z.string().email({ message: "Formato de email inválido." }),
  status: z.enum(["ACTIVE", "INACTIVE"], {
    required_error: "Você precisa selecionar um status.",
  }),
});

type AddClientFormValues = z.infer<typeof addClientFormSchema>;

interface AddClientFormProps {
  onSuccess: () => void;
}

const createClient = async (data: AddClientFormValues) => {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_URL não está definida");
  }
  const response = await axios.post(`${API_BASE_URL}/clients`, data);
  return response.data;
};

export function AddClientForm({ onSuccess }: AddClientFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<AddClientFormValues>({
    resolver: zodResolver(addClientFormSchema),
    defaultValues: {
      name: "",
      email: "",
      status: "ACTIVE",
    },
  });

  const mutation = useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      onSuccess();
      alert("Cliente adicionado com sucesso!");
      form.reset();
    },
onError: (error: unknown) => { // Ou (error: Error) ou (error: AxiosError)
  // Import AxiosError type from axios
  
  const axiosError = error as AxiosError<{ message?: string }>;
  console.error("Objeto de erro completo do Axios (Adicionar):", axiosError);
  if (axiosError.response) {
    alert(`Erro ${axiosError.response.status}: ${axiosError.response.data?.message || 'Erro ao adicionar o cliente.'}`);
  } else if (axiosError.request) {
    alert("Erro de rede ao adicionar: Nenhuma resposta recebida do servidor.");
  } else {
    alert(`Erro ao configurar requisição de adição: ${axiosError.message}`);
  }
},
  });

  function onSubmit(data: AddClientFormValues) {
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
            <Button type="button" variant="outline" onClick={() => { form.reset(); onSuccess(); /* Adicionado onSuccess para fechar ao cancelar */ }}>
              Cancelar
            </Button>
          </DialogClose>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Adicionando..." : "Adicionar Cliente"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}