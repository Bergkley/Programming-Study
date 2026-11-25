import { mount } from 'cypress/react';
import { LoadingSpinner } from '../../src/components/LoadingSpinner';

describe('LoadingSpinner', () => {
  it('exibe o indicador e a mensagem de carregamento', () => {
    mount(<LoadingSpinner />);

    cy.contains('Loading tasks...').should('be.visible');
    cy.get('.animate-spin').should('be.visible');
  });
});
