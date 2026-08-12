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