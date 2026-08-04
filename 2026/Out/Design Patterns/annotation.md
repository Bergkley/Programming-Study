# Design Patterns

# Factory, Strategy e Observer

Os **Design Patterns (Padrões de Projeto)** são soluções reutilizáveis para problemas comuns encontrados durante o desenvolvimento de software.

Eles **não são códigos prontos**, mas sim formas de estruturar o código para torná-lo mais organizado, flexível e fácil de manter.

Os padrões de projeto ficaram conhecidos após a publicação do livro **:contentReference[oaicite:0]{index=0}**, escrito pelo grupo conhecido como **Gang of Four (GoF)**.

Os três padrões mais utilizados no desenvolvimento de aplicações são:

- Factory
- Strategy
- Observer

---

# Por que utilizar Design Patterns?

Imagine uma aplicação crescendo ao longo do tempo.

Sem padrões:

- muito código duplicado;
- alto acoplamento;
- dificuldade para adicionar novas funcionalidades;
- manutenção complicada.

Com Design Patterns:

- código reutilizável;
- baixo acoplamento;
- maior flexibilidade;
- melhor organização.

---

# Visão geral

```
Design Patterns

        │

 ┌──────┼────────┐

 ▼      ▼        ▼

Factory Strategy Observer
```

Cada padrão resolve um problema diferente.

---

# O que é Factory?

O **Factory Pattern** é um padrão criacional.

Seu objetivo é:

> **Centralizar a criação de objetos.ou seja, cria instâncias de classes. **

Em vez de criar objetos diretamente utilizando `new`, delegamos essa responsabilidade para uma fábrica.

---

# Problema

Imagine um sistema de pagamentos.

```typescript
const pagamento =
  new CartaoCredito();
```

Depois surge um novo método.

```typescript
const pagamento =
  new Pix();
```

Depois:

```typescript
const pagamento =
  new Boleto();
```

Em pouco tempo o código ficará cheio de:

```typescript
new CartaoCredito()

new Pix()

new Boleto()
```

---

# Solução

Criamos uma fábrica.

```
Cliente

↓

Factory

↓

Objeto correto
```

---

# Exemplo

Interface:

```typescript
interface Pagamento {

  pagar(): void;

}
```

Implementações:

```typescript
class Pix
  implements Pagamento {

  pagar() {
    console.log("PIX");
  }

}
```

```typescript
class Cartao
  implements Pagamento {

  pagar() {
    console.log("Cartão");
  }

}
```

Factory:

```typescript
class PagamentoFactory {

  static criar(
    tipo: string
  ): Pagamento {

    if (tipo === "pix") {
      return new Pix();
    }

    return new Cartao();

  }

}
```

Uso:

```typescript
const pagamento =
  PagamentoFactory.criar(
    "pix"
  );

pagamento.pagar();
```

---

# Vantagens do Factory

- Centraliza a criação de objetos.
- Reduz duplicação.
- Facilita manutenção.
- Facilita testes.
- Esconde detalhes de implementação.

---

# Quando usar Factory?

Utilize quando:

- existirem vários tipos de objetos;
- a criação do objeto for complexa;
- quiser esconder detalhes de criação;
- precisar trocar implementações facilmente.

---

# O que é Strategy?

O **Strategy Pattern** permite encapsular diferentes algoritmos(regras) em classes separadas.

Em vez de utilizar diversos `if` ou `switch`, escolhemos uma estratégia em tempo de execução.

---

# Problema

```typescript
function calcular(
  tipo: string,
  valor: number
) {

  if (tipo === "pix") {
    return valor;
  }

  if (tipo === "boleto") {
    return valor + 5;
  }

  if (tipo === "cartao") {
    return valor * 1.05;
  }

}
```

Sempre que surgir um novo método será necessário alterar essa função.

---

# Solução

Cada algoritmo vira uma estratégia.

```
Pagamento

↓

Estratégia

↓

PIX

Cartão

Boleto
```

---

# Interface

```typescript
interface Pagamento {

  calcular(
    valor: number
  ): number;

}
```

---

# Estratégias

```typescript
class Pix
  implements Pagamento {

  calcular(valor: number) {
    return valor;
  }

}
```

```typescript
class Cartao
  implements Pagamento {

  calcular(valor: number) {
    return valor * 1.05;
  }

}
```

---

# Context

```typescript
class Checkout {

  constructor(
    private estrategia: Pagamento
  ) {}

  finalizar(valor: number) {

    return this.estrategia.calcular(
      valor
    );

  }

}
```

Uso:

```typescript
const checkout =
  new Checkout(
    new Pix()
  );

checkout.finalizar(100);
```

---

# Vantagens do Strategy

- Elimina grandes blocos de `if` e `switch`.
- Facilita adicionar novos algoritmos.
- Baixo acoplamento.
- Código aberto para extensão.

---

# Quando usar Strategy?

Utilize quando:

- existirem vários algoritmos;
- diferentes regras de negócio;
- diferentes cálculos;
- diferentes formas de processamento.

---

# O que é Observer?

O **Observer Pattern** permite que vários objetos sejam notificados quando outro objeto sofre alguma alteração.

