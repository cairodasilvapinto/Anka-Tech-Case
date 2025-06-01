import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-black p-4">
      <main className="flex flex-col items-center text-center gap-8 max-w-2xl">
        <Image
          src="/anka-logo.png"
          alt="Anka Tech Logo"
          width={180}
          height={180}
          priority
          className="rounded-full shadow-2xl mb-4"
        />

        <div className="space-y-4">
          <h1
            className="text-4xl sm:text-5xl font-bold tracking-tight bg-clip-text text-transparent"
            style={{
              backgroundImage: "linear-gradient(90deg, #ff0000, #F9480A)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Bem-vindo ao Sistema Anka Tech!
          </h1>
          <p className="text-lg sm:text-xl text-slate-700">
            Sua plataforma completa para gerenciamento de clientes e
            investimentos financeiros.
          </p>
          <p className="text-md text-slate-500">
            Utilize o menu ou os botões abaixo para navegar pelas funcionalidades.
          </p>
        </div>

        <Link href="/clients" passHref>
          <Button
            size="lg"
            className="mt-6 bg-[#F9480A] text-white hover:bg-[#E04009] transition-colors duration-150 ease-in-out focus:ring-2 focus:ring-offset-2 focus:ring-[#F9480A]"
            style={{
              backgroundColor: "#F9480A",
              color: "#fff",
            }}
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