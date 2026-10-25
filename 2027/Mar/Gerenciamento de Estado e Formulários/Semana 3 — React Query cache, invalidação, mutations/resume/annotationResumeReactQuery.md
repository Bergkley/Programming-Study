# React Query

# Cache, Invalidação, Mutations

O **React Query** (hoje chamado **TanStack Query**) é uma biblioteca para gerenciar **estado do servidor** em aplicações React: buscar, armazenar em cache, sincronizar e atualizar dados que vêm de uma API.

Ele elimina a necessidade de escrever manualmente `useEffect` + `useState` para controlar `loading`, `erro` e `dados` em cada requisição.

Os três pilares principais desse tema são:

- **Cache**: guardar os dados já buscados para reaproveitá-los.
- **Invalidação**: marcar dados do cache como "desatualizados" para que sejam buscados de novo.
- **Mutations**: operações que **alteram** dados no servidor (criar, atualizar, deletar).

---

# Por que usar React Query?

Imagine uma aplicação que consome uma API em várias telas.

Sem React Query:

- cada componente repete `useEffect` + `fetch` + estados de `loading`/`erro`;
- a mesma requisição é feita várias vezes por componentes diferentes;
- não há cache: voltar para uma tela dispara tudo de novo;
- manter a lista atualizada após criar/editar/deletar exige lógica manual espalhada.

Com React Query:

- uma linha (`useQuery`) entrega `data`, `isLoading` e `error`;
- requisições idênticas são **deduplicadas** e compartilham o mesmo cache;
- dados em cache são exibidos instantaneamente, com atualização em segundo plano;
- após uma mutation, basta **invalidar** as queries relacionadas.

---

# Visão geral

```
React Query

        │

 ┌──────┼────────┐

 ▼      ▼        ▼

Queries  Cache +    Mutations
(leitura) Invalidação (escrita)
```

---

# Instalação e configuração

```bash
npm install @tanstack/react-query
```

```typescript
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MinhaAplicacao />
    </QueryClientProvider>
  );
}
```

O `QueryClient` é quem **guarda o cache** e gerencia todas as queries da aplicação.

---

# Estado do servidor x estado do cliente

```
Estado do cliente

(tema, filtros, modal aberto)

↓

useState, Context, Zustand, Redux

Estado do servidor

(lista de usuários, pedidos, produtos)

↓

React Query
```

Dados do servidor têm características próprias: ficam **desatualizados** com o tempo, são **compartilhados** por vários componentes e dependem de **rede**. É exatamente isso que o React Query resolve.

---

# Problema — Buscar dados "na mão"

```typescript
function ListaUsuarios() {

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/usuarios")
      .then((res) => res.json())
      .then(setUsuarios)
      .catch(() => setErro("Falha ao carregar"))
      .finally(() => setCarregando(false));
  }, []);

  // ...
}
```

Sem cache, sem deduplicação, sem refetch automático — e essa lógica se repete em todo componente que busca dados.

---

# Solução — useQuery

```typescript
import { useQuery } from "@tanstack/react-query";

async function buscarUsuarios(): Promise<Usuario[]> {
  const resposta = await fetch("/api/usuarios");
  if (!resposta.ok) throw new Error("Falha ao carregar usuários");
  return resposta.json();
}

function ListaUsuarios() {

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["usuarios"],
    queryFn: buscarUsuarios,
  });

  if (isLoading) return <p>Carregando...</p>;
  if (isError) return <p>Erro: {error.message}</p>;

  return (
    <ul>
      {data?.map((usuario) => (
        <li key={usuario.id}>{usuario.nome}</li>
      ))}
    </ul>
  );

}
```

- **queryKey**: identificador único da query no cache.
- **queryFn**: função que busca os dados (deve retornar uma Promise e **lançar erro** em caso de falha).

---

# Query Keys

A **queryKey** é a "chave" do cache. Duas queries com a mesma chave compartilham os mesmos dados.

```typescript
["usuarios"]                         // lista de usuários
["usuarios", 5]                      // usuário de id 5
["usuarios", { status: "ativo" }]    // lista filtrada
["pedidos", usuarioId, "itens"]      // itens dos pedidos de um usuário
```

```typescript
useQuery({
  queryKey: ["usuarios", id],
  queryFn: () => buscarUsuarioPorId(id),
});
```

Sempre que um valor **usado na queryFn** mudar (como o `id`), ele deve estar na chave. O React Query então trata cada combinação como uma query **diferente**, com seu próprio cache.

---

# Como o cache funciona

```
Componente A usa ["usuarios"]

        │

        ▼

Dados buscados e guardados

no cache

        │

        ▼

Componente B usa ["usuarios"]

        │

        ▼

Recebe os dados do cache

instantaneamente

(sem nova requisição se ainda "frescos")
```

