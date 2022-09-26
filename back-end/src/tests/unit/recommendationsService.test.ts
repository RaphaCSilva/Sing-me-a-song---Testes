import { jest } from "@jest/globals";
import { recommendationRepository } from "../../repositories/recommendationRepository.js";
import { recommendationService } from "../../services/recommendationsService.js";
import { conflictError, notFoundError } from "../../utils/errorUtils.js";
import { recommendationsFactory, recommendationFactoryDB } from "../factory/recommendationFactory.js";

describe("recommendation service unit test", () => {
    
    beforeEach(() => {
        jest.resetAllMocks();
        jest.clearAllMocks();
    })

    it("deve criar uma recomendação",async () => {
        const recommendation = recommendationsFactory();
        jest
            .spyOn(recommendationRepository, "findByName")
            .mockImplementationOnce((): any => {});
        jest
            .spyOn(recommendationRepository, "create")
            .mockImplementationOnce((): any => {});
        await recommendationService.insert(recommendation);
        expect(recommendationRepository.findByName).toBeCalled();
        expect(recommendationRepository.create).toBeCalled();    
    });
    
    it("não pode criar um nome repetido",async () => {
        const recomendation = recommendationsFactory();
        jest
        .spyOn(recommendationRepository, "findByName")
            .mockResolvedValueOnce({
                id: 1,
                score: 0,
                ... recomendation
            })
        jest
            .spyOn(recommendationRepository, "create");
        
        const promise = recommendationService.insert(recomendation);
        expect(promise).rejects.toEqual(conflictError("Recommendations names must be unique"));
        expect(recommendationRepository.create).not.toBeCalled();
    });

    it("deve retornar uma recomendação pelo id", async () => {
        const recomendation = recommendationFactoryDB();
        jest
            .spyOn(recommendationRepository, "find")
            .mockImplementationOnce((): any => recomendation);
        const promise = await recommendationService.getById(recomendation.id);
        expect(promise).toEqual(recomendation);
    });

    it("não deve retornar recomendação para id não registrado", async () => {
        const recomendation = recommendationFactoryDB();
        jest
            .spyOn(recommendationRepository, "find")
            .mockImplementationOnce((): any => {});
        const promise = recommendationService.getById(recomendation.id);
        expect(promise).rejects.toEqual(notFoundError());
    });

    it("deve incrementar no score", async () => {
        const recommendation = recommendationFactoryDB();
        jest
          .spyOn(recommendationRepository, "find")
          .mockImplementationOnce((): any => recommendation);
        jest
          .spyOn(recommendationRepository, "updateScore")
          .mockImplementationOnce((): any => recommendation);
        await recommendationService.upvote(recommendation.id);
        expect(recommendationRepository.updateScore).toBeCalled();
    })

    it("deve decrementar no score maior que cinco", async () => {
        const recommendation = recommendationFactoryDB();
        jest
          .spyOn(recommendationRepository, "find")
          .mockImplementationOnce((): any => recommendation);
        jest
          .spyOn(recommendationRepository, "updateScore")
          .mockImplementationOnce((): any => recommendation);
        await recommendationService.downvote(recommendation.id);
        expect(recommendationRepository.updateScore).toBeCalled();
    });

    it("deve decrementar e remover o score menor que cinco", async () => {
        const recommendation = recommendationFactoryDB();
        recommendation.score = -6;
        jest
          .spyOn(recommendationRepository, "find")
          .mockImplementationOnce((): any => recommendation);
        jest
          .spyOn(recommendationRepository, "updateScore")
          .mockImplementationOnce((): any => recommendation);
        jest
            .spyOn(recommendationRepository, "remove")
            .mockImplementationOnce((): any => {});
        
        await recommendationService.downvote(recommendation.id);
        expect(recommendationRepository.updateScore).toBeCalled();
        expect(recommendationRepository.remove).toBeCalled();
    });
    
    it("deve retornar todas as recomendações", async () => {
        jest
            .spyOn(recommendationRepository, "findAll")
            .mockImplementationOnce((): any => {});
        await recommendationService.get();
        expect(recommendationRepository.findAll).toBeCalled();
    });

    it("deve retornar o top N recomendações", async () => {
        const amount = 10;
        jest
            .spyOn(recommendationRepository, "getAmountByScore")
            .mockImplementationOnce((): any => {});
        await recommendationService.getTop(amount);
        expect(recommendationRepository.getAmountByScore).toBeCalled();
    });

    it("Deve retornar uma recomendação aleatoria", async () => {
        const recomendation = recommendationsFactory();
        jest
            .spyOn(recommendationRepository, "findAll")
            .mockImplementationOnce((): any => [recomendation]);

        await recommendationService.getRandom();
        expect(recommendationRepository.findAll).toBeCalled();
    });

});

