# JavaScript - Módulos ES6

## O que são Módulos ES6?

Os **Módulos ES6 (ECMAScript Modules - ESM)** são um recurso do JavaScript que permite dividir o código em arquivos menores e reutilizáveis. Cada módulo pode exportar funcionalidades (como funções, classes, objetos e constantes) para serem utilizadas em outros arquivos.

Essa abordagem torna o código mais organizado, facilita a manutenção e promove a reutilização de componentes.

## Vantagens

- Organização do código em arquivos independentes.
- Reutilização de funções, classes e objetos.
- Melhor manutenção e escalabilidade da aplicação.
- Evita a poluição do escopo global.
- Possibilita o carregamento de apenas aquilo que é necessário.

## Exportando módulos

É possível exportar elementos de duas formas:

### Named Export

```javascript
// math.js
export function sum(a, b) {
  return a + b;
}

export const PI = 3.14159;
```

### Default Export

```javascript
// logger.js
export default function log(message) {
  console.log(message);
}
```

## Importando módulos

### Importando Named Exports

```javascript
import { sum, PI } from "./math.js";

console.log(sum(2, 3));
console.log(PI);
```

### Importando Default Export

```javascript
import log from "./logger.js";

log("Olá, mundo!");
```

### Importando tudo

```javascript
import * as MathUtils from "./math.js";

console.log(MathUtils.sum(5, 10));
```

## Renomeando importações

```javascript
import { sum as add } from "./math.js";

console.log(add(2, 5));
```

## Exportando diretamente

```javascript
export const version = "1.0.0";

export function hello() {
  console.log("Olá!");
}
```

## Boas práticas

- Utilize um módulo para cada responsabilidade.
- Prefira **Named Exports** quando houver múltiplas exportações.
- Utilize **Default Export** quando o módulo possuir apenas uma funcionalidade principal.
- Sempre utilize caminhos relativos (`./` ou `../`) ao importar arquivos locais.
- Mantenha nomes claros e consistentes para arquivos e funções.

## Quando utilizar?

Os módulos ES6 são recomendados para praticamente todos os projetos JavaScript modernos, incluindo aplicações com:

- JavaScript puro
- Node.js (com suporte a ES Modules)
- React
- Vue
- Angular
- Vite
- Next.js

## Referências

- Vídeo: JavaScript ES6 Modules  
  https://www.youtube.com/watch?v=vylVbb2PY0M