Os dados no cache passam por dois momentos principais: **fresh** (frescos) e **stale** (obsoletos).

---

# staleTime e gcTime

Dois parâmetros controlam o ciclo de vida do cache:

- **staleTime**: por quanto tempo os dados são considerados **frescos**. Enquanto estiverem frescos, o React Query **não refaz** a requisição. Padrão: `0` (já nascem obsoletos).
- **gcTime** (antes chamado `cacheTime`): por quanto tempo dados **sem uso** (nenhum componente os observando) permanecem na memória antes de serem descartados. Padrão: 5 minutos.

```typescript
useQuery({
  queryKey: ["usuarios"],
  queryFn: buscarUsuarios,
  staleTime: 60 * 1000,      // 1 min: dentro desse tempo, não refaz a busca
  gcTime: 10 * 60 * 1000,    // 10 min: mantém em memória após sair de uso
});
```

```
Dado buscado

↓

fresh (dentro do staleTime)

↓ usa o cache, sem requisição

stale (passou do staleTime)

↓ usa o cache E revalida em segundo plano

inativo (sem observadores)

↓

removido após o gcTime
```

---

# Stale-While-Revalidate

Quando um dado está **stale** e um componente o pede de novo, o React Query:

- mostra **imediatamente** o dado em cache (a tela não "pisca" de loading);
- refaz a requisição **em segundo plano**;
- atualiza a tela quando os dados novos chegarem.

Isso dá a sensação de aplicação **rápida**, mesmo com dados que precisam ser revalidados.

---

# Quando o React Query refaz a busca?

Para dados **stale**, a revalidação automática acontece quando:

- um componente que usa a query **monta** de novo;
- a janela do navegador **volta ao foco** (`refetchOnWindowFocus`);
- a **conexão** com a internet é restabelecida (`refetchOnReconnect`);
- um **intervalo** configurado se completa (`refetchInterval`).

```typescript
useQuery({
  queryKey: ["notificacoes"],
  queryFn: buscarNotificacoes,
  refetchInterval: 30 * 1000, // atualiza a cada 30 segundos
  refetchOnWindowFocus: false,
});
```

---

# isLoading, isFetching e status

É comum confundir esses estados.

| Estado | Significado |
|---------|----------|
| `isLoading` | Primeira busca, **sem dados em cache** ainda |
| `isFetching` | **Qualquer** busca em andamento (inclusive revalidação em segundo plano) |
| `isError` | A query falhou |
| `isSuccess` | A query tem dados disponíveis |

```typescript
const { data, isLoading, isFetching } = useQuery({ ... });

if (isLoading) return <Skeleton />;

return (
  <div>
    {isFetching && <small>Atualizando...</small>}
    <Lista dados={data} />
  </div>
);
```

Com `isFetching`, é possível mostrar um indicador discreto de atualização sem esconder os dados já exibidos.

---

# Opções úteis da query

```typescript
useQuery({
  queryKey: ["usuarios", id],
  queryFn: () => buscarUsuarioPorId(id),
  enabled: !!id,          // só busca quando "id" existir
  retry: 2,               // tenta 2 vezes em caso de erro
  select: (usuario) => usuario.nome, // transforma o dado antes de entregar
  placeholderData: keepPreviousData, // mantém dados anteriores ao trocar a chave
});
```

- **enabled**: executa a query apenas quando a condição for verdadeira (queries dependentes).
- **retry**: quantidade de novas tentativas em caso de falha.
- **select**: derivar/transformar os dados, com re-render apenas se o resultado mudar.
- **placeholderData**: útil em paginação, evitando "piscar" ao trocar de página.

---

# O que são Mutations?

Queries servem para **ler** dados. Para **criar, atualizar ou deletar** (POST, PUT, PATCH, DELETE), usa-se o **useMutation**.

```
useQuery

↓

Leitura (GET)

Executa automaticamente

useMutation

↓

Escrita (POST/PUT/DELETE)

Executa quando você chama
```

---

# Exemplo — useMutation

```typescript
import { useMutation } from "@tanstack/react-query";

async function criarUsuario(novo: NovoUsuario): Promise<Usuario> {
  const resposta = await fetch("/api/usuarios", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(novo),
  });
  if (!resposta.ok) throw new Error("Falha ao criar usuário");
  return resposta.json();
}

function FormUsuario() {

  const mutation = useMutation({
    mutationFn: criarUsuario,
  });

  function handleSubmit(dados: NovoUsuario) {
    mutation.mutate(dados);
  }

  return (
    <button
      onClick={() => handleSubmit({ nome: "Sheila" })}
      disabled={mutation.isPending}
    >
      {mutation.isPending ? "Salvando..." : "Criar"}
    </button>
  );

}
```

