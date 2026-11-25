import { mount } from 'cypress/react';
import { TaskItem } from '../../src/components/TaskItem';

const task = {
  id: 'task-1',
  title: 'Test TaskItem',
  completed: false,
  createdAt: new Date('2026-11-24T12:00:00'),
};

describe('TaskItem', () => {
  it('renderiza uma tarefa pendente e encaminha as interações', () => {
    const onToggle = cy.stub().as('onToggle');
    const onDelete = cy.stub().as('onDelete');
    mount(<TaskItem task={task} onToggle={onToggle} onDelete={onDelete} />);

    cy.contains(task.title).should('be.visible');
    cy.contains('Pending').should('be.visible');
    cy.get('input[type="checkbox"]').should('not.be.checked').check({ force: true });
    cy.get('@onToggle').should('have.been.calledOnceWith', task.id);

    cy.get('button[title="Delete task"]').click({ force: true });
    cy.get('@onDelete').should('have.been.calledOnceWith', task.id);
  });

  it('renderiza o estado concluído', () => {
    mount(<TaskItem task={{ ...task, completed: true }} onToggle={cy.stub()} onDelete={cy.stub()} />);

    cy.get('input[type="checkbox"]').should('be.checked');
    cy.contains('Completed').should('be.visible');
    cy.contains(task.title).should('have.class', 'line-through');
  });
});
