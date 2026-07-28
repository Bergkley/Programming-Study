# TypeScript Avançado

# O que são TypeScript Decorators?

Os **Decorators** são um recurso do TypeScript que permite **adicionar ou modificar comportamentos de classes, métodos, propriedades, parâmetros e acessores**, sem alterar diretamente o código original.

Eles seguem o padrão de **Metaprogramação (Metaprogramming)**, ou seja, código que modifica ou adiciona comportamento a outro código.

Em outras palavras:

> **Um Decorator é uma função que é executada quando uma classe ou um de seus membros é definido, permitindo estender seu comportamento.**

Decorators são muito utilizados em frameworks como:

- Angular
- NestJS
- TypeORM
- TypeGraphQL
- class-validator
- class-transformer

---

# Importante

Atualmente, os Decorators fazem parte do ecossistema JavaScript e TypeScript, porém existem diferenças entre:

- **Decorators legados (Legacy Decorators)** → utilizados pelo TypeScript há muitos anos e amplamente adotados por frameworks como Angular e NestJS.
- **Decorators do padrão ECMAScript** → versão padronizada da linguagem JavaScript.

Neste material, utilizaremos a sintaxe mais conhecida e presente na maioria dos projetos TypeScript atuais (Legacy Decorators).

Para utilizá-los, normalmente é necessário habilitar a opção:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true
  }
}
```

Em alguns projetos também é utilizado:

```json
{
  "emitDecoratorMetadata": true
}
```

Principalmente quando frameworks precisam acessar informações sobre os tipos em tempo de execução.

---

# O que é um Decorator?

Um Decorator é apenas uma função.

Ela recebe informações sobre o elemento decorado e pode modificar seu comportamento.

Exemplo:

```typescript
function Log(constructor: Function) {
  console.log("Classe criada!");
}

@Log
class Usuario {}
```

Saída:

```text
Classe criada!
```

Observe que o Decorator foi executado **quando a classe foi definida**, e não quando uma instância foi criada.

---

# Sintaxe

Decorators utilizam o símbolo `@`.

```typescript
@Decorator
class MinhaClasse {}
```

Também podem receber parâmetros.

```typescript
@Decorator("Admin")
class Usuario {}
```

---

# Tipos de Decorators

O TypeScript permite criar Decorators para:

- Classes
- Métodos
- Propriedades
- Acessores (`get` e `set`)
- Parâmetros

---

# Class Decorator

É aplicado sobre uma classe inteira.

```typescript
function Logger(constructor: Function) {
  console.log(
    `${constructor.name} foi criada`
  );
}

@Logger
class Produto {}
```

Saída:

```text
Produto foi criada
```

---

## Modificando a classe

Um Class Decorator também pode retornar uma nova classe.

```typescript
function CriadoEm<T extends new (...args: any[]) => {}>(
  constructor: T
) {
  return class extends constructor {
    criadoEm = new Date();
  };
}

@CriadoEm
class Usuario {
  nome = "João";
}

const usuario = new Usuario();

console.log(usuario);
```

Resultado:

```typescript
{
  nome: "João",
  criadoEm: Date(...)
}
```

---

# Method Decorator

Permite interceptar chamadas de métodos.

```typescript
function Log(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const metodoOriginal =
    descriptor.value;

  descriptor.value = function (...args: any[]) {
    console.log(
      `Executando ${propertyKey}`
    );

    return metodoOriginal.apply(
      this,
      args
    );
  };
}
```

Uso:

```typescript
class Usuario {
  @Log
  salvar() {
    console.log("Salvando...");
  }
}

new Usuario().salvar();
```

Saída:

```text
Executando salvar

Salvando...
```

Esse padrão é muito utilizado para:

- Logs
- Auditoria
- Cache
- Controle de permissões
- Monitoramento

---

# Property Decorator

É aplicado sobre propriedades.

```typescript
function Obrigatorio(
  target: any,
  propertyKey: string
) {
  console.log(
    `Propriedade: ${propertyKey}`
  );
}

class Usuario {
  @Obrigatorio
  nome!: string;
}
```

Embora Property Decorators possam registrar metadados, eles **não conseguem alterar diretamente o comportamento da propriedade** da mesma forma que Method Decorators.

---

# Accessor Decorator

É aplicado sobre métodos `get` e `set`.

```typescript
function LogAccessor(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  console.log(
    `Accessor: ${propertyKey}`
  );
}

class Produto {
  private _preco = 100;

  @LogAccessor
  get preco() {
    return this._preco;
  }
}
```

---

# Parameter Decorator

Permite observar informações sobre um parâmetro.

```typescript
function ParamInfo(
  target: any,
  propertyKey: string,
  parameterIndex: number
) {
  console.log(
    `Parâmetro ${parameterIndex}`
  );
}

