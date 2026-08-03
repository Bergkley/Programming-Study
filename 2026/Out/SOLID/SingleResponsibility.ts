// Solid - Single Responsibility Principle (SRP) Example

// Problema inicial
// a class User tem múltiplas responsabilidades: validação de email e persistência de dados. Isso viola o princípio da responsabilidade única.

class User {
  constructor(
    private name: string,
    private email: string,
  ) {}

  validateEmail(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email);
  }

  save(): void {
    console.log("User saved");
  }
}

// Solução: Separação das responsabilidades em diferentes classes.

class User2 {
  constructor(
    public name: string,
    public email: string,
  ) {}
}
class UserValidator {
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

class UserRepository {
  private users: User2[] = [];

  save(user: User2): void {
    this.users.push(user);
    console.log("User saved");
  }

  getUser(username: string): User2 | undefined {
    return this.users.find((user) => user.name === username);
  }
}

class UserService {
  constructor(
    private userValidator: UserValidator,
    private userRepository: UserRepository,
  ) {}

  saveUser(user: User2): void {
    if (this.userValidator.validateEmail(user.email)) {
        const people = new User2(user.name, user.email);
        this.userRepository.save(people);
    } else {
        console.log("Invalid email");
    }
  }
}
