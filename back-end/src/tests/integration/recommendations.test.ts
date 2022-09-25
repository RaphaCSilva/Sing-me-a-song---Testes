import supertest from "supertest";
import { prisma } from "./../../../src/database.js"
import app from "./../../../src/app.js"
import { recommendationService } from "../../services/recommendationsService";
import { recommendationsFactory } from "../factory/recommendationFactory.js";



describe("testes de integração das recomendações", () => {

    beforeEach(async () => {
            // resetar o banco
    })
    
    
    it("Should create and persist one recommendation", async () => {

        const recomendation = recommendationsFactory();

        const response = await supertest(app)
            .post("/recommendations")
            .send(recomendation);
            
        expect(response.status).toBe(201);

        const persistedRecommendation = await prisma.recommendation.findFirst({
            where: {
                name: recomendation.name
            }
        })

        expect(persistedRecommendation).not.toBeNull();
    })

})