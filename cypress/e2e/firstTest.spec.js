/// <reference types="cypress" />

describe('Test with backend', () => {
  beforeEach('login to the app', () => {
    cy.intercept({ method: 'GET', path: 'tags' }, { fixture: 'tags.json' });
    cy.loginToApplication();
  });

  it('Should log in', () => {
    console.log('Login Succesful');
  });

  it('verify correct request and response', () => {
    cy.intercept('POST', 'https://api.realworld.io/api/articles/').as('postArticles');

    cy.contains('New Article').click();
    cy.get('[formcontrolname="title"]').type('Title of the Article 1234');
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

  it('intercepting and modifying the request and response', () => {
    // cy.intercept('POST', '*/articles/', (req) => {
    //   req.body.article.description = 'This is a Fake Discription';
    // }).as('postArticles');

    cy.intercept('POST', '*/articles/', (req) => {
      req.reply((res) => {
        expect(res.body.article.description).to.equal('Description of the Article');
        res.body.article.description = 'This is a Fake Discription';
      });
    }).as('postArticles');

    cy.contains('New Article').click();
    cy.get('[formcontrolname="title"]').type('Title of the Article 12345');
    cy.get('[formcontrolname="description"]').type('Description of the Article');
    cy.get('[formcontrolname="body"]').type('This is a body of the Article.');
    cy.contains('Publish Article').click();

    cy.wait('@postArticles').then((xhr) => {
      console.log(xhr);
      expect(xhr.response.statusCode).to.equal(201);
      expect(xhr.request.body.article.body).to.equal('This is a body of the Article.');
      expect(xhr.response.body.article.description).to.equal('This is a Fake Discription');
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

  it('verify global feed likes count', () => {
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

  it('delete a new article in glabal feed', () => {
    const bodyRequest = {
      article: {
        title: 'Title of the article Hello 123',
        description: 'Description 129',
        body: 'Hello WOrld!',
        tagList: [],
      },
    };

    cy.get('@token').then((token) => {
      cy.request({
        url: 'https://api.realworld.io/api/articles',
        headers: { Authorization: 'Token ' + token },
        method: 'POST',
        body: bodyRequest,
      }).then((response) => {
        expect(response.status).to.equal(201);
      });

      cy.contains('Global Feed').click();
      cy.get('.preview-link').first().click();
      cy.get('.article-actions').contains('Delete Article').click();

      cy.request({
        url: 'https://api.realworld.io/api/articles?limit=10&offset=0',
        header: { Authorization: 'Token ' + token },
        method: 'GET',
      })
        .its('body')
        .then((body) => {
          console.log(body);
          expect(body.articles[0].title).not.to.equal('Title of the article 01');
        });
    });
  });
});
