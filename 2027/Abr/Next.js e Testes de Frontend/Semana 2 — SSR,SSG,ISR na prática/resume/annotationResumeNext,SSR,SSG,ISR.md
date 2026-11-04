# Next.js

# SSR, SSG, ISR e CSR

Uma das decisões mais importantes ao construir uma aplicação Next.js é **quando e onde cada página é renderizada**. O Next.js oferece diferentes estratégias de renderização, cada uma com um equilíbrio diferente entre **performance**, **atualidade dos dados** e **custo de servidor**.

As quatro estratégias são:

- **SSG (Static Site Generation)**: a página é gerada **uma vez, no build**, e servida como arquivo estático.
- **SSR (Server-Side Rendering)**: a página é gerada **a cada requisição**, no servidor.
- **ISR (Incremental Static Regeneration)**: a página é estática, mas **regenerada em segundo plano** de tempos em tempos (ou sob demanda).
- **CSR (Client-Side Rendering)**: o **navegador** monta a página (ou parte dela) com JavaScript, buscando os dados depois que a página carrega.

---

# Por que isso importa?

Imagine um e-commerce com página inicial, catálogo, detalhe de produto e área do cliente.

Usando a mesma estratégia para tudo:

- páginas que raramente mudam (ex.: "Sobre nós") sendo geradas a cada acesso, gastando servidor à toa;
- páginas com dados em tempo real (ex.: estoque, preço) servidas desatualizadas;
- páginas com milhares de produtos exigindo um build gigantesco;
- SEO e velocidade de carregamento comprometidos.

Escolhendo a estratégia certa para cada página:

- páginas estáticas servidas por CDN, quase instantâneas;
- páginas dinâmicas sempre com dados atualizados;
- catálogos grandes atualizados sem refazer o site inteiro;
- melhor equilíbrio entre custo, velocidade e frescor dos dados.

---

# Visão geral

```
Estratégias de renderização

        │

 ┌──────┼──────┬────────┐

 ▼      ▼      ▼        ▼

SSG     ISR    SSR      CSR

(build) (build + (cada   (no
         revalida) requisição) navegador)
```

```
Mais estático / mais rápido          Mais dinâmico / mais atual

SSG  →  ISR  →  SSR  →  CSR
```

---

# Pré-requisito — Onde acontece a renderização

```
SSG

↓

Build (uma vez)

↓

HTML pronto, servido por CDN

SSR

↓

Requisição chega

↓

Servidor gera o HTML na hora

CSR

↓

Navegador recebe um "casco" vazio

↓

JavaScript busca os dados e monta a tela
```

---

# SSG — Static Site Generation

No **SSG**, o HTML da página é gerado **durante o build** (`next build`) e reaproveitado para todos os visitantes, como um arquivo estático servido por CDN.

```
next build

        │

        ▼

Busca dados e gera o HTML

        │

        ▼

Arquivos estáticos

        │

        ▼

Visitante acessa

↓

CDN entrega o HTML pronto

(sem processar nada)
```

No **App Router**, uma página sem dados dinâmicos é estática por padrão:

```typescript
// app/sobre/page.tsx
export default function SobrePage() {
  return (
    <div>
      <h1>Sobre nós</h1>
      <p>Conteúdo que raramente muda.</p>
    </div>
  );
}
```

Uma página com busca de dados também pode ser estática, desde que a busca possa ser feita no build:

```typescript
// app/blog/page.tsx
export default async function BlogPage() {

  const posts = await fetch("https://api.exemplo.com/posts", {
    cache: "force-cache",
  }).then((res) => res.json());

  return (
    <ul>
      {posts.map((post: Post) => (
        <li key={post.id}>{post.titulo}</li>
      ))}
    </ul>
  );

}
```

---

# SSG com rotas dinâmicas (generateStaticParams)

Para rotas como `/blog/[slug]`, o Next.js precisa saber **quais páginas gerar** no build. Isso é feito com `generateStaticParams`.

```typescript
// app/blog/[slug]/page.tsx

export async function generateStaticParams() {

  const posts = await fetch("https://api.exemplo.com/posts").then((res) =>
    res.json()
  );

  return posts.map((post: Post) => ({ slug: post.slug }));

}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {

  const { slug } = await params;
  const post = await buscarPost(slug);

  return <article>{post.conteudo}</article>;

}
```

```
Build

↓

generateStaticParams retorna

["ola-mundo", "nextjs", "react"]

↓

Gera 3 páginas estáticas:

/blog/ola-mundo
/blog/nextjs
/blog/react
```

