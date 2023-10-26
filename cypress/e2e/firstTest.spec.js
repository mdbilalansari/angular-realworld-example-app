/// <reference types="cypress" />

describe("Test with backend", () => {
  beforeEach("login to the app", () => {
    cy.loginToApplication();
  });

  it("Should log in", () => {
    console.log("Login Succesful");
  });
});
