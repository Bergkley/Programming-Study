# APIs REST Avançadas, JWT , OAuth e Segurança Básica - 1 semana - REST paginação, versionamento, status codes

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

---

# APIs REST Avançadas, JWT , OAuth e Segurança Básica - 2 semana - JWT (access-refresh) + sessão vs token

# JWT (Access / Refresh)

# Sessão vs Token

**JWT (JSON Web Token)** é um padrão para representar informações de forma compacta e segura entre duas partes, muito utilizado para autenticação e autorização em APIs.

Ao trabalhar com autenticação, existem duas abordagens principais para manter um usuário "logado": **Sessão (baseada em servidor)** e **Token (baseada em cliente, como o JWT)**.

Os três pilares principais desse tema são:

- Estrutura e funcionamento do JWT
- Access Token e Refresh Token
- Autenticação por Sessão x Autenticação por Token

---

# Por que entender isso?

Imagine uma aplicação com login de usuários crescendo ao longo do tempo.

Sem entender esses conceitos:

- tokens que nunca expiram, aumentando o risco de segurança;
- usuário sendo deslogado com frequência, prejudicando a experiência;
- dificuldade para escalar a autenticação em múltiplos servidores;
- confusão entre "onde" e "como" guardar as credenciais de acesso.

Com esse entendimento:

- autenticação seletiva, segura e com expiração controlada;
- renovação de sessão sem exigir novo login constantemente;
- arquitetura mais fácil de escalar horizontalmente (no caso de tokens);
- escolha consciente entre sessão e token, de acordo com o cenário.

---

# Visão geral

```
Autenticação

        │

 ┌──────┼────────┐

 ▼      ▼        ▼

JWT    Access/   Sessão
       Refresh   vs Token
```

O **JWT** é o formato do token, o par **Access/Refresh** é a estratégia de uso, e **Sessão x Token** é a decisão arquitetural de como manter o usuário autenticado.

---

# O que é JWT?

Um **JWT** é uma string composta por três partes, separadas por ponto (`.`):

```
header.payload.signature
```

```
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMiLCJub21lIjoiU2hlaWxhIn0.4f8s...
```

- **Header**: informa o algoritmo de assinatura utilizado (ex.: `HS256`).
- **Payload**: contém os dados (claims), como `id`, `nome`, `exp` (expiração).
- **Signature**: garante que o token não foi alterado desde que foi gerado.

---

# Estrutura decodificada (exemplo)

Header:

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

Payload:

```json
{
  "sub": "123",
  "nome": "Sheila",
  "iat": 1710000000,
  "exp": 1710003600
}
```

- `sub`: identifica o "dono" do token (subject), geralmente o ID do usuário.
- `iat`: data de emissão (issued at).
- `exp`: data de expiração (expiration).

**Importante:** o payload de um JWT **não é criptografado**, apenas codificado em Base64 — qualquer pessoa pode decodificá-lo e ler seu conteúdo. Por isso, nunca coloque dados sensíveis (senha, dados bancários) dentro do payload.

---

# Como o JWT garante segurança?

A segurança do JWT não está em "esconder" o conteúdo, mas em garantir que ele **não foi alterado**, através da assinatura.

```
Servidor gera o token

↓

Assina com uma chave secreta

↓

Cliente envia o token

de volta nas próximas requisições

↓

Servidor verifica a assinatura

↓

Se bater → token válido

Se não bater → token foi alterado (rejeitado)
```

```typescript
import jwt from "jsonwebtoken";

const token = jwt.sign(
  { sub: "123", nome: "Sheila" },
  process.env.JWT_SECRET!,
  { expiresIn: "15m" }
);
```

```typescript
try {
  const payload = jwt.verify(token, process.env.JWT_SECRET!);
} catch (erro) {
  // token inválido, expirado ou adulterado
}
```

---

# Problema — Token único

Se a aplicação usar apenas **um token de longa duração**, dois problemas surgem:

- se o token for roubado, o invasor terá acesso por muito tempo;
- se o token tiver duração curta, o usuário precisará fazer login com muita frequência.

---

# Solução — Access Token + Refresh Token

A estratégia mais comum divide a responsabilidade em **dois tokens**:

```
Login

↓

Gera Access Token (curta duração)

+ Refresh Token (longa duração)

↓

Access Token expira

↓

Usa o Refresh Token

para gerar um novo Access Token

↓

Usuário continua logado

sem precisar inserir senha novamente
```

---

# Access Token

- Duração **curta** (ex.: 15 minutos).
- Enviado em **todas** as requisições autenticadas, geralmente no header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

- Se roubado, o risco é limitado pela curta duração.

```typescript
const accessToken = jwt.sign(
  { sub: usuario.id },
  process.env.JWT_ACCESS_SECRET!,
  { expiresIn: "15m" }
);
```

---

# Refresh Token

- Duração **longa** (ex.: 7 dias, 30 dias).
- Utilizado **apenas** para gerar um novo Access Token, não é enviado em toda requisição.
- Deve ser armazenado com mais cuidado (ex.: cookie `httpOnly`, banco de dados).

