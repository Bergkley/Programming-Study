# Jest + React Testing Library

# Testes de Comportamento em React

O **Jest** é o framework de testes (runner, assertions e mocks) já visto no tema de Testes Unitários. A **React Testing Library (RTL)** é a biblioteca que complementa o Jest para **testar componentes React** de um jeito diferente do tradicional: em vez de verificar *como* o componente foi implementado, ela verifica *o que o usuário vê e faz*.

Esse é o conceito de **testes de comportamento**: o teste simula o uso real (ler texto, clicar, digitar) e confere o resultado na tela, sem depender de detalhes internos como estado, nomes de funções ou estrutura de componentes.

Os três pilares principais desse tema são:

- **Renderizar** o componente e **consultar** a tela (`render`, `screen`, queries).
- **Interagir** como o usuário (`userEvent`).
- **Esperar** mudanças assíncronas (`findBy`, `waitFor`) e **mockar** dependências.

---

# Por que testar comportamento?

Imagine uma aplicação React crescendo ao longo do tempo, com testes escritos sobre detalhes internos.

Testes focados em implementação (ex.: verificar o valor de um `useState`, chamar métodos de instância):

- quebram a cada refatoração, mesmo quando o comportamento não mudou;
- passam mesmo quando a tela está quebrada para o usuário;
- exigem manutenção constante e geram desconfiança nos testes.

Testes focados em comportamento:

- sobrevivem a refatorações (trocar `useState` por `useReducer`, dividir componentes);
- falham quando o usuário **realmente** seria prejudicado;
- servem como documentação do que a tela faz;
- dão confiança real para evoluir o código.

A frase que resume a filosofia da RTL: **"Quanto mais seus testes se parecem com o jeito que o software é usado, mais confiança eles podem dar."**

---

# Visão geral

```
Testes de componentes React

        │

 ┌──────┼────────┐

 ▼      ▼        ▼

Jest      RTL          user-event
(runner,  (render,     (interações
 mocks)   queries)      do usuário)
```

O **Jest** executa os testes e fornece os mocks, a **RTL** renderiza e consulta a tela, e o **user-event** simula o que o usuário faz.

---

# Instalação

```bash
npm install --save-dev jest jest-environment-jsdom \
  @testing-library/react @testing-library/jest-dom \
  @testing-library/user-event
```

Configuração do Jest (`jest.config.js`), usando o ambiente `jsdom` (simula o navegador):

```javascript
module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
};
```

```typescript
// jest.setup.ts
import "@testing-library/jest-dom";
```

O `jest-dom` adiciona matchers voltados ao DOM, como `toBeInTheDocument()` e `toBeDisabled()`.

Em projetos TypeScript, também é necessário um transformador (como `ts-jest` ou `babel-jest`/SWC), visto no tema de Jest.

---

# Anatomia de um teste com RTL

```typescript
import { render, screen } from "@testing-library/react";
import Saudacao from "./Saudacao";

describe("Saudacao", () => {

  it("deve exibir o nome do usuário", () => {

    render(<Saudacao nome="Sheila" />);

    expect(screen.getByText("Olá, Sheila!")).toBeInTheDocument();

  });

});
```

```
Arrange

↓

render(<Componente />)

Act

↓

interação do usuário

(se houver)

Assert

↓

expect(screen...)
```

- **render**: monta o componente em um DOM virtual.
- **screen**: objeto com as queries, para consultar o que está na tela.
- **expect + jest-dom**: confere o resultado.

---

# Queries: como encontrar elementos

A RTL oferece três "famílias" de queries, cada uma com um comportamento diferente quando o elemento **não existe**:

| Família | Se o elemento existe | Se não existe | Uso principal |
|---------|----------|----------|----------|
| `getBy...` | Retorna o elemento | **Lança erro** | Elemento que deve estar na tela agora |
| `queryBy...` | Retorna o elemento | Retorna `null` | Verificar que algo **não** está na tela |
| `findBy...` | Retorna o elemento (assíncrono) | Lança erro após o timeout | Elemento que **vai aparecer** depois |