---

# Vantagens e limitações do SSG

**Vantagens:**

- carregamento extremamente rápido (HTML pronto, servido por CDN);
- baixo custo de servidor (nada é processado por requisição);
- ótimo para SEO;
- alta disponibilidade e escalabilidade.

**Limitações:**

- os dados ficam **congelados** até o próximo build;
- sites com muitas páginas podem ter builds longos;
- não serve para conteúdo personalizado por usuário.

---

# Quando usar SSG?

Utilize quando:

- o conteúdo **muda pouco** (páginas institucionais, documentação, posts de blog);
- o conteúdo é **igual para todos** os visitantes;
- a velocidade e o SEO são prioridade.

---

# SSR — Server-Side Rendering

No **SSR**, o HTML é gerado **no servidor a cada requisição**, sempre com os dados mais atuais.

```
Visitante acessa a página

        │

        ▼

Servidor recebe a requisição

        │

        ▼

Busca dados atualizados

        │

        ▼

Gera o HTML na hora

        │

        ▼

Envia ao navegador
```

No App Router, uma página vira dinâmica (SSR) quando usa **dados dinâmicos**, como `cookies()`, `headers()`, `searchParams`, ou um `fetch` sem cache.

```typescript
// app/pedidos/page.tsx

export default async function PedidosPage() {

  const pedidos = await fetch("https://api.exemplo.com/pedidos", {
    cache: "no-store",
  }).then((res) => res.json());

  return (
    <ul>
      {pedidos.map((pedido: Pedido) => (
        <li key={pedido.id}>{pedido.numero}</li>
      ))}
    </ul>
  );

}
```

Também é possível forçar o comportamento da rota inteira:

```typescript
export const dynamic = "force-dynamic";
```

---

# SSR com dados do usuário

```typescript
// app/painel/page.tsx
import { cookies } from "next/headers";

export default async function PainelPage() {

  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  const dados = await buscarDadosDoUsuario(token);

  return <h1>Olá, {dados.nome}</h1>;

}
```

Ao usar `cookies()`, o Next.js entende que a página **depende da requisição** e a renderiza dinamicamente. Esse é um caso clássico de SSR: conteúdo **personalizado por usuário**, conectando com o tema de **cookies seguros**.

---

# Vantagens e limitações do SSR

**Vantagens:**

- dados sempre atualizados;
- permite conteúdo personalizado por usuário;
- bom para SEO (o HTML já vem completo).

**Limitações:**

- mais lento que SSG (o servidor precisa processar cada requisição);
- maior custo de servidor;
- o tempo de resposta depende da velocidade das APIs/banco usados.

---

# Quando usar SSR?

Utilize quando:

- os dados **mudam a todo momento** (estoque, cotações, feeds);
- o conteúdo é **personalizado por usuário** (painel, carrinho, perfil);
- a página depende de informações da **requisição** (cookies, headers, parâmetros de busca).

---

# ISR — Incremental Static Regeneration

O **ISR** combina o melhor dos dois mundos: a página é **estática** (rápida, servida por CDN), mas é **regenerada em segundo plano** depois de um tempo, sem precisar refazer o build do site inteiro.

```
Build

↓

Página estática gerada

        │

        ▼

Visitantes recebem

a versão em cache (rápido)

        │

        ▼

Passou o tempo de revalidação?

   │           │
  Não          Sim

   ▼            ▼

Continua      Próxima visita recebe a
servindo      versão antiga e dispara a
a mesma       regeneração em segundo plano

                    │
                    ▼

              Nova versão fica
              disponível para
              as próximas visitas
```

---

# ISR por tempo (time-based)

```typescript
// app/produtos/page.tsx

export const revalidate = 60; // regenera no máximo a cada 60 segundos

export default async function ProdutosPage() {

  const produtos = await fetch("https://api.exemplo.com/produtos").then((res) =>
    res.json()
  );

  return (
    <ul>
      {produtos.map((produto: Produto) => (
        <li key={produto.id}>{produto.nome}</li>
      ))}
    </ul>
  );

}
```

Ou definindo o tempo diretamente no `fetch`:

```typescript
const produtos = await fetch("https://api.exemplo.com/produtos", {
  next: { revalidate: 60 },
}).then((res) => res.json());
```

---

# ISR sob demanda (on-demand)

Em vez de esperar um tempo, é possível **forçar a regeneração** quando algo muda (ex.: um produto foi editado).

