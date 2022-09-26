import { prisma } from "../../src/database";
import { recommendationRepository } from "../../src/repositories/recommendationRepository";

import { recommendationService } from "../../src/services/recommendationsService";
import * as recommendationFactory from "../factories/recommendationsFactory";

beforeEach(async () => {
/*     await prisma.$executeRaw`TRUNCATE TABLE recommendations RESTART IDENTITY`; */
    jest.resetAllMocks();
    jest.clearAllMocks();
});

describe("Test insert function", () => {
    it("Should create", async () => {
        jest.spyOn(recommendationRepository, "create").mockResolvedValue();
        jest.spyOn(recommendationRepository, "findByName").mockResolvedValue(undefined);

        await recommendationService.insert({ name: "name", youtubeLink: "youbeLink" });

        expect(recommendationRepository.create).toHaveBeenCalled();
        expect(recommendationRepository.findByName).toHaveBeenCalled();
    });

    it("Should return conflict error", async () => {
        const { name, youtubeLink } = await recommendationFactory.fakeRecommendation();

        jest.spyOn(recommendationRepository, "create").mockResolvedValue();
        jest.spyOn(recommendationRepository, "findByName").mockImplementationOnce((): any => {
            return { name, youtubeLink };
        });

        await recommendationService.insert({ name, youtubeLink }).catch((e) =>
            expect(e).toEqual({
                type: "conflict",
                message: "Recommendations names must be unique",
            })
        );

        expect(recommendationRepository.findByName).toHaveBeenCalled();
    });
});

describe("Upvote function", () => {
    it("Should upvote recommendation", async () => {
        jest.spyOn(recommendationRepository, "find").mockImplementationOnce((): any => {
            return true;
        });
        jest.spyOn(recommendationRepository, "updateScore").mockResolvedValue(undefined);

        await recommendationService.upvote(1);

        expect(recommendationRepository.find).toHaveBeenCalled();
        expect(recommendationRepository.updateScore).toHaveBeenCalled();
    });

    it("Should return conflict error when invalid recommendation id", async () => {
        jest.spyOn(recommendationRepository, "find").mockImplementationOnce((): any => {
            return false;
        });
        jest.spyOn(recommendationRepository, "updateScore").mockResolvedValue(undefined);

        await recommendationService.upvote(1).catch((e) => {
            expect(e).toEqual({ type: "not_found", message: "" });
        });

        expect(recommendationRepository.find).toHaveBeenCalled();
        expect(recommendationRepository.updateScore).not.toHaveBeenCalled();
    });
});

describe("Downvote function", () => {
    it("Should downvote recommendation", async () => {
        jest.spyOn(recommendationRepository, "find").mockImplementationOnce((): any => {
            return true;
        });
        jest.spyOn(recommendationRepository, "updateScore").mockImplementationOnce((): any => {
            return { score: 0 };
        });
        jest.spyOn(recommendationRepository, "remove").mockResolvedValueOnce(undefined);

        await recommendationService.downvote(1);

        expect(recommendationRepository.find).toHaveBeenCalled();
        expect(recommendationRepository.remove).not.toHaveBeenCalled();
        expect(recommendationRepository.updateScore).toHaveBeenCalled();
    });

    it("Should return conflict error when invalid recommendation id", async () => {
        jest.spyOn(recommendationRepository, "find").mockImplementationOnce((): any => {
            return false;
        });
        jest.spyOn(recommendationRepository, "updateScore").mockImplementationOnce((): any => {
            return { score: 0 };
        });
        jest.spyOn(recommendationRepository, "remove").mockResolvedValueOnce(undefined);

        await recommendationService.downvote(1).catch((e) => {
            expect(e).toEqual({ type: "not_found", message: "" });
        });

        expect(recommendationRepository.find).toHaveBeenCalled();
        expect(recommendationRepository.remove).not.toHaveBeenCalled();
        expect(recommendationRepository.updateScore).not.toHaveBeenCalled();
    });

    it("Should remove if the recommendation score is less than 5", async () => {
        jest.spyOn(recommendationRepository, "find").mockImplementationOnce((): any => {
            return true;
        });
        jest.spyOn(recommendationRepository, "updateScore").mockImplementationOnce((): any => {
            return { score: -6 };
        });
        jest.spyOn(recommendationRepository, "remove").mockResolvedValueOnce(undefined);

        await recommendationService.downvote(1);

        expect(recommendationRepository.find).toHaveBeenCalled();
        expect(recommendationRepository.remove).toHaveBeenCalled();
        expect(recommendationRepository.updateScore).toHaveBeenCalled();
    });
});

describe("Get function", () => {
    it("Should return all recommendations", async () => {
        jest.spyOn(recommendationRepository, "findAll").mockResolvedValueOnce(undefined);

        await recommendationService.get();

        expect(recommendationRepository.findAll).toHaveBeenCalled();
    });
});

describe("GetTop function", () => {
    it("Should return recommendations ordered by score", async () => {
        jest.spyOn(recommendationRepository, "getAmountByScore").mockResolvedValueOnce(undefined);

        await recommendationService.getTop(10);

        expect(recommendationRepository.getAmountByScore).toHaveBeenCalled();
    });
});

describe("GetRandom function", () => {
    it("Should return a recommendation with a score greater than 10", async () => {
        jest.spyOn(Math, "random").mockImplementationOnce((): any => {
            return 0.9;
        });
        const recommendations = await recommendationFactory.createRecommendationWithRandomScore();
        jest.spyOn(recommendationRepository, "findAll").mockImplementationOnce((): any => {
            return recommendations;
        });

        await recommendationService.getRandom()

        expect(recommendationRepository.findAll).toHaveBeenCalled()
    });

    it("Should return a recommendation with a score less than 10", async () => {
        jest.spyOn(Math, "random").mockImplementationOnce((): any => {
            return 0.5;
        });
        const recommendations = await recommendationFactory.createRecommendationWithRandomScore();
        jest.spyOn(recommendationRepository, "findAll").mockImplementationOnce((): any => {
            return recommendations;
        });

        await recommendationService.getRandom()

        expect(recommendationRepository.findAll).toHaveBeenCalled()
    });

    it("Should return a error if nonexistent recomendation", async () => {
        jest.spyOn(recommendationRepository, "findAll").mockImplementationOnce((): any => {return []})

        await recommendationService.getRandom().catch((e) => {
            expect(e).toEqual({type: "not_found", message: "NonExisting Recommendation"})
        })

        expect(recommendationRepository.findAll).toHaveBeenCalled()
    });
});
