export interface Usuario {
  id: number;
  nome: string;
  ativo: boolean;
}

export interface UsuarioRepository {
  buscarPorId(id: number): Promise<Usuario | null>;
}

export class UsuarioService {
  constructor(private repository: UsuarioRepository) {}

  async buscarUsuario(id: number): Promise<Usuario | null> {
    return this.repository.buscarPorId(id);
  }

  async podeAcessar(id: number): Promise<boolean> {
    const usuario = await this.repository.buscarPorId(id);

    if (!usuario) {
      return false;
    }

    return usuario.ativo;
  }
}
