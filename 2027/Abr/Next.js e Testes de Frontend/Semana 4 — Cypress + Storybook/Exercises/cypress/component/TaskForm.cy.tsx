import { mount } from 'cypress/react';
import { TaskForm } from '../../src/components/TaskForm';

describe('TaskForm', () => {
  it('mantém o envio desabilitado enquanto o título está vazio', () => {
    mount(<TaskForm onAddTask={cy.stub()} />);

    cy.contains('button', 'Add Task').should('be.disabled');
  });

  it('envia o título e limpa o campo', () => {
    const onAddTask = cy.stub().as('onAddTask');
    mount(<TaskForm onAddTask={onAddTask} />);

    cy.get('input[placeholder="What needs to be done?"]').type('Write Cypress tests');
    cy.contains('button', 'Add Task').click();

    cy.get('@onAddTask').should('have.been.calledOnceWith', 'Write Cypress tests');
    cy.get('input[placeholder="What needs to be done?"]').should('have.value', '');
  });
});
