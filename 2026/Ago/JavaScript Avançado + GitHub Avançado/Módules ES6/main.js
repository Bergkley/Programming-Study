// main.js

// Importando a exportação padrão
import saudacao from "./ModulesES6.js";

// Importando exportações nomeadas
import { soma, subtracao } from "./ModulesES6.js";

// Utilizando as funções
saudacao();

console.log("Soma:", soma(10, 5));
console.log("Subtração:", subtracao(10, 5));