# Bancos SQL, Modelagem e ORMs - 1 semana -  Modelagem relacional e normalização

# Modelagem Relacional

# e Normalização

A **Modelagem Relacional** é o processo de representar dados do mundo real em **tabelas**, definindo entidades, atributos e relacionamentos, de forma que possam ser armazenados de maneira organizada em um banco de dados relacional (MySQL, PostgreSQL, SQL Server, etc.).

A **Normalização** é uma técnica utilizada durante a modelagem para **organizar os dados**, reduzindo redundância e evitando inconsistências.

Esses conceitos foram formalizados por **Edgar F. Codd**, criador do modelo relacional de banco de dados.

Os três pilares principais desse tema são:

- Entidades e Relacionamentos
- Chaves (Primária e Estrangeira)
- Formas Normais (1FN, 2FN, 3FN)

---

# Por que modelar corretamente?

Imagine um sistema crescendo ao longo do tempo.

Sem uma boa modelagem:

- dados duplicados em várias tabelas;
- inconsistências (o mesmo dado com valores diferentes);
- dificuldade para atualizar informações;
- desperdício de espaço de armazenamento;
- consultas (queries) mais lentas e complexas.

Com uma modelagem bem feita:

- dados organizados e sem repetição desnecessária;
- integridade garantida;
- consultas mais simples e eficientes;
- facilidade para manter e evoluir o banco de dados.

---

# Visão geral

```
Banco de Dados Relacional

        │

 ┌──────┼────────┐

 ▼      ▼        ▼

Entidades Chaves  Normalização
```

Cada elemento contribui para um banco de dados bem estruturado.

---

# O que são Entidades e Relacionamentos?

**Entidade** representa algo do mundo real que queremos armazenar (Cliente, Produto, Pedido).

**Atributo** é uma característica da entidade (nome, preço, data).

**Relacionamento** é a forma como duas entidades se conectam.

```
Cliente

↓ faz

Pedido

↓ contém

Produto
```

---

# Modelo Entidade-Relacionamento (MER)

Antes de criar as tabelas, é comum desenhar um **Diagrama Entidade-Relacionamento (DER)**.

```
┌───────────┐        ┌───────────┐
│  Cliente  │ 1 ── N │  Pedido   │
└───────────┘        └───────────┘
                            │
                            │ N ── N
                            ▼
                      ┌───────────┐
                      │  Produto  │
                      └───────────┘
```

- **1 ── N**: um cliente pode ter vários pedidos.
- **N ── N**: um pedido pode ter vários produtos, e um produto pode estar em vários pedidos.

---

# Tipos de relacionamento

- **1:1 (um para um)**: uma pessoa possui um único CPF.
- **1:N (um para muitos)**: um cliente possui vários pedidos.
- **N:N (muitos para muitos)**: um pedido possui vários produtos e um produto pode estar em vários pedidos.

Relacionamentos **N:N** exigem uma **tabela associativa** (tabela intermediária) para serem representados em um banco relacional.

---

# O que são Chaves?

As chaves garantem a integridade e o relacionamento entre as tabelas.

- **Chave Primária (Primary Key - PK)**: identifica de forma única cada registro de uma tabela.
- **Chave Estrangeira (Foreign Key - FK)**: referencia a chave primária de outra tabela, criando o relacionamento.

---

# Exemplo — Tabelas

```sql
CREATE TABLE cliente (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL
);
```

```sql
CREATE TABLE pedido (
  id INT PRIMARY KEY AUTO_INCREMENT,
  data_pedido DATE NOT NULL,
  cliente_id INT NOT NULL,
  FOREIGN KEY (cliente_id) REFERENCES cliente(id)
);
```

Aqui, `cliente_id` na tabela `pedido` é uma **chave estrangeira** que referencia o `id` da tabela `cliente`.

---

# Exemplo — Relacionamento N:N

```sql
CREATE TABLE produto (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(100) NOT NULL,
  preco DECIMAL(10,2) NOT NULL
);
```

```sql
CREATE TABLE pedido_produto (
  pedido_id INT NOT NULL,
  produto_id INT NOT NULL,
  quantidade INT NOT NULL,
  PRIMARY KEY (pedido_id, produto_id),
  FOREIGN KEY (pedido_id) REFERENCES pedido(id),
  FOREIGN KEY (produto_id) REFERENCES produto(id)
);
```

A tabela `pedido_produto` é a **tabela associativa** que resolve o relacionamento N:N entre `pedido` e `produto`.

---

# O que é Normalização?

**Normalização** é o processo de organizar os dados em tabelas seguindo um conjunto de regras chamadas **Formas Normais**, com o objetivo de:

> **Eliminar redundância e evitar anomalias de inserção, atualização e exclusão.**

```
Dados desorganizados

↓

Normalização

↓

Dados organizados,

sem redundância
```

---

# Problema — Sem normalização

```
| pedido_id | cliente_nome | cliente_email     | produto        | preco  |
|-----------|--------------|--------------------|-----------------|--------|
| 1         | Sheila       | sheila@email.com   | Teclado, Mouse  | 250,00 |
| 2         | Sheila       | sheila@email.com   | Monitor         | 900,00 |
```

Problemas nessa estrutura:

- o e-mail do cliente está **duplicado**;
- a coluna `produto` armazena **mais de um valor** na mesma célula;
- se o e-mail do cliente mudar, é necessário atualizar em várias linhas.

---

# Primeira Forma Normal (1FN)

**Regra:** cada coluna deve conter apenas **valores atômicos** (não pode haver múltiplos valores na mesma célula).

Antes:

```
| pedido_id | produtos        |
|-----------|-----------------|
| 1         | Teclado, Mouse  |
```

Depois (1FN):

```
| pedido_id | produto  |
|-----------|----------|
| 1         | Teclado  |
| 1         | Mouse    |
```

Agora cada linha representa um único valor por coluna.

---

# Segunda Forma Normal (2FN)

**Regra:** a tabela deve estar na 1FN, e todo atributo não-chave deve depender da **chave primária inteira** (relevante em chaves compostas).

Antes:

```
| pedido_id | produto_id | cliente_nome |
|-----------|------------|----------------|
```

Aqui, `cliente_nome` depende apenas de `pedido_id`, não da chave composta inteira (`pedido_id` + `produto_id`).

Depois (2FN):

```
pedido        → pedido_id, cliente_id
pedido_produto → pedido_id, produto_id, quantidade
```

O dado `cliente_nome` foi movido para a tabela `pedido`, eliminando a dependência parcial.

---

# Terceira Forma Normal (3FN)

**Regra:** a tabela deve estar na 2FN, e não pode haver dependência entre colunas que **não sejam chave** (dependência transitiva).

Antes:

```
| pedido_id | cliente_id | cliente_cidade | cliente_estado |
```

Aqui, `cliente_cidade` e `cliente_estado` dependem de `cliente_id`, não diretamente de `pedido_id`.

Depois (3FN):

```
pedido  → pedido_id, cliente_id
cliente → cliente_id, cliente_cidade, cliente_estado
```

Os dados do cliente ficam isolados em sua própria tabela, evitando redundância.

---

# Resumo das Formas Normais

```
Dados brutos

↓

1FN → elimina valores múltiplos na mesma coluna

↓

2FN → elimina dependência parcial da chave

↓

3FN → elimina dependência transitiva
```

---

# Vantagens da Normalização

- Reduz redundância de dados.
- Evita inconsistências ao atualizar informações.
- Facilita a manutenção do banco de dados.
- Economiza espaço de armazenamento.

---

# Quando (não) normalizar totalmente?

Utilize normalização quando:

- a integridade dos dados for prioridade;
- o sistema realizar muitas operações de escrita (INSERT, UPDATE, DELETE).

Em alguns cenários, uma **desnormalização controlada** é aplicada propositalmente para melhorar performance de leitura em sistemas com grande volume de consultas (ex.: relatórios, dashboards, data warehouses).

---

# Comparando os conceitos

| Conceito | Objetivo |
|---------|----------|
| Entidade | Representar um objeto do mundo real |
| Chave Primária | Identificar unicamente um registro |
| Chave Estrangeira | Relacionar tabelas entre si |
| Normalização | Organizar os dados e evitar redundância |