É um padrão baseado em **eventos**.

```
Evento

↓

Notificar

↓

Todos os inscritos
```

---

# Exemplo do mundo real

Imagine um canal do YouTube.

```
Canal

↓

Novo vídeo

↓

Inscritos recebem notificação
```

O canal não conhece cada inscrito individualmente.

Ele apenas dispara um evento.

---

# Outro exemplo

Sistema de pedidos.

```
Pedido criado

↓

Enviar Email

↓

Atualizar Estoque

↓

Gerar Nota Fiscal

↓

Registrar Log
```

Cada serviço reage ao evento.

---

# Implementação

Interface:

```typescript
interface Observer {

  update(): void;

}
```

---

Observers

```typescript
class Email
  implements Observer {

  update() {
    console.log(
      "Enviar email"
    );
  }

}
```

```typescript
class Estoque
  implements Observer {

  update() {
    console.log(
      "Atualizar estoque"
    );
  }

}
```

---

Subject

```typescript
class Pedido {

  private observers:
    Observer[] = [];

  adicionar(
    observer: Observer
  ) {

    this.observers.push(
      observer
    );

  }

  notificar() {

    this.observers.forEach(
      observer => observer.update()
    );

  }

}
```

Uso:

```typescript
const pedido =
  new Pedido();

pedido.adicionar(
  new Email()
);

pedido.adicionar(
  new Estoque()
);

pedido.notificar();
```

Resultado:

```text
Enviar email

Atualizar estoque
```

---

# Vantagens do Observer

- Baixo acoplamento.
- Fácil adicionar novos observadores.
- Muito utilizado em sistemas orientados a eventos.
- Facilita integração entre módulos.

---

# Quando usar Observer?

Utilize quando:

- vários componentes precisam reagir ao mesmo evento;
- utilizar eventos;
- trabalhar com notificações;
- implementar sistemas reativos.

---

# Comparando os padrões

| Padrão | Objetivo |
|---------|----------|
| Factory | Criar objetos |
| Strategy | Escolher algoritmos |
| Observer | Notificar interessados |

---

# Exemplo prático

Imagine um e-commerce.

```
Cliente compra produto

        │

        ▼

PagamentoFactory

        │

        ▼

Cria Pix

        │

        ▼

Checkout

        │

        ▼

Strategy

↓

Calcula pagamento

        │

        ▼

Pedido aprovado

        │

        ▼

Observer

↓

Email

↓

Estoque

↓

Nota Fiscal

↓

Logs
```

Nesse fluxo:

- **Factory** cria o tipo de pagamento.
- **Strategy** define como o pagamento será processado.
- **Observer** notifica os demais módulos após a conclusão.

---

# Factory x Strategy

É comum confundir esses dois padrões.

| Factory | Strategy |
|----------|----------|
| Cria objetos | Escolhe algoritmos |
| Resolve "como criar?" | Resolve "como executar?" |
| Criacional | Comportamental |

---

# Strategy x Observer

| Strategy | Observer |
|-----------|----------|
| Escolhe uma única estratégia | Notifica vários objetos |
| Um algoritmo ativo | Vários ouvintes |
| Executa lógica | Reage a eventos |

---

# Factory + Strategy

É muito comum utilizar os dois juntos.

```typescript
const pagamento =
  PagamentoFactory.criar("pix");

const checkout =
  new Checkout(pagamento);

checkout.finalizar(100);
```

A Factory cria a estratégia que será utilizada.

---

# Observer no JavaScript

O JavaScript utiliza esse padrão em diversos lugares.

Exemplo:

```typescript
button.addEventListener(
  "click",
  () => {
    console.log("Clicou!");
  }
);
```

Quando o botão é clicado, todos os listeners registrados são notificados.

Outro exemplo no Node.js:

```typescript
import { EventEmitter } from "node:events";

const emitter = new EventEmitter();

emitter.on("pedido", () => {
  console.log("Pedido recebido");
});

emitter.emit("pedido");
```

O `EventEmitter` é uma implementação clássica do padrão Observer.

---

# Boas práticas

- Utilize Factory quando a criação de objetos for complexa.
- Utilize Strategy para eliminar grandes blocos de `if` e `switch`.
- Utilize Observer para comunicação baseada em eventos.
- Evite aplicar padrões quando uma solução simples já resolve o problema.
- Escolha o padrão de acordo com o problema, não por preferência pessoal.

---

# Resumo

| Padrão | Resolve |
|---------|---------|
| Factory | Criação de objetos |
| Strategy | Variação de algoritmos |
| Observer | Comunicação entre objetos através de eventos |

---

# Fluxo mental

```
Preciso resolver...

            │

   ┌────────┼────────┐

   ▼        ▼        ▼

Criar    Escolher   Notificar
objetos algoritmo   eventos

   │        │        │

Factory Strategy Observer
```

---

# Referências

- :contentReference[oaicite:1]{index=1}
- :contentReference[oaicite:2]{index=2}
- Documentação oficial - EventEmitter (Node.js): https://nodejs.org/api/events.html
- Refactoring Guru: https://refactoring.guru/design-patterns