```typescript
// app/produtos/actions.ts
"use server";

import { revalidatePath, revalidateTag } from "next/cache";

export async function atualizarProduto(id: string, dados: DadosProduto) {

  await db.produto.update({ where: { id }, data: dados });

  revalidatePath("/produtos");          // regenera uma rota
  revalidateTag("produtos");            // regenera tudo marcado com essa tag

}
```

```typescript
// uso de tags no fetch
const produtos = await fetch("https://api.exemplo.com/produtos", {
  next: { tags: ["produtos"] },
});
```

A revalidação sob demanda segue a mesma ideia do `invalidateQueries` do React Query: o cache é marcado como desatualizado quando uma mutação acontece.

---

# Páginas dinâmicas não geradas no build

Para sites com milhares de páginas (ex.: catálogo com 50 mil produtos), não é viável gerar todas no build. Com ISR, é possível gerar **apenas as principais** no build e as demais **na primeira visita**.

```typescript
export const dynamicParams = true; // padrão: gera sob demanda as rotas não listadas

export async function generateStaticParams() {
  const maisVendidos = await buscarMaisVendidos(100);
  return maisVendidos.map((p) => ({ id: p.id }));
}
```

```
Build gera os 100 mais vendidos

        │

        ▼

Visitante acessa um produto

que não foi gerado

        │

        ▼

Next.js gera a página na hora,

guarda em cache

        │

        ▼

Próximas visitas recebem

a versão estática
```

---

# Vantagens e limitações do ISR

**Vantagens:**

- velocidade de página estática com dados razoavelmente atuais;
- não exige rebuild do site inteiro para atualizar conteúdo;
- escala bem para catálogos grandes;
- baixo custo de servidor.

**Limitações:**

- os dados podem ficar **levemente desatualizados** até a revalidação;
- não serve para conteúdo personalizado por usuário;
- o comportamento depende da plataforma de hospedagem (cache em CDN, funções serverless).

---

# Quando usar ISR?

Utilize quando:

- o conteúdo muda com alguma frequência, mas **não precisa ser em tempo real** (catálogo, notícias, listagens);
- há **muitas páginas**, e gerar todas no build é inviável;
- quer a velocidade do estático sem abrir mão de atualizações.

---

# CSR — Client-Side Rendering

No **CSR**, o servidor envia um HTML "casco" (quase vazio) e o **navegador** executa o JavaScript, busca os dados na API e monta a interface. É o modelo clássico das SPAs em React.

```
Visitante acessa a página

        │

        ▼

Servidor envia HTML mínimo

+ bundle JavaScript

        │

        ▼

Navegador baixa e executa o JS

        │

        ▼

useEffect / React Query

busca os dados na API

        │

        ▼

Interface é montada

no navegador
```

No App Router, o CSR acontece dentro de **Client Components** (`"use client"`), geralmente com React Query ou `useEffect`.

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";

export default function EstoqueAoVivo({ produtoId }: { produtoId: string }) {

  const { data, isLoading } = useQuery({
    queryKey: ["estoque", produtoId],
    queryFn: () => buscarEstoque(produtoId),
    refetchInterval: 10_000,
  });

  if (isLoading) return <span>Carregando...</span>;

  return <span>Em estoque: {data?.quantidade}</span>;

}
```

O dado é buscado **depois** que a página já carregou, e atualizado a cada 10 segundos, sem recarregar nada.

---

# CSR puro x CSR dentro do Next.js

Mesmo com `"use client"`, o Next.js ainda **pré-renderiza** o Client Component no servidor (HTML inicial) e depois o hidrata no navegador. O que caracteriza o CSR é **onde os dados são buscados**: no navegador, depois do carregamento.

Para trechos que dependem de APIs do navegador (`window`, `localStorage`) e **não devem** ser renderizados no servidor, é possível desativar o SSR do componente:

```typescript
import dynamic from "next/dynamic";