---

# Exemplo prático

Imagine um sistema de e-commerce.

```
Modelo Entidade-Relacionamento

        │

        ▼

Definir entidades

(Cliente, Pedido, Produto)

        │

        ▼

Definir relacionamentos

(1:N, N:N)

        │

        ▼

Criar tabelas com

chaves primárias e estrangeiras

        │

        ▼

Aplicar Normalização

↓

1FN

↓

2FN

↓

3FN

        │

        ▼

Banco de dados

organizado e consistente
```

---

# Chave Primária x Chave Estrangeira

É comum confundir esses dois conceitos.

| Chave Primária (PK) | Chave Estrangeira (FK) |
|----------|----------|
| Identifica unicamente um registro da própria tabela | Referencia a chave primária de outra tabela |
| Não pode se repetir na tabela | Pode se repetir na tabela onde está |
| Não pode ser nula | Pode ser nula, dependendo da regra de negócio |

---

# Normalização x Desnormalização

| Normalização | Desnormalização |
|-----------|----------|
| Reduz redundância | Aumenta redundância propositalmente |
| Melhor para escrita (INSERT/UPDATE) | Melhor para leitura em grande volume |
| Mais tabelas e joins | Menos joins, dados já agrupados |
| Ideal para sistemas transacionais (OLTP) | Ideal para relatórios e análises (OLAP) |

---

# Boas práticas

- Sempre defina uma chave primária para cada tabela.
- Utilize chaves estrangeiras para garantir a integridade referencial.
- Normalize até a 3FN na maioria dos sistemas transacionais.
- Avalie a desnormalização apenas quando houver um motivo real de performance.
- Nomeie tabelas e colunas de forma clara e consistente.
- Documente o modelo com um DER antes de criar as tabelas.

---

# Resumo

| Conceito | Resolve |
|---------|---------|
| Entidades e Relacionamentos | Representar o domínio do sistema |
| Chaves (PK/FK) | Identificar registros e relacionar tabelas |
| Normalização (1FN, 2FN, 3FN) | Eliminar redundância e inconsistências |

---

# Fluxo mental

```
Preciso modelar meu banco...

            │

   ┌────────┼────────┐

   ▼        ▼        ▼

Definir    Relacionar   Organizar
entidades  tabelas      os dados

   │        │        │

Entidades  Chaves    Normalização
```

---

# Referências

- CODD, E. F. — A Relational Model of Data for Large Shared Data Banks
- Documentação oficial do PostgreSQL — Modelagem de dados: https://www.postgresql.org/docs/
- Documentação oficial do MySQL: https://dev.mysql.com/doc/
- Refactoring Guru — Database Normalization: https://www.databasestar.com/database-normalization/


-Video:https://www.youtube.com/watch?v=hGstS10kCPM&pp=ygUVTW9kZWxhZ2VtIHJlbGFjaW9uYWwg

---

# Bancos SQL, Modelagem e ORMs - 2 semana - PostgreSQL índices, EXPLAIN ANALYZE, transactions

# PostgreSQL

# Índices, EXPLAIN ANALYZE e Transactions

O **PostgreSQL** é um dos bancos de dados relacionais mais utilizados no mercado, conhecido por sua robustez, conformidade com o padrão SQL e recursos avançados de performance.

Três recursos fundamentais para trabalhar com performance e integridade no PostgreSQL são:

- **Índices**: estruturas que aceleram a busca de dados.
- **EXPLAIN ANALYZE**: ferramenta para entender como o banco executa uma query.
- **Transactions**: mecanismo que garante consistência em operações compostas por várias etapas.

---

# Por que se aprofundar nisso?

Imagine uma aplicação crescendo ao longo do tempo.

Sem esse conhecimento:

- queries lentas conforme a tabela cresce;
- dificuldade para identificar o motivo da lentidão;
- dados inconsistentes após falhas em operações compostas;
- decisões de otimização feitas "no achismo".

Com esse conhecimento:

- consultas otimizadas com os índices corretos;
- capacidade de diagnosticar problemas de performance com dados reais;
- operações seguras, mesmo em caso de falha no meio do processo;
- decisões de otimização baseadas em evidências.

---

# Visão geral

```
Performance e Integridade

no PostgreSQL

        │

 ┌──────┼────────┐

 ▼      ▼        ▼

Índices EXPLAIN  Transactions
        ANALYZE
```

Cada um resolve um problema diferente: **buscar rápido**, **entender o plano de execução** e **garantir consistência**.

---

# O que são Índices?

Um **índice** é uma estrutura auxiliar que permite ao banco de dados encontrar registros **sem precisar ler a tabela inteira**.

```
Sem índice

↓

Percorre todas as linhas

(Sequential Scan)

↓

Com índice

↓

Vai direto ao registro

(Index Scan)
```

Funciona de forma parecida com o índice de um livro: em vez de ler página por página, você vai direto ao capítulo desejado.

---

# Problema

```sql
SELECT * FROM pedidos WHERE cliente_id = 1500;
```

Em uma tabela com milhões de registros, sem índice, o banco precisa **verificar linha por linha** até encontrar as correspondências.

---

# Solução

```sql
CREATE INDEX idx_pedidos_cliente_id
ON pedidos (cliente_id);
```

Agora a mesma consulta consegue localizar os registros de forma muito mais rápida, sem varrer a tabela inteira.

---

# Tipos de índice mais comuns

- **B-tree** (padrão): ideal para igualdade e comparações (`=`, `<`, `>`, `BETWEEN`).
- **Hash**: otimizado apenas para igualdade (`=`).
- **GIN**: usado para dados compostos, como JSONB e arrays.
- **GiST**: usado para dados geométricos e buscas de texto (full text search).
- **Índice único (UNIQUE)**: garante que não existam valores duplicados na coluna.
- **Índice composto**: criado sobre mais de uma coluna.

```sql
CREATE INDEX idx_pedidos_cliente_data
ON pedidos (cliente_id, data_pedido);
```

---

# Quando usar índices?

Utilize quando:

- a coluna for muito utilizada em cláusulas `WHERE`, `JOIN` ou `ORDER BY`;
- a tabela tiver um volume alto de registros;
- a coluna tiver boa **seletividade** (muitos valores distintos).

**Evite** criar índices quando:

- a tabela for pequena (o ganho é insignificante);
- a coluna tiver poucos valores distintos (ex.: campo booleano);
- houver muitas operações de escrita (`INSERT`/`UPDATE`), pois cada índice adiciona custo a essas operações.

---

# O que é EXPLAIN ANALYZE?

O **EXPLAIN** mostra o **plano de execução** que o PostgreSQL pretende usar para rodar uma query, sem executá-la de fato.

O **EXPLAIN ANALYZE** vai além: **executa a query de verdade** e mostra o tempo real gasto em cada etapa.

```
Query

↓

EXPLAIN

↓

Plano de execução

(estimado)

↓

EXPLAIN ANALYZE

↓

Plano de execução

+ tempo real de execução
```

---

# Exemplo

```sql
EXPLAIN ANALYZE
SELECT * FROM pedidos WHERE cliente_id = 1500;
```

Resultado (exemplo):

```text
Seq Scan on pedidos  (cost=0.00..18334.00 rows=12 width=72)
                      (actual time=45.201..120.532 rows=10 loops=1)
  Filter: (cliente_id = 1500)
  Rows Removed by Filter: 999988
Planning Time: 0.120 ms
Execution Time: 120.601 ms
```

Aqui, o **Seq Scan** (varredura sequencial) indica que o banco percorreu praticamente toda a tabela — um forte sinal de que um índice na coluna `cliente_id` traria ganho de performance.

---

# Depois de criar o índice

```sql
CREATE INDEX idx_pedidos_cliente_id ON pedidos (cliente_id);

EXPLAIN ANALYZE
SELECT * FROM pedidos WHERE cliente_id = 1500;
```

```text
Index Scan using idx_pedidos_cliente_id on pedidos
  (cost=0.42..8.55 rows=12 width=72)
  (actual time=0.032..0.041 rows=10 loops=1)
  Index Cond: (cliente_id = 1500)
Planning Time: 0.150 ms
Execution Time: 0.070 ms
```

