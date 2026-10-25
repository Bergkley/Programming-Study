# Zustand

# + Comparação com Redux

O **Zustand** (palavra alemã para "estado") é uma biblioteca **minimalista** de gerenciamento de estado global para React. Ele resolve o mesmo problema do Redux — compartilhar estado entre componentes distantes — com **muito menos código, sem Provider e sem boilerplate**.

Os três pilares principais desse tema são:

- Criação de uma **store** com `create`
- Consumo do estado com **seletores** (re-render seletivo)
- Comparação com o **Redux Toolkit** para decidir qual usar

---

# Por que usar Zustand?

Imagine uma aplicação React em que o estado global precisa ser compartilhado (usuário logado, carrinho, tema, filtros).

Com Context API:

- todos os consumidores re-renderizam quando qualquer parte do valor muda;
- é necessário criar Providers aninhados e dividir Contexts manualmente.

Com Redux Toolkit:

- ótima estrutura, mas exige store, slices, Provider, hooks tipados e thunks;
- mais cerimônia para estados simples.

Com Zustand:

- uma store é uma única função, sem Provider;
- o componente assina apenas o pedaço do estado que usa;
- ações e estado ficam juntos, em poucas linhas;
- API pequena, fácil de aprender e de manter.

---

# Visão geral

```
Zustand

        │

 ┌──────┼────────┐

 ▼      ▼        ▼

create   Seletores  Middlewares
(store)  (re-render (persist,
          seletivo)  devtools)
```

---

# Instalação

```bash
npm install zustand
```

---

# Criando uma store

```typescript
import { create } from "zustand";

type ContadorStore = {
  valor: number;
  incrementar: () => void;
  decrementar: () => void;
  resetar: () => void;
};

export const useContadorStore = create<ContadorStore>((set) => ({

  valor: 0,

  incrementar: () => set((state) => ({ valor: state.valor + 1 })),

  decrementar: () => set((state) => ({ valor: state.valor - 1 })),

  resetar: () => set({ valor: 0 }),

}));
```

- `create` recebe uma função que devolve o **estado inicial** e as **ações**, tudo no mesmo objeto.
- `set` atualiza o estado, fazendo **merge raso** com o estado atual (não é preciso espalhar `...state`).
- A store já é um **hook**: `useContadorStore`.

---

# Usando a store no componente

```typescript
function Contador() {

  const valor = useContadorStore((state) => state.valor);
  const incrementar = useContadorStore((state) => state.incrementar);

  return (
    <div>
      <p>{valor}</p>
      <button onClick={incrementar}>+</button>
    </div>
  );

}
```

Não há `Provider`, `dispatch`, actions nem reducers: o componente simplesmente **chama o hook** e escolhe o que quer ler.

---

# Seletores e re-render

O argumento passado ao hook é um **seletor**: o componente só re-renderiza quando o **valor retornado pelo seletor** mudar.

```typescript
// re-renderiza apenas quando "valor" mudar
const valor = useContadorStore((state) => state.valor);
```

```typescript
// Evite: assina a store inteira, re-renderiza a cada mudança
const store = useContadorStore();
```

```
Estado muda

↓

Zustand compara o retorno

do seletor de cada componente

↓

Mudou?

   │           │
  Sim          Não

   ▼            ▼

Re-renderiza  Ignora
```

Esse é o ponto que resolve o problema visto no tema de **Context API + Re-render**: aqui o re-render seletivo já vem embutido.

---

# Selecionando vários valores (useShallow)

Ao retornar um **novo objeto** no seletor, a comparação por referência sempre considera que "mudou", causando re-renders desnecessários. O `useShallow` compara o conteúdo de forma rasa.

```typescript
import { useShallow } from "zustand/react/shallow";

const { valor, incrementar } = useContadorStore(
  useShallow((state) => ({
    valor: state.valor,
    incrementar: state.incrementar,
  }))
);
```

Alternativa mais simples: usar um hook por valor, como no exemplo anterior.

---

# Ações assíncronas

Diferente do Redux, **não é necessário thunk nem middleware** para lógica assíncrona: a ação pode simplesmente ser uma função `async`.

```typescript
type UsuariosStore = {
  lista: Usuario[];
  carregando: boolean;
  erro: string | null;
  buscarUsuarios: () => Promise<void>;
};

export const useUsuariosStore = create<UsuariosStore>((set) => ({

  lista: [],
  carregando: false,
  erro: null,

  buscarUsuarios: async () => {

    set({ carregando: true, erro: null });

    try {
      const resposta = await fetch("/api/usuarios");
      const dados = await resposta.json();
      set({ lista: dados, carregando: false });
    } catch (e) {
      set({ erro: "Falha ao buscar usuários", carregando: false });
    }

  },

}));
```

