import { criarUsuario, ehPar, somar } from "../index";

describe("funcoes basicas", () => {
  test("soma dois numeros", () => {
    expect(somar(2, 3)).toBe(5);
  });

  test("verifica se um numero e par", () => {
    expect(ehPar(10)).toBe(true);
    expect(ehPar(7)).toBe(false);
  });

  test("cria um usuario ativo", () => {
    expect(criarUsuario("Ana", 22)).toEqual({
      nome: "Ana",
      idade: 22,
      ativo: true,
    });
  });
});
