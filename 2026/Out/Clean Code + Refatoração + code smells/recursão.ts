// Recursão = chamada de uma função dentro dela mesma

function fatorial(n: number): number {
    if (n === 0) {
        return 1;
    }
    return n * fatorial(n - 1);
}