O tempo de execução caiu drasticamente, e o plano agora utiliza um **Index Scan**.

---

# Principais informações do EXPLAIN ANALYZE

- **Seq Scan**: leitura sequencial de toda a tabela (geralmente ruim em tabelas grandes).
- **Index Scan**: leitura utilizando um índice (geralmente mais rápido).
- **cost**: estimativa de custo (início..fim) feita pelo planejador, antes da execução.
- **actual time**: tempo real gasto na execução (em milissegundos).
- **rows**: quantidade de linhas retornadas.
- **Planning Time**: tempo gasto para planejar a query.
- **Execution Time**: tempo total de execução real.

---

# Quando usar EXPLAIN ANALYZE?

Utilize quando:

- uma query estiver lenta e for necessário entender o motivo;
- for avaliar se um índice está realmente sendo utilizado;
- quiser comparar o desempenho antes e depois de uma otimização;
- estiver revisando queries críticas antes de subir para produção.

**Atenção:** como o `ANALYZE` executa a query de verdade, tenha cuidado ao usá-lo com comandos como `DELETE` ou `UPDATE` em produção — prefira testar em ambiente controlado ou dentro de uma transação que pode ser desfeita.

---

# O que são Transactions?

Uma **transaction (transação)** é um conjunto de operações no banco de dados que deve ser executado **como uma única unidade**: ou tudo é aplicado, ou nada é.

```
BEGIN

↓

Operação 1

↓

Operação 2

↓

Operação 3

↓

COMMIT (confirma tudo)

ou

ROLLBACK (desfaz tudo)
```

---

# Propriedades ACID

Toda transação em um banco relacional segue os princípios **ACID**:

- **Atomicidade**: todas as operações acontecem, ou nenhuma acontece.
- **Consistência**: o banco sempre passa de um estado válido para outro estado válido.
- **Isolamento**: transações concorrentes não interferem umas nas outras.
- **Durabilidade**: uma vez confirmada (`COMMIT`), a alteração persiste mesmo em caso de falha do sistema.

---

# Problema

Imagine uma transferência bancária.

```sql
UPDATE contas SET saldo = saldo - 100 WHERE id = 1;

UPDATE contas SET saldo = saldo + 100 WHERE id = 2;
```

Se o sistema falhar **entre** os dois comandos, o dinheiro sai da conta 1, mas nunca chega na conta 2 — uma inconsistência grave.

---

# Solução

```sql
BEGIN;

UPDATE contas SET saldo = saldo - 100 WHERE id = 1;

UPDATE contas SET saldo = saldo + 100 WHERE id = 2;

COMMIT;
```

Se qualquer uma das operações falhar antes do `COMMIT`, é possível executar um `ROLLBACK` e desfazer tudo, garantindo que o saldo nunca fique inconsistente.

---

# Exemplo com ROLLBACK

```sql
BEGIN;

UPDATE contas SET saldo = saldo - 100 WHERE id = 1;

-- Algo deu errado (ex.: saldo insuficiente)

ROLLBACK;
```

Nenhuma das alterações é aplicada ao banco.

---

# SAVEPOINT

Permite desfazer apenas uma parte de uma transação, sem cancelar tudo.

```sql
BEGIN;

UPDATE contas SET saldo = saldo - 100 WHERE id = 1;

SAVEPOINT antes_credito;

UPDATE contas SET saldo = saldo + 100 WHERE id = 2;

-- Algo deu errado apenas nessa etapa

ROLLBACK TO antes_credito;

COMMIT;
```

---

# Níveis de Isolamento

O PostgreSQL oferece diferentes níveis de isolamento entre transações concorrentes:

- **Read Uncommitted**: (na prática, tratado como Read Committed no PostgreSQL).
- **Read Committed** (padrão): cada consulta enxerga apenas dados já confirmados.
- **Repeatable Read**: garante que os mesmos dados sejam lidos durante toda a transação.
- **Serializable**: nível mais rígido, trata as transações como se fossem executadas uma por vez.

```sql
BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE;
```

Quanto mais rígido o isolamento, maior a segurança contra inconsistências, porém menor o desempenho em cenários de alta concorrência.

---

# Quando usar Transactions?

Utilize quando:

- uma operação envolver **múltiplos comandos** que precisam ser consistentes entre si;
- houver risco de falha no meio do processo (ex.: conexão perdida, erro de aplicação);
- for necessário garantir que dados relacionados sejam sempre alterados juntos (ex.: pedido + estoque + pagamento).

---

# Comparando os conceitos

| Conceito | Objetivo |
|---------|----------|
| Índice | Acelerar a busca de dados |
| EXPLAIN ANALYZE | Entender e medir o plano de execução de uma query |
| Transaction | Garantir consistência em operações compostas |

---

# Exemplo prático

Imagine um sistema de pedidos.

```
Query lenta ao buscar pedidos

        │

        ▼

EXPLAIN ANALYZE

↓

Identifica Seq Scan

        │

        ▼

Criar índice na coluna

utilizada no WHERE

        │

        ▼

EXPLAIN ANALYZE novamente

↓

Confirma Index Scan

        │

        ▼

Ao finalizar o pedido,

usar Transaction

↓

Debitar estoque + Criar pedido

+ Registrar pagamento

        │

        ▼

COMMIT (sucesso)

ou ROLLBACK (falha)
```

---

# Seq Scan x Index Scan

É comum confundir esses dois termos ao ler o `EXPLAIN ANALYZE`.

| Seq Scan | Index Scan |
|----------|----------|
| Percorre todas as linhas da tabela | Utiliza um índice para localizar os registros |
| Mais lento em tabelas grandes | Mais rápido quando há um índice adequado |
| Pode ser mais rápido em tabelas pequenas | Custo extra em tabelas muito pequenas não compensa |

---

# COMMIT x ROLLBACK

| COMMIT | ROLLBACK |
|-----------|----------|
| Confirma e salva permanentemente as alterações | Desfaz todas as alterações da transação |
| Usado quando tudo ocorreu como esperado | Usado quando algo deu errado |
| Após o COMMIT não é possível desfazer | Retorna o banco ao estado anterior ao BEGIN |

---

# Índices + Transactions

É comum utilizar os dois conceitos juntos: uma transação bem escrita, sobre tabelas bem indexadas, garante tanto **consistência** quanto **performance**.

```sql
BEGIN;

UPDATE estoque SET quantidade = quantidade - 1
WHERE produto_id = 42; -- coluna indexada

INSERT INTO pedidos (cliente_id, produto_id, quantidade)
VALUES (1500, 42, 1); -- cliente_id indexado

COMMIT;
```

---

# Boas práticas

- Crie índices com base em consultas reais, não por suposição.
- Use `EXPLAIN ANALYZE` antes e depois de otimizar uma query, para comparar o ganho real.
- Evite excesso de índices em tabelas com muitas escritas.
- Sempre envolva operações compostas em uma `Transaction`.
- Mantenha as transações o mais curtas possível, para reduzir bloqueios (locks).
- Escolha o nível de isolamento de acordo com a necessidade real de consistência da aplicação.

---

# Resumo

| Conceito | Resolve |
|---------|---------|
| Índices | Tornar buscas mais rápidas |
| EXPLAIN ANALYZE | Diagnosticar e validar a performance de queries |
| Transactions | Garantir consistência em operações com múltiplas etapas |

---

# Fluxo mental

```
Meu banco está...

            │

   ┌────────┼────────┐

   ▼        ▼        ▼

Lento em    Sem saber   Com risco de
buscas      o motivo    inconsistência

   │        │        │

Índices   EXPLAIN    Transactions
          ANALYZE
```

---

# Referências

- Documentação oficial do PostgreSQL — Indexes: https://www.postgresql.org/docs/current/indexes.html
- Documentação oficial do PostgreSQL — EXPLAIN: https://www.postgresql.org/docs/current/using-explain.html
- Documentação oficial do PostgreSQL — Transactions (ACID): https://www.postgresql.org/docs/current/tutorial-transactions.html
- Vídeo: https://www.youtube.com/watch?v=S9EFegGpQ8E

---

# Bancos SQL, Modelagem e ORMs - 3 semana - Prisma schema, migrations, relations

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

