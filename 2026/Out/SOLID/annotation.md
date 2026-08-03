# SOLID

O **SOLID** é um conjunto de **cinco princípios de design de software** que ajudam a criar sistemas mais organizados, flexíveis, fáceis de manter e de evoluir.

Esses princípios foram propostos por **:contentReference[oaicite:0]{index=0}**, também conhecido como **Uncle Bob**, e são amplamente utilizados no desenvolvimento orientado a objetos.

O nome **SOLID** é um acrônimo formado pelas iniciais de cada princípio:

- **S** — Single Responsibility Principle
- **O** — Open/Closed Principle
- **L** — Liskov Substitution Principle
- **I** — Interface Segregation Principle
- **D** — Dependency Inversion Principle

> O objetivo do SOLID não é obrigar você a seguir regras rígidas, mas fornecer boas práticas para escrever um código mais limpo, reutilizável e de fácil manutenção.

---

# Por que o SOLID surgiu?

À medida que uma aplicação cresce, é comum que o código comece a apresentar problemas como:

- Classes muito grandes.
- Alto acoplamento entre módulos.
- Dificuldade para adicionar novas funcionalidades.
- Bugs ao alterar código existente.
- Baixa reutilização.
- Testes difíceis de escrever.

Exemplo de uma classe com muitas responsabilidades:

```typescript
class UsuarioService {
  criarUsuario() {}

  validarEmail() {}

  enviarEmail() {}

  salvarNoBanco() {}

  gerarRelatorio() {}

  exportarCSV() {}
}
```

Essa classe faz muitas coisas diferentes.

Quando isso acontece:

- fica difícil entender o código;
- aumenta a chance de bugs;
- alterações simples podem afetar outras funcionalidades.

O SOLID busca evitar esse tipo de problema.

---

# Visão geral

```
        SOLID

   ┌────┬────┬────┬────┬────┐

   S    O    L    I    D
```

Cada princípio resolve um problema específico.

---

# S — Single Responsibility Principle (SRP)

## Princípio da Responsabilidade Única

Uma classe deve possuir **apenas um motivo para mudar**.

Ou seja:

> Cada classe deve ser responsável por apenas uma tarefa.

---

## Exemplo incorreto

```typescript
class UsuarioService {
  criarUsuario() {}

  salvarBanco() {}

  enviarEmail() {}

  gerarPDF() {}
}
```

Essa classe possui várias responsabilidades.

---

## Melhor solução

```typescript
class UsuarioService {
  criarUsuario() {}
}
```

```typescript
class EmailService {
  enviarEmail() {}
}
```

```typescript
class RelatorioService {
  gerarPDF() {}
}
```

Agora cada classe possui apenas uma responsabilidade.

---

## Benefícios

- Código mais organizado.
- Fácil manutenção.
- Melhor reutilização.
- Testes mais simples.

---

# O — Open/Closed Principle (OCP)

## Princípio Aberto/Fechado

As classes devem estar:

- **Abertas para extensão.**
- **Fechadas para modificação.**

Em vez de alterar código existente, adicionamos novos comportamentos.

---

## Exemplo incorreto

```typescript
class Desconto {

  calcular(tipo: string) {

    if (tipo === "vip") {
      return 20;
    }

    if (tipo === "premium") {
      return 40;
    }

    return 0;
  }
}
```

Sempre que surgir um novo tipo de desconto será necessário alterar a classe.

---

## Melhor solução

```typescript
interface Desconto {
  calcular(): number;
}
```

```typescript
class Vip implements Desconto {
  calcular() {
    return 20;
  }
}
```

```typescript
class Premium implements Desconto {
  calcular() {
    return 40;
  }
}
```

Agora basta criar uma nova implementação sem modificar as existentes.

---

## Benefícios

- Menor risco de quebrar funcionalidades.
- Código mais extensível.
- Melhor organização.

---

# L — Liskov Substitution Principle (LSP)

## Princípio da Substituição de Liskov

Criado por **:contentReference[oaicite:1]{index=1}**.

O princípio diz:

> Objetos derivados devem poder substituir seus objetos base sem alterar o comportamento esperado da aplicação.

---

## Exemplo incorreto

```typescript
class Ave {
  voar() {}
}

class Pinguim extends Ave {
  voar() {
    throw new Error("Pinguins não voam");
  }
}
```

Um `Pinguim` não pode substituir corretamente uma `Ave`.

---

## Melhor solução

```typescript
class Ave {}
```

```typescript
class AveQueVoa extends Ave {
  voar() {}
}
```

```typescript
class Pinguim extends Ave {}
```

Agora a hierarquia faz sentido.

---

## Benefícios

- Heranças corretas.
- Polimorfismo seguro.
- Menos erros de execução.

---

# I — Interface Segregation Principle (ISP)

## Princípio da Segregação de Interfaces

Nenhuma classe deve ser obrigada a implementar métodos que não utiliza.

---

## Exemplo incorreto

```typescript
interface Animal {

  andar(): void;

  voar(): void;

  nadar(): void;

}
```

Agora:

