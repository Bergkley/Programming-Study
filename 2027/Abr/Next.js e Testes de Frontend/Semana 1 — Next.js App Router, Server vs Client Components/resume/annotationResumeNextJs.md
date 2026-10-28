# Next.js App Router

# Server vs Client Components

O **Next.js** é um framework React que adiciona roteamento, renderização no servidor, otimizações de performance e uma estrutura completa para construir aplicações web. O **App Router** (pasta `app/`) é o modelo de roteamento atual, construído sobre os **React Server Components**.

A grande mudança do App Router é que, **por padrão, todo componente é um Server Component**: ele roda **apenas no servidor**, e só o resultado (HTML + dados) chega ao navegador. Quando é necessário interatividade, usa-se um **Client Component**.

Os três pilares principais desse tema são:

- **App Router**: roteamento baseado em pastas, layouts e arquivos especiais.
- **Server Components**: componentes renderizados no servidor (padrão).
- **Client Components**: componentes com interatividade e hooks, renderizados também no navegador.

---

# Por que isso importa?

Imagine uma aplicação React tradicional (SPA) crescendo ao longo do tempo.

Sem Server Components:

- todo o JavaScript dos componentes é enviado ao navegador, aumentando o bundle;
- dados são buscados no cliente (`useEffect` + `fetch`), gerando "cascatas" de loading;
- credenciais e lógica sensível precisam ficar fora do front-end, exigindo uma API separada;
- o usuário vê uma tela em branco até o JavaScript carregar e executar.

Com App Router + Server Components:

- componentes de servidor **não enviam JavaScript** ao navegador;
- dados são buscados **direto no componente**, no servidor, perto do banco/API;
- é possível acessar banco de dados e segredos com segurança, sem expô-los ao cliente;
- o HTML já chega pronto, melhorando carregamento e SEO.

---

# Visão geral

```
Next.js App Router

        │

 ┌──────┼────────┐

 ▼      ▼        ▼

Roteamento  Server       Client
(pastas e   Components   Components
 layouts)   (padrão)     ("use client")
```

---

# Estrutura do App Router

O roteamento é definido pela **estrutura de pastas** dentro de `app/`.

```
app/
 ├── layout.tsx          → layout raiz (obrigatório)
 ├── page.tsx            → rota "/"
 ├── loading.tsx         → UI de carregamento
 ├── error.tsx           → UI de erro
 ├── not-found.tsx       → página 404
 │
 ├── produtos/
 │    ├── page.tsx       → rota "/produtos"
 │    └── [id]/
 │         └── page.tsx  → rota "/produtos/123" (dinâmica)
 │
 └── api/
      └── usuarios/
           └── route.ts  → endpoint "/api/usuarios"
```

---

# Arquivos especiais

- **page.tsx**: define a UI de uma rota e a torna acessível publicamente.
- **layout.tsx**: UI compartilhada entre páginas (cabeçalho, menu). **Não re-renderiza** ao navegar entre páginas filhas.
- **loading.tsx**: exibido automaticamente (via Suspense) enquanto a página carrega.
- **error.tsx**: exibido quando ocorre um erro na rota (Error Boundary automático).
- **not-found.tsx**: exibido quando a rota ou recurso não existe.
- **route.ts**: define um endpoint de API (Route Handler).

```typescript
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <Cabecalho />
        {children}
      </body>
    </html>
  );
}
```

```typescript
// app/produtos/page.tsx
export default function ProdutosPage() {
  return <h1>Produtos</h1>;
}
```

O `loading.tsx` e o `error.tsx` aplicam na prática o que foi visto em **Suspense** e **Error Boundary**, sem precisar configurá-los manualmente.

---

# Rotas dinâmicas

```typescript
// app/produtos/[id]/page.tsx
export default async function ProdutoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {

  const { id } = await params;
  const produto = await buscarProduto(id);

  return <h1>{produto.nome}</h1>;

}
```

A pasta `[id]` cria um parâmetro dinâmico, disponível em `params`. Nas versões mais recentes do Next.js, `params` é uma **Promise** e deve ser aguardado com `await`.

---

# O que são Server Components?