---

# Bancos SQL, Modelagem e ORMs - 4 semana - TypeORM avançado QueryBuilder

# TypeORM

# QueryBuilder avançado

O **TypeORM** é um **ORM (Object-Relational Mapping)** para Node.js e TypeScript. Ele permite representar tabelas como classes, trabalhar com relacionamentos entre entidades e consultar o banco por meio de repositórios ou do `QueryBuilder`.

O **QueryBuilder** é a API usada para construir consultas SQL passo a passo. Ele é especialmente útil quando a consulta possui filtros dinâmicos, joins, agregações, subqueries ou atualizações que não ficam claras usando apenas os métodos de um repositório.

---

# Por que utilizar o QueryBuilder?

Os métodos de repositório resolvem consultas simples de maneira direta:

```typescript
const users = await userRepository.find({
  where: { active: true },
});
```

Porém, uma aplicação pode precisar de:

- filtros adicionados conforme os parâmetros recebidos;
- condições combinando `AND` e `OR`;
- `INNER JOIN` e `LEFT JOIN`;
- `COUNT`, `SUM`, `GROUP BY` e `HAVING`;
- subqueries;
- paginação e ordenação;
- `INSERT`, `UPDATE` ou `DELETE` em massa.

O QueryBuilder permite expressar essas operações sem perder o controle sobre o SQL gerado e mantendo os valores separados da consulta por meio de parâmetros.

---

# Visão geral

```text
QueryBuilder

       |
       +-- SELECT
       |     +-- WHERE e parâmetros
       |     +-- JOIN
       |     +-- agregações
       |     +-- subqueries
       |     +-- paginação
       |
       +-- INSERT
       +-- UPDATE
       +-- DELETE
       +-- RELATIONS
```

O builder começa com uma entidade ou tabela, recebe cláusulas encadeadas e, no final, executa a consulta com um método como `getMany()` ou `execute()`.

---

# Instalação

Neste projeto, o TypeORM utiliza SQLite por meio do driver `better-sqlite3`:

```bash
npm install typeorm reflect-metadata better-sqlite3
npm install --save-dev typescript tsx @types/node @types/better-sqlite3
```

Os decorators precisam estar habilitados no `tsconfig.json`:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

---

# DataSource

O `DataSource` guarda a configuração da conexão e registra as entidades usadas pela aplicação.

```typescript
import "reflect-metadata";
import { DataSource } from "typeorm";
import { Post } from "./entities/Post";
import { Tag } from "./entities/Tag";
import { User } from "./entities/User";

export const AppDataSource = new DataSource({
  type: "better-sqlite3",
  database: "data/study.sqlite",
  entities: [User, Post, Tag],
  synchronize: true,
  logging: false,
});

await AppDataSource.initialize();
```

> `synchronize: true` é conveniente neste projeto didático porque mantém o banco local de acordo com as entidades. Em produção, prefira migrations: sincronizações automáticas podem alterar ou remover estruturas e dados de forma inesperada.

---

# Modelo usado nos exemplos

```text
User 1 ----- N Post N ----- N Tag
```

- um usuário pode escrever vários posts;
- cada post possui um único autor;
- um post pode possuir várias tags;
- uma tag pode classificar vários posts;
- `post_tags` é a tabela intermediária da relação N:N.

Trecho da entidade `Post`:

```typescript
@Entity({ name: "posts" })
export class Post {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 160 })
  title!: string;

  @Column({ type: "boolean", default: false })
  published!: boolean;

  @Column({ type: "integer", default: 0 })
  views!: number;

  @ManyToOne(() => User, (user) => user.posts)
  @JoinColumn({ name: "author_id" })
  author!: User;

  @ManyToMany(() => Tag, (tag) => tag.posts)
  @JoinTable({ name: "post_tags" })
  tags!: Tag[];
}
```

---

# Criando um QueryBuilder

Existem três formas comuns de criar um QueryBuilder:

```typescript
// Pelo repositório
AppDataSource.getRepository(Post).createQueryBuilder("post");

// Pelo DataSource, informando SELECT e FROM
AppDataSource.createQueryBuilder()
  .select("post")
  .from(Post, "post");

// Pelo EntityManager
AppDataSource.manager.createQueryBuilder(Post, "post");
```

Para consultas ligadas a uma entidade, iniciar pelo repositório costuma ser a opção mais direta.

---

# Estrutura de uma consulta

```typescript
const posts = await AppDataSource.getRepository(Post)
  .createQueryBuilder("post")
  .innerJoinAndSelect("post.author", "author")
  .where("post.published = :published", { published: true })
  .andWhere("post.views >= :minimumViews", { minimumViews: 100 })
  .orderBy("post.views", "DESC")
  .getMany();
```

O encadeamento representa uma consulta SQL:

| QueryBuilder | SQL aproximado |
|---|---|
| `createQueryBuilder("post")` | `FROM posts AS post` |
| `innerJoinAndSelect(...)` | `INNER JOIN` + colunas da relação |
| `where(...)` | `WHERE` |
| `andWhere(...)` | `AND` |
| `orderBy(...)` | `ORDER BY` |
| `getMany()` | executa e retorna entidades |

---

# Aliases

O texto passado para `createQueryBuilder("post")` é um **alias SQL**. Ele identifica a tabela dentro da consulta.

```typescript
.createQueryBuilder("post")
.innerJoin("post.author", "author")
.where("author.active = :active", { active: true })
.orderBy("post.views", "DESC")
```

Nesse exemplo:

- `post` representa a tabela `posts`;
- `author` representa a tabela `users` acessada pela relação `post.author`;
- os aliases podem ser usados em filtros, seleção, agrupamento e ordenação.

Aliases devem ser únicos e descritivos dentro da consulta.

---

# Parâmetros e SQL injection

Valores externos não devem ser concatenados diretamente no SQL.

```typescript
// Incorreto: entrada misturada ao SQL
.where(`user.email = '${email}'`)

// Correto: valor enviado separadamente
.where("user.email = :email", { email })
```

O `:email` é um parâmetro nomeado. O driver envia seu valor separadamente e faz o tratamento adequado.

Para uma lista de valores, use `:...nomeDoParametro`:

```typescript
.where("post.id IN (:...ids)", { ids: [1, 2, 3] })
```

Cada valor diferente deve ter um nome de parâmetro diferente. Reutilizar o mesmo nome sobrescreve o valor anterior:

```typescript
.where("post.views >= :minimumViews", { minimumViews: 100 })
.andWhere("post.views <= :maximumViews", { maximumViews: 500 })
```

> Parâmetros protegem **valores**, mas não nomes de colunas, tabelas ou direções de ordenação. Para esses casos, valide a entrada usando uma lista explícita de opções permitidas.

---

# WHERE dinâmico

Um benefício importante do QueryBuilder é adicionar filtros somente quando eles existem.

```typescript
type UserFilters = {
  active?: boolean;
  city?: string;
};

function buildUserSearch(filters: UserFilters) {
  const query = AppDataSource.getRepository(User)
    .createQueryBuilder("user");

  if (filters.active !== undefined) {
    query.andWhere("user.active = :active", {
      active: filters.active,
    });
  }

  if (filters.city) {
    query.andWhere("user.city = :city", {
      city: filters.city,
    });
  }

  return query.orderBy("user.name", "ASC");
}
```

O builder é mutável: cada chamada adiciona ou altera uma parte da mesma consulta.

> Chamar `.where()` novamente substitui o `WHERE` anterior. Depois da primeira condição, use `.andWhere()` ou `.orWhere()`.

---

# Agrupando condições com Brackets

Quando uma consulta mistura `AND` e `OR`, os parênteses mudam o resultado lógico.

Objetivo:

```sql
WHERE user.active = true
  AND (user.name LIKE '%ana%' OR user.email LIKE '%ana%')
```

Com QueryBuilder:

```typescript
import { Brackets } from "typeorm";

const search = "ana";

const users = await AppDataSource.getRepository(User)
  .createQueryBuilder("user")
  .where("user.active = :active", { active: true })
  .andWhere(
    new Brackets((nestedQuery) => {
      nestedQuery
        .where("LOWER(user.name) LIKE LOWER(:search)")
        .orWhere("LOWER(user.email) LIKE LOWER(:search)");
    }),
    { search: `%${search}%` },
  )
  .getMany();
```

