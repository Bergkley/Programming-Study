# Prisma

# Schema, Migrations, Relations

O **Prisma** é um **ORM (Object-Relational Mapping)** moderno para Node.js e TypeScript, que facilita a comunicação entre a aplicação e o banco de dados, permitindo escrever consultas de forma tipada, sem precisar escrever SQL manualmente na maior parte das vezes.

Ele é composto por três peças principais:

- **Schema**: arquivo onde o modelo de dados é definido.
- **Migrations**: histórico versionado de alterações no banco de dados.
- **Relations**: forma como o Prisma representa relacionamentos entre tabelas.

---

# Por que utilizar o Prisma?

Imagine uma aplicação crescendo ao longo do tempo.

Sem um ORM:

- SQL espalhado e duplicado pelo código;
- risco de erros de digitação em queries;
- falta de tipagem entre o banco e o TypeScript;
- dificuldade para manter o histórico de alterações do banco.

Com Prisma:

- modelo de dados centralizado em um único arquivo;
- autocomplete e tipagem automática no TypeScript;
- migrations versionadas e reproduzíveis;
- relacionamentos mais simples de definir e consultar.

---

# Visão geral

```
Prisma

        │

 ┌──────┼────────┐

 ▼      ▼        ▼

Schema Migrations Relations
```

O **Schema** define o modelo, as **Migrations** aplicam esse modelo no banco, e as **Relations** conectam as entidades entre si.

---

# Instalação

```bash
npm install prisma --save-dev
npm install @prisma/client

npx prisma init
```

Isso cria a pasta `prisma/` com o arquivo `schema.prisma` e um arquivo `.env` para a variável `DATABASE_URL`.

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/meubanco"
```

---

# O que é o Schema?

O **schema.prisma** é o arquivo central do Prisma, onde são definidos:

- a fonte de dados (`datasource`);
- o gerador do client (`generator`);
- os **models** (que representam as tabelas do banco).

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}
```

---

# Definindo um Model

```prisma
model Cliente {
  id        Int      @id @default(autoincrement())
  nome      String
  email     String   @unique
  criadoEm  DateTime @default(now())
}
```

- `@id`: define o campo como chave primária.
- `@default(autoincrement())`: gera o valor automaticamente.
- `@unique`: garante que o valor não se repita.
- `@default(now())`: preenche automaticamente com a data atual.

---

# Tipos de dados comuns

- `String`
- `Int`
- `Float`
- `Boolean`
- `DateTime`
- `Json`

```prisma
model Produto {
  id     Int     @id @default(autoincrement())
  nome   String
  preco  Float
  ativo  Boolean @default(true)
}
```

---

# O que são Migrations?

**Migrations** são arquivos que registram, passo a passo, todas as alterações feitas na estrutura do banco de dados ao longo do tempo.

```
Alteração no schema.prisma

↓

npx prisma migrate dev

↓

Cria arquivo de migration

↓

Aplica a alteração no banco
```

Isso permite que qualquer pessoa da equipe (ou o ambiente de produção) reproduza exatamente a mesma estrutura de banco, na mesma ordem.

---

# Problema

Sem migrations, alterações no banco de dados são feitas manualmente por cada desenvolvedor.

```sql
ALTER TABLE cliente ADD COLUMN telefone VARCHAR(20);
```

Isso gera riscos:

- alguém pode esquecer de aplicar a alteração;
- ambientes (dev, homologação, produção) podem ficar diferentes entre si;
- não há histórico organizado do que mudou e quando.

---

# Solução

```prisma
model Cliente {
  id        Int      @id @default(autoincrement())
  nome      String
  email     String   @unique
  telefone  String?
  criadoEm  DateTime @default(now())
}
```

```bash
npx prisma migrate dev --name adiciona_telefone
```

O Prisma gera automaticamente o SQL necessário e cria um arquivo de migration versionado dentro de `prisma/migrations/`.

---

# Principais comandos de Migration

- `npx prisma migrate dev`: cria e aplica uma nova migration em ambiente de desenvolvimento.
- `npx prisma migrate deploy`: aplica as migrations pendentes em produção.
- `npx prisma migrate reset`: apaga o banco e reaplica todas as migrations do zero.
- `npx prisma studio`: abre uma interface visual para consultar e editar os dados.
- `npx prisma generate`: gera o Prisma Client atualizado, com base no schema.

---

# Estrutura de uma Migration

```
prisma/
 └── migrations/
      ├── 20240110120000_init/
      │     └── migration.sql
      └── 20240115093000_adiciona_telefone/
            └── migration.sql
```

Cada pasta representa uma alteração incremental no banco, na ordem em que foi criada.

---

# O que são Relations?

**Relations** são a forma como o Prisma representa relacionamentos entre tabelas, de maneira declarativa dentro do schema.

```
Cliente

↓ 1:N

Pedido

↓ N:N

Produto
```

---

# Relacionamento 1:N

```prisma
model Cliente {
  id      Int      @id @default(autoincrement())
  nome    String
  pedidos Pedido[]
}

model Pedido {
  id         Int      @id @default(autoincrement())
  data       DateTime @default(now())
  cliente    Cliente  @relation(fields: [clienteId], references: [id])
  clienteId  Int
}
```

- `Cliente` possui uma lista de `Pedido[]`.
- `Pedido` possui um campo `clienteId`, que é a chave estrangeira.
- `@relation` define qual campo se conecta com qual referência.

---

# Relacionamento N:N

