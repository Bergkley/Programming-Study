export class User {
  private name: string;
  private age: number;
  private email: string;
  private active: boolean;

  constructor(name: string, age: number, email: string) {
    this.name = name;
    this.age = age;
    this.email = email;
    this.active = true;
  }

  getName(): string {
    return this.name;
  }

  setName(newName: string): void {
    this.name = newName;
  }

  getAge(): number {
    return this.age;
  }

  isAdult(): boolean {
    return this.age >= 18;
  }

  getEmail(): string {
    return this.email;
  }

  setEmail(newEmail: string): void {
    this.email = newEmail;
  }

  activate(): void {
    this.active = true;
  }

  deactivate(): void {
    this.active = false;
  }

  isActive(): boolean {
    return this.active;
  }

  getDescription(): string {
    return `${this.name} is ${this.age} years old and has the email ${this.email}.`;
  }

  compareAge(otherUser: User): string {
    if (this.age > otherUser.age) {
      return `${this.name} is older than ${otherUser.name}.`;
    }

    if (this.age < otherUser.age) {
      return `${this.name} is younger than ${otherUser.name}.`;
    }

    return `${this.name} and ${otherUser.name} are the same age.`;
  }
}