`Brackets` envolve as condições internas entre parênteses e preserva a precedência lógica esperada.

---

# INNER JOIN e LEFT JOIN

```text
INNER JOIN
Retorna somente registros que possuem correspondência nos dois lados.

LEFT JOIN
Retorna todos os registros da esquerda, mesmo sem correspondência à direita.
```

Exemplo com autor e tags:

```typescript
const posts = await AppDataSource.getRepository(Post)
  .createQueryBuilder("post")
  .innerJoinAndSelect("post.author", "author")
  .leftJoinAndSelect("post.tags", "tag")
  .where("post.published = :published", { published: true })
  .getMany();
```

- `innerJoinAndSelect` cria o join e carrega o autor em `post.author`;
- `leftJoinAndSelect` também mantém posts que não possuem tags;
- métodos sem `AndSelect`, como `leftJoin`, fazem o join sem carregar a relação no objeto retornado.

---

# Condição no JOIN x condição no WHERE

É possível filtrar a tabela relacionada na própria condição do join:

```typescript
.leftJoinAndSelect(
  "user.posts",
  "post",
  "post.published = :published",
  { published: true },
)
```

Em um `LEFT JOIN`, isso não é necessariamente igual a colocar a condição no `WHERE`:

```typescript
.leftJoinAndSelect("user.posts", "post")
.where("post.published = :published", { published: true })
```

A primeira versão mantém usuários sem posts publicados e retorna a relação vazia. A segunda remove esses usuários do resultado, pois a condição do `WHERE` não é atendida.

---

# SELECT parcial

Para buscar somente os campos necessários, use `select` e `addSelect`:

```typescript
const query = AppDataSource.getRepository(Post)
  .createQueryBuilder("post")
  .innerJoin("post.author", "author")
  .select("post.title", "title")
  .addSelect("author.name", "author")
  .addSelect("post.views", "views");
```

Isso reduz dados transferidos e deixa explícito o formato necessário para relatórios ou listagens.

---

# Entidades x resultados raw

O TypeORM pode transformar o resultado em instâncias de entidades ou devolver as colunas diretamente.

| Método | Retorno |
|---|---|
| `getOne()` | uma entidade ou `null` |
| `getOneOrFail()` | uma entidade ou lança erro |
| `getMany()` | lista de entidades |
| `getRawOne()` | uma linha projetada |
| `getRawMany()` | lista de linhas projetadas |
| `getCount()` | quantidade de registros |
| `getManyAndCount()` | tupla com entidades e total |

Use entidades quando precisar do modelo completo. Para agregações e projeções com aliases próprios, prefira resultados raw:

```typescript
const results = await query.getRawMany<{
  title: string;
  author: string;
  views: number;
}>();
```

---

# Agregações

O QueryBuilder permite usar funções SQL e atribuir aliases ao resultado.

```typescript
const summary = await AppDataSource.getRepository(User)
  .createQueryBuilder("user")
  .leftJoin("user.posts", "post")
  .select("user.id", "userId")
  .addSelect("user.name", "name")
  .addSelect("COUNT(post.id)", "postCount")
  .addSelect("SUM(post.views)", "totalViews")
  .groupBy("user.id")
  .addGroupBy("user.name")
  .having("COUNT(post.id) >= :minimumPosts", { minimumPosts: 1 })
  .orderBy("totalViews", "DESC")
  .getRawMany();
```

- `GROUP BY` reúne linhas do mesmo usuário;
- `COUNT` conta os posts de cada grupo;
- `SUM` soma as visualizações;
- `HAVING` filtra o resultado depois do agrupamento;
- `WHERE` filtra linhas antes do agrupamento.

---

# COUNT x COUNT(DISTINCT)

Um join 1:N ou N:N pode duplicar a entidade principal no resultado SQL.

Imagine um post associado a três tags:

```text
post 1 + tag A
post 1 + tag B
post 1 + tag C
```

Após o join, `COUNT(post.id)` conta três linhas. Para contar o post uma única vez:

```typescript
const result = await AppDataSource.getRepository(Post)
  .createQueryBuilder("post")
  .innerJoin("post.tags", "tag")
  .select("COUNT(post.id)", "countWithDuplicates")
  .addSelect("COUNT(DISTINCT post.id)", "distinctPostCount")
  .getRawOne();
```

Use `DISTINCT` quando a pergunta for sobre entidades únicas, e não sobre as linhas produzidas pelo join.

---

# GROUP BY x HAVING

É comum confundir esses conceitos:

| Cláusula | Objetivo |
|---|---|
| `WHERE` | filtrar linhas antes do agrupamento |
| `GROUP BY` | reunir linhas que compartilham uma chave |
| `HAVING` | filtrar os grupos já calculados |

```typescript
.where("user.active = :active", { active: true })
.groupBy("user.id")
.having("COUNT(post.id) >= :minimumPosts", { minimumPosts: 2 })
```

---

# Subqueries

Uma subquery é uma consulta usada dentro de outra consulta.

Exemplo: buscar usuários que possuem ao menos um post popular e publicado.

```typescript
const popularAuthors = AppDataSource.getRepository(Post)
  .createQueryBuilder("popularPost")
  .select("popularPost.authorId")
  .where("popularPost.published = :isPublished")
  .andWhere("popularPost.views >= :popularViews");

const users = await AppDataSource.getRepository(User)
  .createQueryBuilder("user")
  .where(`user.id IN (${popularAuthors.getQuery()})`)
  .setParameters({
    isPublished: true,
    popularViews: 200,
  })
  .getMany();
```

Ao reutilizar o SQL de outro builder, os parâmetros da subquery também precisam ser repassados à consulta principal. Outra opção é usar `popularAuthors.getParameters()`.

---

# Ordenação segura

Parâmetros não podem substituir um identificador SQL, como o nome de uma coluna. Por isso, uma ordenação dinâmica deve usar uma lista permitida:

```typescript
const sortableColumns = {
  title: "post.title",
  views: "post.views",
  createdAt: "post.createdAt",
} as const;

type SortField = keyof typeof sortableColumns;

function applySort(
  query: SelectQueryBuilder<Post>,
  field: SortField,
  direction: "ASC" | "DESC",
) {
  return query.orderBy(sortableColumns[field], direction);
}
```

Não passe diretamente um nome de coluna recebido de uma requisição para `orderBy()`.

---

# Paginação

```typescript
const page = 2;
const perPage = 10;

const [posts, total] = await AppDataSource.getRepository(Post)
  .createQueryBuilder("post")
  .where("post.published = :published", { published: true })
  .orderBy("post.views", "DESC")
  .addOrderBy("post.id", "DESC")
  .skip((page - 1) * perPage)
  .take(perPage)
  .getManyAndCount();
```

- `skip` informa quantos registros serão ignorados;
- `take` limita a quantidade retornada;
- `getManyAndCount` retorna `[registros, total]`;
- uma ordenação estável, com critério de desempate, evita registros trocando de página.

Para consultas complexas com joins, o TypeORM recomenda `skip` e `take` em vez de `offset` e `limit`.

Em tabelas muito grandes, paginação por cursor costuma escalar melhor:

```typescript
.where("post.id < :cursor", { cursor: lastPostId })
.orderBy("post.id", "DESC")
.take(perPage)
```

---

# InsertQueryBuilder

```typescript
const result = await AppDataSource.createQueryBuilder()
  .insert()
  .into(Post)
  .values({
    title: "QueryBuilder na prática",
    content: "Conteúdo do post",
    published: false,
    views: 0,
    authorId: 2,
  })
  .execute();
```

`InsertQueryBuilder` também permite inserir vários registros de uma vez passando um array para `values()`.

O retorno de `execute()` é um `InsertResult`, que pode conter os identificadores e dados gerados pelo banco.

---

# RelationQueryBuilder

O `RelationQueryBuilder` altera uma relação sem precisar carregar previamente todas as entidades envolvidas.

```typescript
await AppDataSource.createQueryBuilder()
  .relation(Post, "tags")
  .of(postId)
  .add(tagId);
```