- **mutate**: dispara a mutation (não retorna Promise).
- **mutateAsync**: dispara e retorna uma Promise, útil com `await` e `try/catch`.
- **isPending**, **isError**, **isSuccess**: estados da mutation.

---

# Callbacks da mutation

```typescript
const mutation = useMutation({
  mutationFn: criarUsuario,

  onSuccess: (usuarioCriado) => {
    console.log("Criado:", usuarioCriado);
  },

  onError: (erro) => {
    console.error("Falhou:", erro.message);
  },

  onSettled: () => {
    // roda sempre, com sucesso ou erro
  },
});
```

---

# Problema — Lista desatualizada após a mutation

```typescript
const mutation = useMutation({ mutationFn: criarUsuario });
```

Depois de criar um usuário com sucesso, a lista de usuários que está **no cache** continua exibindo os dados **antigos** — o servidor mudou, mas o cache não sabe disso.

---

# Solução — Invalidação de queries

A **invalidação** marca queries do cache como **stale** e, se estiverem em uso na tela, **refaz a busca** automaticamente.

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";

function FormUsuario() {

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: criarUsuario,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });
    },
  });

  // ...
}
```

```
Mutation concluída com sucesso

        │

        ▼

invalidateQueries(["usuarios"])

        │

        ▼

Queries com essa chave

são marcadas como stale

        │

        ▼

As que estão na tela

refazem a busca

        │

        ▼

Lista atualizada
```

---

# Invalidação por prefixo

A invalidação atua sobre todas as queries cuja chave **começa** com o valor informado.

```typescript
// invalida ["usuarios"], ["usuarios", 5], ["usuarios", { status: "ativo" }]
queryClient.invalidateQueries({ queryKey: ["usuarios"] });

// invalida apenas o usuário 5
queryClient.invalidateQueries({ queryKey: ["usuarios", 5] });

// correspondência exata
queryClient.invalidateQueries({ queryKey: ["usuarios"], exact: true });
```

Por isso a **organização das queryKeys** importa: chaves hierárquicas permitem invalidar grupos inteiros de uma só vez.

---

# Atualizando o cache diretamente (setQueryData)

Em vez de refazer a busca, é possível **escrever direto no cache** com os dados que a mutation já devolveu, economizando uma requisição.

```typescript
const mutation = useMutation({
  mutationFn: atualizarUsuario,
  onSuccess: (usuarioAtualizado) => {
    queryClient.setQueryData(
      ["usuarios", usuarioAtualizado.id],
      usuarioAtualizado
    );
    queryClient.invalidateQueries({ queryKey: ["usuarios"], exact: true });
  },
});
```

---

# Optimistic Updates (atualização otimista)

Na atualização otimista, a interface é atualizada **antes** da resposta do servidor, assumindo que a operação vai dar certo. Se falhar, o estado anterior é restaurado.

```typescript
const mutation = useMutation({

  mutationFn: alternarFavorito,

  onMutate: async (novoFavorito) => {

    await queryClient.cancelQueries({ queryKey: ["favoritos"] });

    const anterior = queryClient.getQueryData<Favorito[]>(["favoritos"]);

    queryClient.setQueryData<Favorito[]>(["favoritos"], (atual = []) => [
      ...atual,
      novoFavorito,
    ]);

    return { anterior };

  },

  onError: (_erro, _variaveis, contexto) => {
    queryClient.setQueryData(["favoritos"], contexto?.anterior);
  },

  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ["favoritos"] });
  },

});
```

```
Usuário clica

        │

        ▼

onMutate: atualiza a tela

na hora (otimista)

        │

        ▼

Requisição ao servidor

        │

        ▼

Sucesso?

   │           │
  Sim          Não

   ▼            ▼

onSettled     onError: restaura

revalida      o estado anterior
```

Ideal para ações simples e de baixo risco (curtir, favoritar, marcar como lido), onde a espera pelo servidor daria sensação de lentidão.

---

# Organizando as queries em hooks customizados

```typescript
export function useUsuarios() {
  return useQuery({
    queryKey: ["usuarios"],
    queryFn: buscarUsuarios,
    staleTime: 60 * 1000,
  });
}

