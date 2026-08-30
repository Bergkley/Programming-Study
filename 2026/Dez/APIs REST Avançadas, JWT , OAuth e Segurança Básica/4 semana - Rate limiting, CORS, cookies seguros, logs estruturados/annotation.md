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