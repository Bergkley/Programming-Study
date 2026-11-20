import type { Task } from '../types/Task';
import { isTaskComplete } from './isTaskComplete';

describe('isTaskComplete', () => {
  test('retorna true quando tarefa está completa', () => {
    const task = { id: '1', title: 'Comprar café', completed: true, createdAt: new Date() };
    expect(isTaskComplete(task)).toBe(true);
  });

  test('retorna false quando tarefa não está completa', () => {
    const task = { id: '1', title: 'Estudar React', completed: false, createdAt: new Date() };
    expect(isTaskComplete(task)).toBe(false);
  });

  test('retorna false quando task é null', () => {
    expect(isTaskComplete(null as unknown as Task)).toBe(false);
  });
});