**Server Components** são componentes React que rodam **exclusivamente no servidor**. O navegador recebe apenas o resultado renderizado, sem o código do componente.

```
Requisição

        │

        ▼

Servidor executa o componente

(busca dados, acessa banco)

        │

        ▼

Envia o resultado (HTML/RSC payload)

        │

        ▼

Navegador exibe

sem baixar o JS do componente
```

No App Router, **todo componente é Server Component por padrão** — não é preciso escrever nada especial.

---

# Exemplo — Server Component buscando dados

```typescript
// app/produtos/page.tsx  (Server Component)
import { db } from "@/lib/db";

export default async function ProdutosPage() {

  const produtos = await db.produto.findMany();

  return (
    <ul>
      {produtos.map((produto) => (
        <li key={produto.id}>{produto.nome}</li>
      ))}
    </ul>
  );

}
```

- O componente é **`async`**: pode usar `await` diretamente.
- Acessa o **banco de dados** (ex.: Prisma) sem expor nada ao navegador.
- Não há `useEffect`, `useState` nem estado de `loading` manual.

Compare com o fluxo "clássico" (SPA): componente + `useEffect` + `fetch` para uma API + estados de loading/erro, tudo no cliente.

---

# O que Server Components podem e não podem fazer

**Podem:**

- ser `async` e usar `await` diretamente;
- acessar banco de dados, sistema de arquivos e variáveis de ambiente secretas;
- usar bibliotecas pesadas sem aumentar o bundle do cliente;
- renderizar Client Components como filhos.

**Não podem:**

- usar hooks de estado e efeito (`useState`, `useEffect`, `useReducer`);
- usar eventos do navegador (`onClick`, `onChange`);
- usar APIs do navegador (`window`, `localStorage`, `document`);
- usar `useContext` (Context só funciona em Client Components).

---

# O que são Client Components?

**Client Components** são os componentes React "tradicionais": são pré-renderizados no servidor (HTML inicial) e depois **hidratados** no navegador, passando a ter interatividade.

Para marcar um componente como Client Component, usa-se a diretiva **`"use client"`** no **topo** do arquivo.

```typescript
"use client";

import { useState } from "react";

export default function Contador() {

  const [valor, setValor] = useState(0);

  return (
    <button onClick={() => setValor(valor + 1)}>
      Cliques: {valor}
    </button>
  );

}
```

Sem o `"use client"`, esse componente falharia, pois `useState` e `onClick` não existem em Server Components.

---

# Quando usar cada um?

| Necessidade | Server Component | Client Component |
|---------|:---------:|:---------:|
| Buscar dados (API, banco) | Sim | Possível, mas menos ideal |
| Acessar segredos/chaves de API | Sim | Nunca |
| Reduzir JavaScript enviado ao navegador | Sim | Não |
| `useState`, `useEffect`, `useReducer` | Não | Sim |
| Eventos (`onClick`, `onChange`) | Não | Sim |
| APIs do navegador (`localStorage`, `window`) | Não | Sim |
| `useContext` / Context Providers | Não | Sim |
| Bibliotecas que dependem do navegador | Não | Sim |

**Regra prática:** mantenha tudo como **Server Component** e use `"use client"` apenas nas "folhas" da árvore que realmente precisam de interatividade.

---

# Compondo Server e Client Components

Um Server Component pode **importar e renderizar** Client Components. A fronteira `"use client"` define a partir de onde o código vai também para o navegador.

```typescript
// app/produtos/page.tsx  (Server Component)
import BotaoFavoritar from "./BotaoFavoritar"; // Client Component

export default async function ProdutosPage() {

  const produtos = await buscarProdutos();

  return (
    <ul>
      {produtos.map((produto) => (
        <li key={produto.id}>
          {produto.nome}
          <BotaoFavoritar produtoId={produto.id} />
        </li>
      ))}
    </ul>
  );

}
```

```typescript
// app/produtos/BotaoFavoritar.tsx  (Client Component)
"use client";

import { useState } from "react";

export default function BotaoFavoritar({ produtoId }: { produtoId: string }) {

  const [favorito, setFavorito] = useState(false);

  return (
    <button onClick={() => setFavorito(!favorito)}>
      {favorito ? "Favorito" : "Favoritar"}
    </button>
  );

}
```

