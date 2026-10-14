# Redux Toolkit

# Slices, Thunks

O **Redux Toolkit (RTK)** é a forma oficial e recomendada de escrever Redux atualmente, criada para resolver os maiores problemas do Redux "clássico": excesso de boilerplate, configuração manual complexa e mutação acidental de estado.

Dois conceitos centrais do Redux Toolkit são:

- **Slices**: uma "fatia" do estado global, junto com suas actions e reducers, tudo em um único lugar.
- **Thunks**: funções que permitem lidar com lógica **assíncrona** (como chamadas de API) dentro do fluxo do Redux.

---

# Por que usar Redux Toolkit?

Imagine uma aplicação React com estado global crescendo ao longo do tempo.

Com Redux "clássico" (sem Toolkit):

- muito código repetitivo para criar actions, action types e reducers;
- risco constante de mutar o estado diretamente por engano;
- configuração manual de middlewares (como o `redux-thunk`) e do DevTools;
- lógica assíncrona exigindo bibliotecas e padrões à parte.

Com Redux Toolkit:

- menos código, mais produtividade (`createSlice` gera tudo automaticamente);
- é possível "mutar" o estado dentro dos reducers (o Immer cuida da imutabilidade nos bastidores);
- configuração de store simplificada, com DevTools e middlewares já inclusos;
- `createAsyncThunk` padroniza chamadas assíncronas, com estados de loading/erro prontos.

---

# Visão geral

```
Redux Toolkit

        │

 ┌──────┼────────┐

 ▼      ▼        ▼

configureStore  Slices  Thunks
```

O `configureStore` monta a store, os **Slices** organizam o estado por domínio, e os **Thunks** cuidam da lógica assíncrona dentro desse fluxo.

---

# Instalação

```bash
npm install @reduxjs/toolkit react-redux
```

---

# Relembrando o fluxo do Redux

```
Componente

↓ dispara

Action

↓

Reducer processa

↓

Store atualiza o estado

↓

Componente re-renderiza

com o novo estado
```

O Redux Toolkit não muda esse fluxo — ele apenas torna cada uma dessas etapas mais simples de escrever.

---

# O que é um Slice?

Um **Slice** representa uma parte isolada do estado global (ex.: `usuario`, `carrinho`, `produtos`), agrupando em um só lugar:

- o **estado inicial**;
- os **reducers** (que também geram as actions automaticamente);
- o **nome** usado para identificar essa fatia no estado global.

```
createSlice({

  name: "contador",

  initialState: { valor: 0 },

  reducers: { ... }

})

↓

Gera automaticamente:

- actions (ex.: incrementar())
- reducer (contadorSlice.reducer)
```

---

# Problema — Redux sem Toolkit (boilerplate)

```typescript
// Action Types
const INCREMENTAR = "contador/INCREMENTAR";
const DECREMENTAR = "contador/DECREMENTAR";

// Action Creators
function incrementar() {
  return { type: INCREMENTAR };
}

function decrementar() {
  return { type: DECREMENTAR };
}

// Reducer
function contadorReducer(state = { valor: 0 }, action: any) {
  switch (action.type) {
    case INCREMENTAR:
      return { ...state, valor: state.valor + 1 };
    case DECREMENTAR:
      return { ...state, valor: state.valor - 1 };
    default:
      return state;
  }
}
```

Muito código apenas para um contador simples, e qualquer esquecimento no `...state` pode gerar mutação acidental.

---

# Solução — Com createSlice

```typescript
import { createSlice } from "@reduxjs/toolkit";

const contadorSlice = createSlice({

  name: "contador",

  initialState: { valor: 0 },

  reducers: {

    incrementar: (state) => {
      state.valor += 1; // parece mutação, mas é seguro (Immer)
    },

    decrementar: (state) => {
      state.valor -= 1;
    },

    incrementarEm: (state, action: { payload: number }) => {
      state.valor += action.payload;
    },

  },

});

export const { incrementar, decrementar, incrementarEm } = contadorSlice.actions;
export default contadorSlice.reducer;
```

O `createSlice` gera automaticamente as **actions** (`incrementar`, `decrementar`, `incrementarEm`) e o **reducer**, a partir de um único objeto de configuração.

---

# Como a "mutação" é segura?

Por baixo dos panos, o Redux Toolkit utiliza a biblioteca **Immer**, que permite escrever um código que **parece** mutar o estado diretamente, mas na verdade gera um novo estado imutável automaticamente.

