import { UsuarioRepository } from "../../Exercise/exerciseJest";

export const mockRepository: jest.Mocked<UsuarioRepository> = {
  buscarPorId: jest.fn(),
};
