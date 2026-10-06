# Lazy Loading, Suspense

# + Code Splitting

Conforme uma aplicação React cresce, o **bundle** (arquivo JavaScript final enviado ao navegador) também cresce, aumentando o tempo de carregamento inicial. **Lazy Loading**, **Code Splitting** e **Suspense** são técnicas que trabalham juntas para carregar apenas o que é **necessário no momento**, em vez de tudo de uma vez.

- **Code Splitting**: dividir o bundle em pedaços menores (chunks).
- **Lazy Loading**: carregar cada pedaço **sob demanda**, apenas quando necessário.
- **Suspense**: exibir uma interface de carregamento enquanto o conteúdo "preguiçoso" ainda não chegou.

---

# Por que isso importa?

Imagine uma aplicação React crescendo ao longo do tempo, com várias telas, bibliotecas e funcionalidades.

Sem essas técnicas:

- o usuário baixa o código de **todas** as telas, mesmo as que nunca vai acessar;
- o tempo até a aplicação ficar interativa (TTI) aumenta a cada nova funcionalidade;
- bibliotecas pesadas (editores de texto, gráficos, mapas) são carregadas mesmo quando não utilizadas naquela sessão;
- a experiência em conexões mais lentas (mobile, 3G/4G) piora significativamente.

Com Code Splitting, Lazy Loading e Suspense:

- o carregamento inicial contém apenas o essencial;
- telas e componentes pesados só são baixados quando o usuário realmente os acessa;
- a aplicação "sente-se" mais rápida, mesmo sem reduzir o código total;
- há controle total sobre o que exibir enquanto algo carrega.

---

# Visão geral

```
Performance de Carregamento

        │

 ┌──────┼────────┐

 ▼      ▼        ▼

Code    Lazy      Suspense
Splitting Loading
```

O **Code Splitting** divide o código, o **Lazy Loading** decide quando carregar cada parte, e o **Suspense** cuida da experiência visual durante essa espera.

---

# O que é Code Splitting?

**Code Splitting** é o processo de dividir o bundle de uma aplicação em **múltiplos arquivos menores (chunks)**, em vez de um único arquivo gigante.

```
Sem Code Splitting

↓

app.bundle.js (3 MB)

↓

Tudo carregado de uma vez,

mesmo o que não será usado

Com Code Splitting

↓

main.js (200 KB)
dashboard.chunk.js (500 KB)
relatorios.chunk.js (800 KB)
configuracoes.chunk.js (300 KB)

↓

Cada chunk carregado

apenas quando necessário
```

Ferramentas como **Vite** e **Webpack** fazem esse split automaticamente a partir de `import()` dinâmicos.

---

# Problema — Bundle único

```typescript
import Dashboard from "./paginas/Dashboard";
import Relatorios from "./paginas/Relatorios";
import Configuracoes from "./paginas/Configuracoes";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/relatorios" element={<Relatorios />} />
      <Route path="/configuracoes" element={<Configuracoes />} />
    </Routes>
  );
}
```

Mesmo que o usuário acesse apenas o `/`, o código de `Relatorios` e `Configuracoes` é incluído no **mesmo bundle inicial**, aumentando o tempo de carregamento sem necessidade.

---

# O que é Lazy Loading?

**Lazy Loading** ("carregamento preguiçoso") significa adiar o carregamento de um recurso até o momento em que ele é **realmente necessário**.

No React, isso é feito com a função `lazy()`, combinada a um `import()` dinâmico.

```typescript
import { lazy } from "react";

const Relatorios = lazy(() => import("./paginas/Relatorios"));
```

Em vez de importar o componente diretamente no topo do arquivo, o `import()` dinâmico retorna uma **Promise**, que só é resolvida (baixando o código) quando o componente precisa ser renderizado.

---

# O que é Suspense?

Como o carregamento de um componente `lazy` é **assíncrono**, é necessário informar ao React o que exibir **enquanto** esse carregamento acontece. É para isso que existe o `<Suspense>`.

```typescript
import { Suspense } from "react";

function App() {
  return (
    <Suspense fallback={<p>Carregando...</p>}>
      <Relatorios />
    </Suspense>
  );
}
```

```
Componente lazy

é renderizado

↓

Código ainda

não chegou?

   │           │
  Sim          Não

   ▼            ▼

Exibe o        Exibe o
"fallback"     componente
do Suspense    normalmente
```

---

# Solução — Dashboard com Lazy Loading e Suspense