```typescript
class Cachorro implements Animal {

  andar() {}

  voar() {
    throw new Error();
  }

  nadar() {}

}
```

O cachorro foi obrigado a implementar um método que não faz sentido.

---

## Melhor solução

```typescript
interface Andador {
  andar(): void;
}
```

```typescript
interface Nadador {
  nadar(): void;
}
```

```typescript
interface Voador {
  voar(): void;
}
```

Agora cada classe implementa apenas o que realmente precisa.

---

## Benefícios

- Interfaces menores.
- Menor acoplamento.
- Código mais flexível.

---

# D — Dependency Inversion Principle (DIP)

## Princípio da Inversão de Dependência

Módulos de alto nível não devem depender de implementações concretas.

Ambos devem depender de abstrações.

---

## Exemplo incorreto

```typescript
class MySQLDatabase {

  salvar() {}

}
```

```typescript
class UsuarioService {

  private banco =
    new MySQLDatabase();

}
```

O `UsuarioService` depende diretamente do MySQL.

Se trocar para PostgreSQL será necessário alterar a classe.

---

## Melhor solução

```typescript
interface Database {
  salvar(): void;
}
```

```typescript
class MySQLDatabase
  implements Database {

  salvar() {}

}
```

```typescript
class UsuarioService {

  constructor(
    private banco: Database
  ) {}

}
```

Agora qualquer implementação pode ser utilizada.

---

## Exemplo

```typescript
new UsuarioService(
  new MySQLDatabase()
);
```

Ou:

```typescript
new UsuarioService(
  new PostgreSQLDatabase()
);
```

Nenhuma alteração é necessária no `UsuarioService`.

---

## Benefícios

- Baixo acoplamento.
- Fácil troca de implementações.
- Testes simplificados.
- Facilita Injeção de Dependência (Dependency Injection).

---

# Resumindo os princípios

| Letra | Princípio | Objetivo |
|--------|-----------|----------|
| S | Single Responsibility | Uma responsabilidade por classe |
| O | Open/Closed | Estender sem modificar |
| L | Liskov Substitution | Substituição correta de subclasses |
| I | Interface Segregation | Interfaces pequenas e específicas |
| D | Dependency Inversion | Depender de abstrações |

---

# SOLID na prática

Imagine uma API de e-commerce.

```
Pedido

↓

PedidoService

↓

Pagamento

↓

Banco
```

Sem SOLID:

```
PedidoService

↓

MySQL

↓

Stripe

↓

Envio Email

↓

PDF

↓

Logs
```

Tudo fica concentrado em uma única classe.

Com SOLID:

```
PedidoService

      │

 ┌────┼─────┐

 ▼    ▼     ▼

Pagamento

Email

Relatório

Banco
```

Cada responsabilidade fica separada.

---

# Vantagens

Aplicar SOLID traz diversos benefícios:

- Código mais limpo.
- Fácil manutenção.
- Fácil reutilização.
- Baixo acoplamento.
- Alta coesão.
- Melhor testabilidade.
- Facilita evolução do sistema.
- Reduz bugs.

---

# SOLID resolve todos os problemas?

Não.

O SOLID é um conjunto de princípios, não regras obrigatórias.

Aplicá-lo em excesso também pode gerar:

- Classes desnecessárias.
- Complexidade excessiva.
- Muitas abstrações.

O importante é encontrar um equilíbrio.

---

# Quando utilizar?

O SOLID faz mais sentido em:

- Projetos médios e grandes.
- Sistemas orientados a objetos.
- APIs.
- Microsserviços.
- Aplicações que evoluem constantemente.

Em projetos muito pequenos, aplicar todos os princípios pode ser exagero.

---

# Relação com Design Patterns

Os princípios SOLID são frequentemente utilizados em conjunto com os **Design Patterns**.

Por exemplo:

| Princípio | Padrões relacionados |
|-----------|----------------------|
| OCP | Strategy, Factory |
| DIP | Dependency Injection, Factory |
| SRP | Facade, Service |
| ISP | Adapter |
| LSP | Template Method |

Os padrões ajudam a implementar os princípios do SOLID de forma prática.

---

# Fluxo mental

```
Meu código está difícil de manter?

             │
             ▼

Existe mais de uma responsabilidade?

             │
        ┌────┴────┐
        │         │
       Sim       Não
        │
        ▼

Aplique SRP

Depois pergunte:

Posso adicionar funcionalidades
sem alterar código existente?

↓

OCP

Minhas heranças fazem sentido?

↓

LSP

Minhas interfaces são pequenas?

↓

ISP

Estou dependendo de abstrações?

↓

DIP
```

---

# Resumo

```
S → Uma responsabilidade

O → Estenda sem modificar

L → Substitua sem quebrar

I → Interfaces específicas

D → Dependa de abstrações
```

---

# Referências

- :contentReference[oaicite:2]{index=2}
- :contentReference[oaicite:3]{index=3}
- Vídeo: https://www.youtube.com/watch?v=atqeoS1YMG4
- Artigo original: https://web.archive.org/web/20201029084250/http://butunclebob.com/ArticleS.UncleBob.PrinciplesOfOod
````