Cada uma tem a versão `...AllBy...` para múltiplos elementos (`getAllByRole`, `queryAllByText`, `findAllByRole`).

---

# Prioridade das queries

A RTL recomenda buscar elementos **do jeito que o usuário (e tecnologias assistivas) os percebe**, nesta ordem de preferência:

```
1. getByRole          → botões, links, campos, títulos (preferida)

2. getByLabelText     → campos de formulário com label

3. getByPlaceholderText

4. getByText          → textos visíveis

5. getByDisplayValue  → valor atual de inputs

6. getByAltText       → imagens

7. getByTitle

8. getByTestId        → último recurso (data-testid)
```

```typescript
// Preferido: como o usuário enxerga
screen.getByRole("button", { name: /enviar/i });
screen.getByLabelText("E-mail");

// Último recurso: não representa nada para o usuário
screen.getByTestId("botao-enviar");
```

Usar `getByRole` ainda ajuda a garantir **acessibilidade**: se o elemento não é encontrado pelo papel (role) e nome, é provável que um leitor de tela também não o encontre.

---

# Problema — Teste focado em implementação

```typescript
function Contador() {

  const [valor, setValor] = useState(0);

  return (
    <div>
      <span>{valor}</span>
      <button onClick={() => setValor(valor + 1)}>Incrementar</button>
    </div>
  );

}
```

```typescript
// Frágil: depende de detalhes internos (fora do padrão da RTL)
const wrapper = shallow(<Contador />);
wrapper.instance().setState({ valor: 5 });
expect(wrapper.state("valor")).toBe(5);
```

Se o componente for refatorado para `useReducer`, esse teste quebra, mesmo com o comportamento **idêntico** para o usuário.

---

# Solução — Teste de comportamento

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Contador from "./Contador";

describe("Contador", () => {

  it("deve incrementar o valor ao clicar no botão", async () => {

    const user = userEvent.setup();

    render(<Contador />);

    expect(screen.getByText("0")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /incrementar/i }));

    expect(screen.getByText("1")).toBeInTheDocument();

  });

});
```

O teste só descreve o que o usuário **vê** e **faz**. Qualquer forma de implementar o contador que preserve esse comportamento continua passando.

---

# userEvent: simulando o usuário

O `@testing-library/user-event` simula interações de forma mais próxima do navegador real do que o `fireEvent` (que dispara apenas um evento isolado).

```typescript
const user = userEvent.setup();

await user.click(botao);
await user.type(campo, "sheila@email.com");
await user.clear(campo);
await user.selectOptions(select, "admin");
await user.tab();
await user.keyboard("{Enter}");
await user.hover(elemento);
```

Todas as interações são **assíncronas** e devem ser aguardadas com `await`.

| userEvent | fireEvent |
|----------|----------|
| Simula a sequência real (foco, teclas, mouse) | Dispara um único evento isolado |
| Mais fiel ao comportamento do navegador | Mais "mecânico" |
| Recomendado pela RTL | Usar apenas quando `userEvent` não cobrir o caso |

---

# Testando um formulário

```typescript
function Login({ onEnviar }: { onEnviar: (dados: { email: string }) => void }) {

  const [email, setEmail] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onEnviar({ email });
      }}
    >
      <label htmlFor="email">E-mail</label>
      <input
        id="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button type="submit">Entrar</button>
    </form>
  );

}
```

```typescript
it("deve enviar o e-mail digitado", async () => {

  const user = userEvent.setup();
  const onEnviar = jest.fn();

  render(<Login onEnviar={onEnviar} />);

  await user.type(screen.getByLabelText("E-mail"), "sheila@email.com");
  await user.click(screen.getByRole("button", { name: /entrar/i }));

  expect(onEnviar).toHaveBeenCalledWith({ email: "sheila@email.com" });

});
```

Aqui o `jest.fn()` (mock de função, visto no tema de Jest) verifica que o componente **comunicou a ação** para fora, sem testar detalhes internos.

---

# Verificando que algo NÃO está na tela

```typescript
// Errado: getBy lança erro quando não encontra
expect(screen.getByText("Erro")).not.toBeInTheDocument();