```prisma
model Pedido {
  id        Int              @id @default(autoincrement())
  produtos  PedidoProduto[]
}

model Produto {
  id        Int              @id @default(autoincrement())
  nome      String
  pedidos   PedidoProduto[]
}

model PedidoProduto {
  pedido     Pedido  @relation(fields: [pedidoId], references: [id])
  pedidoId   Int
  produto    Produto @relation(fields: [produtoId], references: [id])
  produtoId  Int
  quantidade Int

  @@id([pedidoId, produtoId])
}
```

A tabela `PedidoProduto` funciona como **tabela associativa**, assim como no modelo relacional puro.

---

# Relacionamento 1:1

```prisma
model Usuario {
  id      Int      @id @default(autoincrement())
  nome    String
  perfil  Perfil?
}

model Perfil {
  id        Int     @id @default(autoincrement())
  bio       String
  usuario   Usuario @relation(fields: [usuarioId], references: [id])
  usuarioId Int     @unique
}
```

O `@unique` na chave estrangeira garante que cada `Usuario` tenha, no máximo, um `Perfil`.

---

# Consultando relacionamentos com o Prisma Client

```typescript
const clienteComPedidos = await prisma.cliente.findUnique({
  where: { id: 1 },
  include: { pedidos: true },
});
```

```typescript
const pedidosComProdutos = await prisma.pedido.findMany({
  include: {
    produtos: {
      include: { produto: true },
    },
  },
});
```

O `include` diz ao Prisma para trazer também os dados relacionados na mesma consulta.

---

# Criando registros relacionados

```typescript
const novoPedido = await prisma.pedido.create({
  data: {
    cliente: { connect: { id: 1 } },
    produtos: {
      create: [
        { produto: { connect: { id: 10 } }, quantidade: 2 },
      ],
    },
  },
});
```

- `connect`: conecta a um registro já existente.
- `create`: cria um novo registro relacionado ao mesmo tempo.

---

# Vantagens do Prisma

- Tipagem automática com base no schema.
- Autocomplete no editor para models e relações.
- Migrations versionadas e fáceis de reverter.
- Prisma Studio para visualizar dados sem precisar de outra ferramenta.
- Sintaxe simples para relacionamentos complexos.

---

# Quando usar Prisma?

Utilize quando:

- o projeto for em Node.js/TypeScript e precisar de acesso a banco relacional;
- for importante ter tipagem forte entre banco e aplicação;
- o time precisar de um histórico organizado de alterações no banco (migrations);
- houver relacionamentos entre entidades que precisam ser consultados com frequência.

---

# Comparando os conceitos

| Conceito | Objetivo |
|---------|----------|
| Schema | Definir o modelo de dados da aplicação |
| Migration | Versionar e aplicar alterações no banco |
| Relation | Conectar entidades entre si |

---

# Exemplo prático

Imagine um sistema de pedidos.

```
Definir models no schema.prisma

(Cliente, Pedido, Produto)

        │

        ▼

Definir relations

(1:N e N:N)

        │

        ▼

npx prisma migrate dev

        │

        ▼

Banco atualizado

+ migration versionada

        │

        ▼

npx prisma generate

        │

        ▼

Prisma Client atualizado

        │

        ▼

Consultas tipadas

com include/connect/create
```

---

# migrate dev x migrate deploy

É comum confundir esses dois comandos.

| migrate dev | migrate deploy |
|----------|----------|
| Uso em ambiente de desenvolvimento | Uso em ambiente de produção |
| Cria novas migrations a partir do schema | Apenas aplica migrations já existentes |
| Pode resetar o banco se necessário | Nunca reseta o banco |
| Gera arquivos SQL automaticamente | Não gera novos arquivos |

---

# connect x create

| connect | create |
|-----------|----------|
| Relaciona a um registro que já existe | Cria um novo registro e já relaciona |
| Requer que o registro exista previamente | Não requer registro prévio |
| Usado com o `id` do registro existente | Usado com os dados completos do novo registro |

---

# Prisma + Modelagem Relacional

O schema do Prisma é, na prática, uma representação declarativa do modelo relacional e das formas normais já aplicadas no banco.

```prisma
model Cliente {
  id      Int      @id @default(autoincrement())
  nome    String
  email   String   @unique
  pedidos Pedido[]
}
```

Esse `model` corresponde diretamente a uma tabela `cliente`, já normalizada, com sua chave primária e seus relacionamentos bem definidos.

---

# Boas práticas

- Sempre revise o SQL gerado pela migration antes de aplicá-lo em produção.
- Utilize nomes de models e campos consistentes com o restante do projeto.
- Prefira `migrate deploy` em pipelines de CI/CD, nunca `migrate dev`.
- Utilize `include` com moderação, buscando apenas os relacionamentos realmente necessários.
- Nunca edite manualmente arquivos dentro de `prisma/migrations/` já aplicados.
- Rode `npx prisma generate` sempre que o schema for alterado.

---

# Resumo

| Conceito | Resolve |
|---------|---------|
| Schema | Definição centralizada do modelo de dados |
| Migrations | Versionamento e aplicação de alterações no banco |
| Relations | Conexão entre entidades (1:1, 1:N, N:N) |

---

# Fluxo mental

```
Preciso...

            │

   ┌────────┼────────┐

   ▼        ▼        ▼

Definir    Aplicar     Conectar
o modelo   no banco    entidades

   │        │        │

Schema   Migrations  Relations
```

---

# Referências

- Documentação oficial do Prisma: https://www.prisma.io/docs
- Prisma Schema Reference: https://www.prisma.io/docs/orm/reference/prisma-schema-reference
- Prisma Migrate: https://www.prisma.io/docs/orm/prisma-migrate
- Prisma Relations: https://www.prisma.io/docs/orm/prisma-schema/data-model/relations