```typescript
const refreshToken = jwt.sign(
  { sub: usuario.id },
  process.env.JWT_REFRESH_SECRET!,
  { expiresIn: "7d" }
);
```

---

# Fluxo completo

```
POST /login

↓

Retorna accessToken + refreshToken

        │

        ▼

Requisições autenticadas

usam o accessToken

        │

        ▼

accessToken expira (401)

        │

        ▼

POST /refresh

com o refreshToken

        │

        ▼

Novo accessToken gerado

        │

        ▼

Aplicação continua

funcionando normalmente
```

---

# Exemplo — Endpoint de refresh

```typescript
app.post("/refresh", (req, res) => {

  const { refreshToken } = req.body;

  try {

    const payload = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET!
    ) as { sub: string };

    const novoAccessToken = jwt.sign(
      { sub: payload.sub },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: "15m" }
    );

    res.json({ accessToken: novoAccessToken });

  } catch (erro) {
    res.status(401).json({ erro: "Refresh token inválido" });
  }

});
```

---

# Revogação de Refresh Tokens

Como o JWT não é armazenado no servidor por padrão, revogar um token antes do seu vencimento exige controle adicional, como:

- salvar os **refresh tokens** ativos no banco de dados (ou Redis), podendo invalidá-los manualmente (ex.: logout, troca de senha);
- utilizar uma **blacklist** de tokens revogados;
- rotacionar o refresh token a cada uso (gerar um novo refresh token junto do access token, invalidando o anterior).

```
Refresh Token usado

↓

Gera novo Access Token

+ novo Refresh Token

↓

Refresh Token antigo

é invalidado
```

---

# Vantagens do padrão Access/Refresh

- Reduz o tempo de exposição em caso de vazamento do access token.
- Evita que o usuário precise digitar a senha com frequência.
- Permite revogar o acesso de um usuário sem esperar a expiração natural.
- Facilita cenários como "sair de todos os dispositivos".

---

# Sessão vs Token

Agora que o JWT foi entendido, é possível comparar as duas abordagens arquiteturais de autenticação.

---

# Autenticação por Sessão

O servidor cria uma **sessão** e a armazena (em memória, banco ou Redis), enviando ao cliente apenas um identificador (geralmente em um cookie).

```
Login

↓

Servidor cria a sessão

e guarda no armazenamento

↓

Envia um session_id

para o cliente (cookie)

↓

Cada requisição

envia o session_id

↓

Servidor consulta

os dados da sessão
```

```typescript
app.use(session({
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
}));
```

---

# Autenticação por Token (JWT)

O servidor **não guarda nada**. Todas as informações necessárias já estão dentro do próprio token, que é validado apenas pela assinatura.

```
Login

↓

Servidor gera o JWT

com os dados necessários

↓

Cliente guarda o token

↓

Cada requisição

envia o token

↓

Servidor apenas

verifica a assinatura
```

---

# Comparando Sessão x Token

| Sessão | Token (JWT) |
|----------|----------|
| Estado guardado no servidor (stateful) | Estado guardado no próprio token (stateless) |
| Fácil revogar (basta apagar a sessão) | Difícil revogar antes da expiração |
| Exige armazenamento compartilhado entre servidores | Não exige, facilita escalar horizontalmente |
| Cookie geralmente `httpOnly`, mais simples de proteger contra XSS | Precisa de cuidado extra em como o token é armazenado no cliente |
| Comum em aplicações web tradicionais (monolito) | Comum em APIs, microsserviços e aplicações mobile |

---

# Onde armazenar o token no cliente?

- **localStorage**: fácil de usar, porém vulnerável a ataques **XSS** (scripts maliciosos podem ler o token).
- **Cookie httpOnly**: não pode ser acessado via JavaScript, reduzindo o risco de XSS, porém exige atenção a ataques **CSRF**.

```
localStorage → vulnerável a XSS

Cookie httpOnly → vulnerável a CSRF

(mitigado com SameSite e tokens CSRF)
```

Não existe uma opção "perfeita" — a escolha depende do tipo de aplicação e das medidas de segurança complementares adotadas.

---

# Quando usar Sessão x Token?

Utilize **Sessão** quando:

- a aplicação for um monolito tradicional, renderizado no servidor;
- for importante revogar o acesso instantaneamente;
- não houver necessidade de escalar para múltiplos serviços diferentes.

Utilize **Token (JWT)** quando:

- a aplicação for uma API consumida por front-end, mobile ou terceiros;
- a arquitetura envolver **microsserviços**, onde cada serviço precisa validar o usuário sem depender de um armazenamento central;
- for necessário escalar horizontalmente sem compartilhar estado entre servidores.

---

# Exemplo prático

Imagine uma aplicação com front-end React e uma API Node.js.

```
Usuário faz login

        │

        ▼

API gera Access Token (JWT)

+ Refresh Token

        │

        ▼

Front-end guarda o Access Token

em memória (ou cookie httpOnly)

        │

        ▼

Requisições usam

Authorization: Bearer <token>

        │

        ▼

Access Token expira

        │

        ▼

Front-end chama /refresh

usando o Refresh Token

        │

        ▼

Novo Access Token

e o usuário nem percebe
```

---

# Access Token x Refresh Token