```
state.valor += 1

↓ (parece mutação)

Immer intercepta

↓

Gera um novo objeto de estado,

sem alterar o original
```

**Importante:** essa "mutação segura" só funciona **dentro de um reducer do createSlice**. Fora desse contexto, o estado do Redux continua sendo tratado como imutável.

---

# Configurando a Store

```typescript
import { configureStore } from "@reduxjs/toolkit";
import contadorReducer from "./features/contador/contadorSlice";
import usuarioReducer from "./features/usuario/usuarioSlice";

export const store = configureStore({
  reducer: {
    contador: contadorReducer,
    usuario: usuarioReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

O `configureStore` já vem com o **Redux DevTools** habilitado e os middlewares padrão (incluindo suporte a thunks) configurados automaticamente.

---

# Conectando ao React

```typescript
import { Provider } from "react-redux";
import { store } from "./app/store";

function App() {
  return (
    <Provider store={store}>
      <MinhaAplicacao />
    </Provider>
  );
}
```

---

# Hooks tipados (useSelector / useDispatch)

```typescript
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../app/store";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
```

```typescript
function Contador() {

  const valor = useAppSelector((state) => state.contador.valor);
  const dispatch = useAppDispatch();

  return (
    <div>
      <p>{valor}</p>
      <button onClick={() => dispatch(incrementar())}>+</button>
      <button onClick={() => dispatch(decrementar())}>-</button>
    </div>
  );

}
```

Criar esses hooks tipados (`useAppSelector`, `useAppDispatch`) evita repetir a tipagem manualmente em cada componente.

---

# O que são Thunks?

Reducers no Redux precisam ser **funções puras e síncronas** — eles não podem fazer chamadas de API, usar `setTimeout`, ou qualquer outra operação assíncrona diretamente.

Um **Thunk** é uma função que permite executar essa lógica assíncrona **fora** do reducer, despachando actions comuns conforme o processo avança.

```
Componente dispara o Thunk

↓

Thunk executa a chamada assíncrona

(ex.: fetch na API)

↓

Conforme o resultado,

despacha actions normais

↓

Reducers atualizam o estado
```

---

# Problema — Lógica assíncrona dentro do componente

```typescript
function ListaUsuarios() {

  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    setCarregando(true);
    fetch("/api/usuarios")
      .then((res) => res.json())
      .then(setUsuarios)
      .finally(() => setCarregando(false));
  }, []);

  // ...
}
```

Se vários componentes precisarem da mesma lista de usuários, essa lógica de busca acaba **duplicada**, e o estado fica espalhado em vários componentes em vez de centralizado.

---

# Solução — createAsyncThunk

```typescript
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const buscarUsuarios = createAsyncThunk(
  "usuarios/buscarUsuarios",
  async () => {
    const resposta = await fetch("/api/usuarios");
    const dados = await resposta.json();
    return dados;
  }
);
```

O `createAsyncThunk` recebe:

- um **nome** (usado como prefixo das actions geradas);
- uma função assíncrona, que retorna os dados (ou lança um erro).

Automaticamente, ele gera **três actions**: `pending`, `fulfilled` e `rejected`, uma para cada momento da requisição.

---

# Tratando os três estados no Slice

```typescript
type UsuariosState = {
  lista: Usuario[];
  status: "ocioso" | "carregando" | "sucesso" | "erro";
  erro: string | null;
};

const estadoInicial: UsuariosState = {
  lista: [],
  status: "ocioso",
  erro: null,
};

const usuariosSlice = createSlice({

  name: "usuarios",

  initialState: estadoInicial,

  reducers: {},

  extraReducers: (builder) => {

    builder
      .addCase(buscarUsuarios.pending, (state) => {
        state.status = "carregando";
        state.erro = null;
      })
      .addCase(buscarUsuarios.fulfilled, (state, action) => {
        state.status = "sucesso";
        state.lista = action.payload;
      })
      .addCase(buscarUsuarios.rejected, (state, action) => {
        state.status = "erro";
        state.erro = action.error.message ?? "Erro desconhecido";
      });

  },

});