Nesse exemplo, o TypeORM insere o vínculo na tabela `post_tags`.

Operações comuns:

| Método | Uso comum |
|---|---|
| `add()` | adicionar item a relações 1:N ou N:N |
| `remove()` | remover item de relações 1:N ou N:N |
| `set()` | definir relação 1:1 ou N:1 |
| `loadOne()` | carregar um único registro relacionado |
| `loadMany()` | carregar vários registros relacionados |

---

# UpdateQueryBuilder

```typescript
const result = await AppDataSource.createQueryBuilder()
  .update(Post)
  .set({ published: true })
  .where("id = :id", { id: postId })
  .execute();

console.log(result.affected);
```

É possível usar uma expressão SQL para atualizar um valor com base nele mesmo:

```typescript
.set({ views: () => '"views" + 10' })
```

Funções passadas ao `set` produzem SQL bruto. Dados externos nunca devem ser concatenados dentro dessa expressão.

---

# DeleteQueryBuilder

```typescript
const result = await AppDataSource.createQueryBuilder()
  .delete()
  .from(Post)
  .where("id = :id", { id: postId })
  .execute();

console.log(result.affected);
```

Um `DELETE` sem `WHERE` pode remover todos os registros da tabela. Monte e revise a condição antes de executar operações destrutivas.

---

# SELECT x mutações

| Operação | Finalização comum | Retorno |
|---|---|---|
| `SELECT` de entidades | `getOne()` / `getMany()` | entidade(s) |
| `SELECT` projetado | `getRawOne()` / `getRawMany()` | objeto(s) raw |
| contagem | `getCount()` | número |
| `INSERT` | `execute()` | `InsertResult` |
| `UPDATE` | `execute()` | `UpdateResult` |
| `DELETE` | `execute()` | `DeleteResult` |
| alteração de relação | `add()` / `remove()` / `set()` | depende da operação |

Construir um QueryBuilder não executa a consulta. A comunicação com o banco acontece quando um método de finalização é chamado.

---

# Transações

Quando várias escritas precisam ter sucesso ou falhar juntas, use uma transação:

```typescript
await AppDataSource.transaction(async (manager) => {
  const postRepository = manager.getRepository(Post);
  const tagRepository = manager.getRepository(Tag);

  const post = await postRepository.save({
    title: "Novo post",
    content: "Conteúdo",
    published: true,
    views: 0,
    authorId: 1,
  });

  const tag = await tagRepository.findOneByOrFail({ id: 2 });

  await manager
    .createQueryBuilder()
    .relation(Post, "tags")
    .of(post.id)
    .add(tag.id);
});
```

Dentro do callback, todas as operações devem usar o `manager` fornecido pela transação. Usar o `AppDataSource.manager` global faria a operação sair do contexto transacional.

---

# Visualizando o SQL gerado

Antes de executar uma consulta complexa, é útil conferir seu SQL e seus parâmetros:

```typescript
const query = AppDataSource.getRepository(Post)
  .createQueryBuilder("post")
  .where("post.views >= :minimumViews", { minimumViews: 100 });

console.log(query.getSql());
console.log(query.getQueryAndParameters());
```

- `getSql()` mostra o SQL com os placeholders do driver;
- `getQueryAndParameters()` retorna o SQL e a lista de parâmetros;
- `logging: true` no `DataSource` registra as consultas executadas.

Essa inspeção ajuda a identificar joins desnecessários, filtros incorretos e problemas de desempenho.

---

# QueryBuilder x Repository

| Repository | QueryBuilder |
|---|---|
| melhor para CRUD simples | melhor para consultas dinâmicas ou complexas |
| código mais curto | controle mais próximo do SQL |
| usa `find`, `findOne`, `save`, `remove` | usa cláusulas encadeadas |
| relações podem ser carregadas por opções | joins são montados explicitamente |
| adequado para operações comuns | adequado para agregações e subqueries |

Não é necessário usar QueryBuilder em toda consulta. Use a API mais simples que expresse a regra com clareza.

---

# TypeORM x Prisma

| Prisma | TypeORM |
|---|---|
| modelo definido principalmente em `schema.prisma` | modelo definido por entidades/decorators ou schemas |
| consultas usam o Prisma Client | consultas usam Repository, EntityManager ou QueryBuilder |
| `include` carrega relações | `joinAndSelect` carrega relações no QueryBuilder |
| `select` projeta campos | `select` e `addSelect` projetam campos |
| filtros são objetos tipados | QueryBuilder aceita expressões SQL com parâmetros |
| migrations geradas pelo Prisma CLI | migrations geradas e executadas pelo TypeORM CLI |

O Prisma oferece uma API mais declarativa. O QueryBuilder do TypeORM deixa a estrutura da consulta mais próxima do SQL, o que aumenta o controle e também exige mais atenção.

---

# Erros comuns

- Concatenar dados externos em `where`, `having` ou expressões SQL brutas.
- Chamar `.where()` duas vezes e apagar condições anteriores.
- Misturar `AND` e `OR` sem `Brackets`.
- Reutilizar o mesmo nome de parâmetro para valores diferentes.
- Usar `join` esperando que a relação seja carregada sem `AndSelect`.
- Usar `getMany()` para uma projeção agregada que deveria usar `getRawMany()`.
- Contar registros após um join sem avaliar a necessidade de `DISTINCT`.
- Paginar sem `orderBy` estável.
- Aceitar nomes de coluna ou direção de ordenação sem validação.
- Executar `UPDATE` ou `DELETE` sem conferir o `WHERE`.
- Usar o manager global dentro de uma transação.

---

# Boas práticas

- Use parâmetros para todos os valores externos.
- Dê aliases curtos e claros às tabelas e colunas calculadas.
- Selecione apenas os campos e relações necessários.
- Extraia a construção de filtros complexos para funções testáveis.
- Confira `getQueryAndParameters()` durante o desenvolvimento.
- Use `DISTINCT` conscientemente quando joins multiplicarem linhas.
- Adicione um critério de desempate à ordenação paginada.
- Use transações em operações dependentes.
- Revise o plano de execução do banco para consultas críticas.
- Prefira migrations e mantenha `synchronize: false` em produção.

---

# Exemplo prático

Imagine uma tela que lista posts publicados, com autor, tags e um número mínimo de visualizações.

```text
Receber filtros
      |
      v
Criar QueryBuilder de Post
      |
      v
Adicionar parâmetros e WHERE
      |
      v
Fazer JOIN de author e tags
      |
      v
Ordenar e paginar
      |
      v
Executar getManyAndCount()
      |
      v
Retornar registros + total
```

```typescript
const [posts, total] = await postRepository
  .createQueryBuilder("post")
  .innerJoinAndSelect("post.author", "author")
  .leftJoinAndSelect("post.tags", "tag")
  .where("post.published = :published", { published: true })
  .andWhere("post.views >= :minimumViews", { minimumViews: 100 })
  .orderBy("post.views", "DESC")
  .addOrderBy("post.id", "DESC")
  .skip(0)
  .take(10)
  .getManyAndCount();
```

---

# Executando o projeto

```bash
npm install
npm run start
```

Scripts disponíveis nesta pasta:

- `npm run seed`: recria o banco e insere os dados iniciais;
- `npm run queries`: executa os exemplos de `SELECT`;
- `npm run mutations`: executa `INSERT`, relação, `UPDATE` e `DELETE`;
- `npm run typecheck`: verifica os tipos sem gerar arquivos.

---

# Resumo

| Conceito | Resolve |
|---|---|
| Alias | identifica tabelas e projeções na consulta |
| Parâmetro | envia valores de forma separada do SQL |
| `Brackets` | agrupa condições lógicas |
| Join | conecta e, com `AndSelect`, carrega relações |
| Agregação | calcula `COUNT`, `SUM` e outros resultados |
| Subquery | usa uma consulta dentro de outra |
| `skip` / `take` | implementa paginação |
| Resultado raw | retorna projeções e agregações |
| Mutation builders | executam `INSERT`, `UPDATE` e `DELETE` |
| RelationQueryBuilder | altera vínculos sem carregar entidades completas |

---

# Fluxo mental

