import { faker } from "@faker-js/faker";

export default function recommendationsFactory() {
      
    const youtubeLink = "https://youtu.be/DYed5whEf4g";
    const recommendation = {
        name: faker.lorem.words(3),
        youtubeLink
    };
    return recommendation;
}