export default usuariosSlice.reducer;
```

- **pending**: disparada quando a requisição **começa**.
- **fulfilled**: disparada quando a requisição **é concluída com sucesso**.
- **rejected**: disparada quando a requisição **falha** (erro ou exceção).

`extraReducers` é usado (em vez de `reducers`) porque essas actions **não foram criadas pelo próprio slice**, e sim pelo `createAsyncThunk`.

---

# Usando o Thunk no componente

```typescript
function ListaUsuarios() {

  const dispatch = useAppDispatch();

  const { lista, status, erro } = useAppSelector((state) => state.usuarios);

  useEffect(() => {
    dispatch(buscarUsuarios());
  }, [dispatch]);

  if (status === "carregando") return <p>Carregando...</p>;
  if (status === "erro") return <p>Erro: {erro}</p>;

  return (
    <ul>
      {lista.map((usuario) => (
        <li key={usuario.id}>{usuario.nome}</li>
      ))}
    </ul>
  );

}
```

Agora, qualquer componente da aplicação pode disparar `buscarUsuarios()` e consumir o mesmo estado centralizado, sem duplicar a lógica de `loading`/`erro`.

---

# Thunk com parâmetros

```typescript
export const buscarUsuarioPorId = createAsyncThunk(
  "usuarios/buscarUsuarioPorId",
  async (id: string) => {
    const resposta = await fetch(`/api/usuarios/${id}`);
    if (!resposta.ok) {
      throw new Error("Usuário não encontrado");
    }
    return resposta.json();
  }
);
```

```typescript
dispatch(buscarUsuarioPorId("123"));
```

O argumento passado ao disparar o thunk (`"123"`) chega como primeiro parâmetro da função assíncrona.

---

# Thunk com acesso ao estado (getState)

```typescript
export const buscarPedidosDoUsuario = createAsyncThunk(
  "pedidos/buscarPedidosDoUsuario",
  async (_, { getState }) => {

    const estado = getState() as RootState;
    const usuarioId = estado.usuario.id;

    const resposta = await fetch(`/api/pedidos?usuarioId=${usuarioId}`);
    return resposta.json();

  }
);
```

O segundo argumento do thunk é um objeto com utilitários como `getState`, `dispatch` e `rejectWithValue`.

---

# Tratando erros de forma mais específica (rejectWithValue)

```typescript
export const criarPedido = createAsyncThunk(
  "pedidos/criarPedido",
  async (dadosPedido: NovoPedido, { rejectWithValue }) => {

    try {
      const resposta = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosPedido),
      });

      if (!resposta.ok) {
        const erro = await resposta.json();
        return rejectWithValue(erro);
      }

      return resposta.json();

    } catch (erro) {
      return rejectWithValue({ mensagem: "Erro de conexão" });
    }

  }
);
```

```typescript
.addCase(criarPedido.rejected, (state, action) => {
  state.erro = action.payload as string; // erro customizado, não genérico
})
```

Sem `rejectWithValue`, o `action.error` traria apenas a mensagem padrão do erro JavaScript — com ele, é possível repassar um objeto de erro customizado vindo da própria API.

---

# Combinando múltiplos Slices

```
store
  │
  ├── usuario (usuarioSlice)
  ├── carrinho (carrinhoSlice)
  ├── produtos (produtosSlice)
  └── pedidos (pedidosSlice)
```

```typescript
export const store = configureStore({
  reducer: {
    usuario: usuarioReducer,
    carrinho: carrinhoReducer,
    produtos: produtosReducer,
    pedidos: pedidosReducer,
  },
});
```

Cada slice cuida apenas do seu próprio domínio, mantendo o estado global organizado e fácil de localizar.

---

# Selectors

**Selectors** são funções que extraem (e opcionalmente derivam) dados do estado global, evitando repetir a lógica de acesso em vários componentes.

```typescript
export const selecionarTotalCarrinho = (state: RootState) =>
  state.carrinho.itens.reduce((soma, item) => soma + item.preco, 0);
```

```typescript
const total = useAppSelector(selecionarTotalCarrinho);
```

Para selectors mais complexos (com cálculos custosos), é comum utilizar a biblioteca `reselect` (já integrada ao Redux Toolkit via `createSelector`), que memoriza o resultado.

```typescript
import { createSelector } from "@reduxjs/toolkit";