Compare com o `createAsyncThunk` do Redux Toolkit, que exige `pending`, `fulfilled`, `rejected` e `extraReducers`.

---

# Lendo o estado fora de componentes (get e getState)

```typescript
export const useCarrinhoStore = create<CarrinhoStore>((set, get) => ({

  itens: [],

  adicionar: (item) => set((state) => ({ itens: [...state.itens, item] })),

  total: () => get().itens.reduce((soma, item) => soma + item.preco, 0),

}));
```

```typescript
// fora de um componente React (ex.: interceptor de API)
const token = useAuthStore.getState().token;
useAuthStore.getState().logout();
```

`getState()` permite acessar a store em qualquer lugar do código, inclusive fora do React.

---

# Middlewares

O Zustand oferece middlewares oficiais para recursos comuns.

```typescript
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export const useTemaStore = create<TemaStore>()(
  devtools(
    persist(
      (set) => ({
        tema: "claro",
        alternar: () =>
          set((state) => ({ tema: state.tema === "claro" ? "escuro" : "claro" })),
      }),
      { name: "tema-storage" }
    )
  )
);
```

- **persist**: salva o estado no `localStorage` (ou outro storage) e o restaura ao recarregar a página.
- **devtools**: integra com o Redux DevTools para inspecionar mudanças.
- **immer**: permite escrever atualizações "mutando" o estado, como no Redux Toolkit.

```typescript
import { immer } from "zustand/middleware/immer";

create<Store>()(
  immer((set) => ({
    itens: [],
    adicionar: (item) =>
      set((state) => {
        state.itens.push(item);
      }),
  }))
);
```

---

# Dividindo a store em slices

Em stores maiores, é possível dividir em partes menores e combiná-las (o chamado **slice pattern**).

```typescript
const criarUsuarioSlice = (set) => ({
  usuario: null,
  login: (usuario) => set({ usuario }),
});

const criarCarrinhoSlice = (set) => ({
  itens: [],
  adicionar: (item) => set((state) => ({ itens: [...state.itens, item] })),
});

export const useAppStore = create((...args) => ({
  ...criarUsuarioSlice(...args),
  ...criarCarrinhoSlice(...args),
}));
```

Outra abordagem, mais comum, é manter **várias stores pequenas e independentes** (uma por domínio), já que não há custo em criar mais de uma.

---

# Comparando o mesmo caso: contador

**Redux Toolkit:**

```typescript
// contadorSlice.ts
const contadorSlice = createSlice({
  name: "contador",
  initialState: { valor: 0 },
  reducers: {
    incrementar: (state) => { state.valor += 1; },
  },
});

export const { incrementar } = contadorSlice.actions;
export default contadorSlice.reducer;

// store.ts
export const store = configureStore({
  reducer: { contador: contadorSlice.reducer },
});

// App.tsx
<Provider store={store}>
  <App />
</Provider>

// Componente
const valor = useSelector((state: RootState) => state.contador.valor);
const dispatch = useDispatch();
dispatch(incrementar());
```

**Zustand:**

```typescript
// store.ts
export const useContadorStore = create<ContadorStore>((set) => ({
  valor: 0,
  incrementar: () => set((state) => ({ valor: state.valor + 1 })),
}));

// Componente (sem Provider)
const valor = useContadorStore((state) => state.valor);
const incrementar = useContadorStore((state) => state.incrementar);
```

---

# Zustand x Redux Toolkit

| Aspecto | Zustand | Redux Toolkit |
|---------|----------|----------|
| Boilerplate | Mínimo (uma função `create`) | Moderado (store, slices, Provider, hooks tipados) |
| Provider | Não precisa | Obrigatório |
| Modelo mental | Hook com estado e ações juntos | Actions → Reducers → Store (fluxo unidirecional) |
| Lógica assíncrona | Função `async` comum na store | `createAsyncThunk` com `extraReducers` |
| Imutabilidade | Manual (ou middleware `immer`) | Automática via Immer |
| Re-render seletivo | Seletores nativos | Seletores com `useSelector` |
| DevTools | Via middleware `devtools` | Integrado por padrão |
| Estrutura imposta | Livre (você define a organização) | Convenções fortes e padronizadas |
| Ecossistema | Menor, mais enxuto | Grande (RTK Query, middlewares, comunidade) |
| Tamanho | Muito pequeno (~1 KB) | Maior |
| Curva de aprendizado | Baixa | Média |
| Rastreabilidade de mudanças | Menos formal (sem actions nomeadas por padrão) | Alta (cada mudança é uma action registrada) |