class Usuario {
  salvar(
    @ParamInfo nome: string
  ) {}
}
```

É bastante utilizado por frameworks de injeção de dependências.

---

# Decorators com parâmetros

Um Decorator pode ser configurável.

Nesse caso, criamos uma função que retorna o Decorator.

```typescript
function Perfil(tipo: string) {
  return function (
    constructor: Function
  ) {
    console.log(
      `Perfil: ${tipo}`
    );
  };
}
```

Uso:

```typescript
@Perfil("Administrador")
class Usuario {}
```

Saída:

```text
Perfil: Administrador
```

---

# Ordem de execução

Quando existem vários Decorators, eles são avaliados de cima para baixo, mas executados de baixo para cima.

```typescript
@Primeiro
@Segundo
class Usuario {}
```

Ordem de execução:

```
Segundo

Primeiro
```

Esse comportamento é semelhante à composição de funções.

---

# Exemplo do mundo real

No NestJS é muito comum encontrar algo como:

```typescript
@Controller("usuarios")
export class UsuarioController {}
```

Outro exemplo:

```typescript
@Get()
listarUsuarios() {}
```

Ou ainda:

```typescript
@Injectable()
export class UsuarioService {}
```

Todos esses são Decorators.

Eles adicionam metadados que o framework utiliza para:

- Criar rotas.
- Registrar serviços.
- Fazer injeção de dependências.
- Configurar autenticação.
- Aplicar interceptadores e filtros.

---

# Outro exemplo

Criando um Decorator para medir tempo de execução.

```typescript
function TempoExecucao(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const original =
    descriptor.value;

  descriptor.value = function (...args: any[]) {
    const inicio = performance.now();

    const resultado = original.apply(
      this,
      args
    );

    console.log(
      performance.now() - inicio
    );

    return resultado;
  };
}
```

Uso:

```typescript
class Relatorio {
  @TempoExecucao
  gerar() {
    // código...
  }
}
```

---

# Vantagens

- Evitam repetição de código.
- Facilitam reutilização de comportamentos.
- Deixam regras transversais (logs, cache, autorização etc.) separadas da lógica principal.
- São muito utilizados em frameworks modernos.
- Facilitam a criação de APIs declarativas.

---

# Desvantagens

- Podem tornar o fluxo de execução menos evidente.
- Exigem conhecimento sobre metaprogramação.
- O uso excessivo pode dificultar a depuração.
- Nem sempre são a melhor escolha para aplicações pequenas.

---

# Quando usar?

Utilize Decorators quando precisar adicionar comportamentos reutilizáveis, como:

- Logs
- Cache
- Autorização
- Validação
- Injeção de dependências
- Registro de metadados
- Monitoramento
- Auditoria

---

# Quando NÃO usar?

Evite Decorators quando:

- Uma função comum resolve o problema.
- O comportamento é específico de apenas um lugar da aplicação.
- O código fica mais difícil de entender do que a implementação tradicional.

Decorators são excelentes para funcionalidades transversais (**cross-cutting concerns**), mas não devem substituir boas práticas de organização do código.

---

# Resumo

| Tipo | Atua sobre |
|-------|------------|
| Class Decorator | Classe |
| Method Decorator | Métodos |
| Property Decorator | Propriedades |
| Accessor Decorator | `get` e `set` |
| Parameter Decorator | Parâmetros |

---

# Fluxo mental

```
Quero adicionar um comportamento
sem alterar a classe?

             │
             ▼
      Use um Decorator

             │
 ┌───────────┼────────────┐
 │           │            │
 ▼           ▼            ▼
Classe     Método     Propriedade

             │
      Também existem
      Accessor e
      Parameter Decorators
```

---

# Boas práticas

- Utilize Decorators para comportamentos reutilizáveis e independentes da lógica de negócio.
- Evite colocar regras complexas diretamente dentro dos Decorators.
- Prefira nomes claros, como `@Log`, `@Cache`, `@Authorize` e `@Validate`.
- Conheça a diferença entre os Decorators legados do TypeScript e os Decorators padronizados do JavaScript, especialmente ao iniciar novos projetos.
- Em aplicações com NestJS ou Angular, aproveite os Decorators fornecidos pelo framework antes de criar os seus próprios.

---

# Referências

- Documentação oficial do TypeScript - Decorators: https://www.typescriptlang.org/docs/handbook/decorators.html
- Proposta de Decorators (TC39): https://github.com/tc39/proposal-decorators
- Vídeo: https://www.youtube.com/watch?v=KquAqdsucTM
````
