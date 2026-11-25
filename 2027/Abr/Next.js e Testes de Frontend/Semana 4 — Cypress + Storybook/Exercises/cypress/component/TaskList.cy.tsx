import { mount } from 'cypress/react';
import { TaskList } from '../../src/components/TaskList';

const tasks = [
  {
    id: 'task-1',
    title: 'Completed task',
    completed: true,
    createdAt: new Date('2026-11-23T12:00:00'),
  },
  {
    id: 'task-2',
    title: 'Pending task',
    completed: false,
    createdAt: new Date('2026-11-24T12:00:00'),
  },
];

describe('TaskList', () => {
  it('exibe o estado vazio', () => {
    mount(<TaskList tasks={[]} onToggleTask={cy.stub()} onDeleteTask={cy.stub()} />);

    cy.contains('No tasks yet').should('be.visible');
    cy.contains('Add your first task above to get started!').should('be.visible');
  });

  it('calcula os totais e o progresso', () => {
    mount(<TaskList tasks={tasks} onToggleTask={cy.stub()} onDeleteTask={cy.stub()} />);

    cy.contains('Total Tasks').parent().should('contain.text', '2');
    cy.contains('Completed').first().parent().should('contain.text', '1');
    cy.contains('Pending').first().parent().should('contain.text', '1');
    cy.contains('Progress').parent().should('contain.text', '50%');
  });
});
