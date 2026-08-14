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