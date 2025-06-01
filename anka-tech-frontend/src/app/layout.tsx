import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Anka Tech Case",
  description: "Gerenciamento de Clientes e Ativos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      {/* Não deve haver NENHUM espaço, texto ou { ' ' } aqui entre <html> e <body>
          O Next.js gerencia a tag <head> aqui se você não a definir.
          Se precisar de uma tag <head> personalizada, coloque-a aqui.
      */}
      <body className={inter.className}>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}