| Access Token | Refresh Token |
|-----------|----------|
| Duração curta | Duração longa |
| Enviado em toda requisição | Usado apenas para gerar novo access token |
| Se vazar, risco limitado pelo tempo curto | Precisa de proteção extra (armazenamento seguro) |
| Não costuma ser salvo no servidor | Geralmente salvo/controlado no servidor para permitir revogação |

---

# Boas práticas

- Nunca armazene dados sensíveis no payload do JWT (ele não é criptografado).
- Utilize um Access Token de curta duração (minutos) e um Refresh Token de duração maior.
- Prefira `httpOnly cookies` para armazenar tokens sensíveis, quando possível.
- Implemente rotação de refresh tokens para reduzir o risco de reuso indevido.
- Sempre valide a assinatura do token no servidor, nunca confie apenas no conteúdo do payload.
- Use HTTPS em toda a aplicação — sem isso, qualquer estratégia de token fica vulnerável.
- Avalie sessão ou token de acordo com a arquitetura real do projeto, não por modismo.

---

# Resumo

| Conceito | Resolve |
|---------|---------|
| JWT | Representar dados de autenticação de forma compacta e verificável |
| Access/Refresh Token | Equilibrar segurança (curta duração) com boa experiência de uso |
| Sessão vs Token | Decidir a estratégia de autenticação de acordo com a arquitetura |

---

# Fluxo mental

```
Preciso autenticar meus usuários...

            │

   ┌────────┼────────┐

   ▼        ▼        ▼

Como         Como manter    Guardar estado
representar  a sessão       no servidor ou
os dados     ativa          no próprio token

   │        │        │

JWT      Access/     Sessão
         Refresh     vs Token
```

---

# Referências

- jwt.io — Introdução e decodificador de JWT: https://jwt.io/introduction
- RFC 7519 — JSON Web Token (JWT): https://datatracker.ietf.org/doc/html/rfc7519
- OWASP — JSON Web Token Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html

---

# APIs REST Avançadas, JWT , OAuth e Segurança Básica - 3 semana - OAuth2 (Authorization Code Flow)

# OAuth, OAuth 2.0, OIDC

# (Authorization Code Flow)

**OAuth** é um protocolo de **autorização** que permite que uma aplicação acesse recursos de um usuário em outro serviço, **sem que a aplicação precise conhecer a senha** desse usuário.

**OAuth 2.0** é a versão atual e amplamente adotada do protocolo, sendo a base utilizada por serviços como Google, GitHub, Facebook, entre outros, para permitir login e integrações entre sistemas.

**OIDC (OpenID Connect)** é uma camada construída **sobre o OAuth 2.0**, adicionando o conceito de **autenticação** (confirmar quem é o usuário), algo que o OAuth puro não resolve sozinho.

Os três pilares principais desse tema são:

- Diferença entre Autenticação e Autorização
- Authorization Code Flow (o fluxo mais utilizado e seguro do OAuth 2.0)
- OIDC como camada de identidade sobre o OAuth 2.0

---

# Por que entender OAuth?

Imagine uma aplicação que precisa integrar com serviços de terceiros (Google, GitHub, etc.).

Sem OAuth:

- a aplicação precisaria pedir a senha do usuário de outro serviço, um risco de segurança enorme;
- não haveria forma de dar acesso **limitado** (ex.: apenas ler e-mails, sem poder excluí-los);
- o usuário não teria controle para revogar o acesso depois;
- cada integração exigiria uma solução própria e insegura.

Com OAuth:

- o usuário autoriza o acesso sem compartilhar sua senha;
- é possível conceder permissões específicas (**scopes**);
- o acesso pode ser revogado a qualquer momento pelo usuário;
- é um padrão amplamente adotado, com bibliotecas prontas na maioria das linguagens.

---

# Visão geral

```
OAuth

        │

 ┌──────┼────────┐

 ▼      ▼        ▼

Autorização  Authorization   OIDC
(OAuth 2.0)  Code Flow       (Identidade)
```

O **OAuth 2.0** resolve autorização, o **Authorization Code Flow** é o fluxo mais seguro para aplicar isso na prática, e o **OIDC** adiciona a camada de autenticação por cima.

---

# Autenticação x Autorização

Antes de entender o OAuth, é essencial diferenciar esses dois conceitos, frequentemente confundidos.

```
Autenticação

↓

"Quem é você?"

Autorização

↓

"O que você pode fazer?"
```

- **Autenticação**: confirma a identidade do usuário (ex.: login com e-mail e senha).
- **Autorização**: define o que esse usuário (ou aplicação) tem permissão para acessar.

O **OAuth 2.0**, em sua essência, resolve **autorização**. Para resolver autenticação de forma padronizada, existe o **OIDC**.

---

# Papéis (Roles) no OAuth 2.0

- **Resource Owner**: o usuário, dono dos dados (ex.: dono da conta do Google).
- **Client**: a aplicação que quer acessar os dados (ex.: um app que quer ler os contatos do Google).
- **Authorization Server**: o servidor que autentica o usuário e emite os tokens (ex.: `accounts.google.com`).
- **Resource Server**: o servidor onde os dados realmente estão (ex.: API do Gmail).

