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