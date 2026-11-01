# Arquitetura do CleanStock

## 1. Visão geral

O CleanStock utilizará uma arquitetura de monólito
modular no backend, com frontend e backend separados.

## 2. Frontend

Tecnologias:

- React
- TypeScript
- Vite
- Tailwind CSS
- Recharts

Responsabilidades:

- Apresentação dos dados.
- Navegação.
- Formulários.
- Validação de interface.
- Comunicação com a API REST.
- Visualização de indicadores.

## 3. Backend

Tecnologias:

- Node.js
- Express
- TypeScript
- Prisma ORM
- Zod

Responsabilidades:

- Regras de negócio.
- Validação dos dados.
- Autenticação.
- Controle de estoque.
- Processamento das movimentações.
- Comunicação com o banco de dados.

## 4. Banco de dados

PostgreSQL.

Acesso através do Prisma ORM.

## 5. Comunicação

O frontend se comunicará com o backend através
de uma API REST utilizando HTTP e JSON.

## 6. Segurança

- Variáveis de ambiente.
- Senhas protegidas com hash.
- Autenticação JWT.
- Validação de entradas.
- Controle de permissões.