// Certo: queryBy retorna null
expect(screen.queryByText("Erro")).not.toBeInTheDocument();
```

Use `queryBy` sempre que a expectativa for a **ausência** do elemento.

---

# Testes assíncronos: findBy e waitFor

Quando o conteúdo aparece **depois** de uma ação assíncrona (requisição, timer), é necessário esperar.

```typescript
// findBy = getBy + espera (retorna uma Promise)
const mensagem = await screen.findByText("Cadastro realizado!");
expect(mensagem).toBeInTheDocument();
```

```typescript
import { waitFor } from "@testing-library/react";

await waitFor(() => {
  expect(screen.getByText("Cadastro realizado!")).toBeInTheDocument();
});
```

- **findBy**: ideal para esperar um elemento aparecer.
- **waitFor**: ideal para esperar **qualquer** condição ser verdadeira (repete a função até passar ou estourar o timeout).
- Evite `setTimeout` ou esperas fixas nos testes: use `findBy`/`waitFor`.

---

# Testando um componente que busca dados (mock de fetch)

```typescript
function ListaUsuarios() {

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    fetch("/api/usuarios")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(setUsuarios)
      .catch(() => setErro(true))
      .finally(() => setCarregando(false));
  }, []);

  if (carregando) return <p>Carregando...</p>;
  if (erro) return <p>Falha ao carregar</p>;

  return (
    <ul>
      {usuarios.map((u) => (
        <li key={u.id}>{u.nome}</li>
      ))}
    </ul>
  );

}
```

```typescript
describe("ListaUsuarios", () => {

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("deve exibir os usuários após o carregamento", async () => {

    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => [{ id: 1, nome: "Sheila" }],
    } as Response);

    render(<ListaUsuarios />);

    expect(screen.getByText("Carregando...")).toBeInTheDocument();

    expect(await screen.findByText("Sheila")).toBeInTheDocument();

  });

  it("deve exibir mensagem de erro quando a requisição falhar", async () => {

    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: false,
    } as Response);

    render(<ListaUsuarios />);

    expect(await screen.findByText("Falha ao carregar")).toBeInTheDocument();

  });

});
```

O teste cobre os três estados que o usuário percebe: **carregando**, **sucesso** e **erro**.

---

# Mock de módulos (jest.mock)

Quando o componente depende de um módulo (serviço de API, hook próprio), é possível mockar o módulo inteiro.

```typescript
import { buscarUsuarios } from "../services/usuarios";

jest.mock("../services/usuarios");

const buscarUsuariosMock = jest.mocked(buscarUsuarios);

it("deve exibir os usuários retornados pelo serviço", async () => {

  buscarUsuariosMock.mockResolvedValue([{ id: 1, nome: "Sheila" }]);

  render(<ListaUsuarios />);

  expect(await screen.findByText("Sheila")).toBeInTheDocument();

});
```

**Dica:** para chamadas HTTP, muitos times preferem o **MSW (Mock Service Worker)**, que intercepta a requisição na rede em vez de mockar `fetch` ou módulos, deixando o teste ainda mais próximo do comportamento real.

---

# Testando componentes com Context, Redux e React Query

Componentes que dependem de Providers precisam ser renderizados **dentro** deles. Uma prática comum é criar uma função de render customizada.

```typescript
// test-utils.tsx
import { render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function renderComProviders(ui: React.ReactElement) {

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );

}
```

```typescript
it("deve listar os usuários", async () => {

  renderComProviders(<ListaUsuarios />);

  expect(await screen.findByText("Sheila")).toBeInTheDocument();

});
```

- Crie um `QueryClient` **novo por teste**, para não vazar cache entre testes.
- Desative o `retry` nos testes, para que erros apareçam imediatamente.
- O mesmo padrão vale para `<Provider store={store}>` (Redux) ou Providers de Context/tema.

---

# Testando Custom Hooks

Hooks podem ser testados isoladamente com `renderHook`.

```typescript
import { renderHook, act } from "@testing-library/react";

