// src/app/assets/page.tsx
"use client";

import React from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

// import {
//  Table,
//  TableBody,
//  TableCaption,
//  TableCell,
//  TableHead,
//  TableHeader,
//  TableRow,
// } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Asset {
  name: string;
  value: number;
}

// USA A VARIÁVEL DE AMBIENTE COM FALLBACK
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
const API_ASSETS_URL = `${API_BASE_URL}/assets`;

const fetchAssets = async (): Promise<Asset[]> => {
  if (!API_ASSETS_URL) {
    throw new Error("API URL para ativos não está configurada");
  }
  const { data } = await axios.get(API_ASSETS_URL);
  return data;
};

export default function AssetsPage() {
  const {
    data: assets,
    isLoading,
    isError,
    error,
  } = useQuery<Asset[], Error>({
    queryKey: ["fixedAssets"],
    queryFn: fetchAssets,
    staleTime: 1000 * 60 * 15,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Ativos Financeiros</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-4">Ativos Financeiros</h1>
        <p className="text-red-600 bg-red-100 p-4 rounded-md">
          Erro ao buscar ativos: {error?.message || "Erro desconhecido"}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Ativos Financeiros (Lista Fixa)</h1>

      {assets && assets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {assets.map((asset) => (
            <Card key={asset.name}>
              <CardHeader>
                <CardTitle className="text-xl">{asset.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">
                  R$ {asset.value.toFixed(2).replace(".", ",")}
                </p>
                <p className="text-sm text-gray-500 mt-1">Valor Atual</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">Nenhum ativo encontrado ou a lista está vazia.</p>
      )}
    </div>
  );
}