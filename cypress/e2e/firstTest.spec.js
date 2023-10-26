/// <reference types="cypress" />

describe('Test with backend', () => {
  beforeEach('login to the app', () => {
    cy.intercept('GET', 'https://api.realworld.io/api/tags', { fixture: 'tags.json' });
    cy.loginToApplication();
  });

  it('Should log in', () => {
    console.log('Login Succesful');
  });

  it('verify correct request and response', () => {
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

  it('verify popular tags are displayed', () => {
    cy.get('.tag-list')
      .should('contain', 'welcome')
      .and('contain', 'My Tag')
      .and('contain', 'Cypress')
      .and('contain', 'Automation')
      .and('contain', 'is')
      .and('contain', 'Fun');
  });

  it.only('verify global feed likes count', () => {
    cy.intercept('GET', 'https://api.realworld.io/api/articles/feed*', { articles: [], articlesCount: 0 });
    cy.intercept('GET', 'https://api.realworld.io/api/articles*', { fixture: 'articles.json' });

    cy.contains('Global Feed').click();
    cy.get('app-article-list button').then((heartList) => {
      expect(heartList[0]).to.contain('1');
      expect(heartList[1]).to.contain('5');
    });

    cy.fixture('articles.json').then((file) => {
      const articleLinnk = file.articles[1].slug;
      file.articles[1].favoritesCount = 6;

      cy.intercept('POST', 'https://api.realworld.io/api/articles/' + articleLinnk + '/favorite', file);
      cy.get('app-article-list button').eq(1).click().should('contain', '6');
    });
  });
});