export const selecionarTotalCarrinho = createSelector(
  (state: RootState) => state.carrinho.itens,
  (itens) => itens.reduce((soma, item) => soma + item.preco, 0)
);
```

---

# Quando usar Redux Toolkit?

Utilize quando:

- a aplicação tiver **estado compartilhado** entre muitos componentes distantes na árvore;
- houver necessidade de **centralizar** lógica assíncrona complexa (múltiplas chamadas de API relacionadas);
- for importante ter **DevTools** avançados para depurar mudanças de estado (histórico, time-travel debugging);
- o time já estiver familiarizado com o padrão Redux, ou a aplicação for grande o suficiente para justificar essa estrutura.

**Evite** quando:

- o estado for simples e local a poucos componentes — nesse caso, `useState`/`useReducer` (ou mesmo Context API) podem ser suficientes;
- a aplicação for pequena, sem necessidade real de um estado global complexo.

---

# Comparando os conceitos

| Conceito | Objetivo |
|---------|----------|
| configureStore | Criar e configurar a store do Redux |
| Slice (createSlice) | Agrupar estado, actions e reducers de um domínio |
| Thunk (createAsyncThunk) | Lidar com lógica assíncrona dentro do fluxo Redux |
| Selector | Extrair e derivar dados do estado global |

---

# Exemplo prático

Imagine uma tela de pedidos.

```
Componente monta

        │

        ▼

dispatch(buscarPedidos())

        │

        ▼

Thunk dispara "pending"

↓

Slice marca status = "carregando"

        │

        ▼

Requisição à API

        │

        ▼

Sucesso?

   │           │
  Sim          Não

   ▼            ▼

"fulfilled"    "rejected"

↓              ↓

Lista          Mensagem
preenchida     de erro

        │

        ▼

Componente lê o estado

via useAppSelector

e renderiza de acordo
```

---

# reducers x extraReducers

É comum confundir quando usar cada um dentro do `createSlice`.

| reducers | extraReducers |
|----------|----------|
| Define actions **criadas pelo próprio slice** | Reage a actions **vindas de fora** (ex.: de um thunk ou de outro slice) |
| Gera a action automaticamente | Não gera action, apenas escuta |
| Uso comum: `incrementar`, `definirFiltro` | Uso comum: `pending`, `fulfilled`, `rejected` de um `createAsyncThunk` |

---

# Redux Toolkit x Context API

Vale relacionar com o tema de Context API já visto: ambos compartilham dados entre componentes, mas resolvem problemas de escala diferentes.

| Context API | Redux Toolkit |
|-----------|----------|
| Nativo do React | Requer biblioteca externa |
| Ideal para dados que mudam pouco (tema, autenticação) | Ideal para estado complexo, com muitas atualizações |
| Sem DevTools dedicado | DevTools avançados (histórico, time-travel) |
| Re-render afeta todos os consumidores do Context | Com `useSelector`, cada componente só re-renderiza se o pedaço que ele lê mudar |

---

# Boas práticas

- Organize os slices por **domínio/feature** (ex.: `usuarioSlice`, `carrinhoSlice`), não por tipo de dado genérico.
- Use `createAsyncThunk` para toda lógica assíncrona, em vez de chamar `fetch` diretamente nos componentes.
- Sempre trate os três estados (`pending`, `fulfilled`, `rejected`) ao lidar com um thunk.
- Use `rejectWithValue` quando precisar de mensagens de erro customizadas vindas da API.
- Crie hooks tipados (`useAppSelector`, `useAppDispatch`) para evitar repetição de tipos.
- Prefira **selectors** em vez de acessar o estado diretamente dentro dos componentes.
- Use `createSelector` para selectors que envolvem cálculos (evita recomputar sem necessidade).
- Não guarde no Redux dados que são puramente locais de um componente (ex.: se um input está focado).

---

# Resumo

| Conceito | Resolve |
|---------|---------|
| createSlice | Reduzir boilerplate ao criar actions e reducers |
| createAsyncThunk | Padronizar lógica assíncrona dentro do Redux |
| extraReducers | Reagir a actions geradas por thunks ou outros slices |
| Selector | Centralizar e otimizar o acesso ao estado |

---

# Fluxo mental

```
Preciso de estado

compartilhado na aplicação...

            │

   ┌────────┼────────┐

   ▼        ▼        ▼

Organizar   Lidar com      Ler o estado
o estado    lógica         de forma
por domínio assíncrona     eficiente

   │        │        │

Slices    Thunks     Selectors
(createSlice) (createAsyncThunk)
```

---

# Referências

- Documentação oficial do Redux Toolkit: https://redux-toolkit.js.org/
- Redux Toolkit — createSlice: https://redux-toolkit.js.org/api/createSlice
- Redux Toolkit — createAsyncThunk: https://redux-toolkit.js.org/api/createAsyncThunk
- Redux — Guia oficial de uso com TypeScript: https://redux.js.org/usage/usage-with-typescript
- Vídeo: https://www.youtube.com/watch?v=HGMd3dbB-lM&t=2172s&pp=ygUTcmVkdXggdG9vbGtpdCBwdC1icg%3D%3D