function useContador(inicial = 0) {
  const [valor, setValor] = useState(inicial);
  const incrementar = () => setValor((v) => v + 1);
  return { valor, incrementar };
}

it("deve incrementar o valor", () => {

  const { result } = renderHook(() => useContador(5));

  act(() => {
    result.current.incrementar();
  });

  expect(result.current.valor).toBe(6);

});
```

O `act` garante que as atualizações de estado sejam processadas antes das verificações. Sempre que possível, prefira testar o hook **através de um componente** que o utilize, pois isso reflete melhor o uso real.

---

# Acessibilidade e o papel do getByRole

```typescript
screen.getByRole("heading", { name: /cadastro/i });
screen.getByRole("textbox", { name: /e-mail/i });
screen.getByRole("checkbox", { name: /aceito os termos/i });
screen.getByRole("alert");
screen.getByRole("button", { name: /salvar/i, hidden: false });
```

Se `getByRole` não encontra o elemento, a RTL mostra no erro **todos os roles disponíveis** na tela, o que ajuda a depurar. Para inspecionar o DOM durante o desenvolvimento do teste:

```typescript
screen.debug();                    // imprime o DOM atual
screen.logTestingPlaygroundURL();  // gera link do Testing Playground
```

---

# Quando usar Jest + RTL?

Utilize quando:

- quiser testar **componentes React** do ponto de vista do usuário;
- precisar de testes rápidos, que rodam no terminal e no CI sem abrir navegador;
- quiser proteger **fluxos de interface** (formulários, listas, estados de loading/erro);
- quiser validar **acessibilidade básica** através das queries por role.

**Não substitui:** testes **end-to-end** (Cypress, Playwright), que validam a aplicação inteira em um navegador real, incluindo rotas, back-end e integrações.

---

# Comparando os conceitos

| Conceito | Objetivo |
|---------|----------|
| Jest | Executar os testes, fornecer asserções e mocks |
| React Testing Library | Renderizar componentes e consultá-los como o usuário |
| jest-dom | Matchers específicos para o DOM |
| user-event | Simular interações realistas do usuário |
| findBy / waitFor | Aguardar mudanças assíncronas na tela |

---

# Exemplo prático

Imagine um formulário de login.

```
Teste "deve exibir erro com credenciais inválidas"

        │

        ▼

Mock da API retorna 401

        │

        ▼

render(<Login />)

        │

        ▼

user.type(email, senha)

        │

        ▼

user.click(botão "Entrar")

        │

        ▼

await findByRole("alert")

        │

        ▼