```typescript
import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

const Dashboard = lazy(() => import("./paginas/Dashboard"));
const Relatorios = lazy(() => import("./paginas/Relatorios"));
const Configuracoes = lazy(() => import("./paginas/Configuracoes"));

function App() {
  return (
    <Suspense fallback={<p>Carregando página...</p>}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/relatorios" element={<Relatorios />} />
        <Route path="/configuracoes" element={<Configuracoes />} />
      </Routes>
    </Suspense>
  );
}
```

Agora, o código de `Relatorios` só é baixado quando o usuário **navega** até `/relatorios` — e, enquanto isso acontece, a mensagem "Carregando página..." é exibida.

---

# Múltiplos Suspense (granularidade)

É possível (e recomendado) ter **vários `Suspense`** em diferentes níveis da aplicação, exibindo fallbacks mais específicos para cada parte.

```typescript
function Dashboard() {
  return (
    <div>
      <Cabecalho />

      <Suspense fallback={<SkeletonGrafico />}>
        <GraficoVendas />
      </Suspense>

      <Suspense fallback={<SkeletonTabela />}>
        <TabelaPedidosRecentes />
      </Suspense>
    </div>
  );
}
```

```
Sem granularidade

↓

Um Suspense "engole" a tela toda

enquanto qualquer parte carrega

Com granularidade

↓

Cabeçalho aparece na hora,

só o gráfico e a tabela têm

seus próprios "esqueletos"
```

Isso evita que a tela inteira fique em branco (ou com um único spinner genérico) enquanto apenas uma parte específica ainda está carregando.

---

# Lazy Loading em interações, não apenas em rotas

Lazy Loading não se limita a páginas — também é muito útil para componentes **pesados que só aparecem sob interação do usuário**.

```typescript
const ModalEdicaoAvancada = lazy(() => import("./ModalEdicaoAvancada"));

function Formulario() {

  const [mostrarModal, setMostrarModal] = useState(false);

  return (
    <div>
      <button onClick={() => setMostrarModal(true)}>
        Edição avançada
      </button>

      {mostrarModal && (
        <Suspense fallback={<p>Abrindo...</p>}>
          <ModalEdicaoAvancada onFechar={() => setMostrarModal(false)} />
        </Suspense>
      )}
    </div>
  );

}
```

O código de `ModalEdicaoAvancada` (que pode incluir bibliotecas pesadas, como um editor de texto rico) só é baixado quando o usuário realmente **clica** no botão.

---

# Tratando erros com Error Boundary

Se o carregamento de um chunk **falhar** (ex.: problema de rede, deploy no meio do carregamento), o `Suspense` sozinho não trata esse erro — é necessário combiná-lo com um **Error Boundary**.

```typescript
class ErrorBoundary extends React.Component<Props, State> {

  state = { comErro: false };

  static getDerivedStateFromError() {
    return { comErro: true };
  }

  render() {
    if (this.state.comErro) {
      return <p>Não foi possível carregar esta parte da página.</p>;
    }

    return this.props.children;
  }

}
```

```typescript
<ErrorBoundary>
  <Suspense fallback={<p>Carregando...</p>}>
    <Relatorios />
  </Suspense>
</ErrorBoundary>
```

```
Falha ao baixar o chunk

↓

Sem Error Boundary

↓

Tela quebra / erro não tratado

↓

Com Error Boundary

↓

Mensagem de erro amigável,

resto da aplicação continua
```

---

# Code Splitting por biblioteca

Também é comum aplicar Lazy Loading a **bibliotecas de terceiros** pesadas, carregando-as apenas quando necessárias.

```typescript
const GraficoPesado = lazy(() => import("./componentes/GraficoComChartJs"));
```

Isso evita que uma biblioteca de gráficos (ou um editor de texto rico, um leitor de PDF, etc.) seja incluída no bundle principal, mesmo em páginas que nunca a utilizam.

---

# Prefetch — carregando antes do clique

Em alguns casos, vale **antecipar** o carregamento de um chunk antes mesmo do usuário navegar até ele, melhorando a experiência percebida.

```typescript
function LinkRelatorios() {

  const carregarRelatorios = () => {
    import("./paginas/Relatorios");
  };

  return (
    <Link
      to="/relatorios"
      onMouseEnter={carregarRelatorios}
    >
      Relatórios
    </Link>
  );

}
```

Ao passar o mouse sobre o link, o chunk já começa a ser baixado em segundo plano — quando o clique realmente acontecer, o conteúdo pode já estar pronto (ou quase).

---

# Verificando o resultado (bundle analyzer)

Ferramentas como o **Vite Bundle Visualizer** ou o **Webpack Bundle Analyzer** permitem visualizar o tamanho de cada chunk gerado, confirmando se o Code Splitting está realmente funcionando.

