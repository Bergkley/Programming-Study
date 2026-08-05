# Design Patterns: Factory, Strategy e Observer

Este projeto demonstra o uso de tres Design Patterns em TypeScript:

- Factory
- Strategy
- Observer

O exemplo simula um pedido com pagamento e notificacao de status para diferentes interessados, como cliente, administrador e estoque.

## Estrutura do Projeto

```text
src/
├── main.ts
├── payment/
│   ├── interfaces/
│   │   ├── IPayment.ts
│   │   └── IStrategyPayment.ts
│   ├── Payment.ts
│   ├── PaymentFactory.ts
│   └── strategies/
│       ├── StrategyPix.ts
│       ├── StrategyCard.ts
│       └── StrategyTicket.ts
├── order/
│   ├── interfaces/
│   │   └── OrderStatus.ts
│   └── Order.ts
└── observer/
    ├── interfaces/
    │   ├── IObserver.ts
    │   └── ISubject.ts
    ├── Customer.ts
    ├── Administrator.ts
    └── Inventory.ts
```

## Patterns Utilizados

## Factory

O Factory fica no arquivo `PaymentFactory.ts`.

Ele e responsavel por criar o tipo correto de pagamento com base na opcao escolhida:

- `Pix`
- `Card`
- `Ticket`

Exemplo:

```ts
const payment = PaymentFactory.create("Pix");
```

## Strategy

O Strategy e usado para trocar a forma de pagamento sem alterar a classe `Payment`.

Cada forma de pagamento possui uma estrategia propria:

- `StrategyPix`
- `StrategyCard`
- `StrategyTicket`

A classe `Payment` recebe uma estrategia e executa o metodo `send`.

## Observer

O Observer e usado para notificar varias classes quando o status do pedido muda.

Os observers sao:

- `Customer`
- `Administrator`
- `Inventory`

A classe `Order` funciona como o subject. Ela guarda os observers e notifica todos quando o status e atualizado.

## Como Rodar

Entre na pasta do projeto:

```powershell
cd "2026\Out\Design Patterns\Exercises\Design Patterns (Factory,Strategy e Observer)"
```

Rode o arquivo principal com `tsx`:

```powershell
npx tsx src/main.ts
```

Se aparecer uma pergunta para instalar o `tsx`, confirme.

## Saida Esperada

Ao executar o projeto, o terminal deve mostrar:

- pagamento realizado
- status do pedido atualizado
- notificacoes recebidas pelo cliente, administrador e estoque

## Fluxo do Programa

1. O pedido e criado.
2. Cliente, administrador e estoque se inscrevem para receber notificacoes.
3. O pagamento e criado pela `PaymentFactory`.
4. A estrategia de pagamento escolhida executa o pagamento.
5. O pedido muda de status.
6. Todos os observers sao notificados.
