# Utils Library + CLI

Uma biblioteca de utilidades JavaScript acompanhada de uma interface de linha de comando (CLI).

## Funcionalidades

- Soma
- Subtração
- Multiplicação
- Divisão
- Capitalizar texto
- Inverter texto
- Remover duplicados de arrays
- Último elemento do array

## Instalação

```bash
npm install
```

## Executando testes

```bash
npm test
```

## Utilização como biblioteca

```javascript
const utils = require("./src");

utils.sum(10,5);

utils.capitalize("javascript");

utils.unique([1,1,2,2,3]);
```

## CLI

```bash
node bin/cli.js sum 10 30

40
```

ou

```bash
utils sum 10 30
```