```
Resource Owner (usuário)

↓ autoriza

Client (aplicação)

↓ solicita token

Authorization Server

↓ emite token

Client usa o token

↓ acessa dados

Resource Server
```

---

# O que são Scopes?

**Scopes** definem o **nível de acesso** que a aplicação está solicitando, evitando que ela tenha acesso total à conta do usuário.

```
scope=read:email profile
```

Isso significa: "a aplicação quer ler o e-mail e o perfil do usuário", nada além disso.

---

# Authorization Code Flow

É o fluxo **mais utilizado e mais seguro** do OAuth 2.0, recomendado para aplicações com back-end (capazes de manter um segredo com segurança).

```
1. Client redireciona o usuário

   para o Authorization Server

2. Usuário faz login e autoriza

3. Authorization Server redireciona

   de volta com um "code"

4. Client troca o "code" por um

   access_token (nos bastidores,

   servidor a servidor)

5. Client usa o access_token

   para acessar o Resource Server
```

---

# Passo 1 — Redirecionamento para autorização

A aplicação redireciona o usuário para o Authorization Server, informando quem ela é e o que deseja acessar.

```
GET https://authorization-server.com/authorize?
  response_type=code
  &client_id=abc123
  &redirect_uri=https://minhaapp.com/callback
  &scope=read:email profile
  &state=xyz987
```

- `response_type=code`: indica que o fluxo é o Authorization Code Flow.
- `client_id`: identifica a aplicação (previamente cadastrada no provedor).
- `redirect_uri`: para onde o usuário será enviado de volta.
- `scope`: quais permissões estão sendo solicitadas.
- `state`: valor aleatório usado para prevenir ataques CSRF.

---

# Passo 2 — Login e consentimento

O usuário faz login (caso ainda não esteja autenticado) e visualiza uma tela de consentimento:

```
"MinhaApp" quer acessar:

- Seu endereço de e-mail
- Seu perfil básico

[ Permitir ]   [ Negar ]
```

---

# Passo 3 — Redirecionamento com o Authorization Code

Após o consentimento, o Authorization Server redireciona o usuário de volta para a aplicação, com um **código temporário**.

```
https://minhaapp.com/callback?code=AUTH_CODE_TEMP&state=xyz987
```

Esse `code` é **de uso único** e expira rapidamente (geralmente em menos de um minuto). Ele **não é** o token de acesso final.

---

# Passo 4 — Trocando o Code pelo Access Token

O back-end da aplicação (nunca o front-end) troca esse código pelo token de acesso, em uma chamada servidor a servidor.

```typescript
const response = await fetch("https://authorization-server.com/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    grant_type: "authorization_code",
    code: "AUTH_CODE_TEMP",
    redirect_uri: "https://minhaapp.com/callback",
    client_id: "abc123",
    client_secret: process.env.CLIENT_SECRET!,
  }),
});

const dados = await response.json();
// { access_token, refresh_token, expires_in, token_type }
```

Esse passo exige o `client_secret`, que **nunca** deve ser exposto no front-end — por isso o Authorization Code Flow é considerado seguro: o token real nunca passa pelo navegador do usuário.

---

# Passo 5 — Acessando o recurso protegido

Com o `access_token` em mãos, a aplicação já pode acessar os dados do usuário no Resource Server.

```typescript
const perfil = await fetch("https://api.provedor.com/userinfo", {
  headers: {
    Authorization: `Bearer ${access_token}`,
  },
});
```

---

# Fluxo completo resumido

```
Usuário

  │
  ▼
Client pede autorização
  │
  ▼
Authorization Server
(login + consentimento)
  │
  ▼
Redireciona com "code"
  │
  ▼
Client troca "code"
por access_token
(servidor a servidor)
  │
  ▼
Client acessa o
Resource Server
com o access_token
```

---

# Por que o Authorization Code é mais seguro?

Diferente de outros fluxos mais antigos (como o **Implicit Flow**, hoje desaconselhado), o Authorization Code Flow:

- nunca expõe o `access_token` diretamente na URL ou no navegador;
- exige um `client_secret` para a troca final, algo que só o back-end possui;
- utiliza um `code` de curta duração e uso único, reduzindo o risco de interceptação.

---

# PKCE (Proof Key for Code Exchange)

Para aplicações que **não conseguem** guardar um segredo com segurança (SPAs, apps mobile), utiliza-se uma variação chamada **Authorization Code Flow com PKCE**.

```
Client gera um "code_verifier"

↓

Envia um "code_challenge"

(hash do code_verifier)

na etapa de autorização

↓

Na troca do code pelo token,

envia o "code_verifier" original

↓

Authorization Server confere

se o hash bate
```

Isso substitui a necessidade do `client_secret`, mantendo a segurança mesmo em aplicações públicas (sem back-end confiável).

---

# O que é OIDC (OpenID Connect)?

O **OIDC** utiliza a mesma estrutura do OAuth 2.0, mas adiciona um novo tipo de token: o **ID Token**, que é um **JWT** contendo informações de identidade do usuário.

```
OAuth 2.0

↓

resolve "o que a app pode acessar"

OIDC (sobre o OAuth 2.0)

↓

resolve também

"quem é o usuário"
```

