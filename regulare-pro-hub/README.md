# REGULARE PRO HUB - SaaS de Regularização Imobiliária

Este é o protótipo funcional em **Next.js** com banco de dados configurado para rodar localmente, utilizando **SQLite** para máxima facilidade de teste (sem precisar instalar Docker ou PostgreSQL). A estrutura e esquema do Prisma estão totalmente prontos para PostgreSQL quando você for subir para produção.

## 🚀 Como rodar o projeto localmente

Para testar toda a interface funcional com o banco de dados rodando:

### 1. Instalar as dependências
Abra o terminal dentro da pasta `regulare-pro-hub` e rode:
```bash
npm install
```

### 2. Configurar o Banco de Dados e Gerar Dados de Teste
Como configuramos para usar o SQLite localmente, o banco de dados é apenas um arquivo `dev.db`.
Execute o comando abaixo para aplicar a estrutura e rodar o *seed* (que vai gerar clientes, processos, financeiro e tarefas de teste):
```bash
npx prisma db push
npm run seed
```

### 3. Rodar o servidor de desenvolvimento
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador para ver a plataforma em funcionamento!

## ⚙️ Stack Tecnológica Configurada
- **Frontend:** Next.js (App Router), React, Tailwind CSS 4, Shadcn UI, Framer Motion.
- **Backend:** Node.js (via Next.js Server Components e API Routes).
- **Banco de Dados:** Prisma ORM configurado localmente com SQLite (basta trocar `provider = "sqlite"` para `"postgresql"` e adicionar o `DATABASE_URL` no `.env` para produção).
- **Dados:** O banco já inclui `Clientes`, `Processos`, `Financeiro`, `Tarefas`, `Documentos` e `Checklists`.

Aproveite o ambiente de testes!
