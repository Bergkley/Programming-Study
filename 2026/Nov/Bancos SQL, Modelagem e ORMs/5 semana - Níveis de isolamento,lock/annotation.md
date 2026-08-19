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