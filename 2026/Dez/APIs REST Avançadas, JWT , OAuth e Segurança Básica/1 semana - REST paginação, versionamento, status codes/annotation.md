# REST

# Paginação, Versionamento e Status Codes

**REST (Representational State Transfer)** é um estilo arquitetural para construção de APIs, baseado no protocolo HTTP, que define um conjunto de convenções para tornar a comunicação entre cliente e servidor previsível, organizada e escalável.

Três aspectos fundamentais para construir uma API REST bem projetada são:

- **Paginação**: como retornar grandes volumes de dados de forma eficiente.
- **Versionamento**: como evoluir a API sem quebrar clientes existentes.
- **Status Codes**: como comunicar corretamente o resultado de cada requisição.

---

# Por que se preocupar com isso?

Imagine uma API crescendo ao longo do tempo, com múltiplos clientes consumindo-a (apps, front-ends, integrações de terceiros).

Sem esses cuidados:

- endpoints retornando milhares de registros de uma vez, derrubando a aplicação;
- alterações na API quebrando aplicativos que já estão em produção;
- respostas sempre com status `200`, mesmo quando algo deu errado;
- clientes precisando "adivinhar" o que aconteceu a partir do corpo da resposta.

Com boas práticas de paginação, versionamento e status codes:

- respostas rápidas e previsíveis, mesmo com grandes volumes de dados;
- evolução da API sem quebrar integrações existentes;
- comunicação clara sobre sucesso, erro do cliente ou erro do servidor;
- APIs mais fáceis de consumir, documentar e depurar.

---

# Visão geral

```
API REST

        │

 ┌──────┼────────┐

 ▼      ▼        ▼

Paginação Versionamento Status
                          Codes
```

Cada um resolve um problema diferente: **volume de dados**, **evolução da API** e **comunicação de resultado**.

---

# O que é Paginação?

**Paginação** é a técnica de dividir uma grande quantidade de dados em "páginas" menores, retornando apenas um subconjunto por requisição.

```
Banco com 1 milhão

de registros

↓

Sem paginação

↓

Retorna tudo de uma vez

(lento, pesado, perigoso)

↓

Com paginação

↓

Retorna apenas

20, 50 ou 100 por vez
```

---

# Problema

```
GET /produtos
```

```json
[
  { "id": 1, "nome": "Produto 1" },
  { "id": 2, "nome": "Produto 2" }
  // ... mais 999.998 produtos
]
```

Isso sobrecarrega o banco de dados, a rede e o cliente que precisa processar essa resposta.

---

# Paginação por Offset (Offset-based)

A forma mais comum e simples, baseada em `page` (página) e `limit`/`pageSize` (quantidade de itens).

```
GET /produtos?page=2&limit=20
```

```json
{
  "data": [
    { "id": 21, "nome": "Produto 21" },
    { "id": 22, "nome": "Produto 22" }
  ],
  "meta": {
    "page": 2,
    "limit": 20,
    "total": 1000000,
    "totalPages": 50000
  }
}
```

No banco de dados, geralmente implementado com `LIMIT` e `OFFSET`:

```sql
SELECT * FROM produtos
ORDER BY id
LIMIT 20 OFFSET 20;
```

**Limitação:** em tabelas muito grandes, o `OFFSET` fica lento conforme a página aumenta, pois o banco precisa "pular" todos os registros anteriores.

---

# Paginação por Cursor (Cursor-based)

Em vez de usar números de página, utiliza um **cursor** (geralmente o ID ou uma data do último item retornado) para buscar a próxima "fatia" de dados.

```
GET /produtos?cursor=1000&limit=20
```

```json
{
  "data": [
    { "id": 1001, "nome": "Produto 1001" },
    { "id": 1002, "nome": "Produto 1002" }
  ],
  "meta": {
    "nextCursor": 1020
  }
}
```

```sql
SELECT * FROM produtos
WHERE id > 1000
ORDER BY id
LIMIT 20;
```

**Vantagem:** performance consistente, mesmo em tabelas muito grandes, pois não depende de "pular" registros.

---