expect(alerta).toHaveTextContent(

"Credenciais inválidas")
```

```typescript
it("deve exibir erro com credenciais inválidas", async () => {

  const user = userEvent.setup();

  jest.spyOn(global, "fetch").mockResolvedValue({
    ok: false,
    status: 401,
  } as Response);

  render(<Login />);

  await user.type(screen.getByLabelText("E-mail"), "sheila@email.com");
  await user.type(screen.getByLabelText("Senha"), "errada");
  await user.click(screen.getByRole("button", { name: /entrar/i }));

  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Credenciais inválidas"
  );

});
```

---

# getBy x queryBy x findBy

É comum confundir as três famílias.

| getBy | queryBy | findBy |
|----------|----------|----------|
| Síncrona | Síncrona | Assíncrona (Promise) |
| Lança erro se não encontrar | Retorna `null` se não encontrar | Lança erro se não aparecer no tempo |
| Elemento que **deve estar** na tela | Elemento que **não deve estar** na tela | Elemento que **vai aparecer** |

---

# Teste de implementação x Teste de comportamento

| Implementação | Comportamento |
|----------|----------|
| Verifica estado interno, props internas, métodos | Verifica o que aparece na tela e como reage a ações |
| Quebra ao refatorar sem mudar o resultado | Continua passando em refatorações seguras |
| Acoplado ao "como" | Focado no "o quê" |
| Pouca confiança de que a tela funciona | Alta confiança de que o usuário consegue usar |

---

# Testes unitários de função x testes de componente

Conectando com o tema de **Testes Unitários com Jest**:

| Teste de função (Jest puro) | Teste de componente (Jest + RTL) |
|----------|----------|
| Entrada → saída de uma função | Interação do usuário → resultado na tela |
| Ambiente `node` | Ambiente `jsdom` |
| Sem renderização | Renderiza o componente no DOM virtual |
| Ideal para regras de negócio e utilitários | Ideal para interfaces e fluxos de tela |

O **TDD** (Red-Green-Refactor) também funciona com RTL: escreva primeiro o teste descrevendo o comportamento esperado da tela, veja-o falhar, implemente o componente e depois refatore com segurança.

---

# Boas práticas

- Teste **comportamento**, não implementação: evite verificar estado interno ou nomes de funções.
- Prefira queries por **role** e **label**; use `getByTestId` apenas como último recurso.
- Use `userEvent` (com `await`) em vez de `fireEvent`.
- Use `findBy`/`waitFor` para conteúdo assíncrono; nunca esperas fixas com `setTimeout`.
- Use `queryBy` para verificar **ausência** de elementos.
- Mocke apenas as **fronteiras** (rede, serviços externos), não os componentes internos.
- Crie uma função de render com **Providers** para evitar repetição.
- Mantenha cada teste **independente**: limpe mocks (`restoreAllMocks`) e crie um novo `QueryClient` por teste.
- Escreva um teste por comportamento, com nomes descritivos ("deve exibir erro quando...").
- Use `screen.debug()` e o Testing Playground para depurar queries que não encontram o elemento.
- Combine com testes E2E para os fluxos críticos da aplicação.

---

# Resumo

| Conceito | Resolve |
|---------|----------|
| Jest | Execução dos testes, mocks e asserções |
| RTL (render, screen, queries) | Testar componentes pelo que o usuário vê |
| userEvent | Simular cliques, digitação e outras interações |
| findBy / waitFor | Lidar com conteúdo assíncrono |
| Render com Providers | Testar componentes que dependem de Context, Redux ou React Query |

---

# Fluxo mental

```
Preciso testar um componente...

            │

   ┌────────┼────────┐

   ▼        ▼        ▼

O que o     O que o        O que acontece
usuário     usuário        depois (async,
vê na       faz            erro, loading)
tela

   │        │        │

render +   userEvent   findBy /
getByRole             waitFor

            │
            ▼
   Depende de API ou Provider?
            │
            ▼
   Mockar a fronteira (fetch/MSW)
   e renderizar com Providers
```

---

# Referências

- React Testing Library — documentação oficial: https://testing-library.com/docs/react-testing-library/intro/
- Queries e prioridade: https://testing-library.com/docs/queries/about/#priority
- user-event: https://testing-library.com/docs/user-event/intro
- jest-dom: https://github.com/testing-library/jest-dom
- Jest — documentação oficial: https://jestjs.io/pt-BR/
- MSW (Mock Service Worker): https://mswjs.io/
- Kent C. Dodds — Common mistakes with React Testing Library: https://kentcdodds.com/blog/common-mistakes-with-react-testing-library
- video - https://www.youtube.com/watch?v=yV_61piC-nM&list=PLRVYQGMz5x2Y4NhqFI48usszCOtfPELM2&pp=0gcJCZAGa94AFGB0