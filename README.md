# Anka Tech - Case Processo Seletivo (Full Stack)

## 🚀 Sobre o Projeto

Este projeto foi desenvolvido como parte do case para o processo seletivo da Anka Tech. Trata-se de uma aplicação full-stack para um escritório de investimentos, permitindo o gerenciamento de clientes e a visualização de informações básicas de ativos financeiros. A aplicação foi totalmente desenvolvida em TypeScript e é containerizada utilizando Docker e Docker Compose.

O objetivo principal é demonstrar habilidades no desenvolvimento com tecnologias modernas, incluindo Node.js com Fastify e Prisma para o backend, Next.js com React Query, React Hook Form, Zod e ShadCN para o frontend, e MySQL como banco de dados.

### Funcionalidades Implementadas:
* **Backend:**
    * CRUD completo para Clientes (Nome, Email, Status - Ativo/Inativo).
    * Endpoint para listar uma seleção fixa de Ativos Financeiros disponíveis.
    * Endpoints para criar, listar e remover Alocações de Ativos Financeiros por cliente.
* **Frontend:**
    * Página de Boas-vindas/Dashboard.
    * Página de Clientes: Permite listar, adicionar, editar (nome, email, status) e excluir clientes.
    * Página de Alocações por Cliente: Permite visualizar os ativos alocados a um cliente específico, adicionar novas alocações (selecionando de uma lista de ativos fixos e definindo a quantidade) e remover alocações existentes.
    * Página de Ativos: Exibe a lista fixa de ativos financeiros disponíveis (somente leitura).
* **Tecnologias:**
    * **Backend:** Node.js, Fastify, Prisma ORM, Zod, TypeScript.
    * **Frontend:** Next.js, React Query, React Hook Form, Zod, Axios, ShadCN, TypeScript.
    * **Banco de Dados:** MySQL.
    * **Containerização:** Docker, Docker Compose.

## 🛠️ Pré-requisitos

Antes de começar, garanta que você tem as seguintes ferramentas instaladas na sua máquina:
* **Docker:** [Download Docker](https://www.docker.com/products/docker-desktop)
* **Docker Compose:** Geralmente vem incluído com o Docker Desktop.
* **Git** (para clonar o repositório)

## ⚙️ Configuração e Execução do Projeto

Siga os passos abaixo para configurar e rodar a aplicação em seu ambiente local usando Docker:

1.  **Clone o Repositório:**
    ```bash
    git clone <URL_DO_SEU_REPOSITORIO_GIT>
    cd Anka-Tech-Case # Ou o nome da pasta raiz do seu projeto
    ```

2.  **Variáveis de Ambiente (Backend):**
    O backend espera um arquivo `.env` para a URL do banco de dados quando rodado localmente fora do Docker para desenvolvimento de migrações. No entanto, para a execução via Docker Compose, a `DATABASE_URL` é injetada diretamente no serviço `backend` pelo `docker-compose.yml`.
    * Dentro da pasta `anka-tech-backend/`, existe um arquivo `prisma/schema.prisma` que define o schema do banco.
    * As migrações do Prisma (`prisma/migrations/`) estão incluídas e serão aplicadas automaticamente ao banco de dados quando o contêiner do backend iniciar pela primeira vez (graças ao script `entrypoint.sh`).

3.  **Subir os Contêineres com Docker Compose:**
    Na pasta raiz do projeto (`Anka-Tech-Case/`, onde está o arquivo `docker-compose.yml`), execute o seguinte comando no seu terminal:
    ```bash
    docker-compose up --build -d
    ```
    * `--build`: Reconstrói as imagens Docker para o frontend e backend caso haja alterações nos `Dockerfiles` ou nos contextos de build.
    * `-d`: Roda os contêineres em modo "detached" (em segundo plano).

    Aguarde alguns instantes para que as imagens sejam construídas (na primeira vez pode demorar um pouco mais) e os contêineres iniciem. O serviço `db` (MySQL) pode levar um momento para estar totalmente pronto e aceitar conexões. O script de entrypoint do backend aguardará o banco e aplicará as migrações.

4.  **Acessando a Aplicação:**
    * **Frontend:** Após os contêineres estarem rodando, acesse no seu navegador:
        `http://localhost:3000`
    * **Backend API (para testes com Insomnia/Postman, se desejar):**
        `http://localhost:3001/api/...` (ex: `http://localhost:3001/api/clients`, `http://localhost:3001/api/assets`)

5.  **Visualizando os Logs (se necessário):**
    Para acompanhar os logs dos contêineres:
    ```bash
    docker-compose logs -f frontend
    docker-compose logs -f backend
    docker-compose logs -f db
    ```
    Use `Ctrl+C` para sair da visualização de logs.

6.  **Parando a Aplicação:**
    Para parar todos os contêineres, execute na pasta raiz do projeto:
    ```bash
    docker-compose down
    ```
    Se quiser remover também os volumes (isso apagará os dados do banco de dados), use:
    ```bash
    docker-compose down --volumes
    ```

## 📂 Estrutura do Projeto (Simplificada)
Anka-Tech-Case/
├── anka-tech-backend/      # Código fonte do Backend (Node.js, Fastify, Prisma)
│   ├── prisma/             # Schema e migrações do Prisma
│   ├── src/                # Código principal do backend
│   ├── Dockerfile          # Dockerfile para o backend
│   └── entrypoint.sh       # Script para aplicar migrações e iniciar o backend
│   └── ...
├── anka-tech-frontend/     # Código fonte do Frontend (Next.js)
│   ├── public/             # Arquivos estáticos (ex: logo)
│   ├── src/                # Código principal do frontend (app router, components, etc.)
│   ├── Dockerfile          # Dockerfile para o frontend
│   └── ...
└── docker-compose.yml      # Arquivo de orquestração do Docker Compose
└── README.md               # Este arquivo
## ✅ Entregáveis do Case Atendidos

* **Repositórios:** Códigos-fonte do backend e frontend organizados.
* **Configuração Prisma:** Script de migração inicial (`..._init_clients`) e subsequente (`..._add_client_asset_allocations`) para criar as tabelas no banco.
* **CRUD básico com Prisma:** Implementado para clientes e alocações de ativos.
* **Interface Next.js simplificada com ShadCN:** Desenvolvida para as páginas de Clientes e Ativos (e Alocações).
* **Configuração do Docker Compose:** Para rodar os serviços `db` (MySQL) e `backend` (Fastify). O frontend também foi dockerizado para uma solução completa.

---