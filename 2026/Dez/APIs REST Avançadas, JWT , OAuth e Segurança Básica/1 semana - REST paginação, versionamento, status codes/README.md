# OpenAPI - REST maduro

Exemplo em TypeScript/Node.js de uma API documentada com OpenAPI 3.1 usando:

- paginacao por `page` e `perPage`;
- metadados e links de navegacao;
- versionamento por URL com `/v1` e `/v2`;
- status codes consistentes para sucesso e erro;
- SQLite como banco local;
- Prisma no repository para ordenar, paginar e retornar os dados.

## Organizacao

```text
prisma/
  schema.prisma      # modelo Product
  seed.ts            # cria a tabela SQLite e popula produtos iniciais
src/
  app.ts             # configura Express, rotas e middlewares
  server.ts          # sobe o servidor e fecha o Prisma no shutdown
  database/          # conexao Prisma
  middlewares/       # request id, async handler, 404 e erro global
  repositories/      # acesso ao banco com Prisma
  routes/            # rotas HTTP versionadas
  services/          # regras de validacao e mapeamento de resposta
  types/             # tipos compartilhados
  utils/             # helpers de erro e paginacao
```

## Como rodar

```bash
npm install
npm run db:setup
npm run dev
```

Depois acesse:

- `http://localhost:3000/docs` para Swagger UI;
- `http://localhost:3000/openapi.json` para o contrato OpenAPI;
- `http://localhost:3000/v1/products?page=1&perPage=5`;
- `http://localhost:3000/v2/products?page=1&perPage=5`.

## Scripts

```bash
npm run build           # valida TypeScript
npm run openapi:json    # imprime a especificacao OpenAPI no terminal
npm run prisma:generate # gera o Prisma Client em generated/prisma
npm run db:seed         # cria dev.db e popula os produtos iniciais
npm run db:setup        # gera o client e roda o seed
```