```
ProdutosPage (Server)

   │ busca dados no servidor

   ▼

Lista de produtos (HTML)

   │

   └── BotaoFavoritar (Client)

          interatividade

          no navegador
```

Só o botão envia JavaScript ao navegador; a lista e a busca de dados permanecem no servidor.

---

# Passando Server Components como children

Um Client Component **não pode importar** um Server Component, mas pode **receber um Server Component como `children`** (ou outra prop). Isso mantém o conteúdo no servidor.

```typescript
// Client Component
"use client";

export default function Modal({ children }: { children: React.ReactNode }) {

  const [aberto, setAberto] = useState(false);

  return (
    <div>
      <button onClick={() => setAberto(!aberto)}>Abrir</button>
      {aberto && <div>{children}</div>}
    </div>
  );

}
```

```typescript
// Server Component
export default async function Pagina() {
  return (
    <Modal>
      <ConteudoPesadoDoServidor />
    </Modal>
  );
}
```

Esse é o mesmo princípio da técnica de `children` como otimização, vista em **Context API + Re-render**.

---

# Serialização — o que pode atravessar a fronteira

Props passadas de um Server Component para um Client Component precisam ser **serializáveis** (strings, números, objetos simples, arrays, datas…).

```typescript
// Funciona
<BotaoFavoritar produtoId="123" />

// Não funciona: funções não são serializáveis
<BotaoFavoritar onClick={() => console.log("oi")} />
```

Funções comuns não podem ser passadas do servidor para o cliente. Para executar lógica no servidor a partir do cliente, usam-se **Server Actions**.

---

# Context em Client Components

Como `useContext` só funciona em Client Components, Providers (tema, autenticação, React Query, Redux) devem ser Client Components, envolvendo a aplicação no layout.

```typescript
// app/providers.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {

  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

}
```

```typescript
// app/layout.tsx  (Server Component)
import Providers from "./providers";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

Como `children` continua sendo repassado, o restante da aplicação **permanece Server Component**, mesmo dentro do Provider.

---

# Busca de dados e cache

No App Router, o `fetch` pode ser feito direto em Server Components, e o Next.js oferece controle sobre cache e revalidação.

```typescript
// Dados dinâmicos: sempre busca de novo
const res = await fetch("https://api.exemplo.com/pedidos", {
  cache: "no-store",
});

// Revalida a cada 60 segundos
const res = await fetch("https://api.exemplo.com/produtos", {
  next: { revalidate: 60 },
});
```

O comportamento padrão de cache mudou entre versões do Next.js. Vale confirmar na documentação da versão em uso quais requisições são cacheadas por padrão.

---

# Server Actions

**Server Actions** são funções que rodam **no servidor**, mas podem ser chamadas a partir de formulários ou de Client Components, sem criar um endpoint de API manualmente.

```typescript
// app/produtos/actions.ts
"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function criarProduto(formData: FormData) {

  const nome = formData.get("nome") as string;

  await db.produto.create({ data: { nome } });

  revalidatePath("/produtos");

}
```

```typescript
// app/produtos/novo/page.tsx
import { criarProduto } from "../actions";

export default function NovoProdutoPage() {
  return (
    <form action={criarProduto}>
      <input name="nome" />
      <button type="submit">Criar</button>
    </form>
  );
}
```

O `revalidatePath` cumpre um papel parecido com o `invalidateQueries` do React Query: marca os dados da rota como desatualizados após uma alteração.

**Atenção:** Server Actions são endpoints públicos na prática. Sempre **valide os dados** (por exemplo, com Zod) e **verifique autenticação/autorização** dentro da action.

---

# Streaming e Suspense

O Next.js usa **streaming**: partes da página podem ser enviadas ao navegador conforme ficam prontas, em vez de esperar tudo.

```typescript
import { Suspense } from "react";

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>

      <Suspense fallback={<p>Carregando vendas...</p>}>
        <VendasRecentes />   {/* Server Component async e lento */}
      </Suspense>

      <Suspense fallback={<p>Carregando pedidos...</p>}>
        <PedidosPendentes />
      </Suspense>
    </div>
  );
}
```

O título aparece imediatamente, e cada bloco entra assim que seus dados chegam — o mesmo conceito de granularidade de Suspense visto anteriormente.

---

# Comparando os conceitos

| Conceito | Objetivo |
|---------|----------|
| App Router | Roteamento por pastas, com layouts e arquivos especiais |
| Server Component | Renderizar no servidor, sem enviar JS ao navegador |
| Client Component | Adicionar interatividade, hooks e APIs do navegador |
| Server Action | Executar lógica no servidor a partir de formulários/eventos |
| Streaming/Suspense | Enviar a página em partes, conforme os dados ficam prontos |

---

# Exemplo prático

Imagine uma página de produtos com busca e botão de favoritar.

```
app/produtos/page.tsx (Server)

        │

        ▼