export function useCriarUsuario() {

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: criarUsuario,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });
    },
  });

}
```

```typescript
function Pagina() {
  const { data } = useUsuarios();
  const criar = useCriarUsuario();
  // ...
}
```

Encapsular em **Custom Hooks** (tema visto anteriormente) mantém a `queryKey`, a `queryFn` e as regras de invalidação em um único lugar, reaproveitáveis em qualquer componente.

---

# Quando usar React Query?

Utilize quando:

- a aplicação consumir uma API com várias telas e dados compartilhados;
- quiser eliminar o `useEffect` + `useState` para busca de dados;
- precisar de cache, deduplicação e revalidação automática;
- houver listas que precisam ficar sincronizadas após criar/editar/deletar.

**Evite** quando:

- a aplicação for muito simples, com uma ou duas requisições isoladas;
- o dado for puramente local do cliente (nesse caso, `useState`, Context ou Zustand resolvem).

---

# Comparando os conceitos

| Conceito | Objetivo |
|---------|----------|
| useQuery | Buscar e cachear dados (leitura) |
| queryKey | Identificar e organizar os dados no cache |
| staleTime / gcTime | Controlar quando o dado é fresco e quando é descartado |
| useMutation | Alterar dados no servidor (escrita) |
| invalidateQueries | Marcar o cache como desatualizado e refazer a busca |
| Optimistic Update | Atualizar a tela antes da resposta do servidor |

---

# Exemplo prático

Imagine uma tela de lista de tarefas.

```
Tela abre

        │

        ▼

useQuery(["tarefas"])

↓

Busca e guarda no cache

        │

        ▼

Usuário navega para outra

tela e volta

↓

Cache mostrado na hora

+ revalidação em segundo plano

        │

        ▼

Usuário cria uma tarefa

↓

useMutation(criarTarefa)

        │

        ▼

onSuccess:

invalidateQueries(["tarefas"])

        │

        ▼

Lista refaz a busca

e mostra a nova tarefa
```

---

# React Query x Redux / Zustand

Esse tema se conecta diretamente com os anteriores sobre estado global.

| React Query | Redux / Zustand |
|-----------|----------|
| Focado em **estado do servidor** | Focado em **estado do cliente** |
| Cache, revalidação e deduplicação prontos | Cache e sincronização precisam ser implementados manualmente |
| Estados de `loading`/`erro` automáticos | Precisam ser modelados à mão (ou com thunks) |
| Invalidação por `queryKey` | Atualização manual do estado após cada operação |
| Complementar a uma lib de estado | Complementar ao React Query |

Na prática, é comum usar **React Query para dados da API** e **Zustand (ou Redux) apenas para estado de UI** (tema, filtros, modais).

---

# staleTime x gcTime

É comum confundir os dois.

| staleTime | gcTime |
|----------|----------|
| Quanto tempo o dado é considerado **fresco** | Quanto tempo o dado **sem uso** fica na memória |
| Define **quando refazer** a busca | Define **quando apagar** o dado do cache |
| Padrão: 0 | Padrão: 5 minutos |

---

# mutate x mutateAsync

| mutate | mutateAsync |
|-----------|----------|
| Não retorna Promise | Retorna uma Promise |
| Erros tratados via callbacks (`onError`) | Erros tratados com `try/catch` |
| Mais simples para uso comum | Útil para encadear ações com `await` |

---

# Boas práticas

- Organize as **queryKeys** de forma hierárquica (`["usuarios"]`, `["usuarios", id]`) para facilitar a invalidação.
- Inclua na `queryKey` **todas as variáveis** usadas na `queryFn`.
- Configure um `staleTime` adequado ao tipo de dado, em vez de manter o padrão `0` em tudo.
- Sempre faça a `queryFn` **lançar erro** quando a resposta não for `ok` (o `fetch` não lança sozinho em status 4xx/5xx).
- Use `invalidateQueries` em `onSuccess` das mutations para manter as listas sincronizadas.
- Use atualização otimista apenas em ações simples e de baixo risco.
- Encapsule queries e mutations em **Custom Hooks** reutilizáveis.
- Use `enabled` para queries dependentes de outro dado.
- Não copie dados do React Query para `useState` ou para outro store sem necessidade — ele já é a fonte da verdade.

---

# Resumo

| Conceito | Resolve |
|---------|----------|
| useQuery + cache | Buscar dados sem repetir lógica, com reaproveitamento |
| staleTime / gcTime | Controle fino de frescor e memória |
| useMutation | Alterar dados no servidor com estados prontos |
| invalidateQueries | Manter a interface sincronizada após mudanças |

---

# Fluxo mental

```
Preciso lidar com dados da API...

            │

   ┌────────┼────────┐

   ▼        ▼        ▼

Ler e       Alterar      Manter tudo
reaproveitar dados no    atualizado
dados        servidor    após mudanças

   │        │        │

useQuery   useMutation  invalidateQueries
+ cache                 (ou setQueryData)
```

---

# Referências

- Documentação oficial do TanStack Query: https://tanstack.com/query/latest/docs/framework/react/overview
- Query Keys: https://tanstack.com/query/latest/docs/framework/react/guides/query-keys
- Mutations: https://tanstack.com/query/latest/docs/framework/react/guides/mutations
- Invalidation from Mutations: https://tanstack.com/query/latest/docs/framework/react/guides/invalidations-from-mutations
- Optimistic Updates: https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates