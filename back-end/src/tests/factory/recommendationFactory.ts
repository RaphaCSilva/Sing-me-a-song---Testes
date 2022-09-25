import { faker } from "@faker-js/faker";

export function recommendationsFactory() {
      
    const youtubeLink = "https://youtu.be/DYed5whEf4g";

    const recommendation = {
        name: faker.lorem.words(3),
        youtubeLink
    };

    return recommendation;
}

export function recommendationFactoryDB() {

    const youtubeLink = "https://youtu.be/DYed5whEf4g";

    const recommendation = {
      id: faker.datatype.number(100),
      name: faker.lorem.words(3),
      youtubeLink,
      score: 0,
    };

    return recommendation;
  }