---

# Zustand x Context API

| Zustand | Context API |
|---------|----------|
| Re-render seletivo por seletor | Todos os consumidores re-renderizam quando o valor muda |
| Sem Provider | Requer Provider |
| Acessível fora do React (`getState`) | Só dentro da árvore React |
| Biblioteca externa | Nativo do React |
| Ideal para estado que muda com frequência | Ideal para dados estáveis (tema, locale, usuário logado) |

---

# Quando usar Zustand?

Utilize quando:

- precisar de estado global **sem** a cerimônia do Redux;
- a aplicação for pequena ou média, com estado de complexidade moderada;
- quiser re-render seletivo sem dividir Contexts manualmente;
- precisar acessar o estado fora de componentes React;
- o time valorizar simplicidade e rapidez de desenvolvimento.

---

# Quando usar Redux Toolkit?

Utilize quando:

- a aplicação for **grande**, com várias equipes e muitos domínios de estado;
- for importante ter **convenções rígidas** e um padrão único para todo o time;
- houver necessidade de **rastrear cada mudança** como uma action (auditoria, time-travel debugging);
- precisar de **RTK Query** para cache e sincronização de dados do servidor;
- o projeto já usar Redux e a migração não trouxer benefício claro.

---

# E o estado do servidor?

Tanto Zustand quanto Redux são pensados para **estado do cliente** (UI, preferências, carrinho local). Dados que vêm de uma API (listas, detalhes, paginação) costumam ser melhor gerenciados por bibliotecas específicas de **estado do servidor**, como **TanStack Query** ou **RTK Query**, que já cuidam de cache, revalidação e estados de loading/erro.

```
Estado do cliente

(tema, carrinho, filtros)

↓

Zustand ou Redux Toolkit

Estado do servidor

(listas, detalhes da API)

↓

TanStack Query ou RTK Query
```

---

# Exemplo prático

Imagine um e-commerce com carrinho e tema.

```
useCarrinhoStore

↓

itens, adicionar, remover, total

        │

        ▼

Componente <BotaoComprar />

assina apenas "adicionar"

        │

        ▼

Componente <ResumoCarrinho />

assina apenas "itens"

        │

        ▼

Adicionar item

        │

        ▼

Só quem leu "itens"

re-renderiza

(BotaoComprar não muda)

        │

        ▼

persist salva o carrinho

no localStorage
```

---

# Boas práticas

- Sempre use **seletores**; evite `useStore()` sem argumento, que assina a store inteira.
- Crie **várias stores pequenas** por domínio, em vez de uma store gigante.
- Mantenha **estado e ações juntos** na mesma store, com tipos bem definidos.
- Use `useShallow` ao selecionar vários valores em um objeto.
- Use `persist` com cuidado: nunca persista dados sensíveis (tokens) em `localStorage` sem avaliar o risco (tema visto em JWT e cookies seguros).
- Use `devtools` em desenvolvimento para facilitar a depuração.
- Não coloque dados do servidor na store sem necessidade: prefira TanStack Query para isso.
- Escolha a ferramenta pelo **tamanho e necessidade do projeto**, não por modismo.

---

# Resumo

| Conceito | Resolve |
|---------|---------|
| create | Criar uma store com estado e ações em um só lugar |
| Seletores | Re-render seletivo, só quando o dado usado muda |
| Middlewares | Persistência, DevTools e imutabilidade sob demanda |
| Zustand x Redux | Simplicidade e flexibilidade x estrutura e rastreabilidade |

---

# Fluxo mental

```
Preciso de estado global...

            │

   ┌────────┼────────┐

   ▼        ▼        ▼

Dados que   Projeto     Dados vindos
mudam e     pequeno/    de uma API
são usados  médio, quer
em vários   simplicidade
lugares

   │        │        │

Estado do   Zustand    TanStack Query
cliente              ou RTK Query

            │
            ▼
   Projeto grande, vários times,
   precisa de convenções e auditoria?
            │
            ▼
      Redux Toolkit
```

---

# Referências

- Documentação oficial do Zustand: https://zustand.docs.pmnd.rs/
- Repositório do Zustand no GitHub: https://github.com/pmndrs/zustand
- Documentação oficial do Redux Toolkit: https://redux-toolkit.js.org/
- TanStack Query: https://tanstack.com/query/latest