```text
Preciso...

       +----------------+----------------+
       |                |                |
       v                v                v
  Buscar dados      Resumir dados    Alterar dados
       |                |                |
       v                v                v
SELECT + WHERE     GROUP BY/HAVING   INSERT/UPDATE/
JOIN + paginação   resultado raw     DELETE/RELATION
       |                |                |
       +----------------+----------------+
                        |
                        v
              Parâmetros + execução
```

---

# Referências

- Documentação oficial do TypeORM: https://typeorm.io/docs/
- Select QueryBuilder: https://typeorm.io/docs/query-builder/select-query-builder/
- Insert QueryBuilder: https://typeorm.io/docs/query-builder/insert-query-builder/
- Update QueryBuilder: https://typeorm.io/docs/query-builder/update-query-builder/
- Delete QueryBuilder: https://typeorm.io/docs/query-builder/delete-query-builder/
- RelationQueryBuilder: https://typeorm.io/docs/query-builder/relational-query-builder/
- Transações: https://typeorm.io/docs/transactions/


---

# Bancos SQL, Modelagem e ORMs - 5 semana - Níveis de isolamento,lock

# Níveis de Isolamento

# e Locks em Banco de Dados

Quando várias transações acontecem **ao mesmo tempo** em um banco de dados, é preciso garantir que uma não interfira incorretamente na outra. É para resolver esse problema que existem os **Níveis de Isolamento** e os **Locks (travas)**.

**Isolamento** é uma das propriedades do **ACID** e define o quanto uma transação pode "enxergar" do que outra transação está fazendo, antes dela ser confirmada.

**Locks** são o mecanismo interno que o banco de dados utiliza para controlar o acesso concorrente aos mesmos dados, evitando que duas transações alterem a mesma informação de forma conflitante.

Os três pilares principais desse tema são:

- Problemas de concorrência (Dirty Read, Non-Repeatable Read, Phantom Read)
- Níveis de Isolamento (Read Committed, Repeatable Read, Serializable, etc.)
- Locks (Row Lock, Table Lock, Deadlocks)

---

# Por que se preocupar com concorrência?

Imagine uma aplicação com muitos usuários acessando o banco ao mesmo tempo.

Sem controle de concorrência:

- dois usuários alterando o mesmo registro ao mesmo tempo, e um sobrescrevendo o outro;
- leitura de dados que "não deveriam" existir ainda (de uma transação não confirmada);
- resultados diferentes ao executar a mesma consulta duas vezes dentro da mesma transação;
- **deadlocks** travando a aplicação.

Com o entendimento correto de isolamento e locks:

- dados consistentes mesmo com muitos acessos simultâneos;
- previsibilidade sobre o que cada transação pode ou não enxergar;
- menos travamentos e melhor performance em cenários concorrentes;
- capacidade de diagnosticar e evitar deadlocks.

---

# Visão geral

```
Concorrência no Banco de Dados

        │

 ┌──────┼────────┐

 ▼      ▼        ▼

Problemas  Níveis de   Locks
de leitura Isolamento
```

Os **problemas de concorrência** motivam a existência dos **níveis de isolamento**, que por sua vez são implementados internamente através de **locks**.

---

# O que é Isolamento (na prática)?

**Isolamento** define até que ponto uma transação em andamento pode ser afetada, ou pode enxergar, os efeitos de outra transação que ainda não terminou.

```
Transação A

↓

Lendo/alterando dados

↓

Transação B (ao mesmo tempo)

↓

O que ela pode enxergar

da Transação A?
```

Quanto mais isolamento, mais seguro contra inconsistências — porém, geralmente, menor a performance em cenários de alta concorrência.

---

# Problemas clássicos de concorrência

Antes de entender os níveis de isolamento, é preciso entender os problemas que eles tentam resolver.

---

# Dirty Read (Leitura Suja)

Ocorre quando uma transação lê dados que foram alterados por **outra transação ainda não confirmada** (sem `COMMIT`).

```sql
-- Transação A
BEGIN;
UPDATE contas SET saldo = 1000 WHERE id = 1;
-- ainda sem COMMIT

-- Transação B (ao mesmo tempo)
SELECT saldo FROM contas WHERE id = 1;
-- lê 1000, mesmo sem a Transação A ter confirmado
```

Se a Transação A fizer `ROLLBACK`, a Transação B terá lido um valor que **nunca existiu de fato**.

---

# Non-Repeatable Read (Leitura Não Repetível)

Ocorre quando uma transação lê o **mesmo dado duas vezes** e obtém **resultados diferentes**, porque outra transação alterou e confirmou (`COMMIT`) esse dado no meio do caminho.

```sql
-- Transação A
BEGIN;
SELECT saldo FROM contas WHERE id = 1; -- retorna 500

-- Transação B (ao mesmo tempo)
UPDATE contas SET saldo = 800 WHERE id = 1;
COMMIT;

-- Transação A novamente
SELECT saldo FROM contas WHERE id = 1; -- retorna 800
COMMIT;
```

Dentro da **mesma transação**, o mesmo `SELECT` trouxe valores diferentes.

---

# Phantom Read (Leitura Fantasma)

Ocorre quando uma transação executa a mesma consulta duas vezes, e **novas linhas aparecem** (ou desaparecem) porque outra transação inseriu ou removeu registros que se encaixam no filtro.

```sql
-- Transação A
BEGIN;
SELECT COUNT(*) FROM pedidos WHERE status = 'pendente'; -- retorna 10

-- Transação B (ao mesmo tempo)
INSERT INTO pedidos (status) VALUES ('pendente');
COMMIT;

-- Transação A novamente
SELECT COUNT(*) FROM pedidos WHERE status = 'pendente'; -- retorna 11
COMMIT;
```

Diferente do Non-Repeatable Read (que afeta uma linha existente), o Phantom Read envolve o **surgimento de novas linhas**.

---

# Resumo dos problemas

| Problema | O que acontece |
|---------|----------|
| Dirty Read | Lê dado de uma transação não confirmada |
| Non-Repeatable Read | O mesmo dado muda de valor entre duas leituras |
| Phantom Read | Novas linhas aparecem entre duas leituras da mesma consulta |

---

# Níveis de Isolamento

Os níveis de isolamento definem **quais desses problemas são permitidos ou evitados**.

```
Menos isolamento              Mais isolamento

Read Uncommitted → Read Committed → Repeatable Read → Serializable

(mais rápido,                              (mais seguro,
menos seguro)                              mais lento)
```

---

# Read Uncommitted

Permite ler dados de transações ainda não confirmadas.

- Permite: Dirty Read, Non-Repeatable Read, Phantom Read.
- É o nível **menos seguro**.
- No PostgreSQL, esse nível existe apenas por compatibilidade — na prática, ele se comporta como **Read Committed**.

---

# Read Committed (padrão no PostgreSQL)

Cada consulta dentro da transação enxerga apenas dados que já foram **confirmados** (`COMMIT`) até aquele momento.

- Evita: Dirty Read.
- Permite: Non-Repeatable Read, Phantom Read.

```sql
BEGIN TRANSACTION ISOLATION LEVEL READ COMMITTED;
```

É o nível padrão do PostgreSQL, equilibrando segurança e performance para a maioria das aplicações.

---

# Repeatable Read

Garante que, se um dado for lido mais de uma vez dentro da mesma transação, o valor **não mudará**, mesmo que outra transação o altere e confirme.

- Evita: Dirty Read, Non-Repeatable Read.
- No PostgreSQL, também evita a maioria dos casos de Phantom Read (implementação mais rígida que o padrão SQL exige).

```sql
BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ;
```

---

# Serializable

O nível mais rígido: trata as transações concorrentes **como se fossem executadas uma de cada vez**, de forma totalmente serial.

- Evita: Dirty Read, Non-Repeatable Read, Phantom Read.
- Pode gerar erros de **serialização**, exigindo que a aplicação tente executar a transação novamente.

```sql
BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE;
```

```typescript
async function executarComRetry(fn: () => Promise<void>) {
  try {
    await fn();
  } catch (erro: any) {
    if (erro.code === "40001") {
      // erro de serialização, tentar novamente
      await executarComRetry(fn);
    } else {
      throw erro;
    }
  }
}
```

---

# Tabela comparativa dos níveis

