import { faker } from "@faker-js/faker";
import { GoArrowUp } from "react-icons/go";

describe('empty spec', () => {
  
  beforeEach(()=> {
    cy.visit('http://localhost:3000');
  })

  it('Deve criar uma recomendação', () => {
    cy.visit('http://localhost:3000');

    const recommendation = {
      name: faker.lorem.words(2),
      link: "https://youtu.be/DYed5whEf4g"
    };
    
    cy.get('input[placeholder="Name"]').type(recommendation.name);
    cy.get('input[placeholder="https://youtu.be/..."]').type(recommendation.link);

    cy.intercept("POST", "http://localhost:5000/recommendations").as("createRecommendation");
    cy.get("button").click();
    cy.wait("@createRecommendation");

    cy.contains(recommendation.name);
  })

//  it('Deve dar upvote', () => {
//    cy.visit('http://localhost:3000');
//
//    cy.intercept("POST", "http://localhost:5000/recommendations/:id/upvote").as("upvote");
//    
//  cy.get('svg[onclick="handleUpvote"]').click();
//    cy.contains("@upvote");
//  })

  it('Deve receber o top recomendações', () => {
    cy.intercept("GET", "http://localhost:5000/recommendations/top/10").as("getTop");
    
    
    cy.get("#top").click();

    cy.wait("@getTop");
  })


})