Busca produtos direto no banco

        │

        ▼

Renderiza a lista em HTML

        │

        ├── <CampoBusca />      (Client: useState, onChange)

        │

        └── <BotaoFavoritar />  (Client: onClick)

        │

        ▼

Usuário clica em "Favoritar"

        │

        ▼

Server Action grava no banco

        │

        ▼

revalidatePath atualiza a lista
```

---

# Server Component x Client Component

É comum confundir os dois.

| Server Component | Client Component |
|----------|----------|
| Padrão no App Router | Exige `"use client"` |
| Roda apenas no servidor | Renderiza no servidor (HTML inicial) **e** no navegador |
| Não envia JS do componente ao cliente | Envia JS e é hidratado no navegador |
| Pode ser `async` e acessar banco/segredos | Não deve acessar segredos |
| Sem hooks de estado/efeito | Pode usar todos os hooks |

---

# App Router x Pages Router

| App Router (`app/`) | Pages Router (`pages/`) |
|----------|----------|
| Server Components por padrão | Componentes de cliente por padrão |
| Layouts aninhados e persistentes | Layout via `_app` / composição manual |
| Busca de dados com `async/await` no componente | `getServerSideProps`, `getStaticProps` |
| `loading.tsx`, `error.tsx` nativos | Tratamento manual |
| Modelo atual, recomendado para novos projetos | Modelo anterior, ainda suportado |

---

# Boas práticas

- Mantenha componentes como **Server Components** por padrão e adicione `"use client"` só quando necessário.
- Empurre o `"use client"` para as **folhas** da árvore, mantendo o máximo possível no servidor.
- Busque dados no **Server Component**, o mais perto possível de onde são usados.
- Use `Suspense` e `loading.tsx` para exibir partes da página conforme ficam prontas.
- Nunca importe segredos ou código exclusivo de servidor em Client Components.
- Valide dados e verifique permissões dentro de toda **Server Action**.
- Coloque Providers (Context, React Query, Redux) em um Client Component separado e use-o no layout.
- Passe para Client Components apenas props **serializáveis**.
- Consulte a documentação da versão do Next.js em uso, pois comportamentos de cache e APIs mudam entre versões.

---

# Resumo

| Conceito | Resolve |
|---------|----------|
| App Router | Estrutura de rotas, layouts e estados de UI por pastas |
| Server Components | Menos JavaScript no cliente e acesso seguro a dados |
| Client Components | Interatividade, hooks e eventos do navegador |
| Server Actions | Mutações no servidor sem criar endpoints manualmente |

---

# Fluxo mental

```
Preciso criar um componente...

            │

   ┌────────┼────────┐

   ▼        ▼        ▼

Só exibe    Precisa de     Precisa de
dados /     estado,        segredos /
busca       eventos ou     banco de
dados       APIs do        dados
            navegador

   │        │        │

Server     Client      Server
Component  Component   Component
           ("use client")
```

---

# Referências

- Documentação oficial do Next.js — App Router: https://nextjs.org/docs/app
- Server and Client Components: https://nextjs.org/docs/app/getting-started/server-and-client-components
- Server Actions e Mutations: https://nextjs.org/docs/app/getting-started/updating-data
- React — Server Components: https://react.dev/reference/rsc/server-components