---

# Diferenças na requisição

```
scope=openid profile email
```

A presença do escopo `openid` é o que caracteriza o uso do OIDC sobre o OAuth 2.0.

---

# ID Token x Access Token

| ID Token | Access Token |
|----------|----------|
| Usado para **autenticação** (identificar o usuário) | Usado para **autorização** (acessar recursos) |
| Sempre um JWT, com dados do usuário | Pode ser um JWT ou um token opaco |
| Consumido pela própria aplicação (front-end/back-end) | Enviado ao Resource Server nas requisições |
| Contém claims como `sub`, `email`, `name` | Não precisa conter dados de identidade |

```json
// Payload de um ID Token
{
  "sub": "123456",
  "email": "sheila@email.com",
  "name": "Sheila",
  "iss": "https://authorization-server.com",
  "aud": "abc123",
  "exp": 1710003600
}
```

---

# Quando usar OAuth 2.0 puro x OIDC?

Utilize:

- **OAuth 2.0 puro**: quando a aplicação só precisa **acessar recursos** de outro serviço em nome do usuário (ex.: ler arquivos do Google Drive), sem necessidade de identificá-lo.
- **OIDC**: quando a aplicação precisa **autenticar** o usuário (ex.: "Login com Google", onde é necessário saber quem é a pessoa).

Na prática, a maioria dos provedores modernos (Google, Microsoft, etc.) já implementa **OAuth 2.0 + OIDC juntos**.

---

# Comparando os conceitos

| Conceito | Objetivo |
|---------|----------|
| OAuth 2.0 | Autorizar acesso a recursos sem compartilhar senha |
| Authorization Code Flow | Fluxo seguro para obter o access token |
| OIDC | Adicionar autenticação (identidade) sobre o OAuth 2.0 |

---

# Exemplo prático — "Login com Google"

```
Usuário clica em

"Entrar com Google"

        │

        ▼

Redireciona para o Google

com scope=openid profile email

        │

        ▼

Usuário faz login

e autoriza

        │

        ▼

Google redireciona

com o "code"

        │

        ▼

Back-end troca o code

por access_token + id_token

        │

        ▼

Aplicação lê o id_token

(sabe quem é o usuário)

        │

        ▼

Cria sessão / JWT próprio

para o usuário na aplicação
```

---

# Authorization Code Flow x Authorization Code Flow com PKCE

| Sem PKCE | Com PKCE |
|-----------|----------|
| Requer `client_secret` | Não requer `client_secret` |
| Indicado para back-ends confiáveis | Indicado para SPAs e apps mobile |
| Segredo fica armazenado no servidor | Usa `code_verifier` gerado dinamicamente |
| Hoje considerado a base | Atualmente recomendado até para back-ends |

---

# OAuth 2.0 + JWT (Access/Refresh)

Vale relacionar este tema com o funcionamento de **Access Token e Refresh Token** já visto anteriormente: o `access_token` retornado pelo OAuth 2.0 é utilizado da mesma forma — enviado no header `Authorization: Bearer`, com expiração curta — e o `refresh_token` permite renovar o acesso sem exigir novo login.

```
POST /token
grant_type=refresh_token
&refresh_token=xyz...
&client_id=abc123
&client_secret=***
```

---

# Boas práticas

- Sempre utilize o **Authorization Code Flow** (com ou sem PKCE) — evite o Implicit Flow, hoje considerado inseguro.
- Utilize **PKCE** em aplicações SPA e mobile, mesmo quando `client_secret` estiver disponível.
- Sempre valide o parâmetro `state` para prevenir ataques CSRF.
- Nunca exponha o `client_secret` no front-end.
- Solicite apenas os **scopes** realmente necessários (princípio do menor privilégio).
- Utilize **OIDC** quando o objetivo for autenticação, não apenas autorização.
- Valide sempre a assinatura e o `exp` do `id_token` antes de confiar nele.

---

# Resumo

| Conceito | Resolve |
|---------|---------|
| OAuth 2.0 | Autorização de acesso a recursos sem compartilhar senha |
| Authorization Code Flow | Fluxo seguro de obtenção de tokens |
| OIDC | Autenticação padronizada construída sobre o OAuth 2.0 |

---

# Fluxo mental

```
Preciso integrar com

outro serviço...

            │

   ┌────────┼────────┐

   ▼        ▼        ▼

Autorizar   Como obter    Também preciso
acesso a    o token de    saber quem é
recursos    forma segura  o usuário

   │        │        │

OAuth 2.0  Authorization  OIDC
           Code Flow
```

---

# Referências

- RFC 6749 — The OAuth 2.0 Authorization Framework: https://datatracker.ietf.org/doc/html/rfc6749
- RFC 7636 — PKCE: https://datatracker.ietf.org/doc/html/rfc7636
- OpenID Connect — Especificação oficial: https://openid.net/specs/openid-connect-core-1_0.html
- Documentação do Google Identity — OAuth 2.0: https://developers.google.com/identity/protocols/oauth2

---

# APIs REST Avançadas, JWT , OAuth e Segurança Básica - 4 semana - Rate limiting, CORS, cookies seguros, logs estruturados

