import { formatTaskDate } from "./formatTaskDate";

describe('formatTaskDate', () => {
  test('formata data válida corretamente', () => {
    const result = formatTaskDate('2025-11-13T00:00:00');
    expect(result).toBe('13/11/2025');
  });

  test('formata data ISO completa', () => {
    const result = formatTaskDate('2025-11-13T10:30:00');
    expect(result).toBe('13/11/2025');
  });

  test('retorna "Data inválida" quando string vazia', () => {
    const result = formatTaskDate('');
    expect(result).toBe('Data inválida');
  });

  test('retorna "Data inválida" quando null', () => {
    const result = formatTaskDate(null as unknown as string);
    expect(result).toBe('Data inválida');
  });

  test('retorna "Data inválida" quando formato inválido', () => {
    const result = formatTaskDate('data-qualquer');
    expect(result).toBe('Data inválida');
  });
});