| Nível | Dirty Read | Non-Repeatable Read | Phantom Read |
|---------|:---------:|:---------:|:---------:|
| Read Uncommitted | Possível | Possível | Possível |
| Read Committed | Evitado | Possível | Possível |
| Repeatable Read | Evitado | Evitado | Possível* |
| Serializable | Evitado | Evitado | Evitado |

\* No PostgreSQL, o Repeatable Read já evita a maioria dos casos de Phantom Read na prática.

---

# O que são Locks?

**Locks (travas)** são o mecanismo que o banco de dados usa internamente para controlar o acesso simultâneo aos mesmos dados, evitando conflitos.

```
Transação A

↓

Trava a linha

↓

Transação B

↓

Espera a liberação

do lock
```

---

# Row Lock (Trava de Linha)

Trava apenas a(s) linha(s) específica(s) que estão sendo alteradas, permitindo que outras linhas da mesma tabela sejam acessadas normalmente por outras transações.

```sql
BEGIN;

SELECT * FROM contas WHERE id = 1 FOR UPDATE;

-- outra transação tentando alterar a mesma linha
-- ficará esperando até o COMMIT ou ROLLBACK
```

O `FOR UPDATE` trava explicitamente a linha selecionada até o fim da transação.

---

# Table Lock (Trava de Tabela)

Trava a **tabela inteira**, impedindo (ou restringindo) o acesso de outras transações a qualquer linha dela.

```sql
LOCK TABLE contas IN EXCLUSIVE MODE;
```

Usado com bastante cuidado, geralmente em operações de manutenção ou alterações estruturais, pois impacta fortemente a concorrência.

---

# Locks Otimistas x Locks Pessimistas

- **Lock Pessimista**: trava o dado assim que ele é acessado, assumindo que um conflito provavelmente vai acontecer (`SELECT ... FOR UPDATE`).
- **Lock Otimista**: não trava o dado, mas verifica no momento da atualização se ele ainda está com o mesmo valor de quando foi lido (geralmente usando uma coluna de versão).

```sql
UPDATE produtos
SET estoque = estoque - 1, versao = versao + 1
WHERE id = 10 AND versao = 3;
```

Se nenhuma linha for afetada, significa que outra transação já alterou o registro antes — a aplicação decide então se tenta novamente ou informa o usuário.

---

# O que é Deadlock?

Um **deadlock** ocorre quando duas (ou mais) transações ficam **esperando uma pela outra indefinidamente**, cada uma travando um recurso que a outra precisa.

```
Transação A

↓

Trava linha 1

↓ espera linha 2

Transação B

↓

Trava linha 2

↓ espera linha 1

= Impasse (Deadlock)
```

---

# Exemplo de Deadlock

```sql
-- Transação A
BEGIN;
UPDATE contas SET saldo = saldo - 100 WHERE id = 1;
-- em seguida tenta:
UPDATE contas SET saldo = saldo + 100 WHERE id = 2;

-- Transação B (ao mesmo tempo, ordem invertida)
BEGIN;
UPDATE contas SET saldo = saldo - 50 WHERE id = 2;
-- em seguida tenta:
UPDATE contas SET saldo = saldo + 50 WHERE id = 1;
```

Se A trava a linha 1 e espera a linha 2, enquanto B trava a linha 2 e espera a linha 1, nenhuma das duas consegue continuar. O PostgreSQL detecta essa situação e **cancela uma das transações automaticamente**, retornando um erro de deadlock.

---

# Como evitar Deadlocks

- Sempre alterar as tabelas/linhas **na mesma ordem** em todas as transações.
- Manter as transações **curtas**, reduzindo o tempo em que os locks ficam ativos.
- Evitar interações manuais do usuário no meio de uma transação aberta.
- Utilizar `FOR UPDATE` apenas quando realmente necessário.
- Implementar lógica de **retry** para tratar erros de deadlock na aplicação.

---

# Quando usar cada nível de isolamento?

Utilize:

- **Read Committed**: para a maioria das aplicações do dia a dia (é o padrão do PostgreSQL por um bom motivo).
- **Repeatable Read**: quando for necessário que uma transação leia os mesmos dados de forma consistente do início ao fim (ex.: relatórios calculados dentro de uma transação).
- **Serializable**: em operações críticas, onde qualquer inconsistência é inaceitável (ex.: transferências financeiras, controle de estoque com alta concorrência).

---

# Comparando os conceitos

| Conceito | Objetivo |
|---------|----------|
| Nível de Isolamento | Definir o que uma transação pode enxergar de outra |
| Lock | Controlar o acesso concorrente aos mesmos dados |
| Deadlock | Situação de impasse entre transações concorrentes |

---

# Exemplo prático

Imagine um sistema de reserva de assentos.

```
Dois usuários tentam reservar

o mesmo assento ao mesmo tempo

        │

        ▼

SELECT ... FOR UPDATE

(Row Lock no assento)

        │

        ▼

Primeira transação

trava a linha

        │

        ▼

Segunda transação

espera a liberação

        │

        ▼

Primeira confirma (COMMIT)

        │

        ▼

Segunda transação verifica

o assento e recebe erro

de indisponibilidade
```

---

# Row Lock x Table Lock

É comum confundir esses dois conceitos.

| Row Lock | Table Lock |
|----------|----------|
| Trava apenas a(s) linha(s) afetada(s) | Trava a tabela inteira |
| Permite alta concorrência em outras linhas | Bloqueia acesso a toda a tabela |
| Uso comum no dia a dia (`FOR UPDATE`) | Uso pontual, geralmente em manutenção |

---

# Lock Otimista x Lock Pessimista

| Lock Otimista | Lock Pessimista |
|-----------|----------|
| Não trava o dado ao ler | Trava o dado imediatamente ao ler |
| Verifica conflito apenas na escrita | Evita conflito desde o início |
| Melhor para baixa concorrência | Melhor para alta concorrência no mesmo dado |
| Exige coluna de controle (ex.: versão) | Depende do lock nativo do banco |

---

# Isolamento + Locks + Transactions

Os três conceitos trabalham juntos: a **Transaction** define o escopo da operação, o **Nível de Isolamento** define as regras de visibilidade entre transações, e os **Locks** são o mecanismo interno que efetivamente impede conflitos.

```sql
BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ;

SELECT * FROM estoque WHERE produto_id = 42 FOR UPDATE;

UPDATE estoque SET quantidade = quantidade - 1
WHERE produto_id = 42;

COMMIT;
```

---

# Boas práticas

- Utilize o nível de isolamento **Read Committed** como padrão, e eleve apenas quando houver necessidade real.
- Mantenha as transações o mais curtas possível.
- Sempre trate erros de **serialização** e **deadlock** na aplicação, com retry quando fizer sentido.
- Utilize `FOR UPDATE` de forma consciente, apenas nas linhas realmente necessárias.
- Em operações críticas (financeiras, estoque), avalie o uso de `Serializable` ou lock pessimista.
- Sempre altere recursos na mesma ordem entre diferentes transações, para reduzir o risco de deadlocks.

---

# Resumo

| Conceito | Resolve |
|---------|---------|
| Níveis de Isolamento | Definir o grau de visibilidade entre transações concorrentes |
| Locks | Controlar o acesso simultâneo aos mesmos dados |
| Deadlock | Situação de impasse que o banco detecta e resolve automaticamente |

---

# Fluxo mental

```
Minhas transações são concorrentes...

            │

   ┌────────┼────────┐

   ▼        ▼        ▼

Preciso definir  Preciso controlar  Preciso evitar
o que cada uma   o acesso aos       impasses entre
pode enxergar    mesmos dados       transações

   │        │        │

Nível de   Locks      Prevenção de
Isolamento            Deadlock
```

---

# Referências

- Documentação oficial do PostgreSQL — Transaction Isolation: https://www.postgresql.org/docs/current/transaction-iso.html
- Documentação oficial do PostgreSQL — Explicit Locking: https://www.postgresql.org/docs/current/explicit-locking.html
- Vídeo: https://www.youtube.com/watch?v=YZo7jb4MInM
- Vídeo: https://www.youtube.com/watch?v=JU6lj8_z0HA&t=178s

---
