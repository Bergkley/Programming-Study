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
