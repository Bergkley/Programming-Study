// modulosES6.js

// Exportação padrão (default)
export default function saudacao() {
    console.log("Olá! Esta é a função padrão.");
}
// Exportações nomeadas
export function soma(a, b) {
    return a + b;
}

export function subtracao(a, b) {
    return a - b;
}