# Offset x Cursor

| Offset-based | Cursor-based |
|----------|----------|
| Simples de implementar | Um pouco mais complexo |
| Permite pular direto para uma página específica | Permite apenas avançar/voltar sequencialmente |
| Fica lento em páginas muito distantes | Performance consistente em qualquer ponto |
| Bom para telas com números de página | Bom para "scroll infinito" e grandes volumes |

---

# Quando usar cada tipo de paginação?

Utilize:

- **Offset-based**: painéis administrativos, relatórios, telas que exibem números de página.
- **Cursor-based**: feeds, listagens com scroll infinito, tabelas muito grandes com alta frequência de escrita.

---

# O que é Versionamento?

**Versionamento** é a prática de identificar diferentes versões de uma API, permitindo que ela evolua **sem quebrar** os clientes que já a utilizam.

```
Cliente antigo

↓

Continua usando v1

Cliente novo

↓

Passa a usar v2

Ambos funcionam

ao mesmo tempo
```

---

# Problema

```
GET /usuarios/1
```

```json
{ "nome": "Sheila" }
```

Se um dia o campo `nome` for dividido em `nomeCompleto` e `apelido`, todos os clientes que dependem do campo `nome` **quebram instantaneamente**.

---

# Versionamento via URL

A forma mais comum e explícita.

```
GET /v1/usuarios/1
GET /v2/usuarios/1
```

```json
// v1
{ "nome": "Sheila" }
```

```json
// v2
{ "nomeCompleto": "Sheila Silva", "apelido": "Sheila" }
```

---

# Versionamento via Header

A versão é informada em um cabeçalho HTTP, mantendo a URL mais "limpa".

```
GET /usuarios/1
Accept: application/vnd.empresa.v2+json
```

---

# Versionamento via Query Parameter

```
GET /usuarios/1?version=2
```

Menos comum, geralmente utilizado em APIs mais simples.

---

# Comparando as estratégias de versionamento

| Estratégia | Vantagem | Desvantagem |
|---------|----------|----------|
| URL (`/v1/...`) | Simples, visível, fácil de testar | "Polui" a URL |
| Header | URL permanece limpa | Menos visível, mais difícil de testar manualmente |
| Query Param | Fácil de implementar | Pouco convencional, fácil de esquecer |

A estratégia via **URL** é a mais adotada no mercado por ser explícita e simples de documentar.

---

# Quando criar uma nova versão?

Utilize uma nova versão quando a mudança for **incompatível** (breaking change), como:

- remover ou renomear um campo já utilizado;
- mudar o tipo de um campo (ex.: de `string` para `number`);
- alterar o comportamento de um endpoint existente.

**Não** é necessário versionar quando a mudança é **compatível** (non-breaking), como:

- adicionar um novo campo opcional na resposta;
- adicionar um novo endpoint.

---

# O que são Status Codes?

**Status Codes** são códigos numéricos definidos pelo protocolo HTTP que indicam o resultado de uma requisição, permitindo que o cliente entenda o que aconteceu sem precisar interpretar o corpo da resposta.

```
Requisição

↓

Servidor processa

↓

Retorna um Status Code

↓

Cliente sabe se foi

sucesso, erro do cliente

ou erro do servidor
```

---

# Categorias de Status Codes

- **1xx — Informational**: requisição recebida, processo continuando.
- **2xx — Success**: requisição processada com sucesso.
- **3xx — Redirection**: é necessária uma ação adicional para completar a requisição.
- **4xx — Client Error**: erro causado pelo cliente (dados inválidos, não autorizado, etc.).
- **5xx — Server Error**: erro causado pelo servidor.

---

# Status Codes mais utilizados (2xx)

- **200 OK**: requisição bem-sucedida (uso geral, ex.: `GET`, `PUT`).
- **201 Created**: um novo recurso foi criado com sucesso (uso comum em `POST`).
- **204 No Content**: requisição bem-sucedida, porém sem corpo de resposta (comum em `DELETE`).

```
POST /produtos → 201 Created
GET /produtos/1 → 200 OK
DELETE /produtos/1 → 204 No Content
```