# Rate Limiting, CORS,

# Cookies Seguros, Logs Estruturados

Ao colocar uma API em produção, não basta apenas que ela funcione — ela também precisa ser **protegida**, **confiável** e **observável**. Quatro práticas fundamentais para isso são:

- **Rate Limiting**: limitar a quantidade de requisições por cliente.
- **CORS**: controlar quais origens podem acessar a API pelo navegador.
- **Cookies Seguros**: proteger dados sensíveis armazenados no navegador do usuário.
- **Logs Estruturados**: registrar eventos da aplicação de forma organizada e pesquisável.

---

# Por que se preocupar com isso?

Imagine uma API em produção, recebendo tráfego real.

Sem esses cuidados:

- um único cliente (ou ataque) pode sobrecarregar o servidor com requisições em excesso;
- sites maliciosos podem fazer requisições em nome do usuário sem autorização;
- cookies podem ser roubados via scripts maliciosos ou interceptados em conexões inseguras;
- um erro em produção vira uma busca manual em milhares de linhas de log sem estrutura.

Com essas práticas aplicadas:

- a API resiste a abusos e picos de tráfego;
- apenas origens confiáveis conseguem interagir com a API pelo navegador;
- dados sensíveis ficam protegidos mesmo em caso de falhas de segurança comuns;
- problemas em produção são identificados e depurados rapidamente.

---

# Visão geral

```
Segurança e Observabilidade

em Produção

        │

 ┌──────┼────┬────────┐

 ▼      ▼    ▼        ▼

Rate    CORS Cookies  Logs
Limiting     Seguros  Estruturados
```

Cada um resolve um problema diferente: **abuso de tráfego**, **origem das requisições**, **proteção de dados no navegador** e **rastreabilidade**.

---

# O que é Rate Limiting?

**Rate Limiting** é a técnica de **limitar quantas requisições** um cliente pode fazer em um determinado período de tempo.

```
Cliente faz requisições

↓

Servidor conta quantas

foram feitas no período

↓

Dentro do limite?

   │           │
  Sim          Não

   ▼            ▼

Processa    429 Too Many
normalmente Requests
```

---

# Problema

```
Cliente malicioso (ou bug no front-end)

envia 10.000 requisições por segundo

↓

Servidor sobrecarregado

↓

Aplicação fica lenta ou indisponível

para todos os outros usuários
```

---

# Solução — Implementando Rate Limiting

```typescript
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // até 100 requisições por IP nesse período
  message: { erro: "Muitas requisições. Tente novamente mais tarde." },
});

app.use("/api", limiter);
```

Ao ultrapassar o limite, a API responde com o status code adequado:

```
HTTP/1.1 429 Too Many Requests

{
  "erro": "Muitas requisições. Tente novamente mais tarde."
}
```

---

# Estratégias de Rate Limiting

- **Fixed Window**: conta requisições em janelas fixas de tempo (ex.: 100 por 15 minutos).
- **Sliding Window**: janela "deslizante", mais precisa, evita picos nas bordas da janela fixa.
- **Token Bucket**: cada cliente tem um "balde" de tokens que se renova com o tempo; cada requisição consome um token.
- **Leaky Bucket**: as requisições são processadas em um ritmo constante, "vazando" de um balde, suavizando picos de tráfego.

---

# Onde aplicar Rate Limiting?

- **Por IP**: mais simples, útil contra bots e scraping.
- **Por usuário autenticado**: mais justo, evita que um único usuário afete os demais.
- **Por endpoint**: endpoints sensíveis (ex.: `/login`) merecem limites mais rígidos que endpoints de leitura simples.

```typescript
app.use("/login", rateLimit({ windowMs: 60 * 1000, max: 5 }));
app.use("/api", rateLimit({ windowMs: 60 * 1000, max: 100 }));
```

Limitar o `/login` com mais rigor ajuda a mitigar ataques de **força bruta**.

---

# Quando usar Rate Limiting?

Utilize quando:

- a API for pública ou consumida por terceiros;
- houver endpoints sensíveis (login, recuperação de senha, envio de e-mails);
- for necessário proteger a infraestrutura contra picos inesperados de tráfego.

---

# O que é CORS?

**CORS (Cross-Origin Resource Sharing)** é um mecanismo do navegador que controla se uma página de um domínio pode fazer requisições para uma API hospedada em **outro domínio**.

```
Front-end em

https://meusite.com

↓

Tenta acessar

↓

API em

https://api.outrosite.com

↓

Navegador verifica

se a API permite essa origem
```

Por padrão, o navegador **bloqueia** requisições entre origens diferentes, a menos que o servidor informe explicitamente que permite.

---

# Problema

```
Front-end: https://meusite.com
API:       https://api.meusite.com
```

```
Access to fetch at 'https://api.meusite.com/dados'
from origin 'https://meusite.com' has been blocked by CORS policy
```

Mesmo sendo dois domínios da mesma empresa, se as origens forem diferentes, o navegador bloqueia a requisição até que a API autorize explicitamente.

---

# Solução — Configurando CORS

```typescript
import cors from "cors";

app.use(cors({
  origin: "https://meusite.com",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));
```

