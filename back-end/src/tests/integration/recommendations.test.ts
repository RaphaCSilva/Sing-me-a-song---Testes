import supertest from "supertest";
import { prisma } from "./../../../src/database.js"
import app from "./../../../src/app.js"
import { recommendationService } from "../../services/recommendationsService";
import { recommendationsFactory } from "../factory/recommendationFactory.js";



describe("testes de integração das recomendações", () => {

    beforeEach(async () => {
        await prisma.$executeRaw`TRUNCATE TABLE recommendations`
    })
    
    
    it("Deve criar e registrar no banco uma recomendação", async () => {

        const recommendation = recommendationsFactory();

        const response = await supertest(app)
            .post("/recommendations")
            .send(recommendation);

        const persistedRecommendation = await prisma.recommendation.findFirst({
            where: {
                name: recommendation.name
            }
        })

        expect(response.status).toBe(201);
        expect(persistedRecommendation).not.toBeNull();
    });

    it("Deve retornar status 422 para link que não é do youtube", async () => {
        const recommendation = recommendationsFactory();
        recommendation.youtubeLink = "https://www.google.com";

        const response = await supertest(app)
            .post("/recommendations")
            .send(recommendation);
        expect(response.status).toEqual(422);
    });

    it("Deve retornar status 422 quando o nome da recomendação não é uma string",async () => {
        const recommendation = {
            name: 12,
            youtubeLink: "https://youtu.be/DYed5whEf4g"
        }

        const response = await supertest(app)
            .post("/recommendations")
            .send(recommendation);
        expect(response.status).toEqual(422); 
    });

    it("Deve retornar status 409 para duas recomendações com o mesmo nome",async () => {
        const recommendation = recommendationsFactory();
        await prisma.recommendation.create({ data: recommendation});
        
        const response = await supertest(app)
            .post("/recommendations")
            .send(recommendation);

            const recomendationDB = await prisma.recommendation.findMany({
            where: {
                name: recommendation.name
            }
        });

        expect(recomendationDB.length).toEqual(1);
        expect(response.status).toEqual(409);
    });

    it("Deve retornar status 200 e acrescentar um ao score do post",async () => {
        const recommendation = recommendationsFactory();
        const recommendationDB = await prisma.recommendation.create({
            data: recommendation
        });
        const scoreBefore = recommendationDB.score;

        const response = await supertest(app)
            .post(`/recommendations/${recommendationDB.id}/upvote`)
            .send();
        const recommendationAfter = await prisma.recommendation.findFirst({
            where:{
                id: recommendationDB.id
            }
        });
        
        expect(response.status).toEqual(200);
        expect(recommendationAfter.score).toEqual(scoreBefore+1);
    });
    
    it("Deve retornar status 200 e drecrementar um ao score do post",async () => {
        const recommendation = recommendationsFactory();
        const recommendationDB = await prisma.recommendation.create({
            data: recommendation
        });
        const scoreBefore = recommendationDB.score;

        const response = await supertest(app)
            .post(`/recommendations/${recommendationDB.id}/downvote`)
            .send();
        const recommendationAfter = await prisma.recommendation.findFirst({
            where:{
                id: recommendationDB.id
            }
        });
        
        expect(response.status).toEqual(200);
        expect(recommendationAfter.score).toEqual(scoreBefore-1);
    });

    it("Deve retornar 404 para um id inexistente ao tentar fazer um upvote",async () => {
        const response = await supertest(app)
            .post("/recommendations/99/upvote")
            .send();
        expect(response.status).toEqual(404);
    });

    it("Deve retornar 404 para um id inexistente ao tentar fazer um downvote",async () => {
        const response = await supertest(app)
            .post("/recommendations/99/downvote")
            .send();
        expect(response.status).toEqual(404);
    });

    it("Deve retornar 500 para um id invalido ao tentar fazer um upvote",async () => {
        const response = await supertest(app)
            .post("/recommendations/NaN/upvote")
            .send();
        expect(response.status).toEqual(500);
    });

    it("Deve retornar 500 para um id invalido ao tentar fazer um downvote",async () => {
        const response = await supertest(app)
            .post("/recommendations/NaN/downvote")
            .send();
        expect(response.status).toEqual(500);
    });

    it("Deve excluir uma recomendação quando decrementar a menos que -5",async () => {
        const recomendation = recommendationsFactory();
        const recomendationDB = await prisma.recommendation.create({
            data: recomendation
        });

        for(let i = 0; i < 5; i++){
            await supertest(app)
                .post(`/recommendations/${recomendationDB.id}/downvote`)
                .send();
        }
        
        const response = await supertest(app)
            .post(`/recommendations/${recomendationDB.id}/downvote`)
            .send();
        
        const recommendationExcluida = await prisma.recommendation.findFirst({
            where: {
                id: recomendationDB.id
            }
        });
        
        expect(response.status).toEqual(200);
        expect(recommendationExcluida).toBeNull();
    });

    it("Deve retornar status 200 e 10 recomendações", async () => {
        for(let i=0; i < 20; i++){
            const recommendation = recommendationsFactory();
            await prisma.recommendation.create({
                data: recommendation
            });
        }
        
        const response = await supertest(app).get("/recommendations").send();
        
        expect(response.status).toEqual(200);
        expect(response.body.length).toEqual(10);
    });

    function getRandomInt(min: number, max: number) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min);
    }

    it("Deve retornar status 200 e N recomendações",async () => {
        const N = getRandomInt(1, 9);

        for(let i=0; i < N; i++){
            const recommendation = recommendationsFactory();
            await prisma.recommendation.create({
                data: recommendation
            });
        }

        const response = await supertest(app).get("/recommendations").send();
        expect(response.status).toEqual(200);
        expect(response.body.length).toEqual(N);
    });

    it("Deve retornar status 200 e nenhuma recomendação caso banco vazio",async () => {
        const response = await supertest(app).get("/recommendations").send();
        expect(response.status).toEqual(200);
        expect(response.body.length).toEqual(0);
    });

    it("Deve retornar status 200 e a recomendação de um id especifico",async () => {
        const recommendation = recommendationsFactory();
        const recomendationDB = await prisma.recommendation.create({
            data: recommendation
        });

        const response = await supertest(app)
            .get(`/recommendations/${recomendationDB.id}`)
            .send();
        
        expect(response.status).toEqual(200);
        expect(response.body.id).toEqual(recomendationDB.id);
    });
    
    it("Deve retornar status 404 caso tente buscar uma recomendação de um id inexistente",async () => {
        
        const response = await supertest(app)
            .get(`/recommendations/1`)
            .send();
    
        expect(response.status).toEqual(404); 
    });

    it("Deve retornar status 200 e uma recomendação aleatoria",async () => {
        for(let i=0; i < 10; i++){
            const recommendation = recommendationsFactory();
            await prisma.recommendation.create({
                data: recommendation
            });
        }
        const response = await supertest(app)
            .get("/recommendations/random")
            .send();
        
        expect(response.status).toEqual(200);
        expect(response.body.id).not.toBeNull();
    });

    it("Deve retornar status 404 caso tente buscar recomendação aleatoria com banco vazio",async () => {
        const response = await supertest(app)
            .get("/recommendations/random")
            .send();
        
        expect(response.status).toEqual(404);
        expect(response.body).toEqual({});
    });

    it("Deve retornar status 200 a quantidade desejada em ordem",async () => {
        const N = getRandomInt(2,10);
        for(let i = 0; i < N; i++){
            const recommendation = recommendationsFactory();
            const recommendationDB = await prisma.recommendation.create({
                data: recommendation
            });
            for(let j=0; j < i; j++){
                await supertest(app)
                    .post(`/recommendations/${recommendationDB.id}/upvote`)
                    .send();
            }
        }  
        const response = await supertest(app)
            .get(`/recommendations/top/${N}`)
            .send();

        expect(response.status).toEqual(200);
        expect(response.body.length).toEqual(N);
        expect(response.body[0].score).toBeGreaterThanOrEqual(response.body[1].score);
        expect(response.body[1].score).toBeGreaterThanOrEqual(response.body[2].score);
    });
    
    it("Deve retornar status 200 e array vazio para caso banco vazio",async () => {
        const response = await supertest(app)
            .get(`/recommendations/top/10`)
            .send();

        expect(response.status).toEqual(200);
        expect(response.body).toEqual([]);
    })
    
});