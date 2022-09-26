import { faker } from "@faker-js/faker";

Cypress.Commands.add("createRecommendation", () => {
    const recommendation = {
      name: faker.lorem.words(2),
      youtubeLink: "https://youtu.be/DYed5whEf4g",
    };
    cy.request("POST", "http://localhost:5000/recommendations", recommendation);
});