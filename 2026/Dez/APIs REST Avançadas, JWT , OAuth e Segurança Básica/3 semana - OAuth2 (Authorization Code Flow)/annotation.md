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