- `origin`: define quais domínios podem acessar a API.
- `methods`: define quais métodos HTTP são permitidos.
- `credentials`: permite o envio de cookies e headers de autenticação entre origens diferentes.

---

# Múltiplas origens permitidas

```typescript
const origensPermitidas = [
  "https://meusite.com",
  "https://admin.meusite.com",
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origensPermitidas.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Origem não permitida pelo CORS"));
    }
  },
}));
```

---

# Requisições Preflight

Para métodos como `PUT`, `DELETE` ou requisições com headers customizados, o navegador envia antes uma requisição **OPTIONS**, chamada de **preflight**, perguntando ao servidor se a requisição real será permitida.

```
OPTIONS /dados HTTP/1.1
Origin: https://meusite.com
Access-Control-Request-Method: DELETE
```

```
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: https://meusite.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
```

Somente após essa aprovação o navegador envia a requisição real.

---

# Quando configurar CORS?

Utilize quando:

- o front-end e a API estiverem em domínios (ou subdomínios/portas) diferentes;
- for necessário permitir acesso de aplicativos de terceiros à API;
- for preciso enviar cookies entre domínios diferentes (`credentials: true`).

**Evite** configurar `origin: "*"` em APIs que lidam com dados sensíveis ou autenticação, pois isso permite que **qualquer site** faça requisições para a API.

---

# O que são Cookies Seguros?

**Cookies** são pequenos dados armazenados no navegador do usuário, muito utilizados para manter sessões e tokens de autenticação. Torná-los **seguros** significa configurar atributos que reduzem riscos como roubo de sessão (XSS) e falsificação de requisição (CSRF).

```
Servidor define o cookie

↓

Navegador armazena

↓

Envia automaticamente

em requisições futuras

para o mesmo domínio
```

---

# Atributos importantes de um Cookie

```typescript
res.cookie("session_token", token, {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
  maxAge: 15 * 60 * 1000,
});
```

- **httpOnly**: impede que o cookie seja acessado via JavaScript, reduzindo o risco de roubo por ataques **XSS**.
- **secure**: garante que o cookie só seja enviado em conexões **HTTPS**.
- **sameSite**: controla se o cookie é enviado em requisições vindas de outros domínios, mitigando ataques **CSRF**.
- **maxAge / expires**: define o tempo de vida do cookie.

---

# Valores do SameSite

- **Strict**: o cookie só é enviado em requisições originadas do mesmo site (mais seguro, porém pode quebrar fluxos de redirecionamento externos).
- **Lax** (padrão na maioria dos navegadores): permite o envio em navegações simples entre sites (ex.: clicar em um link), mas bloqueia em requisições como `POST` de outra origem.
- **None**: o cookie é enviado em qualquer contexto entre origens diferentes — exige que `secure: true` esteja definido.

```
sameSite: "strict" → mais seguro, menos flexível

sameSite: "lax"    → equilíbrio (padrão recomendado)

sameSite: "none"   → necessário para cenários cross-site,
                      sempre com secure: true
```

---

# Problema — Cookie sem proteção

```typescript
res.cookie("session_token", token);
```

Sem os atributos de segurança, esse cookie:

- pode ser lido por qualquer script JavaScript rodando na página (risco de XSS);
- pode ser enviado mesmo em conexões HTTP não criptografadas;
- pode ser enviado em requisições disparadas por outros sites (risco de CSRF).

---

# Quando usar Cookies Seguros?

Utilize sempre que o cookie armazenar:

- tokens de sessão ou autenticação;
- qualquer dado sensível relacionado ao usuário.

Combine `httpOnly`, `secure` e `sameSite` como prática padrão, e não apenas em cenários "de risco percebido".

---

# O que são Logs Estruturados?

**Logs estruturados** são registros de eventos da aplicação escritos em um **formato padronizado** (geralmente JSON), em vez de texto livre, facilitando busca, filtragem e análise automatizada.

```
Log tradicional (texto livre)

↓

"Usuário 123 fez login às 14:32"

Log estruturado (JSON)

↓

{ "evento": "login", "usuarioId": 123, "timestamp": "..." }
```

---

# Problema — Log não estruturado

```typescript
console.log(`Usuário ${usuario.id} fez login em ${new Date()}`);
```

```
Usuário 123 fez login em Sun Aug 30 2026 14:32:10
Usuário 456 fez login em Sun Aug 30 2026 14:32:15
Erro ao processar pedido 789: saldo insuficiente
```

Buscar, filtrar ou agregar informações desses logs exige expressões regulares frágeis e propensas a erro.

---

# Solução — Log estruturado

```typescript
import pino from "pino";

const logger = pino();

logger.info({
  evento: "login",
  usuarioId: usuario.id,
}, "Usuário autenticado com sucesso");
```

```json
{
  "level": 30,
  "time": 1710000000000,
  "evento": "login",
  "usuarioId": 123,
  "msg": "Usuário autenticado com sucesso"
}
```

Nesse formato, é possível filtrar logs por `evento`, `usuarioId`, nível de severidade, entre outros campos, de forma confiável.

---

# Níveis de Log

