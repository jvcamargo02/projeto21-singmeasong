import supertest from "supertest";
import { prisma } from "../../src/database";
import app from "../../src/app";
import { faker } from "@faker-js/faker"

import * as recommendationFactory from "../factories/recommendationsFactory";
import { Recommendation } from "@prisma/client";

const agent = supertest(app);

type RecommendationData = Partial<Recommendation>;

beforeEach(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE recommendations RESTART IDENTITY`;
});

describe("POST /recommendations", () => {
    it("Should return status 201 if valid schema", async () => {
        const { name, youtubeLink } = await recommendationFactory.fakeRecommendation();

        const promise = await postRecommendation(name, youtubeLink);
        const recommendation = await findRecommendation(name);
        console.log(recommendation)
        console.log(name)
        expect(promise.status).toBe(201);

        expect(recommendation[0].name).toEqual(name);
        expect(recommendation[0].youtubeLink).toEqual(youtubeLink);
    });

    it("Should return status 409 if is already registered", async () => {
        const { name, youtubeLink } = await recommendationFactory.fakeRecommendation();

        await postRecommendation(name, youtubeLink);
        const recommendation: RecommendationData[] = await findRecommendation(name);
        const promise = await postRecommendation(name, youtubeLink);

        expect(promise.status).toBe(409);
        expect(recommendation[0].name).toEqual(name);
        expect(recommendation[0].youtubeLink).toEqual(youtubeLink);
    });

    it("Should return status 422 on invalid schema", async () => {
        const promise = await postRecommendation("", "google.com");

        expect(promise.status).toBe(422);
    });
});

describe("POST /recommendations/:id/upvote", () => {
    it("Should return status 200", async () => {
        const { name, youtubeLink } = await recommendationFactory.fakeRecommendation();

        await postRecommendation(name, youtubeLink);
        const recommendation = await findRecommendation(name);
        const promise = await agent.post(`/recommendations/${recommendation[0].id}/upvote`).send();

        expect(promise.status).toBe(200);
        expect(recommendation[0].name).toEqual(name);
        expect(recommendation[0].youtubeLink).toEqual(youtubeLink);
    });

    it("Should return status 404 if invalid recommendation id", async () => {
        const promise = await agent.post(`/recommendations/1/upvote`).send();

        expect(promise.status).toBe(404);
    });
});

describe("POST /recommendations/:id/downvote", () => {
    it("Should return status 200", async () => {
        const { name, youtubeLink } = await recommendationFactory.fakeRecommendation();

        await postRecommendation(name, youtubeLink);
        const recommendation = await findRecommendation(name);
        const promise = await agent.post(`/recommendations/${recommendation[0].id}/downvote`).send();

        expect(promise.status).toBe(200);
        expect(recommendation[0].name).toEqual(name);
        expect(recommendation[0].youtubeLink).toEqual(youtubeLink);
    });

    it("Should return status 404 if invalid recommendation id", async () => {
        const promise = await agent.post(`/recommendations/1/downvote`).send();

        expect(promise.status).toBe(404);
    });

    it("Should delete recommendation if it has more than 5 downvote", async () => {
        const { name, youtubeLink } = await recommendationFactory.fakeRecommendation();

        await postRecommendation(name, youtubeLink);
        await updatedRecommendation(name, -5);
        const recommendationBefore: RecommendationData[] = await findRecommendation(name);
        const promise = await agent.post(`/recommendations/${recommendationBefore[0].id}/downvote`).send();
        const recommendationAfter: RecommendationData[] = await findRecommendation(name);

        expect(promise.status).toBe(200);
        expect(recommendationAfter).toEqual([]);
    });
});

describe("GET /recommendations", () => {
    it("Should return status 200 and 10 latest recommendations", async () => {
        const { expectedReturn, allRecommendation: unExpectedReturn } = await recommendationFactory.createManyRecomendations(15);

        const promise = await agent.get("/recommendations").send();

        expect(promise.status).toBe(200);
        expect(promise.body).toEqual(expectedReturn.reverse());
        expect(promise.body).toEqual(expect.not.arrayContaining(unExpectedReturn.reverse()));
    });
});

describe("GET /recommendations/:id", () => {
    it("Should return status 200 and a recommendation", async () => {
        const { name, youtubeLink } = await recommendationFactory.fakeRecommendation();

        await postRecommendation(name, youtubeLink);
        const recommendation = await findRecommendation(name);
        const promise = await agent.get(`/recommendations/${recommendation[0].id}`).send();

        expect(promise.status).toBe(200);
        expect(promise.body).toEqual(recommendation[0]);
    });

    it("Should return status 404 if invalid id", async () => {
        const promise = await agent.get(`/recommendations/1`).send();

        expect(promise.status).toBe(404);
    });
});

describe("GET /recommendations/random", () => {
    jest.setTimeout(60000); //if your processing is impacted, increase the time
    test.each([100, 200])( //by reducing the tests samples the tests can be harmed
        "Should return status 200 and a recommendation with more than 10 upvotes 70% of request",

        async (quantity) => {
            let moreThan10Upvotes = []
            await recommendationFactory.createManyRecomendations(quantity/10);

            for (let i = 0; i < quantity; i++) {
                const { name, youtubeLink } = await recommendationFactory.fakeRecommendation();

                await prisma.recommendation.create({
                    data: {
                        name,
                        youtubeLink,
                        score: 15,
                    },
                });

                const promise = await agent.get("/recommendations/random").send();

                if(promise?.body?.score > 10) moreThan10Upvotes.push(promise.body)

                expect(promise.status).toBe(200);
            }
            
            
            expect(moreThan10Upvotes.length).toBeGreaterThanOrEqual(quantity * 0.60)
            expect(moreThan10Upvotes.length).toBeLessThanOrEqual(quantity * 0.80)
        }
    );

    it("Should return status 200 and a recommendation", async () => {
            const { name, youtubeLink } = await recommendationFactory.fakeRecommendation();

            await prisma.recommendation.create({
                data: {
                    name,
                    youtubeLink,
                    score: 15,
                },
            });
            const recommendation = await findRecommendation(name)

            const promise = await agent.get("/recommendations/random").send();

            expect(promise.status).toBe(200)
            expect(promise.body).toEqual(recommendation[0])

    })

    it("Should return status 404 without recommendation in db", async () => {
        const promise = await agent.get("/recommendations/random").send();

        expect(promise.status).toBe(404)
        expect(promise.body).toEqual({})
    })
});

describe("GET /recommendations/top/:amount", () => { 

    test.each([10, 15])("Should return status 200 and recommendations ordered by score", async (quantity) => {
        for (let i = 0; i < quantity; i++) {
            const { name, youtubeLink } = await recommendationFactory.fakeRecommendation();

            await prisma.recommendation.create({
                data: {
                    name,
                    youtubeLink,
                    score: +faker.random.numeric(),
                },
            });
        }

        const recommendations = await prisma.recommendation.findMany({
            orderBy: {
                score: 'desc'
            }
        })

        const promise = await agent.get(`/recommendations/top/${quantity}`).send();


        expect(promise.status).toBe(200);
        expect(promise.body).toEqual(recommendations)
    })
})

afterAll(async () => {
    await prisma.$disconnect()
})


async function findRecommendation(name: string): Promise<RecommendationData[]> {
    return await prisma.recommendation.findMany({
        where: {
            name,
        },
    });
}

async function postRecommendation(name: string, youtubeLink: string) {
    return await agent.post("/recommendations").send({ name, youtubeLink });
}

async function updatedRecommendation(name: string, score: number) {
    return await prisma.recommendation.updateMany({
        where: {
            name,
        },
        data: {
            score,
        },
    });
}


