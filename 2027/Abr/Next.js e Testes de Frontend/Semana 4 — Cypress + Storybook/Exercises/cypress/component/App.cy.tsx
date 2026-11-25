import { mount } from 'cypress/react';
import App from '../../src/App';

describe('Task Manager', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('executa o fluxo de criar, concluir e excluir uma tarefa', () => {
    mount(<App />);

    cy.contains('No tasks yet').should('be.visible');
    cy.get('input[placeholder="What needs to be done?"]').type('Integration task');
    cy.contains('button', 'Add Task').click();

    cy.contains('Integration task').should('be.visible');
    cy.contains('Progress').parent().should('contain.text', '0%');

    cy.get('input[aria-label="Integration task"]').check({ force: true });
    cy.contains('Progress').parent().should('contain.text', '100%');

    cy.get('button[title="Delete task"]').click({ force: true });
    cy.contains('No tasks yet').should('be.visible');
  });
});
