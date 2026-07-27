// ======================================================
// CONDITIONAL TYPES
// ======================================================

type IsString<T> = T extends string ? true : false;

type TestString = IsString<string>; 
type TestNumber = IsString<2>;      

// ======================================================
// BASE INTERFACE
// ======================================================

interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  age: number;

  send(): string;
  join(): void;
  isActive(): boolean;
}

// ======================================================
// MAPPED TYPES
// ======================================================

type MyPartial<T> = {
  [K in keyof T]?: T[K];
};

type PartialUser = MyPartial<User>;

type MyRequired<T> = {
  [K in keyof T]-?: T[K];
};

type RequiredUser = MyRequired<User>;

type UnderscoreUser<T> = {
  [K in keyof T as `_${K & string}`]?: T[K];
};

type UserWithUnderscore = UnderscoreUser<User>;

// ======================================================
// KEY REMAPPING
// ======================================================

type NoMethods<T> = {
  [K in keyof T as T[K] extends Function ? never : K]: T[K];
};

type UserWithoutMethods = NoMethods<User>;

type RemoveStringProps<T> = {
  [K in keyof T as T[K] extends string ? never : K]: T[K];
};

type UserWithoutStrings = RemoveStringProps<User>;

type RemoveProps<T, U> = {
  [K in keyof T as T[K] extends U ? never : K]: T[K];
};

type UserWithoutStringProps = RemoveProps<User, string>;
type UserWithoutFunctions = RemoveProps<User, Function>;
type UserWithoutNumbers = RemoveProps<User, number>;

// ======================================================
// INFER
// ======================================================

type ArrayType<T> = T extends (infer U)[] ? U : never;

const names = ["João", "Maria", "Pedro"];
const numbers = [1, 2, 3];
const mixedArray = [...names, ...numbers];
const allTypes = ["test", true, 1];

type NamesType = ArrayType<typeof names>;         
type NumbersType = ArrayType<typeof numbers>;     
type MixedArrayType = ArrayType<typeof mixedArray>; 
type AllTypes = ArrayType<typeof allTypes>;      