# TypeORM avançado: QueryBuilder com SQLite

Projeto didático em TypeScript para praticar consultas SQL por meio do
`QueryBuilder` do TypeORM. O banco é local e fica em `data/study.sqlite`.

## Como executar

```bash
npm install
npm run start
```

Scripts disponíveis:

```bash
npm run seed       # recria o banco e insere os dados iniciais
npm run queries    # recria o banco e roda apenas consultas SELECT
npm run mutations  # recria o banco e pratica INSERT, relação, UPDATE e DELETE
npm run typecheck  # confere os tipos sem gerar arquivos
```

Todos os scripts recriam o banco antes dos exemplos. Assim, podem ser executados
quantas vezes quiser sem acumular registros.

## Modelo usado

```text
User 1 ─── N Post N ─── N Tag
```

- `User`: autor, com nome, e-mail, cidade e status.
- `Post`: publicação, visualizações e vínculo com o autor.
- `Tag`: classificação de posts pela tabela intermediária `post_tags`.

## Roteiro dos exemplos

Abra [`src/query-builder.ts`](src/query-builder.ts) e execute `npm run queries`.
Cada exemplo mostra no terminal o SQL produzido e seus parâmetros.

1. `WHERE` dinâmico, parâmetros e `Brackets` para agrupar `OR`.
2. `INNER JOIN` e `LEFT JOIN` carregando relações.
3. `SELECT` parcial, `COUNT`, `SUM`, `GROUP BY` e `HAVING`.
4. Diferença entre `COUNT` e `COUNT(DISTINCT ...)` após um `JOIN`.
5. Subquery com `IN`.
6. Paginação com `skip`, `take` e `getManyAndCount`.
7. Resultado projetado com `getRawMany`.
8. `InsertQueryBuilder`.
9. `RelationQueryBuilder`.
10. `UpdateQueryBuilder` com expressão SQL.
11. `DeleteQueryBuilder`.

### Padrão básico

```ts
const posts = await postRepository
  .createQueryBuilder("post") // alias SQL
  .innerJoinAndSelect("post.author", "author")
  .where("post.published = :published", { published: true })
  .andWhere("post.views >= :minimumViews", { minimumViews: 100 })
  .orderBy("post.views", "DESC")
  .getMany();
```

Use parâmetros (`:published`) para valores recebidos pelo programa. Não monte o
`WHERE` concatenando entrada do usuário, pois isso permite SQL injection.

## Exercícios sugeridos

1. Filtre posts por uma lista de tags usando `IN (:...tags)`.
2. Retorne somente usuários sem posts usando `LEFT JOIN` e `IS NULL`.
3. Crie uma consulta com a média de visualizações por autor.
4. Adicione ordenação dinâmica aceitando somente uma lista segura de colunas.
5. Implemente paginação por cursor (`post.id < :cursor`) em vez de `skip`.
6. Use uma transação para publicar dois posts de uma vez.

## Observação

O projeto usa `synchronize: true` para tornar o estudo simples. Essa opção altera
o schema automaticamente e não deve substituir migrations em produção.

Documentação oficial:

- [Select QueryBuilder](https://typeorm.io/docs/query-builder/select-query-builder/)
- [SQLite no TypeORM](https://typeorm.io/docs/drivers/sqlite/)
