import { UsuarioService } from "../Exercise/exerciseJest";
import { mockRepository } from "./mocks/mockRepository";
import { mockUsuario } from "./mocks/mockUser";

describe("UsuarioService", () => {
  const usuarioService = new UsuarioService(mockRepository);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return a user when id is valid", async () => {
    mockRepository.buscarPorId.mockResolvedValueOnce(mockUsuario);

    const result = await usuarioService.buscarUsuario(1);

    expect(result).toEqual(mockUsuario);
    expect(mockRepository.buscarPorId).toHaveBeenCalledWith(1);
  });

  test("should return null when user is not found", async () => {
    mockRepository.buscarPorId.mockResolvedValueOnce(null);

    const result = await usuarioService.buscarUsuario(2);

    expect(result).toBeNull();
    expect(mockRepository.buscarPorId).toHaveBeenCalledWith(2);
  });

  test("should allow acess for user ativated", async () => {
    mockRepository.buscarPorId.mockResolvedValueOnce({
      ...mockUsuario,
      ativo: true,
    });

    const result = await usuarioService.podeAcessar(1);

    expect(result).toBe(true);
  });

  test("should not allow acess for user not ativated", async () => {
    mockRepository.buscarPorId.mockResolvedValueOnce({
      ...mockUsuario,
      ativo: false,
    });

    const result = await usuarioService.podeAcessar(1);

    expect(result).toBe(false);
  });

  test("should not allow acess for user not found", async () => {
    mockRepository.buscarPorId.mockResolvedValueOnce(null);

    const result = await usuarioService.podeAcessar(1);

    expect(result).toBe(false);
  });

  test("should call o repository only 1 ", async () => {
    mockRepository.buscarPorId.mockResolvedValueOnce(mockUsuario);

    await usuarioService.podeAcessar(1);

    expect(mockRepository.buscarPorId).toHaveBeenCalledTimes(1);
  });

  test("should  handle repository error ", async () => {
    mockRepository.buscarPorId.mockRejectedValueOnce(new Error("Repository error"));

    await expect(usuarioService.buscarUsuario(1)).rejects.toThrow("Repository error");
  });

});
