import supertest from "supertest";
import { prisma } from "../../src/database";
import app from "../../src/app";

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
        const recommendation: RecommendationData[] = await findRecommendation(name);

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

        console.log(recommendationAfter);

        expect(promise.status).toBe(200);
        expect(recommendationAfter).toEqual([]);
    });
});

describe("GET /recommendations", () => {
    it("Should return status 200 and 10 latest recommendations", async () => {
        const { expectedReturn, allRecommendation: unExpectedReturn } = await createManyRecomendations(15);

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
});



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

async function createManyRecomendations(quantity: number) {
    let recommendationData = [];

    for (let i = 0; i < quantity + 1; i++) {
        recommendationData.push(await recommendationFactory.fakeRecommendation());
    }

    await prisma.recommendation.createMany({
        data: recommendationData,
    });

    const allRecommendation = await prisma.recommendation.findMany({});
    const expectedReturn = allRecommendation.slice(-10);

    return { allRecommendation, expectedReturn };
}
