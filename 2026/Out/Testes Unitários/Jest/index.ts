export function somar(a: number, b: number): number {
  return a + b;
}

export function ehPar(numero: number): boolean {
  return numero % 2 === 0;
}

export function criarUsuario(nome: string, idade: number) {
  return {
    nome,
    idade,
    ativo: true,
  };
}
