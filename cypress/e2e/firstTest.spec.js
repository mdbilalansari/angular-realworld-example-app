/// <reference types="cypress" />

describe('Test with backend', () => {
  beforeEach('login to the app', () => {
    cy.loginToApplication();
  });

  it('Should log in', () => {
    console.log('Login Succesful');
  });

  it.only('verify correct request and response', () => {
    cy.intercept('POST', 'https://api.realworld.io/api/articles/').as('postArticles');

    cy.contains('New Article').click();
    cy.get('[formcontrolname="title"]').type('Title of the Article');
    cy.get('[formcontrolname="description"]').type('Description of the Article');
    cy.get('[formcontrolname="body"]').type('This is a body of the Article.');
    cy.contains('Publish Article').click();

    cy.wait('@postArticles').then((xhr) => {
      console.log(xhr);
      expect(xhr.response.statusCode).to.equal(201);
      expect(xhr.request.body.article.body).to.equal('This is a body of the Article.');
      expect(xhr.response.body.article.description).to.equal('Description of the Article');
    });
  });
});
