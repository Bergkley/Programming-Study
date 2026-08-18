import { QueryBuilder } from "typeorm";

export function heading(title: string): void {
  console.log(`\n${"=".repeat(72)}\n${title}\n${"=".repeat(72)}`);
}

export function showSql(queryBuilder: QueryBuilder<object>): void {
  const [sql, parameters] = queryBuilder.getQueryAndParameters();

  console.log("SQL:", sql);
  console.log("Parâmetros:", parameters);
}