const MapaInterativo = dynamic(() => import("./MapaInterativo"), {
  ssr: false,
  loading: () => <p>Carregando mapa...</p>,
});
```

Aqui, o `dynamic` com `ssr: false` aplica o conceito de **Lazy Loading** visto anteriormente: o componente só é carregado e renderizado no navegador.

---

# Vantagens e limitações do CSR

**Vantagens:**

- ótimo para **interatividade** e dados em tempo real (dashboards, chats, filtros dinâmicos);
- permite conteúdo **personalizado por usuário** sem exigir renderização no servidor;
- após o carregamento inicial, **navegações e atualizações são rápidas**, sem recarregar a página;
- reduz a carga do servidor de renderização (o trabalho fica no navegador).

**Limitações:**

- o usuário vê um **estado de carregamento** antes do conteúdo real aparecer;
- **SEO mais limitado**: o conteúdo só existe depois do JavaScript executar, e nem todo rastreador espera por isso;
- bundle JavaScript maior, impactando dispositivos e conexões mais lentas;
- risco de **"cascatas" de requisições** (um componente só busca dados depois que o anterior renderizou).

---

# Quando usar CSR?

Utilize quando:

- o conteúdo é **privado e específico do usuário**, sem necessidade de SEO (painéis internos, áreas logadas);
- os dados **mudam em tempo real** ou com alta frequência (estoque ao vivo, notificações, cotações);
- o trecho é **altamente interativo** (editores, mapas, gráficos, filtros dinâmicos);
- depende de **APIs do navegador** (`localStorage`, geolocalização, `window`).

**Evite** para conteúdo público que precisa de SEO e carregamento rápido, como páginas de produto, posts e páginas institucionais.

---

# Combinando estratégias na mesma página

O App Router permite misturar estratégias: a **estrutura** da página vem estática (SSG/ISR) e apenas os trechos vivos ou personalizados são buscados no navegador (CSR).

```typescript
// app/produtos/[id]/page.tsx  (Server Component, ISR)
export const revalidate = 300;

export default async function ProdutoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {

  const { id } = await params;
  const produto = await buscarProduto(id);

  return (
    <div>
      <h1>{produto.nome}</h1>
      <p>{produto.descricao}</p>

      {/* trecho em CSR: dado em tempo real */}
      <EstoqueAoVivo produtoId={id} />
    </div>
  );

}
```

```
Página do produto

↓

Nome, descrição, imagens

(ISR: rápido, bom para SEO)

↓

Estoque ao vivo

(CSR: sempre atualizado,

dentro da página estática)
```

---

# Como o App Router decide entre estático e dinâmico?

No App Router, não existe mais `getStaticProps` ou `getServerSideProps`: o Next.js **infere** a estratégia pelo que a página usa.

```
A rota usa dados dinâmicos?

(cookies, headers, searchParams,

fetch com no-store)

        │

   ┌────┴────┐

  Sim        Não

   ▼          ▼

Dinâmica    Estática

(SSR)       (SSG)

            │
            ▼

     Tem revalidate?

            │
            ▼

         Sim: ISR
```

---

# Pages Router x App Router (como era antes)

No modelo anterior (`pages/`), cada estratégia tinha uma função própria.

```typescript
// SSG
export async function getStaticProps() {
  return { props: { posts } };
}

// SSR
export async function getServerSideProps(context) {
  return { props: { dados } };
}

// ISR
export async function getStaticProps() {
  return { props: { posts }, revalidate: 60 };
}
```

| Estratégia | Pages Router | App Router |
|---------|----------|----------|
| SSG | `getStaticProps` | Página sem dados dinâmicos / `force-cache` |
| SSR | `getServerSideProps` | Dados dinâmicos / `no-store` / `force-dynamic` |
| ISR | `getStaticProps` + `revalidate` | `export const revalidate` / `next: { revalidate }` |
| Rotas dinâmicas estáticas | `getStaticPaths` | `generateStaticParams` |

---

# Comparando as estratégias

| Aspecto | SSG | ISR | SSR | CSR |
|---------|:-------:|:-------:|:-------:|:-------:|
| Quando o HTML é gerado | No build | No build + regenerações | A cada requisição | No navegador |
| Velocidade de resposta | Máxima | Muito alta | Média | Depende do JS carregar |
| Atualidade dos dados | Congelada até o próximo build | Atualizada por tempo/evento | Sempre atual | Sempre atual |
| Custo de servidor | Mínimo | Baixo | Alto | Baixo (mas gasta API) |
| Conteúdo por usuário | Não | Não | Sim | Sim |
| SEO | Excelente | Excelente | Excelente | Mais limitado |

---

# Exemplo prático

Imagine um e-commerce.

```
Página "Sobre nós"

↓

SSG (muda raramente)

Página inicial e categorias

↓

ISR, revalidate: 300

(muda de vez em quando)

Detalhe do produto

↓

ISR com generateStaticParams

nos mais vendidos

+ revalidatePath ao editar

Preço/estoque em tempo real

↓