---

# Status Codes mais utilizados (4xx)

- **400 Bad Request**: a requisição está mal formada ou com dados inválidos.
- **401 Unauthorized**: o cliente não está autenticado.
- **403 Forbidden**: o cliente está autenticado, mas não tem permissão para o recurso.
- **404 Not Found**: o recurso solicitado não existe.
- **409 Conflict**: a requisição conflita com o estado atual do recurso (ex.: e-mail já cadastrado).
- **422 Unprocessable Entity**: a requisição está bem formada, mas contém erros de validação.

```json
// 404
{
  "erro": "Produto não encontrado"
}
```

```json
// 422
{
  "erro": "Dados inválidos",
  "detalhes": [
    { "campo": "email", "mensagem": "E-mail inválido" }
  ]
}
```

---

# Status Codes mais utilizados (5xx)

- **500 Internal Server Error**: erro genérico e inesperado no servidor.
- **502 Bad Gateway**: um servidor intermediário recebeu uma resposta inválida de outro servidor.
- **503 Service Unavailable**: o servidor está temporariamente indisponível (ex.: manutenção, sobrecarga).

---

# 401 x 403

É comum confundir esses dois códigos.

| 401 Unauthorized | 403 Forbidden |
|----------|----------|
| O cliente não está autenticado | O cliente está autenticado |
| "Eu não sei quem você é" | "Eu sei quem você é, mas você não pode fazer isso" |
| Geralmente resolvido fazendo login | Não é resolvido apenas autenticando |

---

# 400 x 422

| 400 Bad Request | 422 Unprocessable Entity |
|----------|----------|
| A requisição está estruturalmente errada (ex.: JSON inválido) | A estrutura está correta, mas os dados não passam nas regras de validação |
| Erro de formato | Erro de conteúdo/regra de negócio |

---

# Exemplo prático de uma API completa

```
GET /v1/produtos?page=2&limit=20

        │

        ▼

Servidor processa

        │

        ▼

Sucesso?

   │           │
  Sim          Não

   ▼            ▼

200 OK      4xx ou 5xx

+ dados     + mensagem de erro

paginados
```

```json
// 200 OK
{
  "data": [
    { "id": 21, "nome": "Produto 21" }
  ],
  "meta": {
    "page": 2,
    "limit": 20,
    "total": 1000000
  }
}
```

---

# Boas práticas

- Sempre pagine endpoints que podem retornar muitos registros.
- Utilize paginação por cursor em tabelas muito grandes ou de alta escrita.
- Verse a API sempre que houver uma mudança incompatível (breaking change).
- Prefira versionamento via URL por ser mais explícito e fácil de documentar.
- Utilize o status code correto para cada situação — evite retornar sempre `200`.
- Padronize o formato de erro em toda a API (ex.: sempre com `erro` e `detalhes`).
- Documente todos os status codes possíveis de cada endpoint.

---

# Resumo

| Conceito | Resolve |
|---------|---------|
| Paginação | Retornar grandes volumes de dados de forma eficiente |
| Versionamento | Evoluir a API sem quebrar clientes existentes |
| Status Codes | Comunicar corretamente o resultado de cada requisição |

---

# Fluxo mental

```
Minha API precisa...

            │

   ┌────────┼────────┐

   ▼        ▼        ▼

Retornar    Evoluir sem   Comunicar o
muitos      quebrar       resultado da
dados       clientes      requisição

   │        │        │

Paginação  Versionamento  Status Codes
```

---

# Referências

- MDN Web Docs — HTTP response status codes: https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Status
- REST API Tutorial — Status Codes: https://restfulapi.net/http-status-codes/
- REST API Tutorial — Versioning: https://restfulapi.net/versioning/
- Vídeo : https://www.youtube.com/watch?v=tdi3B6zZlr8&pp=ygUSUmVzdCB2ZXJzaW9uYW1lbnRv
- Vídeo : https://www.youtube.com/watch?v=qmpUfWN7hh4&pp=ygUQUmVzdCBzdGF0dXMgY29kZQ%3D%3D