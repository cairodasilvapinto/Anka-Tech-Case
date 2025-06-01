// anka-tech-frontend/src/app/page.tsx
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button"; // Importe o botão do ShadCN UI
import {Users } from "lucide-react"; // Ícones para dar um toque visual

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4">
      <main className="flex flex-col items-center text-center gap-8 max-w-2xl">
        {/* Logo da Empresa */}
        <Image
          src="/anka-logo.png" // Caminho para o logo na pasta 'public'
          alt="Anka Tech Logo"
          width={180} // Ajuste a largura conforme necessário
          height={180} // Ajuste a altura conforme necessário
          priority
          className="rounded-full shadow-2xl mb-4" // Estilo opcional para o logo
        />

        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-teal-300 to-green-400">
            Bem-vindo ao Sistema Anka Tech!
          </h1>
          <p className="text-lg sm:text-xl text-slate-300">
            Sua plataforma completa para gerenciamento de clientes e
            investimentos financeiros.
          </p>
          <p className="text-md text-slate-400">
            Utilize o menu ou os botões abaixo para navegar pelas funcionalidades.
          </p>
        </div>

        {/* Botão para a Página de Clientes */}
        <Link href="/clients" passHref>
          <Button
            size="lg" // Botão maior
            className="mt-6 bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white transition-transform duration-150 ease-in-out hover:scale-105"
          >
            <Users className="mr-2 h-5 w-5" />
            Gerenciar Clientes
          </Button>
        </Link>

        <div className="mt-10 text-xs text-slate-500">
          <p>Um projeto de demonstração para Anka Tech.</p>
        </div>
      </main>

      <footer className="absolute bottom-8 text-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Anka Tech - Todos os direitos (quase) reservados.</p>
      </footer>
    </div>
  );
}