- **debug**: informações detalhadas, úteis apenas durante o desenvolvimento.
- **info**: eventos normais da aplicação (ex.: login realizado, pedido criado).
- **warn**: situações inesperadas, mas que não impedem o funcionamento.
- **error**: falhas que impactam a operação, mas não derrubam a aplicação.
- **fatal**: erros críticos que podem interromper a aplicação.

```typescript
logger.warn({ pedidoId: 789 }, "Estoque baixo para o produto");
logger.error({ pedidoId: 789, erro: erro.message }, "Falha ao processar pagamento");
```

---

# Correlação de logs (Request ID)

Em sistemas com múltiplas requisições simultâneas, é importante conseguir agrupar todos os logs de uma **mesma requisição**, utilizando um identificador único.

```typescript
app.use((req, res, next) => {
  req.requestId = crypto.randomUUID();
  next();
});

app.use((req, res, next) => {
  req.log = logger.child({ requestId: req.requestId });
  next();
});
```

```json
{ "requestId": "a1b2c3", "evento": "pedido_criado", "pedidoId": 789 }
{ "requestId": "a1b2c3", "evento": "pagamento_processado", "pedidoId": 789 }
```

Assim, é possível reconstruir toda a jornada de uma requisição específica, mesmo em sistemas com muito tráfego simultâneo.

---

# Quando usar Logs Estruturados?

Utilize sempre, especialmente quando:

- a aplicação estiver em produção, com múltiplos usuários simultâneos;
- houver integração com ferramentas de observabilidade (ex.: Datadog, Grafana, ELK Stack);
- for necessário rastrear o fluxo completo de uma requisição entre diferentes serviços.

**Nunca** registre dados sensíveis (senhas, tokens, dados de cartão) nos logs, mesmo estruturados.

---

# Comparando os conceitos

| Conceito | Objetivo |
|---------|----------|
| Rate Limiting | Limitar requisições e proteger contra abuso |
| CORS | Controlar quais origens podem acessar a API |
| Cookies Seguros | Proteger dados sensíveis armazenados no navegador |
| Logs Estruturados | Tornar os eventos da aplicação rastreáveis e analisáveis |

---

# Exemplo prático

Imagine uma API de login em produção.

```
Requisição chega em /login

        │

        ▼

Rate Limiting

(máx. 5 tentativas por minuto)

        │

        ▼

CORS verifica

a origem da requisição

        │

        ▼

Login validado

        │

        ▼

Cookie de sessão criado

(httpOnly, secure, sameSite)

        │

        ▼

Log estruturado registrado

{ evento: "login", usuarioId, requestId }
```

---

# httpOnly x secure x sameSite

É comum confundir a função de cada atributo do cookie.

| Atributo | Protege contra |
|----------|----------|
| httpOnly | Leitura do cookie via JavaScript (XSS) |
| secure | Envio do cookie em conexões não criptografadas |
| sameSite | Envio do cookie em requisições de outras origens (CSRF) |

---

# Rate Limiting x CORS

| Rate Limiting | CORS |
|-----------|----------|
| Controla **quantas** requisições um cliente pode fazer | Controla **de onde** as requisições podem vir |
| Protege contra abuso e sobrecarga | Protege contra requisições não autorizadas via navegador |
| Aplicado no servidor, para qualquer tipo de cliente | Aplicado e verificado pelo navegador do usuário |

---

# Boas práticas

- Configure Rate Limiting mais rígido em endpoints sensíveis, como `/login`.
- Nunca use `origin: "*"` em APIs autenticadas ou que lidam com dados sensíveis.
- Sempre utilize `httpOnly`, `secure` e `sameSite` em cookies que armazenam sessão ou autenticação.
- Estruture todos os logs em JSON, incluindo um identificador de requisição (`requestId`).
- Nunca registre senhas, tokens ou dados sensíveis nos logs.
- Centralize os logs em uma ferramenta de observabilidade, em vez de depender apenas do terminal.
- Combine essas quatro práticas — elas se complementam, não substituem uma à outra.

---

# Resumo

| Conceito | Resolve |
|---------|---------|
| Rate Limiting | Proteção contra abuso e sobrecarga de requisições |
| CORS | Controle de quais origens podem acessar a API |
| Cookies Seguros | Proteção de dados sensíveis armazenados no navegador |
| Logs Estruturados | Rastreabilidade e observabilidade da aplicação |

---

# Fluxo mental

```
Minha API está em produção...

            │

  ┌─────────┼──────────┬───────────┐

  ▼         ▼          ▼           ▼

Preciso     Preciso     Preciso     Preciso
limitar     controlar   proteger    rastrear
abusos      origens     cookies     eventos

  │         │          │           │

Rate      CORS       Cookies     Logs
Limiting             Seguros     Estruturados
```

---

# Referências

- MDN Web Docs — CORS: https://developer.mozilla.org/pt-BR/docs/Web/HTTP/CORS
- MDN Web Docs — Set-Cookie e atributos de segurança: https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Headers/Set-Cookie
- OWASP — Rate Limiting Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Denial_of_Service_Cheat_Sheet.html
- Documentação do Pino (logger estruturado para Node.js): https://getpino.io/

---