```bash
npm install --save-dev rollup-plugin-visualizer
```

```
Antes do Code Splitting

↓

app.js — 3.2 MB

Depois do Code Splitting

↓

main.js — 180 KB
dashboard.chunk.js — 420 KB
relatorios.chunk.js — 650 KB
```

---

# Quando usar Lazy Loading?

Utilize quando:

- a aplicação tiver **múltiplas rotas/páginas**, especialmente em um SPA;
- houver componentes **pesados** que nem todo usuário acessa (modais complexos, editores, gráficos, mapas);
- bibliotecas de terceiros grandes forem usadas apenas em partes específicas da aplicação;
- o objetivo for melhorar métricas como **tempo até interatividade (TTI)** e **First Contentful Paint**.

**Evite** aplicar lazy loading em componentes muito pequenos ou que aparecem **imediatamente** na tela (ex.: cabeçalho, menu principal) — o overhead da requisição extra pode não compensar.

---

# Comparando os conceitos

| Conceito | Objetivo |
|---------|----------|
| Code Splitting | Dividir o bundle em partes menores |
| Lazy Loading | Carregar cada parte apenas quando necessária |
| Suspense | Controlar a interface exibida durante o carregamento |

---

# Exemplo prático

Imagine uma aplicação de dashboard administrativo.

```
Usuário acessa "/"

        │

        ▼

Apenas o chunk do Dashboard

é baixado (main + dashboard)

        │

        ▼

Usuário clica em "Relatórios"

        │

        ▼

lazy() dispara o import()

        │

        ▼

Suspense exibe o fallback

("Carregando página...")

        │

        ▼

Chunk de Relatórios chega

        │

        ▼

Suspense renderiza

o componente real

        │

        ▼

Se falhar: Error Boundary

exibe mensagem amigável
```

---

# Lazy (React) x Dynamic Import (JavaScript)

É comum confundir esses dois conceitos.

| import() dinâmico | React.lazy |
|----------|----------|
| Recurso nativo do JavaScript/ES Modules | Recurso do React, construído sobre o `import()` |
| Retorna uma Promise com o módulo | Retorna um componente que o React sabe "suspender" |
| Pode ser usado para qualquer módulo (não só componentes) | Específico para componentes React |
| Não lida sozinho com estados de carregamento | Precisa ser usado dentro de um `Suspense` |

---

# Suspense sem Lazy x Suspense com Lazy

| Sem lazy | Com lazy |
|-----------|----------|
| Componente já está no bundle principal | Componente é baixado sob demanda |
| Suspense não tem efeito perceptível | Suspense exibe o fallback durante o download |
| Bundle inicial maior | Bundle inicial menor, carregamento incremental |

---

# Boas práticas

- Aplique Lazy Loading principalmente em **rotas** e **componentes pesados** sob interação.
- Use `Suspense` em múltiplos níveis, evitando telas inteiras "em branco" enquanto uma parte pequena carrega.
- Sempre combine `Suspense` com um **Error Boundary**, tratando falhas de carregamento.
- Use fallbacks que já indiquem o layout final (skeletons), evitando "pulos" bruscos na interface.
- Evite lazy loading em componentes pequenos e sempre visíveis — o ganho não compensa o overhead.
- Utilize um bundle analyzer periodicamente, para confirmar que o Code Splitting está realmente reduzindo o bundle inicial.
- Considere `prefetch` em ações prováveis (hover em links, por exemplo) para melhorar a experiência percebida.

---

# Resumo

| Conceito | Resolve |
|---------|---------|
| Code Splitting | Dividir o bundle em chunks menores |
| Lazy Loading | Carregar cada chunk apenas quando necessário |
| Suspense | Exibir uma interface de carregamento durante a espera |

---

# Fluxo mental

```
Minha aplicação está

carregando lenta demais...

            │

   ┌────────┼────────┐

   ▼        ▼        ▼

O bundle    Preciso        Preciso de uma
inicial     adiar o        interface durante
é grande    carregamento   o carregamento
            de uma parte

   │        │        │

Code       Lazy       Suspense
Splitting  Loading    (+ Error Boundary)
```

---

# Referências

- Documentação oficial do React — lazy: https://react.dev/reference/react/lazy
- Documentação oficial do React — Suspense: https://react.dev/reference/react/Suspense
- Documentação do Vite — Build e Code Splitting: https://vitejs.dev/guide/build.html
- web.dev — Code Splitting: https://web.dev/articles/code-splitting-suspense
- video: https://www.youtube.com/watch?v=h1OdrtXmmmw&pp=ygULcmVhY3QgbGF6eSA%3D