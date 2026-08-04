// Design Patterns: Strategy Pattern in TypeScript

// problema :
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

// solucao :
interface Pagamento  {
  calcular: (valor: number) => number;
}

class Pix
  implements Pagamento {

  calcular(valor: number) {
    return valor;
  }

}

class Cartao
  implements Pagamento {

  calcular(valor: number) {
    return valor * 1.05;
  }

}

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

const checkout =
  new Checkout(
    new Pix()
  );

checkout.finalizar(100);