CSR com React Query

dentro da página estática

Carrinho e área do cliente

↓

SSR (depende de cookies/sessão)
```

---

# SSR x SSG

É comum confundir quando usar cada um.

| SSG | SSR |
|----------|----------|
| Gera no **build** | Gera a **cada requisição** |
| Mesmo HTML para todos | HTML pode variar por requisição/usuário |
| Dados "congelados" até o próximo build | Dados sempre atuais |
| Servido por CDN, muito rápido | Depende do tempo de processamento do servidor |

---

# ISR x SSR

| ISR | SSR |
|-----------|----------|
| Página estática, regenerada periodicamente | Página gerada a cada requisição |
| Pode servir dados levemente antigos | Sempre serve dados atuais |
| Custo baixo | Custo maior |
| Não personaliza por usuário | Pode personalizar por usuário |

---

# SSR x CSR

É comum confundir os dois, já que ambos lidam com dados dinâmicos.

| SSR | CSR |
|-----------|----------|
| O **servidor** busca os dados e gera o HTML | O **navegador** busca os dados e monta a interface |
| HTML já chega completo ao navegador | HTML chega "vazio" e é preenchido depois |
| Melhor para SEO e primeira renderização | Pior para SEO; mostra estado de carregamento |
| Maior custo de servidor | Menor custo de renderização no servidor |
| Ideal para páginas completas dependentes da requisição | Ideal para trechos interativos e dados em tempo real |

---

# revalidatePath x revalidateTag

| revalidatePath | revalidateTag |
|-----------|----------|
| Revalida uma **rota** específica | Revalida **todos os fetches** marcados com a tag |
| Simples quando a mudança afeta uma página | Melhor quando o mesmo dado aparece em várias páginas |
| `revalidatePath("/produtos")` | `revalidateTag("produtos")` |

---

# Boas práticas

- Comece pensando em **estático** e só torne dinâmico o que realmente precisa.
- Use **ISR** para conteúdo que muda com alguma frequência, mas não precisa ser em tempo real.
- Use **revalidação sob demanda** (`revalidatePath`/`revalidateTag`) quando o conteúdo mudar por uma ação (edição, publicação).
- Use `generateStaticParams` apenas para as rotas **mais importantes**, deixando as demais serem geradas sob demanda.
- Reserve **SSR** para páginas que dependem de cookies, headers, sessão ou dados em tempo real.
- Combine estratégias na mesma página: base estática + trechos em **CSR** para dados vivos.
- Evite CSR para conteúdo público que precisa de SEO; prefira SSG, ISR ou SSR.
- Em CSR, use React Query (cache, revalidação) em vez de `useEffect` + `fetch` manual.
- Use `dynamic(..., { ssr: false })` apenas para componentes que dependem do navegador.
- Evite cascatas de requisições no cliente: busque em paralelo ou mova a busca para o servidor.
- Nunca use SSG/ISR para conteúdo **personalizado por usuário** (corre o risco de servir dados de uma pessoa para outra).
- Confirme na documentação da versão do Next.js em uso quais comportamentos de cache são padrão, pois mudaram entre versões.
- Valide no build (`next build`): a saída indica quais rotas são estáticas, dinâmicas ou ISR.

---

# Resumo

| Conceito | Resolve |
|---------|----------|
| SSG | Páginas rápidas e baratas para conteúdo que muda pouco |
| SSR | Páginas sempre atuais e personalizadas por requisição |
| ISR | Velocidade do estático com atualização incremental |
| CSR | Dados vivos e específicos do usuário no navegador |

---

# Fluxo mental

```
Preciso renderizar uma página...

            │

   ┌────────┼────────┐

   ▼        ▼        ▼

Conteúdo    Conteúdo     Conteúdo
muda pouco  muda de vez  muda sempre
e é igual   em quando    ou depende
para todos               do usuário

   │        │        │

SSG        ISR        SSR
(build)    (revalidate) (por requisição)

            │
            ▼
   Trecho em tempo real
   dentro de uma página?
            │
            ▼
   CSR (Client Component
   + React Query)
```

---

# Referências

- Documentação oficial do Next.js — Rendering: https://nextjs.org/docs/app/building-your-application/rendering
- Caching e Revalidating: https://nextjs.org/docs/app/building-your-application/caching
- Incremental Static Regeneration: https://nextjs.org/docs/app/guides/incremental-static-regeneration
- generateStaticParams: https://nextjs.org/docs/app/api-reference/functions/generate-static-params