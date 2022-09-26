import { faker } from "@faker-js/faker";

describe('empty spec', () => {
  
  beforeEach(async ()=> {
    await cy.request("POST", "http://localhost:5000/reset");
  })

  it('Deve criar uma recomendação', () => {
    cy.visit('http://localhost:3000');
    const recommendation = {
      name: faker.lorem.words(2),
      youtubeLink: "https://youtu.be/DYed5whEf4g"
    };
    
    cy.get('input[placeholder="Name"]').type(recommendation.name);
    cy.get('input[placeholder="https://youtu.be/..."]').type(recommendation.youtubeLink);

    cy.intercept("POST", "http://localhost:5000/recommendations").as("createRecommendation");
    cy.get("button").click();
    cy.wait("@createRecommendation");

    cy.contains(recommendation.name);
  })

  it('Deve dar upvote', () => {

    cy.createRecommendation();

    cy.visit('http://localhost:3000');
    cy.intercept("GET", "http://localhost:5000/recommendations").as("updateRecommendation");

    cy.get("[data-cy=up]").click({ multiple: true });
  
    cy.wait("@updateRecommendation");
    cy.get('[data-cy=score]').should("contain", 1);
  });

  it('Deve dar downvote', () => {

    cy.createRecommendation();

    cy.visit('http://localhost:3000');
    cy.intercept("GET", "http://localhost:5000/recommendations").as("updateRecommendation");

    cy.get("[data-cy=down]").click({ multiple: true });
  
    cy.wait("@updateRecommendation");
    cy.get('[data-cy=score]').should("contain", -1);
  });

  it('Deve deletar uma recomendação com menos de -5 de score', () => {
    
    cy.createRecommendation();

    cy.visit("http://localhost:3000");

    cy.intercept("GET", "http://localhost:5000/recommendations").as("updateRecommendation");

    for(let i = 0; i < 6; i++){
      cy.get("[data-cy=down]").click();
    }

    cy.get("[data-cy=noRecommendations]").should("be.visible");

  });

  it('Deve receber o top recomendações', () => {

    cy.createRecommendation();

    cy.intercept("GET", "http://localhost:5000/recommendations/top/10").as("getTop");
    
    cy.visit('http://localhost:3000');
    
    cy.get("[data-cy=top]").click();

    cy.wait("@getTop");
  })

  it('Deve receber uma recomendação aleatoria', () => {
    
    for(let i = 0; i < 10; i++){
      cy.createRecommendation();
    }

    cy.intercept("GET", "http://localhost:5000/recommendations/random").as("getRandom");
    
    cy.visit('http://localhost:3000');
    
    cy.get("[data-cy=top]").click();

    cy.wait("@getTop");
    cy.get("[data-cy=title]").should("have.length", 1);
  })
})